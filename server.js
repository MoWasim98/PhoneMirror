const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const os = require("os");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

// Serve phone page at /phone
app.get("/phone", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "phone.html"));
});

// ── Signaling Hub ──────────────────────────────────────────────────────────────
// Roles: "receiver" (laptop) and "sender" (phone)
// Only one of each at a time (single-session model)
const peers = {}; // { sender: ws, receiver: ws }

wss.on("connection", (ws) => {
  let myRole = null;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    // ── Registration ──
    if (msg.type === "register") {
      myRole = msg.role; // "sender" | "receiver"
      peers[myRole] = ws;
      console.log(`[+] ${myRole} connected`);

      const otherRole = myRole === "sender" ? "receiver" : "sender";
      if (peers[otherRole] && peers[otherRole].readyState === WebSocket.OPEN) {
        // Tell both sides the other is present
        send(ws, { type: "peer-ready", role: otherRole });
        send(peers[otherRole], { type: "peer-ready", role: myRole });
      }
      return;
    }

    // ── Forward WebRTC signaling ──
    const targetRole = myRole === "sender" ? "receiver" : "sender";
    if (peers[targetRole] && peers[targetRole].readyState === WebSocket.OPEN) {
      send(peers[targetRole], msg);
    }
  });

  ws.on("close", () => {
    if (myRole) {
      console.log(`[-] ${myRole} disconnected`);
      delete peers[myRole];
      const otherRole = myRole === "sender" ? "receiver" : "sender";
      if (peers[otherRole] && peers[otherRole].readyState === WebSocket.OPEN) {
        send(peers[otherRole], { type: "peer-disconnected", role: myRole });
      }
    }
  });

  ws.on("error", (err) => console.error("WS error:", err.message));
});

function send(ws, obj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  const localIP = getLocalIP();

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║          📡  PhoneMirror  is  running        ║");
  console.log("╚══════════════════════════════════════════════╝\n");
  console.log(`  📺  LAPTOP  →  open in your browser:`);
  console.log(`       http://localhost:${PORT}\n`);
  console.log(`  📱  PHONE   →  open in your phone browser:`);
  console.log(`       http://${localIP}:${PORT}/phone\n`);
  console.log("  (Both devices must be on the same WiFi network)\n");
});

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "YOUR_LAPTOP_IP";
}
