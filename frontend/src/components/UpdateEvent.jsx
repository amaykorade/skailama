import { useState, useEffect } from 'react';
import { eventsAPI, profilesAPI } from '../services/api';
import './UpdateEvent.css';

const UpdateEvent = ({ event, onEventUpdated, onCancel, refreshProfilesTrigger }) => {
  const [title, setTitle] = useState(event.title || '');
  const [timezone, setTimezone] = useState(event.timezone || 'UTC');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfiles();
    if (event) {
      setTitle(event.title);
      setTimezone(event.timezone);
      // Convert ISO strings to local datetime format
      setStartDateTime(formatDateTimeLocal(event.startDateTime));
      setEndDateTime(formatDateTimeLocal(event.endDateTime));
      setSelectedProfileIds(event.profileIds || []);
    }
  }, [event, refreshProfilesTrigger]);

  const fetchProfiles = async () => {
    try {
      const response = await profilesAPI.getAll();
      setProfiles(response.data);
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    }
  };

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
      await eventsAPI.update(event._id, {
        title: title.trim(),
        timezone,
        startDateTime: startISO,
        endDateTime: endISO,
        profileIds: selectedProfileIds
      });
      
      if (onEventUpdated) {
        onEventUpdated();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-event-overlay">
      <form className="update-event-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h3>Update Event</h3>
          <button type="button" className="btn-close" onClick={onCancel}>×</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="updateTitle">Event Title *</label>
          <input
            type="text"
            id="updateTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="updateTimezone">Event Timezone *</label>
          <select
            id="updateTimezone"
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
          <label htmlFor="updateProfiles">Select Profiles *</label>
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
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="updateStartDateTime">Start Date & Time *</label>
            <input
              type="datetime-local"
              id="updateStartDateTime"
              value={startDateTime}
              onChange={(e) => {
                setStartDateTime(e.target.value);
                // If end date is before new start date, clear it
                if (e.target.value && endDateTime && new Date(e.target.value) >= new Date(endDateTime)) {
                  setEndDateTime('');
                }
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="updateEndDateTime">End Date & Time *</label>
            <input
              type="datetime-local"
              id="updateEndDateTime"
              value={endDateTime}
              onChange={(e) => {
                const selectedEndDate = e.target.value;
                // Validate that end date is after start date
                if (startDateTime && selectedEndDate && new Date(selectedEndDate) <= new Date(startDateTime)) {
                  setError('End date/time must be after start date/time');
                  return;
                }
                setError(null);
                setEndDateTime(selectedEndDate);
              }}
              min={startDateTime || ''}
              required
            />
            {!startDateTime && (
              <small style={{ marginTop: '0.25rem', display: 'block', fontSize: '0.8rem', color: '#718096' }}>
                Please select start date first
              </small>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateEvent;

