import express from 'express';
const router = express.Router();
import problemController from '../controllers/ProblemController';
import { protect  } from '../middleware/authMiddleware';

router.route('/')
    .post(protect, problemController.logProblem.bind(problemController))
    .get(protect, problemController.getUserProblems.bind(problemController));

router.route('/:id')
    .put(protect, problemController.updateProblem.bind(problemController))
    .delete(protect, problemController.deleteProblem.bind(problemController));

export default router;
