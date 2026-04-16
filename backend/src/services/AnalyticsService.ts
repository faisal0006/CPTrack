import userRepository from '../repositories/UserRepository';
import problemRepository from '../repositories/ProblemRepository';

class AnalyticsService {
    async calculateStreak(userId: any) {
        const problems = await problemRepository.findByUser(userId);
        if (!problems || problems.length === 0) return 0;

        // Extract unique days when problems were solved (in local timezone)
        const solvedDays = new Set();
        problems.forEach(p => {
            const d = new Date(p.solvedDate as string);
            // Format as YYYY-MM-DD
            const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            solvedDays.add(dateString);
        });

        const sortedDays = Array.from(solvedDays).sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime());

        let streak = 0;
        let currentDate = new Date();
        let currentString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        
        // If the latest problem isn't today or yesterday, streak is 0
        let latestSolved = sortedDays[0];
        if (latestSolved !== currentString) {
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            let yesterdayString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
            
            if (latestSolved !== yesterdayString) {
                return 0; // Streak broken
            }
        }

        // Calculate continuous streak
        let checkDate = new Date(sortedDays[0] as string);
        for (const day of sortedDays) {
            let checkString = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
            if (day === checkString) {
                streak++;
                // Move checkDate back by 1 day
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Update the database user with this latest streak
        
        await userRepository.update(userId, { streak });

        return streak;
    }

    async generateDifficultyStats(userId: any) {
        const problems = await problemRepository.findByUser(userId);
        const stats = {};
        
        problems.forEach(p => {
            const diff = p.difficulty || 'Unknown';
            stats[diff as any] = (stats[diff as any] || 0) + 1;
        });

        return stats;
    }

    async generateTopicStats(userId: any) {
        const problems = await problemRepository.findByUser(userId);
        const stats = {};

        problems.forEach(p => {
            const topic = p.topic || 'Unknown';
            stats[topic as any] = (stats[topic as any] || 0) + 1;
        });

        return stats;
    }

    async generateWeeklySummary(userId: any) {
        const problems = await problemRepository.findByUser(userId);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyProblems = problems.filter(p => new Date(p.solvedDate as string) >= oneWeekAgo);
        
        return {
            totalSolved: weeklyProblems.length,
            problems: weeklyProblems
        };
    }

    async generateHeatmapData(userId: any) {
        const problems = await problemRepository.findByUser(userId);
        const heatmap = {};

        // Build a map of date -> count for the last 180 days
        problems.forEach(p => {
            const d = new Date(p.solvedDate as string);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            heatmap[key] = (heatmap[key] || 0) + 1;
        });

        return heatmap;
    }

    async generateAdvancedStats(userId: any) {
        const problems = await problemRepository.findByUser(userId);
        if (!problems || problems.length === 0) {
            return { totalSolved: 0, avgDifficulty: 0, hardestProblem: null, topPlatform: '—' };
        }

        const rated = problems.filter(p => (p.difficulty as number) > 0);
        const avgDifficulty = rated.length > 0
            ? Math.round(rated.reduce((sum, p) => sum + (p.difficulty as number), 0) / rated.length)
            : 0;

        const hardestProblem = rated.length > 0
            ? rated.reduce((max, p) => p.difficulty > max.difficulty ? p : max, rated[0])
            : null;

        // Find top platform
        const platformCounts = {};
        problems.forEach(p => {
            platformCounts[p.platform as string] = (platformCounts[p.platform as string] || 0) + 1;
        });
        const topPlatform = Object.entries(platformCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || '—';

        return {
            totalSolved: problems.length,
            avgDifficulty,
            hardestProblem: hardestProblem ? { name: hardestProblem.problemName, rating: hardestProblem.difficulty } : null,
            topPlatform
        };
    }
}

export default new AnalyticsService();
