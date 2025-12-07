import Event from '../models/Event.js';
import Profile from '../models/Profile.js';
import { formatDateTimeForTimezone, getCurrentTimestamp } from '../utils/timezone.js';

export const createEvent = async (req, res) => {
  try {
    const { title, timezone, startDateTime, endDateTime, profileIds } = req.body;
    
    // verify all profile IDs exist
    for (const profileId of profileIds) {
      const profile = await Profile.findById(profileId);
      if (!profile) {
        return res.status(400).json({ error: `Profile with id ${profileId} not found` });
      }
    }

    const now = getCurrentTimestamp(timezone);
    const event = new Event({
      title,
      timezone,
      startDateTime,
      endDateTime,
      profileIds: profileIds || [],
      createdAt: now,
      updatedAt: now
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const getEventsByProfileId = async (req, res) => {
  try {
    const profileId = req.params.profileId;
    const profile = await Profile.findById(profileId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const events = await Event.find({ profileIds: profileId }).sort({ startDateTime: 1 });
    
    // convert event times to user's timezone
    const eventsWithTimezone = events.map(event => {
      const startInUserTz = formatDateTimeForTimezone(event.startDateTime, profile.timezone);
      const endInUserTz = formatDateTimeForTimezone(event.endDateTime, profile.timezone);
      const createdAtInUserTz = formatDateTimeForTimezone(event.createdAt, profile.timezone);
      const updatedAtInUserTz = formatDateTimeForTimezone(event.updatedAt, profile.timezone);

      return {
        ...event.toObject(),
        startDateTime: startInUserTz,
        endDateTime: endInUserTz,
        createdAt: createdAtInUserTz,
        updatedAt: updatedAtInUserTz,
        displayTimezone: profile.timezone
      };
    });

    res.json(eventsWithTimezone);
  } catch (error) {
    console.error('Error fetching events for profile:', error);
    res.status(500).json({ error: 'Failed to fetch events for profile' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const existingEvent = await Event.findById(eventId);
    
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { title, timezone, startDateTime, endDateTime, profileIds } = req.body;

    // verify all profile IDs exist if provided
    if (profileIds) {
      for (const profileId of profileIds) {
        const profile = await Profile.findById(profileId);
        if (!profile) {
          return res.status(400).json({ error: `Profile with id ${profileId} not found` });
        }
      }
    }

    const updateData = { updatedAt: getCurrentTimestamp(timezone || existingEvent.timezone) };
    
    if (title !== undefined) updateData.title = title;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (startDateTime !== undefined) updateData.startDateTime = startDateTime;
    if (endDateTime !== undefined) updateData.endDateTime = endDateTime;
    if (profileIds !== undefined) updateData.profileIds = profileIds;

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { new: true });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

