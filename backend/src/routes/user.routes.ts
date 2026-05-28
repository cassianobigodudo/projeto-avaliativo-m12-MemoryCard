import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// POST /api/users/register
router.post('/register', authController.register.bind(authController));

export default router;
