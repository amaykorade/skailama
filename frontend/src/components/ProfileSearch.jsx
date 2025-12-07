import { useState, useEffect } from 'react';
import { profilesAPI } from '../services/api';
import './ProfileSearch.css';

const ProfileSearch = ({ onProfileCreated, onProfileSelected }) => {
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileTimezone, setNewProfileTimezone] = useState('UTC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-search-container')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const fetchProfiles = async () => {
    try {
      const response = await profilesAPI.getAll();
      setProfiles(response.data);
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    
    if (!newProfileName.trim()) {
      setError('Profile name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await profilesAPI.create({ 
        name: newProfileName.trim(), 
        timezone: newProfileTimezone 
      });
      setNewProfileName('');
      setNewProfileTimezone('UTC');
      setShowCreateForm(false);
      setShowDropdown(false);
      fetchProfiles();
      // Notify parent component that a profile was created
      if (onProfileCreated) {
        onProfileCreated();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
    'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo',
    'Asia/Shanghai', 'Asia/Dubai', 'Australia/Sydney', 'America/Sao_Paulo'
  ];

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setSearchTerm(''); // Clear search term to hide search results
    setShowDropdown(false);
    if (onProfileSelected) {
      onProfileSelected(profile);
    }
  };

  const handleClearSelection = () => {
    setSelectedProfile(null);
    setSearchTerm('');
    if (onProfileSelected) {
      onProfileSelected(null);
    }
  };

  return (
    <div className="profile-search-container">
      <div className="profile-search-header">
        <div className={`search-input-wrapper ${selectedProfile ? 'has-selection' : ''}`}>
          <input
            type="text"
            placeholder={selectedProfile ? selectedProfile.name : "Search or select profile..."}
            value={selectedProfile ? '' : searchTerm}
            onChange={(e) => {
              if (selectedProfile) {
                // If a profile is selected, clear selection first
                handleClearSelection();
              }
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (!selectedProfile) {
                setShowDropdown(true);
              }
            }}
            className="profile-search-input"
          />
          {selectedProfile && (
            <button
              type="button"
              className="clear-selection-btn"
              onClick={handleClearSelection}
              title="Clear selection"
            >
              ×
            </button>
          )}
          <button
            type="button"
            className="dropdown-toggle"
            onClick={() => {
              if (selectedProfile) {
                // If profile is selected, clear it and show dropdown
                handleClearSelection();
              }
              setShowDropdown(!showDropdown);
            }}
          >
            ▼
          </button>
        </div>
      </div>

      {showDropdown && !searchTerm && !selectedProfile && (
        <div className="profile-dropdown-menu">
          <button
            type="button"
            className="dropdown-option create-option"
            onClick={handleCreateClick}
          >
            <span className="option-icon">+</span>
            <span>Create Profile</span>
          </button>
          {profiles.length > 0 && (
            <>
              <div className="dropdown-divider"></div>
              <div className="dropdown-section-header">Existing Profiles</div>
              {profiles.map(profile => (
                <button
                  key={profile._id}
                  type="button"
                  className={`dropdown-option profile-option ${selectedProfile?._id === profile._id ? 'selected' : ''}`}
                  onClick={() => handleProfileSelect(profile)}
                >
                  <span className="profile-name">{profile.name}</span>
                  <span className="profile-timezone">{profile.timezone}</span>
                  {selectedProfile?._id === profile._id && (
                    <span className="selected-indicator">✓</span>
                  )}
                </button>
              ))}
            </>
          )}
          {profiles.length === 0 && (
            <>
              <div className="dropdown-divider"></div>
              <div className="dropdown-option info-option">
                <span>No profiles yet. Create one to get started!</span>
              </div>
            </>
          )}
        </div>
      )}

      {showCreateForm && (
        <form className="profile-create-form" onSubmit={handleCreateProfile}>
          <div className="form-header">
            <h4>Create New Profile</h4>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowCreateForm(false);
                setError(null);
              }}
            >
              ×
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Profile name"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            className="profile-name-input"
            required
            autoFocus
          />
          <select
            value={newProfileTimezone}
            onChange={(e) => setNewProfileTimezone(e.target.value)}
            className="profile-timezone-select"
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowCreateForm(false);
                setError(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      )}

      {searchTerm && !selectedProfile && (
        <div className="profile-search-results">
          {filteredProfiles.length === 0 ? (
            <div className="no-results-container">
              <p className="no-results">No profiles found matching "{searchTerm}"</p>
              <button
                type="button"
                className="btn-create-from-search"
                onClick={handleCreateClick}
              >
                + Create New Profile
              </button>
            </div>
          ) : (
            <ul className="profile-list">
              {filteredProfiles.map(profile => (
                <li 
                  key={profile._id} 
                  className={`profile-item ${selectedProfile?._id === profile._id ? 'selected' : ''}`}
                  onClick={() => handleProfileSelect(profile)}
                >
                  <div className="profile-info">
                    <span className="profile-name">{profile.name}</span>
                    <span className="profile-timezone">{profile.timezone}</span>
                    {selectedProfile?._id === profile._id && (
                      <span className="selected-indicator">✓</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSearch;

