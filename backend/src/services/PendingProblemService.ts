import pendingProblemRepository from '../repositories/PendingProblemRepository';

class PendingProblemService {
    async createPendingProblem(data: any) {
        if (!data.problemName || !data.platform) {
            throw new Error('Problem name and platform are required');
        }
        return await pendingProblemRepository.save(data);
    }

    async getPendingProblems(userId: any) {
        return await pendingProblemRepository.findByUser(userId);
    }

    async deletePendingProblem(id: any, userId: any) {
        const problem = await pendingProblemRepository.findById(id);
        if (!problem) {
            throw new Error('Problem not found');
        }
        if (problem.userId.toString() !== userId.toString()) {
            throw new Error('Unauthorized');
        }
        await pendingProblemRepository.delete(id);
        return { message: 'Problem removed from pending list' };
    }
}

export default new PendingProblemService();
