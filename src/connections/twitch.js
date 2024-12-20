const { join } = require("node:path");
const { readFileSync, writeFileSync } = require("node:fs");

const { ApiClient } = require("@twurple/api");
const { ChatClient } = require("@twurple/chat");
const { RefreshingAuthProvider } = require("@twurple/auth");

const Logger = require("../utils/logger");
const config = require("../config/config");

class Twitch {
  #logger;
  #auth;
  #client;
  #chat;
  #channels;
  #level = "WARNING"; // CRITICAL, ERROR, WARNING, INFO, DEBUG = 4, TRACE = 7

  /**
   * Create a new Twitch connection.
   *
   * @param {string} name Name of the account (for logging)
   * @param {string} id Client ID for authentication
   * @param {string} secret Client secret for authentication
   * @param {string} file File location to read/write token data
   * @param {string[]} channels List of channels to join
   * @returns {Promise<Twitch>}
   */
  constructor(name, id, secret, file, channels) {
    this.#logger = new Logger(`connections/twitch/${name}`);

    // Authenticate and create the client
    this.#auth = new RefreshingAuthProvider(
      {
        clientId: id,
        clientSecret: secret,
        onRefresh: (data) => {
          this.#logger.log("Refreshing Twitch token");
          writeFileSync(file, JSON.stringify(data, null, 4), "UTF-8");
        },
      },
      JSON.parse(readFileSync(file, "UTF-8")), // "./tokens.json"
    );
    this.#client = new ApiClient({
      authProvider: this.#auth,
      logger: {
        minLevel: this.#level,
      },
    });

    // Connect to chat in the specified channels
    if (
      !this.#auth.currentScopes.includes("chat:read") ||
      !this.#auth.currentScopes.includes("chat:edit")
    ) {
      throw new Error(`Twitch client (${name}) is missing chat scopes`);
    }
    this.#channels = new Set(channels);
    this.#chat = new ChatClient({
      authProvider: this.#auth,
      channels: [...this.#channels],
      logger: {
        minLevel: this.#level,
      },
    });

    // Register standard chat events
    this.#chat.onRegister(() => {
      this.#logger.log(`Chat connected (${[...this.#channels].join(", ")})`);
    });
    this.#chat.onJoin((channel, user) => {
      this.#logger.log(`${user} joined ${channel.substring(1)}`);
      this.#channels.add(channel.substring(1));
    });
    this.#chat.onJoinFailure((channel, reason) => {
      this.#logger.warn(`Failed to join ${channel.substring(1)}: ${reason}`);
    });
    this.#chat.onPart((channel, user) => {
      this.#logger.log(`${user} parted ${channel.substring(1)}`);
      this.#channels.delete(channel.substring(1));
    });
    this.#chat.onMessageFailed((channel, reason) => {
      this.#logger.warn(
        `Failed to send message (${channel.substring(1)}): ${reason}`,
      );
    });
    this.#chat.onMessageRatelimit((channel, reason) => {
      this.#logger.warn(
        `Chat message ratelimited (${channel.substring(1)}): ${reason}`,
      );
    });
    this.#chat.onNoPermission((channel, message) => {
      this.#logger.warn(
        `No permission for chat action (${channel.substring(1)}): ${message}`,
      );
    });
    this.#chat.onAuthenticationFailure((message) => {
      this.#logger.warn(`Authentication failure: ${message}`);
    });
    this.#chat.onDisconnect((manually, reason) => {
      if (manually)
        this.#logger.log(`Disconnected from chat manually: ${reason}`);
      else this.#logger.warn(`Disconnected from chat: ${reason}`);
    });

    // Connect to Twitch
    return this.#chat.connect().then(() => this);
  }

  /**
   * Register a callback for chat messages.
   *
   * @param {function(string, string, string, Object): void} func Callback function (channel, user, message, msg)
   */
  onMessage(func) {
    this.#chat.onMessage((channel, user, message, msg) =>
      func(channel.substring(1).toLowerCase(), user, message.trim(), msg),
    );
  }

  /**
   * Join a channel.
   *
   * @param {string} channel Channel to join
   * @returns {Promise<string[] | null>} List of connected channels
   */
  async join(channel) {
    try {
      await this.#chat.join(channel);
      return [...this.#channels];
    } catch (e) {
      this.#logger.error(`Failed to join chat channel (${channel}): ${e}`);
      return null;
    }
  }

  /**
   * Leave a channel.
   *
   * @param {string} channel Channel to leave
   * @returns {Promise<string[] | null>} List of connected channels
   */
  leave(channel) {
    try {
      this.#chat.part(channel);
      return [...this.#channels];
    } catch (e) {
      this.#logger.error(`Failed to leave chat channel (${channel}): ${e}`);
      return null;
    }
  }

  /**
   * Send a message to a channel.
   *
   * @param {string} channel Channel to send message to
   * @param {string} message Message to send
   * @returns {Promise<boolean>} Whether the message was sent successfully
   */
  async send(channel, message, api) {
    try {
      // send twitch message to alveusgg channel if api is true 
      if (api === true) {
        channel = 'alveusgg';
      }     
      let messageList = [];
      if (message.length > 500){
        let splitString = message.match(/.{1,480}([\.\s,]|$)/g).map(item => item.trim());
        const remaining = message.replace(splitString.join(''), '');
        messageList = [...splitString, remaining.trim()]
      } else {
        messageList = [message];
      }
      for (let m of messageList){
        await this.#chat.say(channel, m);
      }
      return true;
    } catch (e) {
      this.#logger.error(`Failed to send chat message (${channel}): ${e}`);
      return false;
    }
  }

  /**
   * Get stream information for a user/channel.
   *
   * @param {string | number} id ID of the user/channel
   * @returns {Promise<import("@twurple/api").HelixChannel | null>} Channel information
   */
  async getStreamInfo(id) {
    try {
      // delay, displayName, gameId, gameName, id, name, title
      return await this.#client.channels.getChannelInfoById(id);
    } catch (e) {
      this.#logger.error(`Failed to get stream info (${id}): ${e}`);
      return null;
    }
  }

  /**
   * Set stream information for a user/channel.
   *
   * @param {string | number} id ID of the user/channel
   * @param {string} title Stream title
   * @param {number | "animals" | "chatting" | "pools"} game ID of the game (or "animals", "chatting", "pools")
   * @returns {Promise<boolean>} Whether the stream info was set successfully
   */
  async setStreamInfo(id, title, game) {
    try {
      const aliases = {
        animals: 272263131,
        chatting: 509658,
        pools: 116747788,
      };
      game = aliases[game] || game;

      this.#logger.log(`Setting stream info (${id}): ${title} - ${game}`);
      await this.#client.channels.updateChannelInfo(id, {
        title,
        gameId: game,
      });
      return true;
    } catch (e) {
      this.#logger.error(`Failed to set stream info (${id}): ${e}`);
      return false;
    }
  }

  /**
   * Run a commercial on a user/channel.
   *
   * @param {string | number} id ID of the user/channel
   * @param {30 | 60 | 90 | 120 | 150 | 180} length Length of the commercial
   * @returns {Promise<boolean>} Whether the commercial was run successfully
   */
  async runCommercial(id, length) {
    if (![30, 60, 90, 120, 150, 180].includes(length)) {
      this.#logger.warn(`Invalid commercial length (${id}): ${length}`);
      return false;
    }

    try {
      await this.#client.channels.startChannelCommercial(id, length);
      return true;
    } catch (e) {
      this.#logger.error(`Failed to run commercial (${id}): ${e}`);
      return false;
    }
  }

  /**
   * Create a stream marker for a user/channel.
   *
   * @param {string | number} id ID of the user/channel
   * @param {string} description Description of the marker
   * @returns {Promise<import("@twurple/api").HelixStreamMarker | null>} Marker information
   */
  async createMarker(id, description) {
    try {
      // creationDate, description, id, positionInSeconds
      return await this.#client.streams.createStreamMarker(id, description);
    } catch (e) {
      this.#logger.error(`Failed to create stream marker (${id}): ${e}`);
      return null;
    }
  }
}

/**
 * Establishes connections to the Twitch API
 *
 * `controller.connections.twitch` is the Twitch instance
 *
 * @param {import("../controller")} controller
 * @returns {Promise<void>}
 */
module.exports = async (controller) => {
  const logger = new Logger("connections/twitch");

  if (
    !process.env.ALVEUS_CLIENT_ID ||
    !process.env.ALVEUS_CLIENT_SECRET ||
    !process.env.ALVEUS_TOKEN_PATH
  ) {
    logger.warn(
      "No Twitch API credentials found. Twitch connections will not be established. To enable Twitch connections, set the ALVEUS_CLIENT_ID, ALVEUS_CLIENT_SECRET, and ALVEUS_TOKEN_PATH environment variables.",
    );
    return;
  }

  const twitch = await new Twitch(
    "AlveusSanctuary",
    process.env.ALVEUS_CLIENT_ID,
    process.env.ALVEUS_CLIENT_SECRET,
    join(process.cwd(), process.env.ALVEUS_TOKEN_PATH),
    config.twitchChannelList,
  );
  controller.connections.twitch = twitch;
};
