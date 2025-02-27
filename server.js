const express = require('express');
const WebSocket = require('ws');
const mysql = require('mysql2');

// Initialize Express
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'drawing_app',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

let clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('New client connected');

  ws.on('message', (message) => {
    let data = JSON.parse(message);
    
    if (data.type === 'draw') {
      broadcast(message, ws);
    } else if (data.type === 'reset') {
      broadcast(JSON.stringify({ type: 'reset' }), ws);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

function broadcast(message, sender) {
  clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

server.listen(3000, () => console.log('WebSocket Server running on port 3000'));
