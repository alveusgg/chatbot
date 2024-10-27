require('dotenv').config(); // Load environment variables from .env
const { onTwitchMessage } = require('../modules/legacy');
const Logger = require('../utils/logger');
const WebSocket = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache'); // Import node-cache

class API {
  #ws;
  #logger;
  #pingInterval;
  #tokenCache; // Token cache

  constructor(wsUrl, wsKey, secretKey, controller) { 
    this.wsUrl = `${wsUrl}?token=${wsKey}`; // Append wsKey to the WebSocket URL
    this.secretKey = secretKey || 'your-secret-key';
    this.controller = controller;
    this.#logger = new Logger("api");

    // Initialize token cache with a time-to-live of 30 days
    this.#tokenCache = new NodeCache({ stdTTL: 30 * 24 * 60 * 60 }); // 30 days in seconds

    if (!this.wsUrl) {
      this.#logger.error('PUBLIC_WS_URL is not defined in environment variables.');
      process.exit(1);
    }
    
    this.#createWebSocketConnection();
  }

  // Create WebSocket connection
  #createWebSocketConnection() {
    try {
      if (this.#ws) {
        this.#ws.removeAllListeners();
        this.#ws.close(); // Close the existing WebSocket if it exists
      }

      this.#ws = new ReconnectingWebSocket(this.wsUrl, [], { WebSocket });

      this.#ws.addEventListener('open', () => {
        this.#logger.log('Connected to the public API server via WebSocket');
        if (this.controller) {
          this.controller.ws = this.#ws; // Ensure controller.ws is set
          this.#logger.log('controller.ws assigned');
        }

        // Start the ping heartbeat
        this.#startHeartbeat();
      });

      this.#ws.addEventListener('message', async (event) => {
        try {
          const messageString = event.data.toString('utf8');
          let payload;

          try {
            payload = JSON.parse(messageString);
          } catch (error) {
            this.#logger.error('Failed to parse JSON:', error);
            return;
          }

          const { token, message: cmdMessage, ...rest } = payload;
          let decoded;

          // Check token in cache
          const cachedToken = this.#tokenCache.get(token);
          if (cachedToken) {
            decoded = cachedToken;
          } else {
            try {
              decoded = jwt.verify(token, this.secretKey);
              // Cache the decoded token
              this.#tokenCache.set(token, decoded);
            } catch (error) {
              this.#logger.error('Failed to verify JWT:', error);
              this.#ws.send(JSON.stringify({ error: 'Invalid or expired token' }));
              return;
            }
          }

          const userName = decoded.userName;
          const userId = decoded.userId;

          const tags = {
            userInfo: {
              userName,
              userId
            },
            ...rest
          };

          this.controller.currentResponse = this.#ws;
          this.controller.ws = this.#ws;

          try {
            await onTwitchMessage(this.controller, 'ptzapi', userName, cmdMessage, tags);
            this.#ws.send(JSON.stringify({ success: true, message: 'Command processed successfully' }));
          } catch (error) {
            this.#logger.error(`Error processing command: ${error.message}`);
            this.#ws.send(JSON.stringify({ error: 'Failed to process command' }));
          }

        } catch (error) {
          this.#logger.error(`Unexpected error handling message: ${error.message}`);
        }
      });

      this.#ws.addEventListener('close', () => {
        this.#logger.log('WebSocket connection to public API server closed');
      });

      this.#ws.addEventListener('error', (error) => {
        this.#logger.error(`WebSocket error: ${error.message}`);
      });
    } catch (error) {
      this.#logger.error(`Error creating WebSocket connection: ${error.message}`);
    }
  }

  // Start the ping heartbeat
  #startHeartbeat() {
    this.#pingInterval = setInterval(() => {
      if (this.#ws.readyState === WebSocket.OPEN) {
        this.#ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 90000); // Send a ping every 90 seconds
  }

  // Send API command
  async sendAPI(output) {
    try {
      const ws = this.controller ? this.controller.currentResponse : null;

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        this.#logger.error('WebSocket connection not found or closed');
        return;
      }

      try {
        ws.send(JSON.stringify({ message: output }));
        this.controller.currentResponse = null;
      } catch (error) {
        this.#logger.error(`Failed to send response: ${error.message}`);
      }
    } catch (error) {
      this.#logger.error(`Unexpected error in sendAPI: ${error.message}`);
    }
  }

  // Send broadcast message
  async sendBroadcastMessage(message, type = 'frontend') {
    try {
      const ws = this.controller ? this.controller.ws : null;

      if (!ws || ws.readyState !== WebSocket.OPEN) {
        this.#logger.error('WebSocket connection not found or closed');
        return;
      }

      try {
        ws.send(JSON.stringify({ type: type, data: message }));
      } catch (error) {
        this.#logger.error(`Failed to send broadcast message: ${error.message}`);
      }
    } catch (error) {
      this.#logger.error(`Unexpected error in sendBroadcastMessage: ${error.message}`);
    }
  }
}

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Export a function that instantiates the API class with controller
module.exports = (controller) => {
  try {
    const wsUrl = process.env.PUBLIC_WS_URL; // Get the Public WS server url
    const secretKey = process.env.JWT_SECRET; // Get the JWT decrypt token
    const wsKey = process.env.WS_SECRET_TOKEN; // Get the Websocket key token 
    controller.connections.api = new API(wsUrl, wsKey, secretKey, controller); 
  } catch (error) {
    console.error('Failed to instantiate API:', error.message);
  }
};
