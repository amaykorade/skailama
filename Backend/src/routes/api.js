import express from 'express';
import profilesRouter from './profiles.js';
import eventsRouter from './events.js';

const router = express.Router();

// health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// route handlers
router.use('/profiles', profilesRouter);
router.use('/events', eventsRouter);

export default router;

