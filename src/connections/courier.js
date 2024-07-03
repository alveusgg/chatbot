const { CourierClient } = require("@trycourier/courier");

const Logger = require("../utils/logger");

const logger = new Logger("connections/courier");

class Courier {
  #client;

  /**
   * Establishes a connection to the Courier API
   *
   * @param {string} token Authorization token for the Courier API
   */
  constructor(token) {
    this.#client = CourierClient({ authorizationToken: token });
  }

  /**
   * Create a new Courier profile
   *
   * @param {string} name Name of the user
   * @param {string} [email] Email address for the profile (optional)
   * @param {string} [phoneNumber] Phone number for the profile (optional)
   * @param {string} [discordUserID] Discord user ID for the profile (optional)
   * @param {string} [discordChannelID] Discord channel ID for the profile (optional)
   * @returns {Promise<Awaited<ReturnType<import("@trycourier/courier").ICourierClient.mergeProfile>>["status"] | null>}
   */
  async createProfile(
    name,
    email,
    phoneNumber,
    discordUserID,
    discordChannelID,
  ) {
    // Base profile just has the name
    const profile = {
      recipientId: String(name),
      profile: {
        given_name: String(name),
      },
    };

    // Add the optional fields if they were provided
    if (email) profile.profile.email = String(email);
    if (phoneNumber) profile.profile.phone_number = String(phoneNumber);
    if (discordUserID)
      profile.profile.discord = {
        ...profile.profile.discord,
        user_id: String(discordUserID),
      };
    if (discordChannelID)
      profile.profile.discord = {
        ...profile.profile.discord,
        channel_id: String(discordChannelID),
      };

    try {
      const { status } = await this.#client.mergeProfile(profile);
      logger.log(`Created profile ${name}: ${status}`);
      return status;
    } catch (e) {
      logger.error(`Error creating profile ${name}`, e);
      return null;
    }
  }

  /**
   * Create a new list in Courier
   *
   * @param {string} name Name of the list
   * @param {string} [displayName] Display name of the list (optional)
   * @returns {Promise<boolean>}
   */
  async createList(name, displayName) {
    // Fallback to the name if no display name was provided
    displayName = displayName || name;

    try {
      await this.#client.lists.put(name, {
        name: displayName,
      });
      logger.log(`Created list ${name} (${displayName})`);
      return true;
    } catch (e) {
      logger.error(`Error creating list ${name} (${displayName})`, e);
      return false;
    }
  }

  /**
   * Subscribe a user to a list in Courier
   *
   * @param {string} list Name of the list
   * @param {string} user Name of the user
   * @returns {Promise<boolean>}
   */
  async subscribeToList(list, user) {
    try {
      await this.#client.lists.subscribe(list, user);
      logger.log(`Subscribed ${user} to ${list}`);
      return true;
    } catch (e) {
      logger.error(`Error subscribing ${user} to ${list}`, e);
      return false;
    }
  }

  /**
   * Unsubscribe a user from a list in Courier
   *
   * @param {string} list Name of the list
   * @param {string} user Name of the user
   * @returns {Promise<boolean>}
   */
  async unsubscribeToList(list, user) {
    try {
      await this.#client.lists.unsubscribe(listlistName, user);
      logger.log(`Unsubscribed ${user} from ${list}`);
      return true;
    } catch (e) {
      logger.error(`Error unsubscribing ${user} from ${list}`, e);
      return false;
    }
  }

  /**
   * Get the users subscribed to a list in Courier
   *
   * @param {string} list Name of the list
   * @returns {Promise<Awaited<ReturnType<import("@trycourier/courier").ICourierClient.lists.getSubscriptions>> | null>}
   */
  async getUsers(list) {
    try {
      const response = await this.#client.lists.getSubscriptions(list);
      logger.log(`Users of ${list}: ${JSON.stringify(response)}`);
      return response;
    } catch (e) {
      logger.error(`Error getting users of ${list}`, e);
      return null;
    }
  }

  /**
   * Get a user's profile from Courier
   *
   * @param {string} name Name of the user
   * @returns {Promise<Awaited<ReturnType<import("@trycourier/courier").ICourierClient.getProfile>>["profile"] | null>}
   */
  async getUser(name) {
    try {
      const { profile } = await this.#client.getProfile({
        recipientId: name,
      });
      logger.log(`User profile of ${name}: ${JSON.stringify(profile)}`);
      return profile;
    } catch (e) {
      logger.error(`Error getting user profile of ${name}`, e);
      return null;
    }
  }

  /**
   * Send a notification to a list in Courier
   *
   * @param {string} event Name of the event being sent
   * @param {string} list Name of the list to send to
   * @param {string} message Message to include in the notification
   * @param {object} [override] Override data for the notification (optional)
   * @returns {Promise<Awaited<ReturnType<import("@trycourier/courier").ICourierClient.lists.send>>["messageId"] | null>}
   */
  async sendListNotification(event, list, message, override) {
    try {
      // Create the payload, with the optional override
      const payload = {
        event: event, 
        list: list,
        data: {
          message,
        },
        // override: {
        //     discord: {
        //         body: {
        //             embed: {
        //                 title: message.title
        //                 description: message.message || "",
        //                 fields: [
        //                     {
        //                         name: "timestamp",
        //                         value: message.timestamp || "",
        //                         inline: true,
        //                     }
        //                 ],
        //             },
        //         },
        //     },
        // },
      };
      if (override) payload.override = override;

      // Send the notification
      const { messageId } = await this.#client.lists.send(payload);
      logger.log(`Sent notification to list ${list}`, messageId);
      return messageId;
    } catch (e) {
      logger.error(`Error sending notification to list ${list}`, e);
      return null;
    }
  }

  /**
   * Send a Discord notification to a list in Courier
   *
   * @param {string} event Name of the event being sent
   * @param {string} list Name of the list to send to
   * @param {string} message Message to include in the notification
   * @param {string} [description] Description to include in the notification (optional)
   * @param {{ name: string, value: string }[]} [fields] Fields to include in the notification (optional)
   * @returns {Promise<Awaited<ReturnType<import("@trycourier/courier").ICourierClient.lists.send>>["messageId"] | null>}
   */
  async sendListNotificationDiscord(event, list, message, description, fields) {
    try {
      // Create the payload, with the optional description and fields
      const payload = {
        event: event, 
        list: list,
        data: {
          message,
          description,
        },
        override: {
          discord: {
            body: {
              embed: {
                title: message.message || "",
                description: description || message.message || "",
              },
            },
          },
        },
      };
      if (fields) payload.override.discord.body.embed.fields = fields;

      // Send the notification
      const { messageId } = await this.#client.lists.send(payload);
      logger.log(`Sent Discord notification to list ${list}`, messageId);
      return messageId;
    } catch (e) {
      logger.error(`Error sending Discord notification to list ${list}`, e);
      return null;
    }
  }

  /**
   * Send a notification to a user in Courier
   *
   * @param {string} brand ID of the brand for the notification
   * @param {string} event ID of the event for the notification
   * @param {string} recipient ID of the recipient for the notification
   * @param {{ email: string, discord?: { user_id: string } }} profile User information for the notification
   * @param {string} message Message to include in the notification
   * @param {object} [override] Override data for the notification (optional)
   * @returns {Promise<Awaited<ReturnType<import("@trycourier/courier").ICourierClient.send>>["messageId"] | null>}
   */
  async sendNotification(brand, event, recipient, profile, message, override) {
    try {
      let payload = {
        brand: brand,
        eventId: event,
        recipientId: recipient,
        profile: profile,
        data: message,
      };
      if (override) payload.override = override;

      // Send the notification
      const { messageId } = await this.#client.send(payload);
      logger.log(`Sent notification to ${recipient}`, messageId);
      return messageId;
    } catch (e) {
      logger.error(`Error sending notification to ${recipient}`, e);
      return null;
    }
  }
}

/**
 * Establishes connections to the Courier API
 *
 * `controller.connections.courier` is the Courier instance
 *
 * @param {import("../controller")} controller
 * @returns {Promise<void>}
 */
module.exports = async (controller) => {
  if (!process.env.COURIER_KEY) {
    logger.warn(
      "No Courier API key found. Notifications will not be sent. To enable notifications, set the COURIER_KEY environment variable.",
    );
    return;
  }

  const courier = new Courier(process.env.COURIER_KEY);
  controller.connections.courier = courier;
};
