import axios from 'axios';

// Spotify OAuth Configuration
const SPOTIFY_CLIENT_ID = '9b64bc936f434160b7e3a97ade878737'; // Replace with your actual client ID
const REDIRECT_URI = 'wevibin://callback'; // Custom protocol for Electron
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-library-read',
].join(' ');

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number;
  uri: string;
}

class SpotifyService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;
  private player: any = null;
  private deviceId: string | null = null;

  // Get authorization URL for OAuth flow
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
    });
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async handleCallback(code: string): Promise<boolean> {
    try {
      // Note: This should be done through your backend for security
      // For now, we'll use client-side (not recommended for production)
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID,
        }) as URLSearchParams,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      // Save to localStorage
      localStorage.setItem('spotify_access_token', this.accessToken as string);
      localStorage.setItem('spotify_refresh_token', this.refreshToken || '');
      localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());

      return true;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return false;
    }
  }

  // Load saved token from storage
  loadSavedToken(): boolean {
    const token = localStorage.getItem('spotify_access_token');
    const refresh = localStorage.getItem('spotify_refresh_token');
    const expiry = localStorage.getItem('spotify_token_expiry');

    if (token && expiry) {
      this.accessToken = token;
      this.refreshToken = refresh;
      this.tokenExpiry = parseInt(expiry);

      // Check if token is expired
      if (Date.now() >= this.tokenExpiry) {
        this.refreshAccessToken();
      }

      return true;
    }

    return false;
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) return;

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken as string,
          client_id: SPOTIFY_CLIENT_ID,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      localStorage.setItem('spotify_access_token', this.accessToken as string);
      localStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
    }
  }

  // Initialize Spotify Web Playback SDK
  async initializePlayer(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.accessToken) {
        resolve(false);
        return;
      }

      // Load Spotify SDK
      if (!(window as any).Spotify) {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);

        (window as any).onSpotifyWebPlaybackSDKReady = () => {
          this.createPlayer();
          resolve(true);
        };
      } else {
        this.createPlayer();
        resolve(true);
      }
    });
  }

  private createPlayer(): void {
    const { Player } = (window as any).Spotify;

    this.player = new Player({
      name: 'WeVibin Player',
      getOAuthToken: (cb: any) => {
        cb(this.accessToken);
      },
      volume: 1.0,
    });

    // Ready
    this.player.addListener('ready', ({ device_id }: any) => {
      console.log('Spotify player ready with Device ID', device_id);
      this.deviceId = device_id;
    });

    // Not Ready
    this.player.addListener('not_ready', ({ device_id }: any) => {
      console.log('Device ID has gone offline', device_id);
    });

    this.player.connect();
  }

  // Search for tracks
  async searchTracks(query: string): Promise<SpotifyTrack[]> {
    if (!this.accessToken) return [];

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        params: {
          q: query,
          type: 'track',
          limit: 20,
        },
      });

      return response.data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        albumArt: track.album.images[0]?.url || '',
        duration: track.duration_ms / 1000,
        uri: track.uri,
      }));
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  }

  // Play a track
  async playTrack(uri: string, position: number = 0): Promise<void> {
    if (!this.accessToken || !this.deviceId) return;

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
        {
          uris: [uri],
          position_ms: position * 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }

  // Pause playback
  async pause(): Promise<void> {
    if (!this.accessToken || !this.deviceId) return;

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/pause?device_id=${this.deviceId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error('Error pausing:', error);
    }
  }

  // Resume playback
  async resume(): Promise<void> {
    if (!this.accessToken || !this.deviceId) return;

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error('Error resuming:', error);
    }
  }

  // Seek to position
  async seek(positionMs: number): Promise<void> {
    if (!this.accessToken || !this.deviceId) return;

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/seek`,
        null,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
          params: {
            position_ms: positionMs,
            device_id: this.deviceId,
          },
        }
      );
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }

  // Get current playback state
  async getCurrentState(): Promise<any> {
    if (!this.player) return null;
    return await this.player.getCurrentState();
  }

  // Set volume
  async setVolume(volume: number): Promise<void> {
    if (!this.player) return;
    await this.player.setVolume(volume);
  }

  // Logout
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;
    
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }

    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null && Date.now() < this.tokenExpiry;
  }

  getDeviceId(): string | null {
    return this.deviceId;
  }
}

export const spotifyService = new SpotifyService();
