import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { logger } from './config/logger.js';

import authRoutes from './routes/auth.routes.js';
import weightRoutes from './routes/weight.routes.js';
import workoutRoutes from './routes/workout.routes.js';
import nutritionRoutes from './routes/nutrition.routes.js';
import sleepRoutes from './routes/sleep.routes.js';
import calorieRoutes from './routes/calories.routes.js';
import caffeineRoutes from './routes/caffeine.routes.js';
import voiceRoutes from './routes/voice.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import importRoutes from './routes/import.routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

app.use(helmet({ contentSecurityPolicy: false }));

if (isDev) {
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
}

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalLimiter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/weight-logs', weightRoutes);
app.use('/api/workout-sessions', workoutRoutes);
app.use('/api/nutrition-logs', nutritionRoutes);
app.use('/api/sleep-logs', sleepRoutes);
app.use('/api/calorie-burn-logs', calorieRoutes);
app.use('/api/caffeine-logs', caffeineRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/import', importRoutes);

// Serve client build in production (same domain = no CORS needed)
const clientDist = join(__dirname, '../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(join(clientDist, 'index.html')));
}

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.info(`SUPABASE_URL set: ${!!process.env.SUPABASE_URL}`);
  logger.info(`SERVICE_ROLE_KEY set: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
});

export default app;
