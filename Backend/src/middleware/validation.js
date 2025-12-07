import { isValidTimezone } from '../utils/timezone.js';

export const validateEvent = (req, res, next) => {
  const { title, timezone, startDateTime, endDateTime, profileIds } = req.body;

  // check required fields
  if (!title || !timezone || !startDateTime || !endDateTime) {
    return res.status(400).json({ 
      error: 'Missing required fields: title, timezone, startDateTime, endDateTime' 
    });
  }

  // validate timezone
  if (!isValidTimezone(timezone)) {
    return res.status(400).json({ error: 'Invalid timezone' });
  }

  // validate profileIds
  if (!profileIds || !Array.isArray(profileIds) || profileIds.length === 0) {
    return res.status(400).json({ error: 'At least one profile must be selected' });
  }

  // validate dates
  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);

  if (isNaN(startDate.getTime())) {
    return res.status(400).json({ error: 'Invalid start date/time format' });
  }

  if (isNaN(endDate.getTime())) {
    return res.status(400).json({ error: 'Invalid end date/time format' });
  }

  // check end date is not before or equal to start date
  if (endDate <= startDate) {
    return res.status(400).json({ error: 'End date/time must be after start date/time' });
  }

  next();
};

export const validateProfile = (req, res, next) => {
  const { name, timezone } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Profile name is required' });
  }

  if (timezone && !isValidTimezone(timezone)) {
    return res.status(400).json({ error: 'Invalid timezone' });
  }

  next();
};

