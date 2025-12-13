# Spotify Integration Setup

## Prerequisites

You mentioned you have a Spotify Client ID. Here's how to set it up:

## 1. Configure Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app (or create a new one)
3. Click "Edit Settings"
4. Add Redirect URIs:
   ```
   http://localhost:5173/callback
   http://localhost:5173
   ```
5. Save changes

## 2. Add Your Client ID

Edit `client/src/renderer/services/spotify.ts` and replace:

```typescript
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
```

With your actual client ID from the Spotify Dashboard.

## 3. Important Security Note

⚠️ **The current implementation uses client-side authentication for simplicity.**

For production, you should:

1. Create a backend endpoint to handle token exchange
2. Never expose your Client Secret in the frontend
3. Use PKCE (Proof Key for Code Exchange) flow

## 4. Backend Token Exchange (Recommended)

Add this to your server:

```typescript
// server/src/index.ts
import axios from 'axios';

const SPOTIFY_CLIENT_ID = 'your_client_id';
const SPOTIFY_CLIENT_SECRET = 'your_client_secret';

app.post('/api/spotify/token', async (req, res) => {
  const { code } = req.body;
  
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:5173/callback',
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});
```

Then update the client to call your backend instead of Spotify directly.

## 5. How It Works

1. **User Authentication**
   - User clicks "Connect to Spotify"
   - Opens Spotify OAuth page
   - User grants permissions
   - Redirects back with authorization code

2. **Token Exchange**
   - App exchanges code for access token
   - Token is stored in localStorage
   - Auto-refreshes when expired

3. **Playback**
   - Uses Spotify Web Playback SDK
   - Creates a virtual device in Spotify
   - Syncs playback across all users in room

## 6. Testing Spotify Integration

1. Start the app
2. Click "🎵 Spotify" button in the room (when host)
3. Login to Spotify
4. Search for tracks
5. Select a track to play for everyone

## 7. Limitations

- Requires Spotify Premium for Web Playback SDK
- Users must authenticate with their own Spotify account
- 30-second preview for free accounts
- Rate limits apply to API calls

## 8. Syncing Spotify Across Users

The app will:
- Play the same track URI for all users
- Sync position every 5 seconds
- Auto-correct drift between users
- Handle play/pause/seek from host

## 9. Spotify + Local Files

You can switch between:
- **Spotify**: Streaming from Spotify (requires Premium)
- **Local Files**: Playing uploaded audio files (works for everyone)
