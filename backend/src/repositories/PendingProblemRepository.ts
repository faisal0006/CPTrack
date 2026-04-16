import PendingProblem from '../models/PendingProblem';

class PendingProblemRepository {
    async save(data: any) {
        const problem = new PendingProblem(data);
        return await problem.save();
    }

    async findByUser(userId: any) {
        return await PendingProblem.find({ userId }).sort({ createdAt: -1 });
    }

    async delete(id: any) {
        return await PendingProblem.findByIdAndDelete(id);
    }
    
    async findById(id: any) {
        return await PendingProblem.findById(id);
    }
}

export default new PendingProblemRepository();
