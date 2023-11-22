const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const users = [];

wss.on('connection', (ws) => {
  // Handle incoming messages from clients
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case 'login':
        handleLogin(ws, data);
        break;
      case 'message':
        handleMessage(data);
        break;
    }
  });

  // Handle user disconnect
  ws.on('close', () => {
    handleLogout(ws);
  });
});

function handleLogin(ws, data) {
  const user = {
    id: users.length + 1,
    username: data.username,
    ws,
  };
  users.push(user);

  // Notify all users about the new login
  broadcast({
    type: 'userList',
    users: getUsersList(),
  });

  // Send back the user's ID
  ws.send(JSON.stringify({
    type: 'login',
    id: user.id,
  }));
}

function handleMessage(data) {
  // Broadcast the message to all connected clients
  broadcast({
    type: 'message',
    username: data.username,
    content: data.content,
  });
}

function handleLogout(ws) {
  // Remove the user from the list
  const index = users.findIndex((user) => user.ws === ws);
  if (index !== -1) {
    const username = users[index].username;
    users.splice(index, 1);

    // Notify all users about the logout
    broadcast({
      type: 'userList',
      users: getUsersList(),
    });

    // Broadcast the logout message
    broadcast({
      type: 'message',
      content: `${username} has left the chat.`,
    });
  }
}

function getUsersList() {
  return users.map((user) => ({ id: user.id, username: user.username }));
}

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Serve the front-end files
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT,'0.0.0.0', () => {
  console.log('Server is running on http://0.0.0.0:3000');
});
