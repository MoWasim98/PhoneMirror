# 📡 PhoneMirror

Mirror your phone screen to your laptop over **local WiFi** — no cables, no accounts, no cloud.

## How It Works

- Your laptop runs a tiny Node.js server that handles **WebRTC signaling** and serves the web pages
- Your phone opens a page in its browser and streams video (screen or camera) via **WebRTC peer-to-peer**
- The video travels directly over your local WiFi — zero internet required once connected

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```

### 3. Open on your laptop
Go to: **http://localhost:3000**

### 4. Open on your phone
The terminal will print the phone URL, e.g.:
```
📱 On your PHONE, open: http://192.168.1.42:3000/phone
```

Or just **scan the QR code** shown on the laptop page!

### 5. Tap "Start Mirroring" on your phone
- **Android**: Choose "Share Screen" for full screen mirroring
- **iPhone/iPad**: Choose Camera (iOS Safari doesn't support screen capture via browser)

---

## Requirements

- Node.js 16+ installed on your laptop
- Both devices on the **same WiFi network**
- Android Chrome (for screen mirroring) or any browser (for camera)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Phone can't reach the URL | Make sure both are on same WiFi. Check your firewall allows port 3000 |
| "Share Screen" fails | Use Android Chrome. iOS doesn't support browser screen capture |
| Video is laggy | Move closer to your WiFi router |
| Black screen | Try camera mode instead of screen share |

---

## Privacy

Everything stays on your local network. No data is sent to any external server.

---

Made with WebRTC + Node.js + WebSockets 🚀
