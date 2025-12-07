import { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import UpdateEvent from './UpdateEvent';
import { formatDateTimeForTimezone } from '../utils/timezone';
import './EventList.css';

const EventList = ({ refreshTrigger, refreshProfilesTrigger, selectedProfile }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
    'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo',
    'Asia/Shanghai', 'Asia/Dubai', 'Australia/Sydney', 'America/Sao_Paulo'
  ];

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger, selectedProfile]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let response;
      if (selectedProfile) {
        // Fetch events assigned to the selected profile
        response = await eventsAPI.getByProfileId(selectedProfile._id);
        // Set timezone to profile's timezone when profile is selected
        if (selectedProfile.timezone) {
          setSelectedTimezone(selectedProfile.timezone);
        }
      } else {
        // Fetch all events
        response = await eventsAPI.getAll();
      }
      setEvents(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventUpdated = () => {
    setEditingEvent(null);
    fetchEvents();
  };


  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="event-list-container">
      <div className="timezone-selector">
        <label htmlFor="viewTimezone">View Events in Timezone:</label>
        <select
          id="viewTimezone"
          value={selectedTimezone}
          onChange={(e) => setSelectedTimezone(e.target.value)}
          className="timezone-select"
          disabled={selectedProfile !== null}
        >
          {timezones.map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
        {selectedProfile && (
          <span className="timezone-note">(Using {selectedProfile.name}'s timezone: {selectedProfile.timezone})</span>
        )}
      </div>

      {editingEvent && (
        <UpdateEvent 
          event={editingEvent}
          onEventUpdated={handleEventUpdated}
          onCancel={() => setEditingEvent(null)}
          refreshProfilesTrigger={refreshProfilesTrigger}
        />
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="events-list">
        {(() => {
          // If profile is selected, show all events for that profile (already filtered by API)
          // If no profile selected, filter by timezone
          const filteredEvents = selectedProfile 
            ? events 
            : events.filter(event => event.timezone === selectedTimezone);
          
          if (filteredEvents.length === 0) {
            return (
              <p className="no-events">
                {selectedProfile 
                  ? `No events found for ${selectedProfile.name}.`
                  : `No events found in ${selectedTimezone} timezone. ${events.length > 0 ? ` (${events.length} event${events.length > 1 ? 's' : ''} in other timezones)` : ''}`
                }
              </p>
            );
          }

          return filteredEvents.map(event => {
            // If profile is selected, backend already converted times to profile's timezone
            // If no profile selected, convert using selected timezone
            let startInTz, endInTz, createdAtInTz, updatedAtInTz;
            
            if (selectedProfile && event.displayTimezone) {
              // Backend already converted these to the profile's timezone
              startInTz = event.startDateTime || '';
              endInTz = event.endDateTime || '';
              createdAtInTz = event.createdAt || '';
              updatedAtInTz = event.updatedAt || '';
            } else {
              // Convert to selected timezone (only if it's an ISO string)
              const displayTimezone = selectedTimezone;
              startInTz = event.startDateTime && event.startDateTime.includes('T')
                ? formatDateTimeForTimezone(event.startDateTime, displayTimezone)
                : (event.startDateTime || '');
              endInTz = event.endDateTime && event.endDateTime.includes('T')
                ? formatDateTimeForTimezone(event.endDateTime, displayTimezone)
                : (event.endDateTime || '');
              createdAtInTz = event.createdAt && event.createdAt.includes('T')
                ? formatDateTimeForTimezone(event.createdAt, displayTimezone)
                : (event.createdAt || '');
              updatedAtInTz = event.updatedAt && event.updatedAt.includes('T')
                ? formatDateTimeForTimezone(event.updatedAt, displayTimezone)
                : (event.updatedAt || '');
            }

            return (
              <div key={event._id} className="event-card">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <div className="event-actions">
                    <button 
                      className="btn btn-small btn-secondary"
                      onClick={() => setEditingEvent(event)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
                
                <div className="event-details">
                  <p><strong>Timezone:</strong> {event.timezone}</p>
                  <p><strong>Start:</strong> {startInTz}</p>
                  <p><strong>End:</strong> {endInTz}</p>
                  <p className="event-meta">
                    <small>Created: {createdAtInTz}</small>
                    <small>Updated: {updatedAtInTz}</small>
                  </p>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default EventList;

