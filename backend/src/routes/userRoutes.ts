import express from 'express';
const router = express.Router();
import userController from '../controllers/UserController';
import { protect  } from '../middleware/authMiddleware';

router.get('/profile', protect, userController.getProfile.bind(userController));
router.put('/goal', protect, userController.updateGoal.bind(userController));
router.put('/handle', protect, userController.updateHandle.bind(userController));
router.post('/sync', protect, userController.syncCodeforces.bind(userController));
router.get('/potd', protect, userController.getPotd.bind(userController));
router.post('/check-potd', protect, userController.checkPotd.bind(userController));
router.get('/find-problems', protect, userController.findProblems.bind(userController));
router.get('/deep-analytics', protect, userController.getDeepAnalytics.bind(userController));

export default router;
