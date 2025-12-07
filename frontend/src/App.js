import { useState } from 'react';
import CreateEvent from './components/CreateEvent';
import EventList from './components/EventList';
import ProfileSearch from './components/ProfileSearch';
import './App.css';

function App() {
  const [refreshEvents, setRefreshEvents] = useState(0);
  const [refreshProfiles, setRefreshProfiles] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleEventCreated = () => {
    setRefreshEvents(prev => prev + 1);
  };

  const handleProfileCreated = () => {
    setRefreshProfiles(prev => prev + 1);
  };

  const handleProfileSelected = (profile) => {
    setSelectedProfile(profile);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div>
          <h1>Event Management</h1>
          <div className="header-right">
            <ProfileSearch 
              onProfileCreated={handleProfileCreated}
              onProfileSelected={handleProfileSelected}
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="events-section">
          <div className="create-event-section">
            <h2>Create Event</h2>
            <CreateEvent 
              onEventCreated={handleEventCreated}
              refreshProfilesTrigger={refreshProfiles}
            />
          </div>

          <div className="all-events-section">
            <h2>{selectedProfile ? `${selectedProfile.name}'s Events` : 'All Events'}</h2>
            <EventList 
              refreshTrigger={refreshEvents}
              refreshProfilesTrigger={refreshProfiles}
              selectedProfile={selectedProfile}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
