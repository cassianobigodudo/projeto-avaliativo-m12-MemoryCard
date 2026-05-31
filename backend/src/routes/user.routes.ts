import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { UserController } from '../controllers/user.controller';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();
const userController = new UserController();
const profileController = new ProfileController();

// POST /api/users/register — público
router.post('/register', authController.register.bind(authController));

// PUT /api/users/profile — protegido: atualiza perfil do usuário logado
router.put('/profile', authMiddleware, profileController.update.bind(profileController));

// DELETE /api/users/profile — protegido: exclui conta do usuário logado
router.delete('/profile', authMiddleware, profileController.delete.bind(profileController));

// PUT /api/users/:id — protegido: apenas o próprio usuário
router.put('/:id', authMiddleware, userController.update.bind(userController));

// DELETE /api/users/:id — protegido: apenas o próprio usuário
router.delete('/:id', authMiddleware, userController.delete.bind(userController));

export default router;
