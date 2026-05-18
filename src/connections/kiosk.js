const Logger = require("../utils/logger");

/**
 * @typedef {Tablet} TabletConnection
 */

/**
 * Fully Kiosk Class
 *
 * Communicates with the Web-Controlled-Tablet
 */
class Tablet {
  #logger;
  #host;
  #password;

  /**
   * Establishes a connection to the Tablet
   *
   * @param {string} host Tablet url
   * @param {string} password connection password
   */
  constructor(host,password) {
    this.#logger = new Logger(`tablet`);
    this.#host = host;
    this.#password = password;
  }

  /**
   * Make a GET request to the tablet
   *
   * @param {string} endpoint Endpoint to make the request to
   * @returns {Promise<string | null>} Response body, or null if the request failed
   * @private
   */
  async #get(endpoint) {
    try {
      // Make the request
      const response = await fetch(
        `${this.#host}${endpoint}`,
      );
      // console.log("fetching",response);
      const data = await response.text();

      // If we got data, return the data
      if (data !== null && data !== undefined) return data;

      // Otherwise, log what appears to be the error and return null
      this.#logger.error(`Failed to GET ${this.#host}${endpoint}: ${data?.error?.code}`);
      return null;
    } catch (e) {
      // If the request threw an error, log it and return null
      this.#logger.error(`Failed to GET ${this.#host}${endpoint}: ${e}`);
      return null;
    }
  }

  /**
   * Trigger Application Load
   *
   * @param {string} name Android package name
   * @returns {Promise<string | null>}
   */
  async startApplication(name) {
    name = name || "com.crashinvaders.jollypet";
    let params = new URLSearchParams({ cmd:"startApplication",package:name,password:this.#password});
    const resp = await this.#get(`/?${params}`);
    if (resp === null) return null;
    return resp;
  }

  /**
   * Load Website URL
   *
   * @param {string} url Website
   * @returns {Promise<string | null>}
   */
  async loadURL(url) {
    url = url || "fully://launcher"; 
    url = encodeURI(url);
    let params = new URLSearchParams({ cmd:"loadURL",url,password:this.#password});
    const resp = await this.#get(`/?${params}`);
    if (resp === null) return null;
    return resp;
  }

  /**
   * Load Start URL
   *
   * @returns {Promise<string | null>}
   */
  async loadStartURL() {
    let params = new URLSearchParams({ cmd:"loadStartUrl",password:this.#password});
    const resp = await this.#get(`/?${params}`);
    if (resp === null) return null;
    return resp;
  }

  /**
   * Trigger Kiosk to Foreground
   *
   * @returns {Promise<string | null>}
   */
  async toForeground() {
    let params = new URLSearchParams({ cmd:"toForeground",password:this.#password});
    const resp = await this.#get(`/?${params}`);
    if (resp === null) return null;
    return resp;
  }

  /**
   * Set Tablet Volume
   *
   * @param {number} level Audio Level
   * @param {number} type Select which Audio Slider 0(system)-13
   * @returns {Promise<string | null>}
   */
  async setVolume(level,type) {
    level = level || 0; //mute
    type = type || 3; //media volume
    let params = new URLSearchParams({ cmd:"setAudioVolume",level,stream:type,password:this.#password});
    const resp = await this.#get(`/?${params}`);
    if (resp === null) return null;
    return resp;
  }

}

/**
 * Establishes connection to Tablet
 *
 * `controller.connections.tablet` is the Tablet connection
 *
 * @param {import("../controller")} controller
 * @returns {Promise<void>}
 */
module.exports = async (controller) => {
  const tabletURL = process.env.TABLET_URL; // Get the Tablet Wifi URL
  const tabletPassword = process.env.TABLET_PASSWORD; // Get the Tablet Password


  // Check if tabletURL is defined before instantiation
  if (!tabletURL || !tabletPassword) {
    console.error('TABLET_URL is not defined in environment variables.');
    process.exit(1);
  }

  try {
    controller.connections.tablet = new Tablet (tabletURL,tabletPassword); 
  } catch (error) {
    console.error('Failed to instantiate Tablet:', error.message);
    controller.connections.tablet = null; // Set to null as a fallback indicator
  }
};
