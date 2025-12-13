# WeVibin' Auto IP Detection

This system automatically detects your local network IP and configures the app before startup.

## How It Works

1. **Before every run**: The `detect-ip.js` script runs automatically
2. **IP Detection**: Scans your network interfaces (WiFi, Ethernet, etc.)
3. **Updates Configuration**: 
   - Updates `.env` with `VITE_SERVER_URL`
   - Updates `index.html` CSP with your current IP
4. **App Starts**: With the correct configuration for your current network

## Scripts

- `npm run detect-ip` - Manually detect and update IP
- `npm run dev` - Auto-detects IP, then starts dev server
- `npm run electron` - Auto-detects IP, then starts Electron app
- `npm start` - Auto-detects IP, builds, and starts production app

## What Gets Updated

### .env File
```env
VITE_SERVER_URL=http://192.168.x.x:3001
```

### index.html CSP
The Content Security Policy is updated to allow connections to your current IP address.

## Manual Override

If you need to use a specific IP (e.g., testing with a friend's server), edit `.env`:

```env
VITE_SERVER_URL=http://192.168.1.100:3001
```

Then run without auto-detection:
```bash
npm run watch:renderer  # Skip the predev hook
npm run electron        # Will still auto-detect
```

## Troubleshooting

**IP not detected correctly?**
- Check your network connection
- Run `npm run detect-ip` to see what IP is detected
- Check the console output for detected IP

**Want to force localhost?**
Edit `.env` manually:
```env
VITE_SERVER_URL=http://localhost:3001
```

**CSP blocking connections?**
- The script automatically updates CSP with your IP
- If issues persist, check browser console for CSP violations
- Run `npm run detect-ip` again

## Network Priority

The script detects IPs in this order:
1. WiFi/WLAN interfaces
2. Ethernet interfaces  
3. Other network interfaces
4. Falls back to localhost if no network found
