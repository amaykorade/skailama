import express from 'express';
import { validateProfile } from '../middleware/validation.js';
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfileTimezone
} from '../controllers/profileController.js';

const router = express.Router();

router.post('/', validateProfile, createProfile);
router.get('/', getAllProfiles);
router.get('/:id', getProfileById);
router.put('/:id/timezone', validateProfile, updateProfileTimezone);

export default router;

