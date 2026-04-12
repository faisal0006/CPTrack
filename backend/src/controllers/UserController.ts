import codeforcesService from '../services/CodeforcesService';
import { Request, Response, NextFunction } from 'express';
import userRepository from '../repositories/UserRepository';
import analyticsService from '../services/AnalyticsService';

class UserController {
    async getProfile(req: Request | any, res: Response | any) {
        try {
            const user = await userRepository.findById((req as any).user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const streak = await analyticsService.calculateStreak((req as any).user.id);
            const difficultyStats = await analyticsService.generateDifficultyStats((req as any).user.id);
            const topicStats = await analyticsService.generateTopicStats((req as any).user.id);
            const weeklySummary = await analyticsService.generateWeeklySummary((req as any).user.id);
            const heatmapData = await analyticsService.generateHeatmapData((req as any).user.id);
            const advancedStats = await analyticsService.generateAdvancedStats((req as any).user.id);

            res.status(200).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    currentRating: user.currentRating,
                    targetRating: user.targetRating,
                    dailyGoal: user.dailyGoal,
                    streak: user.streak,
                    codeforcesHandle: user.codeforcesHandle
                },
                analytics: {
                    streak,
                    difficultyStats,
                    topicStats,
                    weeklySummary,
                    heatmapData,
                    advancedStats
                }
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateGoal(req: Request | any, res: Response | any) {
        try {
            const { targetRating, dailyGoal } = req.body;
            const updatedUser = await userRepository.update((req as any).user.id, {
                targetRating,
                dailyGoal
            });
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateHandle(req: Request | any, res: Response | any) {
        try {
            const { codeforcesHandle } = req.body;
            const updatedUser = await userRepository.update((req as any).user.id, {
                codeforcesHandle
            });
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async syncCodeforces(req: Request | any, res: Response | any) {
        try {
            
            const result = await codeforcesService.syncSubmissions((req as any).user.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getPotd(req: Request | any, res: Response | any) {
        try {
            
            const result = await codeforcesService.getProblemOfTheDay((req as any).user.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async checkPotd(req: Request | any, res: Response | any) {
        try {
            const { contestId, problemIndex } = req.body;
            
            const result = await codeforcesService.checkPotdSolved((req as any).user.id, contestId, problemIndex);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findProblems(req: Request | any, res: Response | any) {
        try {
            const { minRating, maxRating, tag } = req.query;
            
            const result = await codeforcesService.findProblems((req as any).user.id, { minRating, maxRating, tag });
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getDeepAnalytics(req: Request | any, res: Response | any) {
        try {
            
            const result = await codeforcesService.getDeepAnalytics((req as any).user.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new UserController();
