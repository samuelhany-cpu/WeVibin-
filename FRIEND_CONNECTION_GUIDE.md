# WeVibin' - How to Connect with Friends (Quick Guide)

## ⚠️ IMPORTANT - Your Friend Should NOT Open the Server URL in Browser!

If your friend sees "Cannot GET /", they're trying to access the server directly in a browser. **This won't work!**

## What Your Friend Needs to Do:

### Step 1: Get the App Files
Your friend needs the **entire WeVibin app** on their computer (the same files you have).

### Step 2: Install Dependencies (One Time)
```bash
cd client
npm install
```

### Step 3: Configure Server Address
1. In the `client` folder, create a file named `.env`
2. Add this line (replace with YOUR IP from the server startup message):
   ```
   VITE_SERVER_URL=http://192.168.1.147:3001
   ```

### Step 4: Start the Client App
```bash
# Terminal 1 - Start the dev server
cd client
npm run dev

# Terminal 2 - Start Electron
cd client
npm run electron
```

## What You See:
- ✅ **Correct**: Electron window opens with WeVibin' app
- ❌ **Wrong**: Browser showing "Cannot GET /"

## Server vs Client:

### Server (runs on YOUR computer):
```bash
cd server
npm run dev
```
Output shows: `http://192.168.1.147:3001` ← This is what friends put in `.env`

### Client (runs on EACH person's computer):
```bash
cd client
npm run dev      # Terminal 1
npm run electron # Terminal 2
```

## Checklist:
- [ ] Both on same WiFi network
- [ ] Friend has the app files (not just the URL)
- [ ] Friend created `.env` with your server IP
- [ ] Friend ran `npm install` in client folder
- [ ] Friend ran `npm run dev` then `npm run electron`
- [ ] Friend sees Electron window (not browser)

## Still Not Working?

### Check Firewall (on your computer):
1. Windows Security → Firewall
2. Allow Node.js through firewall

### Verify Connection:
On friend's computer, open browser and go to: `http://YOUR_IP:3001`
Should show: `{"status":"running","message":"WeVibin' server is running..."}`

If that works, the server is accessible! The friend just needs to run the CLIENT app (not access in browser).
