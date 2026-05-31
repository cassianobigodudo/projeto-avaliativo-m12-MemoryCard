import { Router } from 'express';
import { GameController } from '../controllers/game.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const gameController = new GameController();

// Todas as rotas de jogos requerem autenticação
router.use(authMiddleware);

// GET /api/games
router.get('/', gameController.index.bind(gameController));

// POST /api/games
router.post('/', gameController.create.bind(gameController));

// GET /api/games/:id
router.get('/:id', gameController.show.bind(gameController));

// PUT /api/games/:id
router.put('/:id', gameController.update.bind(gameController));

// DELETE /api/games/:id
router.delete('/:id', gameController.destroy.bind(gameController));

export default router;
