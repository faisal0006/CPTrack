import axios from 'axios';
import userRepository from '../repositories/UserRepository';
import problemRepository from '../repositories/ProblemRepository';

class CodeforcesService {
    async syncSubmissions(userId: any) {
        const user = await userRepository.findById(userId);
        if (!user || !user.codeforcesHandle) {
            throw new Error('User does not have a Codeforces handle configured');
        }

        const handle = user.codeforcesHandle;
        try {
            const response = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
            
            if (response.data.status !== 'OK') {
                throw new Error('Failed to fetch from Codeforces API');
            }

            const submissions = response.data.result;
            
            // Filter only 'OK' submissions
            const okSubmissions = submissions.filter((sub: any) => sub.verdict === 'OK');

            // Get existing problems to avoid duplicates
            const existingProblems = await problemRepository.findByUser(userId);
            const existingProblemNames = new Set(existingProblems.map(p => p.problemName));

            let syncedCount = 0;

            // Process submissions from oldest to newest to preserve chronological order if possible
            // API returns newest first, so we reverse it
            for (const sub of okSubmissions.reverse()) {
                const problemName = `${sub.problem.index} - ${sub.problem.name}`;
                
                // Avoid duplicates
                if (existingProblemNames.has(problemName)) {
                    continue;
                }

                const problemData = {
                    userId: user._id,
                    problemName: problemName,
                    difficulty: sub.problem.rating || 0, // 0 if unrated
                    topic: sub.problem.tags.length > 0 ? sub.problem.tags[0] : 'Unknown', // Take first tag
                    platform: 'Codeforces',
                    solvedDate: new Date(sub.creationTimeSeconds * 1000)
                };

                await problemRepository.save(problemData);
                existingProblemNames.add(problemName);
                syncedCount++;
            }

            return { message: `Successfully synced ${syncedCount} new problems`, count: syncedCount };

        } catch (error) {
            console.error('Codeforces Sync Error:', error.message);
            throw new Error('Could not synchronize Codeforces submissions. Please check your handle.');
        }
    }

    // Fetch current CF rating for a user
    async fetchCurrentRating(handle: any) {
        try {
            const response = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
            if (response.data.status !== 'OK' || !response.data.result.length) {
                throw new Error('Could not fetch user info');
            }
            const info = response.data.result[0];
            return {
                currentRating: info.rating || 0,
                maxRating: info.maxRating || 0,
                rank: info.rank || 'unrated'
            };
        } catch (error) {
            console.error('CF Rating Error:', error.message);
            throw new Error('Could not fetch Codeforces rating. Check your handle.');
        }
    }

    // Get Problem of the Day based on user's rating (excludes already-solved problems)
    async getProblemOfTheDay(userId: any) {
        const user = await userRepository.findById(userId);
        if (!user || !user.codeforcesHandle) {
            throw new Error('Set your Codeforces handle first');
        }

        const ratingInfo = await this.fetchCurrentRating(user.codeforcesHandle);
        const currentRating = ratingInfo.currentRating || 800;
        await userRepository.update(userId, { currentRating: ratingInfo.currentRating });

        const lowerBound = Math.max(800, currentRating - 200);
        const upperBound = currentRating + 500;

        // Fetch all CF problems
        const response = await axios.get('https://codeforces.com/api/problemset.problems');
        if (response.data.status !== 'OK') throw new Error('Failed to fetch problems from Codeforces');
        const allProblems = response.data.result.problems;

        // Build set of solved problem keys from user's CF submissions
        const solvedKeys = await this._getSolvedProblemKeys(user.codeforcesHandle);

        // Filter: in rating range, has rating, NOT already solved
        const eligible = allProblems.filter(p =>
            p.rating && p.rating >= lowerBound && p.rating <= upperBound &&
            !solvedKeys.has(`${p.contestId}-${p.index}`)
        );

        if (eligible.length === 0) throw new Error('No unsolved problems found in your rating range');

        // Deterministic daily seed
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const seedString = `${dateKey}-${userId}`;
        let hash = 0;
        for (let i = 0; i < seedString.length; i++) {
            hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
            hash = hash & hash;
        }
        const index = Math.abs(hash) % eligible.length;
        const chosen = eligible[index];

        return {
            problem: {
                contestId: chosen.contestId, index: chosen.index, name: chosen.name,
                rating: chosen.rating, tags: chosen.tags,
                url: `https://codeforces.com/problemset/problem/${chosen.contestId}/${chosen.index}`
            },
            ratingInfo: { currentRating: ratingInfo.currentRating, maxRating: ratingInfo.maxRating, rank: ratingInfo.rank, lowerBound, upperBound },
            date: dateKey
        };
    }

    // Check if the user has solved the POTD
    async checkPotdSolved(userId: any, contestId: any, problemIndex: any) {
        const user = await userRepository.findById(userId);
        if (!user || !user.codeforcesHandle) throw new Error('Set your Codeforces handle first');
        try {
            const response = await axios.get(`https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}&from=1&count=200`);
            if (response.data.status !== 'OK') throw new Error('Failed to fetch submissions');
            const solved = response.data.result.some((sub: any) =>
                sub.verdict === 'OK' && sub.problem.contestId === Number(contestId) && sub.problem.index === problemIndex
            );
            return { solved };
        } catch (error) {
            throw new Error('Could not check submission status');
        }
    }

    // Find problems by rating range and/or topic (for the Browse page)
    async findProblems(userId: any, { minRating, maxRating, tag }: any) {
        const user = await userRepository.findById(userId);
        const handle = user?.codeforcesHandle;

        const response = await axios.get('https://codeforces.com/api/problemset.problems');
        if (response.data.status !== 'OK') throw new Error('Failed to fetch problems');
        const allProblems = response.data.result.problems;
        const stats = response.data.result.problemStatistics;

        // Build solved set if user has a handle
        let solvedKeys = new Set();
        if (handle) {
            solvedKeys = await this._getSolvedProblemKeys(handle);
        }

        // Build solvedCount map from stats
        const solvedCountMap = {};
        stats.forEach(s => { solvedCountMap[`${s.contestId}-${s.index}`] = s.solvedCount; });

        // Filter
        let filtered = allProblems.filter(p => {
            if (!p.rating) return false;
            if (minRating && p.rating < Number(minRating)) return false;
            if (maxRating && p.rating > Number(maxRating)) return false;
            if (tag && !p.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))) return false;
            return true;
        });

        // Sort by solvedCount descending (most popular first) for better quality
        filtered.sort((a, b) => {
            const countA = solvedCountMap[`${a.contestId}-${a.index}`] || 0;
            const countB = solvedCountMap[`${b.contestId}-${b.index}`] || 0;
            return countB - countA;
        });

        // Take up to 70
        filtered = filtered.slice(0, 70);

        // Mark which ones the user has solved
        const results = filtered.map(p => ({
            contestId: p.contestId,
            index: p.index,
            name: p.name,
            rating: p.rating,
            tags: p.tags,
            url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
            solvedCount: solvedCountMap[`${p.contestId}-${p.index}`] || 0,
            userSolved: solvedKeys.has(`${p.contestId}-${p.index}`)
        }));

        return { problems: results, total: results.length };
    }

    // Helper: get set of "contestId-index" keys the user has solved on CF
    async _getSolvedProblemKeys(handle: any) {
        const keys = new Set();
        try {
            const res = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`);
            if (res.data.status === 'OK') {
                res.data.result.forEach((sub: any) => {
                    if (sub.verdict === 'OK') keys.add(`${sub.problem.contestId}-${sub.problem.index}`);
                });
            }
        } catch (e) { /* ignore */ }
        return keys;
    }

    // Deep Analytics — things CF doesn't show natively
    async getDeepAnalytics(userId: any) {
        const user = await userRepository.findById(userId);
        if (!user || !user.codeforcesHandle) throw new Error('Set your Codeforces handle first');
        const handle = user.codeforcesHandle;

        // Fetch rating history, submissions in parallel
        const [ratingRes, statusRes] = await Promise.all([
            axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`),
            axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`)
        ]);

        if (ratingRes.data.status !== 'OK' || statusRes.data.status !== 'OK') {
            throw new Error('Failed to fetch data from Codeforces');
        }

        const ratingChanges = ratingRes.data.result;
        const submissions = statusRes.data.result;

        // 1. Rating History (for chart)
        const ratingHistory = ratingChanges.map(r => ({
            contestName: r.contestName.length > 30 ? r.contestName.substring(0, 30) + '…' : r.contestName,
            rating: r.newRating,
            change: r.newRating - r.oldRating,
            rank: r.rank,
            date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().split('T')[0]
        }));

        // 2. Contest Performance Stats
        const totalContests = ratingChanges.length;
        const positiveContests = ratingChanges.filter(r => r.newRating > r.oldRating).length;
        const bestContest = ratingChanges.length > 0
            ? ratingChanges.reduce((best, r) => (r.newRating - r.oldRating) > (best.newRating - best.oldRating) ? r : best)
            : null;
        const worstContest = ratingChanges.length > 0
            ? ratingChanges.reduce((worst, r) => (r.newRating - r.oldRating) < (worst.newRating - worst.oldRating) ? r : worst)
            : null;
        const avgChange = totalContests > 0
            ? Math.round(ratingChanges.reduce((sum: any, r: any) => sum + (r.newRating - r.oldRating), 0) / totalContests)
            : 0;

        const contestStats = {
            totalContests,
            positiveContests,
            winRate: totalContests > 0 ? Math.round((positiveContests / totalContests) * 100) : 0,
            avgChange,
            bestContest: bestContest ? { name: bestContest.contestName, change: bestContest.newRating - bestContest.oldRating, rank: bestContest.rank } : null,
            worstContest: worstContest ? { name: worstContest.contestName, change: worstContest.newRating - worstContest.oldRating, rank: worstContest.rank } : null,
        };

        // 3. Weak Topics Analysis — compare solved vs attempted per topic
        const topicSolved: any = {};
        const topicAttempted: any = {};
        const seenProblems = new Set();

        submissions.forEach((sub: any) => {
            const key = `${sub.problem.contestId}-${sub.problem.index}`;
            if (seenProblems.has(key)) return;
            seenProblems.add(key);
            sub.problem.tags.forEach((tag: any) => {
                topicAttempted[tag] = (topicAttempted[tag] || 0) + 1;
                if (sub.verdict === 'OK') topicSolved[tag] = (topicSolved[tag] || 0) + 1;
            });
        });

        // Re-scan for solved (some problems may have been attempted wrong then solved)
        const solvedProblems = new Set();
        submissions.forEach((sub: any) => {
            if (sub.verdict === 'OK') solvedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
        });

        const topicAnalysis = Object.keys(topicAttempted)
            .map((tag: any) => ({
                topic: tag,
                attempted: topicAttempted[tag],
                solved: topicSolved[tag] || 0,
                successRate: topicAttempted[tag] > 0
                    ? Math.round(((topicSolved[tag] || 0) / topicAttempted[tag]) * 100)
                    : 0
            }))
            .filter(t => t.attempted >= 3) // only meaningful with enough data
            .sort((a, b) => a.successRate - b.successRate); // weakest first

        // 4. Upsolving suggestions — problems from contests user participated in but didn't solve
        const contestIds = new Set(ratingChanges.map(r => r.contestId));
        const upsolveCandidates: any[] = [];
        const processedUpsolve = new Set();

        submissions.forEach((sub: any) => {
            const key = `${sub.problem.contestId}-${sub.problem.index}`;
            if (processedUpsolve.has(key)) return;
            processedUpsolve.add(key);
            if (contestIds.has(sub.problem.contestId) && !solvedProblems.has(key) && sub.problem.rating) {
                upsolveCandidates.push({
                    contestId: sub.problem.contestId,
                    index: sub.problem.index,
                    name: sub.problem.name,
                    rating: sub.problem.rating,
                    tags: sub.problem.tags,
                    url: `https://codeforces.com/problemset/problem/${sub.problem.contestId}/${sub.problem.index}`
                });
            }
        });

        // Sort upsolve by rating ascending (easiest first)
        upsolveCandidates.sort((a, b) => a.rating - b.rating);

        return {
            ratingHistory,
            contestStats,
            topicAnalysis,
            upsolveSuggestions: upsolveCandidates.slice(0, 20)
        };
    }
}

export default new CodeforcesService();
