import { Request, Response, NextFunction } from 'express';
import problemService from '../services/ProblemService';

class ProblemController {
    async logProblem(req: Request | any, res: Response | any) {
        try {
            // userId comes from auth middleware
            const problemData = { ...req.body, userId: req.user.id };
            const problem = await problemService.createProblemLog(problemData);
            res.status(201).json(problem);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteProblem(req: Request | any, res: Response | any) {
        try {
            await problemService.removeProblemLog(req.params.id);
            res.status(200).json({ message: 'Problem removed' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getUserProblems(req: Request | any, res: Response | any) {
        try {
            const problems = await problemService.getProblems(req.user.id);
            res.status(200).json(problems);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateProblem(req: Request | any, res: Response | any) {
        try {
            const updated = await problemService.updateProblemLog(req.params.id, req.user.id, req.body);
            res.status(200).json(updated);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new ProblemController();
