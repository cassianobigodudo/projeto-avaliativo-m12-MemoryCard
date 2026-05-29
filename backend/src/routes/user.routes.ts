import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();
const userController = new UserController();

// POST /api/users/register — público
router.post('/register', authController.register.bind(authController));

// PUT /api/users/:id — protegido: apenas o próprio usuário
router.put('/:id', authMiddleware, userController.update.bind(userController));

// DELETE /api/users/:id — protegido: apenas o próprio usuário
router.delete('/:id', authMiddleware, userController.delete.bind(userController));

export default router;
