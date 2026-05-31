import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import gameRoutes from './routes/game.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'MemoryCard API está no ar' });
});

export default app;
