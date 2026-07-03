const { WebSocketServer } = require('ws');
const url = require('url');

// Store active connections by userId
const activeConnections = new Map(); // userId -> Set of ws connections

function initSignalRCompat(server) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const pathname = url.parse(request.url).pathname;

    if (pathname === '/notificationHub') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws, request) => {
    const parsedUrl = url.parse(request.url, true);
    const userId = parsedUrl.query.userId;

    if (userId) {
      if (!activeConnections.has(userId)) {
        activeConnections.set(userId, new Set());
      }
      activeConnections.get(userId).add(ws);
    }

    // Keep-alive ping interval
    const pingInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send('{"type":6}\x1e'); // SignalR Ping
      }
    }, 15000);

    ws.on('message', (message) => {
      try {
        const msgStr = message.toString();
        // Remove trailing record separator \x1e and check
        const cleanMsg = msgStr.split('\x1e')[0];
        if (!cleanMsg) return;

        const payload = JSON.parse(cleanMsg);

        // Handshake
        if (payload.protocol === 'json' && payload.version === 1) {
          ws.send('{}\x1e'); // Confirm handshake
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      clearInterval(pingInterval);
      if (userId && activeConnections.has(userId)) {
        const userConns = activeConnections.get(userId);
        userConns.delete(ws);
        if (userConns.size === 0) {
          activeConnections.delete(userId);
        }
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket connection error:', err);
    });
  });

  console.log('SignalR-compatible WebSocket Hub initialized on /notificationHub');
}

// HTTP Negotiate Endpoint middleware
function negotiateSignalR(req, res) {
  const connectionId = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  res.json({
    negotiateVersion: 1,
    connectionId: connectionId,
    connectionToken: connectionId,
    availableTransports: [
      {
        transport: 'WebSockets',
        transferFormats: ['Text', 'Binary']
      }
    ]
  });
}

// Broadcast helper function
function sendNotificationToUser(userId, notification) {
  const userIdStr = String(userId);
  if (activeConnections.has(userIdStr)) {
    const message = JSON.stringify({
      type: 1, // Invocation message
      target: 'ReceiveNotification',
      arguments: [notification]
    }) + '\x1e';

    for (const ws of activeConnections.get(userIdStr)) {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    }
  }
}

module.exports = {
  initSignalRCompat,
  negotiateSignalR,
  sendNotificationToUser
};
