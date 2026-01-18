const { Controller } = require("unifi-client");

const Logger = require("../utils/logger");

const logger = new Logger("connections/unifi");

/**
 * @typedef {Unifi} Unifi
 */

class Unifi {
  /**
   * Regex to check valid MAC address
   *
   * @type {RegExp}
   */
  static #reMac = new RegExp(
    /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}.[0-9a-fA-F]{4}.[0-9a-fA-F]{4})$/,
  );

  /** @type {import("unifi-client").Site} */
  #site;

  /**
   * Override data as injected by addOverrides
   *
   * @typedef {{ mac: string, name: string, client_name: string, override: true }} BaseOverriddenClient
   */

  /**
   * Full client data from Unifi, for an overridden client
   *
   * @typedef {import("unifi-client").Client & BaseOverriddenClient} OverriddenClient
   */

  /**
   * Full client data from Unifi, for a standard client
   *
   * @typedef {import("unifi-client").Client & { client_name: string }} StandardClient
   */

  /** @type {Record<string, BaseOverriddenClient | OverriddenClient | StandardClient>} */
  #clients = {};

  /**
   * Establishes a connection to a Unifi Console
   *
   * @param {string} host Hostname or IP address of the camera
   * @param {string} username Username to use for authentication
   * @param {string} password Password to use for authentication
   * @param {Record<string, string>} [overrides={}] Mapping of MAC addresses to names (to override names from Unifi)
   * @returns {Promise<Unifi>}
   */
  constructor(host, username, password, overrides = {}) {
    // Create the controller
    const controller = new Controller({
      username: username,
      password: password,
      url: "https://" + host.replace(/https?:\/\//i, ""),
      strictSSL: false,
    });

    // Add any initial overrides
    this.addOverrides(overrides);

    // Start the connection
    return controller.login().then(async () => {
      // Get the default site
      const sites = await controller.getSites();
      this.#site = sites.find((s) => s.name === "default") || sites[0];
      if (!this.#site) throw new Error("No sites found");

      // Populate the full client data, and log how many we found
      const clients = await this.getClients();
      logger.log(`Connected. ${Object.keys(clients).length} clients`);

      // Return the instance
      return this;
    });
  }

  /**
   * Override the names of clients by MAC address
   *
   * @param {Record<string, string>} overrides Mapping of MAC addresses to names (to override names from Unifi)
   */
  addOverrides(overrides) {
    for (const [mac, name] of Object.entries(overrides)) {
      this.#clients[mac] = {
        // Merge with any existing data for this client
        ...this.#clients[mac],

        // Set the mac address and name, marking it as an override
        mac,
        name,
        client_name: name.toLowerCase().replaceAll(" ", ""),
        override: true,
      };
    }
  }

  /**
   * Get all clients from Unifi
   *
   * @returns {Promise<Readonly<Record<string, OverriddenClient | StandardClient>>>}
   */
  async getClients() {
    // Get all the clients from Unifi
    const clients = await this.#site.clients.list();
    for (const client of clients) {
      // Get the MAC address and name
      const mac = client.mac.toLowerCase();
      const name = (client.name || client.hostname || mac)
        .toLowerCase()
        .replaceAll(" ", "");

      // Clone and store the client data
      this.#clients[mac] = {
        ...client,

        // Apply any overrides, and use the cleaned up name
        name: this.#clients[mac]?.override
          ? this.#clients[mac].name
          : client.name,
        client_name: this.#clients[mac]?.override
          ? this.#clients[mac].client_name
          : name,
      };
    }

    // Return a deep-frozen copy of the clients
    return Object.freeze(
      Object.fromEntries(
        Object.entries(this.#clients).map(([mac, client]) => [
          mac,
          Object.freeze(client),
        ]),
      ),
    );
  }

  /**
   * Get a specific client by MAC address
   *
   * @param {string} mac MAC address of the client to get
   * @returns {Promise<Readonly<StandardClient> | null>}
   */
  async getClientByMac(mac) {
    // Fetch the raw device from Unifi
    // TODO: Should this check that `mac` is a valid MAC address?
    const response = await this.#site
      .getInstance()
      .get(`/stat/sta/${mac.toLowerCase()}`)
      .catch((e) => {
        logger.error(`Failed to get client ${mac}: ${e}`);
        return null;
      });

    // Extract the returned clients, and find the matching client
    // TODO: What does the data structure look like? Is it StandardClient? Code in getSignal would suggest `ap_mac` is a thing, which isn't in StandardClient
    const client = response?.data?.data?.find((d) => d.mac === mac);
    if (!client) {
      logger.log(`Failed to find client ${mac}`);
      return null;
    }

    // Set the client_name using the cleaned up name
    // TODO: Abstract this, same logic in getClients (and partially addOverrides)
    const name = (client.name || client.hostname || mac)
      .toLowerCase()
      .replaceAll(" ", "");
    logger.log(`Found client ${name} (${mac})`);

    // Return a frozen copy of the client
    // TODO: Should this apply overrides?
    return Object.freeze({
      ...client,
      client_name: name,
    });
  }

  /**
   * Get clients matching a given name
   *
   * @param {string} name Client name to look up
   * @returns {Promise<Readonly<Exclude<Awaited<ReturnType<Unifi["getClientByMac"]>>, null>[]>>}
   */
  async getClientsByName(name) {
    return (
      Promise.all(
        // Convert the name to matching MAC addresses
        this.#convertNameToMacs(name)
          // And get the full client data for each MAC address
          .map((mac) => this.getClientByMac(mac)),
      )
        // Filter out any MAC addresses that didn't match a client
        .then((clients) => clients.filter(Boolean))
    );
  }

  /**
   * Get signal data for a given client name
   *
   * @param {string} name Client name to look up
   * @returns {Promise<Readonly<{ client_mac: string, hostname: string, signal: number, ap_mac: string, ap_name: string, name: string }> | null>}
   */
  async getSignal(name) {
    // Convert the name to a matching client with a signal
    const client = await this.#convertNameToClient(name);
    if (!client) {
      logger.log(`Failed to find client ${name} with signal`);
      return null;
    }

    // Extract some core signal and AP data from the client
    const hostname = client.client_name;
    const signal = client.signal;
    const client_mac = client.mac;
    const ap_mac = client.ap_mac;
    const ap_name = this.#convertMacToName(ap_mac);
    logger.log(
      `Client ${hostname} is connected to ${ap_name} (${ap_mac}) with signal ${signal}`,
    );
    return {
      hostname,
      signal,
      client_mac,
      ap_mac,
      ap_name,
      name,
    };
  }

  /**
   * Force a client to reconnect by MAC address
   *
   * @param {string} mac MAC address of the client to reconnect
   * @returns {Promise<boolean>}
   */
  async clientReconnectByMac(mac) {
    const response = await this.#site
      .getInstance()
      .post("/cmd/stamgr", {
        cmd: "kick-sta",
        mac: mac.toLowerCase(),
      })
      .catch((e) => {
        logger.error(`Failed to reconnect ${mac}: ${e}`);
        return null;
      });

    // If we got an ok response code, return true
    const data = response?.data?.meta;
    if (data?.rc === "ok") {
      logger.log(`Reconnected ${mac}`);
      return true;
    }

    // Otherwise, log the error and return the response
    logger.log(`Failed to reconnect ${mac}: ${data?.rc}, ${data?.msg}`);
    return false;
  }

  /**
   * Force a client to reconnect by name
   *
   * @param {string} name Client name to look up and reconnect
   * @returns {Promise<boolean>}
   */
  async clientReconnect(name) {
    // Convert the name to a matching client with a signal
    const client = await this.#convertNameToClient(name);
    if (!client) {
      logger.log(`Failed to find client ${name} to reconnect`);
      return false;
    }

    // Attempt to reconnect the client
    return this.clientReconnectByMac(client.mac);
  }

  /**
   * Convert a client name to a client object
   *
   * @param {string} name Client name to look up
   * @returns {ReturnType<Unifi["getClientByMac"]>}
   * @private
   */
  async #convertNameToClient(name) {
    // Convert the name to matching MAC addresses
    // and, iterate through them until we find a client with a signal
    for (const mac of this.#convertNameToMacs(name)) {
      const client = await this.getClientByMac(mac);
      if (client?.signal && client?.client_name) return client;
    }

    // If we didn't find a client with a signal, return null
    return null;
  }

  /**
   * Convert a client name to a list of matching MAC addresses
   *
   * @param {string} name Client name to look up
   * @returns {string[]} List of matching MAC addresses
   * @private
   */
  #convertNameToMacs(name) {
    // If we were given a valid MAC address, just return it
    if (this.isValidMacAddress(name)) return [name];

    // Find all the matching clients,
    // sort them by most recently seen,
    // and return their MAC addresses
    const search = (name || "").toLowerCase().replaceAll(" ", "");
    return Object.values(this.#clients)
      .filter((client) => client.client_name === search)
      .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
      .map((client) => client.mac);
  }

  /**
   * Convert a MAC address to a client name
   *
   * @param {string} mac MAC address to look up
   * @returns {string} Matching client name, or MAC address if no name is found
   * @private
   */
  #convertMacToName(mac) {
    return this.#clients[mac]?.client_name || mac;
  }

  /**
   * Check if a given value is a valid MAC address
   *
   * @param {string} str Value to check
   * @returns {boolean}
   */
  isValidMacAddress(str) {
    return str && typeof str === "string" && Unifi.#reMac.test(str);
  }
}

/**
 * Establishes connections to Unifi Console
 *
 * `controller.connections.unifi` is the Unifi connection
 *
 * @param {import("../controller")} controller
 * @returns {Promise<void>}
 */
module.exports = async (controller) => {
  controller.connections.unifi = {};
  return;
  const unifi = new Unifi(
    process.env.UNIFI_IP,
    process.env.UNIFI_USERNAME,
    process.env.UNIFI_PASSWORD,
    JSON.parse(process.env.UNIFI_AP_MACS) || {},
  );
  controller.connections.unifi = unifi;
};
