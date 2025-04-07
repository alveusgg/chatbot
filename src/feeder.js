const { onFeederMessage } = require('../modules/legacy');
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

          this.controller.currentFeederResponse = this.#ws;

          try {
            await onFeederMessage(this.controller, cmdMessage);
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
        this.#logger.log('WebSocket connection to feeder API server closed');
      });

      this.#ws.addEventListener('error', (error) => {
        this.#logger.error(`Feeder WebSocket error: ${error.message}`);
      });
    } catch (error) {
      this.#logger.error(`Error creating Feeder WebSocket connection: ${error.message}`);
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
      if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
        this.#logger.error('Feeder WebSocket connection not found or closed');
        return;
      }

      try {
        this.#ws.send(JSON.stringify({ message: output }));
        this.controller.currentFeederResponse = null;
      } catch (error) {
        this.#logger.error(`Failed to send feeder response: ${error.message}`);
      }
    } catch (error) {
      this.#logger.error(`Unexpected error in feeder sendAPI: ${error.message}`);
    }
  }

  // Send broadcast message
  async sendBroadcastMessage(message, type = 'frontend') {
    try {
      if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
        this.#logger.error('Feeder WebSocket connection not found or closed');
        return;
      }

      try {
        this.#ws.send(JSON.stringify({ type: type, data: message }));
      } catch (error) {
        this.#logger.error(`Failed to send feeder broadcast message: ${error.message}`);
      }
    } catch (error) {
      this.#logger.error(`Unexpected error in sendBroadcastMessage: ${error.message}`);
    }
  }
}

module.exports = (controller) => {
  const wsUrl = process.env.FEEDER_WS_URL; // Get the Public WS server URL
  const secretKey = process.env.FEEDER_JWT_SECRET; // Get the JWT decrypt token
  const wsKey = process.env.FEEDER_WS_SECRET_TOKEN; // Get the WebSocket key token 

  // Check if wsUrl is defined before instantiation
  if (!wsUrl) {
    console.error('FEEDER_WS_URL is not defined in environment variables.');
    process.exit(1);
  }

  try {
    controller.connections.feeder = new API(wsUrl, wsKey, secretKey, controller); 
  } catch (error) {
    console.error('Failed to instantiate Feeder API:', error.message);
    controller.connections.feeder = null; // Set to null as a fallback indicator
  }
};
