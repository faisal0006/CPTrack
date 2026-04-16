import express from 'express';
const router = express.Router();
import { protect  } from '../middleware/authMiddleware';
import pendingProblemController from '../controllers/PendingProblemController';

router.post('/', protect, pendingProblemController.addPendingProblem.bind(pendingProblemController));
router.get('/', protect, pendingProblemController.getPendingProblems.bind(pendingProblemController));
router.delete('/:id', protect, pendingProblemController.deletePendingProblem.bind(pendingProblemController));

export default router;
