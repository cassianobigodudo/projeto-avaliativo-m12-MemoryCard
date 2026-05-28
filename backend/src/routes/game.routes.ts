import { Router } from 'express';
import { GameController } from '../controllers/game.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const gameController = new GameController();

// Todas as rotas de jogos requerem autenticação
router.use(authMiddleware);

// GET /api/games
router.get('/', gameController.index);

// POST /api/games
router.post('/', gameController.create);

// GET /api/games/:id
router.get('/:id', gameController.show);

// PUT /api/games/:id
router.put('/:id', gameController.update);

// DELETE /api/games/:id
router.delete('/:id', gameController.destroy);

export default router;
