# 🚀 Quick Start Guide - WeVibin'

## 🎯 Easiest Way - Double-Click to Start!

### Windows Users
Just **double-click** `start-wevibin.bat` in the root folder!

This will:
- ✅ Detect your IP automatically
- ✅ Build the app
- ✅ Start server, Vite, and Electron
- ✅ Open 3 windows (Server, Vite, App)

To stop: **Double-click** `stop-wevibin.bat`

---

## 📝 Manual Method

### 1. Start Server (Terminal 1)
```bash
cd server
npm run dev
```

You'll see:
```
🎵 WeVibin' server running on port 3001
📡 Local access: http://localhost:3001
🌐 Network access: http://192.168.0.106:3001
```

### 2. Build & Start Client (Terminal 2)
```bash
cd client
npm run build:main
npm run build:preload
node detect-ip.js
npx vite
```

### 3. Start Electron (Terminal 3)
```bash
cd client
npx cross-env NODE_ENV=development electron .
```

**Auto-detection runs before startup:**
```
🔍 Detected local IP: 192.168.0.106
🌐 Server URL: http://192.168.0.106:3001
✅ Updated .env file with server URL
✅ Updated CSP with IP: 192.168.0.106
```

That's it! The app will automatically use the correct IP.

## What Happens Automatically

✅ Detects your current network IP (WiFi/Ethernet)  
✅ Updates `.env` with correct server URL  
✅ Updates Content Security Policy with your IP  
✅ Starts app with proper configuration  

## Network Changes

If your IP changes (different WiFi, network restart, etc.):
- Just restart the app normally
- Auto-detection will pick up the new IP
- No manual configuration needed!

## Development Commands

```bash
# Full development (auto-detects IP first)
cd client
npm run dev        # Start dev server (auto-detects)
npm run electron   # Start Electron (auto-detects)

# Manual IP detection
npm run detect-ip  # See what IP is detected

# Production build (auto-detects before build)
npm start
```

## Troubleshooting

**App not connecting?**
1. Check server is running: `cd server && npm run dev`
2. Verify IP detection: `cd client && npm run detect-ip`
3. Check console for actual IP being used

**Need to use a specific IP?**
Edit `client/.env` manually:
```env
VITE_SERVER_URL=http://192.168.1.100:3001
```

**Friend can't connect?**
1. Get your IP from server startup message
2. Share it with friends: `http://YOUR_IP:3001`
3. Make sure you're on same WiFi network

## File Changes (Automatic)

These files are updated automatically - no need to edit:

- `client/.env` - Server URL with your current IP
- `client/src/renderer/index.html` - CSP updated with your IP

## Next Steps

1. ✅ Server is running
2. ✅ Client auto-detected IP and started
3. ✅ Create a room and start vibing!

For LAN testing with friends, see: `FRIEND_CONNECTION_GUIDE.md`
