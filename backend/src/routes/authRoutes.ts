import express from 'express';
const router = express.Router();
import authController from '../controllers/AuthController';

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

export default router;
