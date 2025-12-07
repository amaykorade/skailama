import { useState, useEffect } from 'react';
import { eventsAPI, profilesAPI } from '../services/api';
import './CreateEvent.css';

const CreateEvent = ({ onEventCreated, refreshProfilesTrigger }) => {
  const [title, setTitle] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileTimezone, setNewProfileTimezone] = useState('UTC');
  const [creatingProfile, setCreatingProfile] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [refreshProfilesTrigger]);

  const fetchProfiles = async () => {
    try {
      const response = await profilesAPI.getAll();
      setProfiles(response.data);
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    }
  };

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
    'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo',
    'Asia/Shanghai', 'Asia/Dubai', 'Australia/Sydney', 'America/Sao_Paulo'
  ];

  const handleProfileToggle = (profileId) => {
    setSelectedProfileIds(prev => {
      if (prev.includes(profileId)) {
        return prev.filter(id => id !== profileId);
      } else {
        return [...prev, profileId];
      }
    });
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    
    if (!newProfileName.trim()) {
      setError('Profile name is required');
      return;
    }

    try {
      setCreatingProfile(true);
      setError(null);
      const response = await profilesAPI.create({ 
        name: newProfileName.trim(), 
        timezone: newProfileTimezone 
      });
      
      // Add the newly created profile to selected profiles
      const newProfileId = response.data._id || response.data.id;
      if (newProfileId) {
        setSelectedProfileIds(prev => [...prev, newProfileId]);
      }
      
      // Reset form and close modal
      setNewProfileName('');
      setNewProfileTimezone('UTC');
      setShowCreateProfile(false);
      setError(null);
      
      // Refresh profiles list
      await fetchProfiles();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create profile');
    } finally {
      setCreatingProfile(false);
    }
  };

  const formatDateTimeLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Event title is required');
      return;
    }

    if (selectedProfileIds.length === 0) {
      setError('Please select at least one profile');
      return;
    }

    if (!startDateTime || !endDateTime) {
      setError('Start and end date/time are required');
      return;
    }

    // Convert local datetime to ISO string
    const startISO = new Date(startDateTime).toISOString();
    const endISO = new Date(endDateTime).toISOString();

    if (new Date(endISO) <= new Date(startISO)) {
      setError('End date/time must be after start date/time');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await eventsAPI.create({
        title: title.trim(),
        timezone,
        startDateTime: startISO,
        endDateTime: endISO,
        profileIds: selectedProfileIds
      });
      
      setTitle('');
      setTimezone('UTC');
      setStartDateTime('');
      setEndDateTime('');
      setSelectedProfileIds([]);
      
      if (onEventCreated) {
        onEventCreated();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-event-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="eventTitle">Event Title *</label>
        <input
          type="text"
          id="eventTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="eventTimezone">Event Timezone *</label>
        <select
          id="eventTimezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          required
        >
          {timezones.map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="eventProfiles">Select Profiles *</label>
        <div className="profiles-selection-wrapper">
          <div className="profiles-checkbox-group">
            {profiles.map(profile => (
              <label key={profile._id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedProfileIds.includes(profile._id)}
                  onChange={() => handleProfileToggle(profile._id)}
                />
                <span>{profile.name} ({profile.timezone})</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            className="create-profile-btn"
            onClick={() => setShowCreateProfile(true)}
          >
            + Create New Profile
          </button>
        </div>
        {profiles.length === 0 && (
          <p className="hint">No profiles available. Create a profile first.</p>
        )}
      </div>

      {showCreateProfile && (
        <div className="create-profile-modal-overlay" onClick={() => {
          setShowCreateProfile(false);
          setNewProfileName('');
          setNewProfileTimezone('UTC');
          setError(null);
        }}>
          <div className="create-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Create New Profile</h4>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowCreateProfile(false);
                  setNewProfileName('');
                  setNewProfileTimezone('UTC');
                  setError(null);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateProfile}>
              {error && <div className="error-message">{error}</div>}
              <div className="modal-form-group">
                <label htmlFor="modalProfileName">Profile Name *</label>
                <input
                  type="text"
                  id="modalProfileName"
                  placeholder="Enter profile name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="modal-input"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-form-group">
                <label htmlFor="modalProfileTimezone">Timezone *</label>
                <select
                  id="modalProfileTimezone"
                  value={newProfileTimezone}
                  onChange={(e) => setNewProfileTimezone(e.target.value)}
                  className="modal-input"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div className="modal-form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateProfile(false);
                    setNewProfileName('');
                    setNewProfileTimezone('UTC');
                    setError(null);
                  }}
                  disabled={creatingProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creatingProfile || !newProfileName.trim()}
                >
                  {creatingProfile ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDateTime">Start Date & Time *</label>
          <input
            type="datetime-local"
            id="startDateTime"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDateTime">End Date & Time *</label>
          <input
            type="datetime-local"
            id="endDateTime"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default CreateEvent;

