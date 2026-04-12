import ProblemLog from '../models/ProblemLog';

class ProblemRepository {
    async save(problemData: any) {
        const problem = new ProblemLog(problemData);
        return await problem.save();
    }

    async findByUser(userId: any) {
        return await ProblemLog.find({ userId }).sort({ solvedDate: -1 });
    }

    async delete(problemId: any) {
        return await ProblemLog.findByIdAndDelete(problemId);
    }

    async findById(problemId: any) {
        return await ProblemLog.findById(problemId);
    }

    async update(problemId: any, data: any) {
        return await ProblemLog.findByIdAndUpdate(problemId, data, { new: true });
    }
}

export default new ProblemRepository();
