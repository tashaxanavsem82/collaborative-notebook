const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/collaborative-notebook', { useNewUrlParser: true, useUnifiedTopology: true,  serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000, connectTimeoutMS: 5000 })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
  });

app.use(express.json());

// WebSocket connection
wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Broadcast message to all clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});