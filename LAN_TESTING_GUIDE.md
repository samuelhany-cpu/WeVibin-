# Testing WeVibin' with Friends on the Same WiFi

## Setup Instructions

### 1. Start the Server

```bash
cd server
npm run dev
```

The server will display something like:
```
🎵 WeVibin' server running on port 3001
📡 Local access: http://localhost:3001
🌐 Network access (share this with friends on same WiFi):
   http://192.168.1.100:3001
```

**Important:** Copy the network IP address (e.g., `192.168.1.100`)

### 2. Configure Client for LAN Access

**Option A: Using Environment Variable (Recommended)**

1. Create a `.env` file in the `client` folder:
```bash
cd client
copy .env.example .env
```

2. Edit `.env` and set your server IP:
```
VITE_SERVER_URL=http://192.168.1.100:3001
```
Replace `192.168.1.100` with your actual IP from step 1.

**Option B: Direct Code Edit**

Edit `client/src/renderer/config.ts`:
```typescript
export const SERVER_URL = 'http://192.168.1.100:3001';
```

**Option C: Update CSP (For Dynamic IPs)**

If you need to allow any LAN IP, edit `client/src/renderer/index.html`:

Find the `Content-Security-Policy` meta tag and add your specific IP range:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' http://localhost:* http://127.0.0.1:* http://192.168.1.100:* https://accounts.spotify.com ...">
```

Replace `192.168.1.100` with your actual server IP. You must specify the exact IP address in CSP.

### 3. Start the Client

```bash
cd client
npm run dev
# In another terminal:
npm run electron
```

### 4. Share with Friends

Your friends need to:

1. Get the app files (or build the app)
2. Configure their client with the same server URL (your IP address)
3. Make sure they're on the same WiFi network
4. Start their client

### Network Requirements

- ✅ All devices must be on the same WiFi network
- ✅ Firewall must allow port 3001
- ✅ Windows Firewall: Allow Node.js if prompted
- ✅ Router must allow local network communication

### Troubleshooting

**Can't Connect?**

1. Check Windows Firewall:
   - Windows Security → Firewall & network protection
   - Allow an app → Node.js

2. Find your IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under your WiFi adapter

3. Test connection:
   ```bash
   ping 192.168.1.100
   ```

4. Check if server is accessible:
   - Open browser: `http://YOUR_IP:3001`

**Still Not Working?**

- Restart the server
- Verify both devices are on same network
- Check router settings (some routers block device-to-device communication)
- Try temporarily disabling firewall to test
