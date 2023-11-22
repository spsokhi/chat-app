let ws;
let username;
let userId;

function login() {
  username = document.getElementById('username').value;

  // Connect to WebSocket
  ws = new WebSocket('ws://192.168.1.3:3000');

  ws.onopen = () => {
    // Send login data to the server
    ws.send(JSON.stringify({
      type: 'login',
      username: username,
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case 'login':
        userId = data.id;
        showChat();
        break;
      case 'userList':
        updateUsersList(data.users);
        break;
      case 'message':
        displayMessage(data);
        break;
    }
  };
}

function showChat() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('chat-container').style.display = 'block';
}

function updateUsersList(users) {
  const userListDiv = document.getElementById('user-list');
  userListDiv.innerHTML = '';
  users.forEach((user) => {
    const userDiv = document.createElement('div');
    userDiv.textContent = user.username;
    userListDiv.appendChild(userDiv);
  });
}

function sendMessage() {
  const messageInput = document.getElementById('message');
  const message = messageInput.value;
  if (message.trim() !== '') {
    ws.send(JSON.stringify({
      type: 'message',
      username: username,
      content: message,
    }));
    messageInput.value = '';
  }
}

function displayMessage(data) {
  const chatDiv = document.getElementById('chat');
  const messageDiv = document.createElement('div');
  if (data.username) {
    messageDiv.textContent = `${data.username}: ${data.content}`;
  } else {
    messageDiv.textContent = data.content;
  }
  chatDiv.appendChild(messageDiv);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}
