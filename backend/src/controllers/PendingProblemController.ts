import { Request, Response, NextFunction } from 'express';
import pendingProblemService from '../services/PendingProblemService';

class PendingProblemController {
    async addPendingProblem(req: Request | any, res: Response | any) {
        try {
            const data = {
                ...req.body,
                userId: req.user.id
            };
            const problem = await pendingProblemService.createPendingProblem(data);
            res.status(201).json(problem);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getPendingProblems(req: Request | any, res: Response | any) {
        try {
            const problems = await pendingProblemService.getPendingProblems(req.user.id);
            res.status(200).json(problems);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deletePendingProblem(req: Request | any, res: Response | any) {
        try {
            const result = await pendingProblemService.deletePendingProblem(req.params.id, req.user.id);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new PendingProblemController();
