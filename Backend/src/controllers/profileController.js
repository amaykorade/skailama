import Profile from '../models/Profile.js';
import { getCurrentTimestamp } from '../utils/timezone.js';

export const createProfile = async (req, res) => {
  try {
    const { name, timezone = 'UTC' } = req.body;
    const now = getCurrentTimestamp(timezone);
    
    const profile = new Profile({
      name: name.trim(),
      timezone,
      createdAt: now,
      updatedAt: now
    });
    
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfileTimezone = async (req, res) => {
  try {
    const { timezone } = req.body;
    const now = getCurrentTimestamp(timezone);
    
    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      { timezone, updatedAt: now },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile timezone:', error);
    res.status(500).json({ error: 'Failed to update profile timezone' });
  }
};

