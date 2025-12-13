import React, { useState, useEffect } from 'react';
import { spotifyService, SpotifyTrack } from '../services/spotify';

interface SpotifyIntegrationProps {
  onTrackSelected: (track: SpotifyTrack) => void;
  onClose: () => void;
}

export function SpotifyIntegration({ onTrackSelected, onClose }: SpotifyIntegrationProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const hasToken = spotifyService.loadSavedToken();
    if (hasToken && spotifyService.isAuthenticated()) {
      setIsAuthenticated(true);
      spotifyService.initializePlayer();
    }

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    const success = await spotifyService.handleCallback(code);
    if (success) {
      setIsAuthenticated(true);
      await spotifyService.initializePlayer();
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleLogin = () => {
    const authUrl = spotifyService.getAuthUrl();
    window.open(authUrl, '_blank');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await spotifyService.searchTracks(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    onTrackSelected(track);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ color: '#1DB954' }}>🎵</span> Spotify
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ✕
          </button>
        </div>

        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px',
            }}>
              Connect your Spotify account to play music together
            </p>
            <button
              onClick={handleLogin}
              style={{
                padding: '14px 32px',
                background: '#1DB954',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Connect to Spotify
            </button>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for songs, artists, albums..."
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                style={{
                  padding: '12px 24px',
                  background: '#1DB954',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  opacity: isSearching ? 0.7 : 1,
                }}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Search Results */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {searchResults.length === 0 && !isSearching && (
                <p style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  padding: '40px 0',
                }}>
                  Search for music to get started
                </p>
              )}

              {searchResults.map((track) => (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(track)}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                >
                  <img
                    src={track.albumArt}
                    alt={track.album}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '4px',
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#374151',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {track.name}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {track.artist}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    alignSelf: 'center',
                  }}>
                    {Math.floor(track.duration / 60)}:{Math.floor(track.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
