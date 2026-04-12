import problemRepository from '../repositories/ProblemRepository';
import analyticsService from './AnalyticsService';
import userRepository from '../repositories/UserRepository';

class ProblemService {
    async createProblemLog(data: any) {
        const problem = await problemRepository.save(data);
        
        // Update user's streak when a problem is logged
        const streak = await analyticsService.calculateStreak(data.userId);
        await userRepository.update(data.userId, { streak });
        
        return problem;
    }

    async removeProblemLog(id: any) {
        return await problemRepository.delete(id);
    }

    async updateProblemLog(id: any, userId: any, data: any) {
        const problem = await problemRepository.findById(id);
        if (!problem) throw new Error('Problem not found');
        if (problem.userId.toString() !== userId.toString()) throw new Error('Unauthorized');
        return await problemRepository.update(id, data);
    }

    async getProblems(userId: any) {
        return await problemRepository.findByUser(userId);
    }
}

export default new ProblemService();
