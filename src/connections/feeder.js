const Logger = require("../utils/logger");

/**
 * Feeder Class
 *
 * Board: Unexpected Maker FeatherS3
 * Communicates with the Web-Controlled-Feeder
 */
class Feeder {
  #logger;
  #host;

  /**
   * Establishes a connection to the Feeder
   *
   * @param {string} name Name of the camera (for logging)
   */
  constructor(host) {
    this.#logger = new Logger(`feeder`);
    this.#host = host;
  }

  /**
   * Make a GET request to the camera
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
      console.log("fetching",response);
      const data = await response.text();

      // If we got data, return the data
      if (data !== null && data !== undefined) return data;

      // Otherwise, log what appears to be the error and return null
      this.#logger.error(`Failed to GET ${endpoint}: ${data?.error?.code}`);
      return null;
    } catch (e) {
      // If the request threw an error, log it and return null
      this.#logger.error(`Failed to GET ${endpoint}: ${e}`);
      return null;
    }
  }

  /**
   * Make a binary GET request to the camera
   *
   * @param {string} endpoint Endpoint to make the request to
   * @returns {Promise<string | null>} Response body, or null if the request failed
   * @private
   */
  async #getBinary(endpoint) {
    try {
        const url = `http://${this.#host}${endpoint}`;
        this.#logger.log(`Fetching binary data from: ${url}`); // Log the request URL

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'image/jpeg' // Specify the expected content type
            }
        });

        if (!response.ok) {
            this.#logger.error(`Failed to GET ${endpoint}: ${response.status} ${response.statusText}`);
            return null; // Return null if the response is not OK
        }

        // Return the response as an ArrayBuffer
        const data = await response.arrayBuffer();
        this.#logger.log('Received ArrayBuffer of size:', data.byteLength); // Log the size of the ArrayBuffer
        return data;
    } catch (e) {
        this.#logger.error(`Failed to GET ${endpoint}: ${e.message}`);
        return null;
    }
  }
  
  /**
   * Make a POST request to the feeder
   *
   * Parses the response as JSON
   *
   * @param {string} endpoint Endpoint to make the request to
   * @param {any} body Request body (will be stringified as JSON)
   * @returns {Promise<any | null>} Response body, or null if the request failed
   * @private
   */
  async #post(endpoint, body) {
    try {
      // Make the request
      const response = await fetch(
        `http://${this.#host}${endpoint}`,
        {
          method: "post",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await response.json();

      // If we got data and no error, return the data
      if (data !== null && data !== undefined && data.error === null)
        return data;

      // Otherwise, log what appears to be the error and return null
      this.#logger.error(`Failed to POST ${endpoint}: ${data?.error?.code}`);
      return null;
    } catch (e) {
      // If the request threw an error, log it and return null
      this.#logger.error(`Failed to POST ${endpoint}: ${e}`);
      return null;
    }
  }

  /**
   * Get the tank status
   *
   * @returns {Promise<number | null>}
   */
  async getTank() {
    const resp = await this.#get("/tank");
    if (resp === null) return null;
    return resp;
  }

  /**
   * Trigger a Feed
   *
   * @returns {Promise<number | null>}
   */
  async feed() {
    const resp = await this.#get("/feed");
    if (resp === null) return null;
    return resp;
  }
}

/**
 * Establishes connection to Feeder
 *
 * `controller.connections.feeder` is the Feeder connection
 *
 * @param {import("../controller")} controller
 * @returns {Promise<void>}
 */
module.exports = async (controller) => {
  const feederUrl = process.env.FEEDER_URL; // Get the Feeder Wifi URL

  // Check if feederUrl is defined before instantiation
  if (!feederUrl) {
    console.error('FEEDER_URL is not defined in environment variables.');
    process.exit(1);
  }

  try {
    controller.connections.feeder = new Feeder (feederUrl); 
  } catch (error) {
    console.error('Failed to instantiate Feeder:', error.message);
    controller.connections.feeder = null; // Set to null as a fallback indicator
  }
};
