import { Request, Response, NextFunction } from 'express';
import authService from '../services/AuthService';

class AuthController {
    async register(req: Request | any, res: Response | any) {
        try {
            const user = await authService.registerUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async login(req: Request | any, res: Response | any) {
        try {
            const user = await authService.authenticateUser(req.body);
            res.status(200).json(user);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}

export default new AuthController();
