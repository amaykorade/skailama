import express from 'express';
import { validateEvent } from '../middleware/validation.js';
import {
  createEvent,
  getAllEvents,
  getEventById,
  getEventsByProfileId,
  updateEvent
} from '../controllers/eventController.js';

const router = express.Router();

router.post('/', validateEvent, createEvent);
router.get('/', getAllEvents);
router.get('/profile/:profileId', getEventsByProfileId);
router.get('/:id', getEventById);
router.put('/:id', validateEvent, updateEvent);

export default router;

