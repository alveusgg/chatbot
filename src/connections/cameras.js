const DigestFetch = require("digest-fetch");

const Logger = require("../utils/logger");
const config = require("../config/config");

/**
 * Axis Camera Vapix Class
 *
 * https://www.axis.com/vapix-library/subjects/t10175981/section/t10036011/display
 */
class Axis {
  #logger;
  #host;
  #client;

  /**
   * Establishes a connection to an Axis camera
   *
   * @param {string} name Name of the camera (for logging)
   * @param {string} host Hostname or IP address of the camera
   * @param {string} username Username to authenticate with
   * @param {string} password Password to authenticate with
   */
  constructor(name, host, username, password) {
    this.#logger = new Logger(`connections/cameras/${name}`);
    this.#host = host;
    this.#client = new DigestFetch(username, password);
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
      const response = await this.#client.fetch(
        `http://${this.#host}${endpoint}`,
      );
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
        console.log(`Fetching binary data from: ${url}`); // Log the request URL

        const response = await this.#client.fetch(url, {
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
        console.log('Received ArrayBuffer of size:', data.byteLength); // Log the size of the ArrayBuffer
        return data;
    } catch (e) {
        this.#logger.error(`Failed to GET ${endpoint}: ${e.message}`);
        return null;
    }
  }
  
  /**
   * Make a POST request to the camera
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
      const response = await this.client.fetch(
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
   * Enable auto tracking for the camera
   *
   * @returns {Promise<boolean>}
   */
  async enableAutoTracking() {
    const resp = await this.#post(
      "/local/axis-ptz-autotracking/settings.fcgi",
      {
        apiVersion: "1.0",
        context: "abc",
        method: "setAutotrackingState",
        params: {
          enabled: true,
        },
      },
    );
    return resp !== null;
  }

  /**
   * Disable auto tracking for the camera
   *
   * @returns {Promise<boolean>}
   */
  async disableAutoTracking() {
    const resp = await this.#post(
      "/local/axis-ptz-autotracking/settings.fcgi",
      {
        apiVersion: "1.0",
        context: "abc",
        method: "setAutotrackingState",
        params: {
          enabled: false,
        },
      },
    );
    return resp !== null;
  }

   /**
     * Fetch an image from the Axis camera
     * @returns {Promise<string|null>} The image as a Base64 string
     */
   async fetchImage() {
    try {
        // Use #getBinary to fetch the image as an ArrayBuffer
        const resp = await this.#getBinary('/axis-cgi/jpg/image.cgi');
      
        // Check if resp is defined and has data
        if (resp && resp.byteLength > 0) {
            const base64Image = Buffer.from(resp).toString('base64'); // Convert to Base64
            return base64Image;
        } else {
            this.#logger.error('Image response is undefined or has no data');
            return null; // Return null if the image fetch was unsuccessful
        }
    } catch (error) {
        this.#logger.error(`Failed to fetch image: ${error.message}`); // Improved error logging
        console.error('Error fetching image:', error);
        return null; // Return null on error
    }           
 } 

  /**
   * Run a PTZ commands on the camera
   *
   * @param {Record<string, string>} commands Commands to run
   * @returns {Promise<boolean>}
   */
  async ptz(commands) {
    const query = new URLSearchParams(commands);
    const resp = await this.#get(`/axis-cgi/com/ptz.cgi?${query.toString()}`);
    return resp !== null;
  }

  /**
   * Move the camera
   *
   * Expects values such as 25%, 50-90degrees, home, up, down, left, right, upleft, upright, downleft, downright, stop
   *
   * @param {string} direction Direction to move the camera
   * @returns {Promise<boolean>}
   */
  async moveCamera(direction) {
    return this.ptz({ move: direction });
  }

  /**
   * Home the camera position
   *
   * @returns {Promise<boolean>}
   */
  async goHome() {
    return this.moveCamera("home");
  }

  /**
   * Stop the camera moving
   *
   * @returns {Promise<boolean>}
   */
  async stopCamera() {
    return this.moveCamera("stop");
  }

  /**
   * Pan the camera, relative to the current position
   *
   * @param {number} degrees Degrees to pan the camera (-360 to 360)
   * @returns {Promise<boolean>}
   */
  async panCamera(degrees) {
    return this.ptz({ rpan: degrees });
  }

  /**
   * Pan the camera, to an exact position
   *
   * @param {number} degrees Degrees to pan the camera (-180 to 180)
   * @returns {Promise<boolean>}
   */
  async panCameraExact(degrees) {
    return this.ptz({ pan: degrees });
  }

  /**
   * Tilt the camera, relative to the current position
   *
   * @param {number} degrees Degrees to tilt the camera (-360 to 360)
   * @returns {Promise<boolean>}
   */
  async tiltCamera(degrees) {
    return this.ptz({ rtilt: degrees });
  }

  /**
   * Tilt the camera, to an exact position
   *
   * @param {number} degrees Degrees to tilt the camera (-180 to 180)
   * @returns {Promise<boolean>}
   */
  async tiltCameraExact(degrees) {
    return this.ptz({ tilt: degrees });
  }

  /**
   * Zoom the camera, relative to the current zoom
   *
   * @param {number} steps Steps to zoom the camera (-9999 to 9999)
   * @returns {Promise<boolean>}
   */
  async zoomCamera(steps) {
    return this.ptz({ rzoom: steps });
  }

  /**
   * Zoom the camera, to an exact zoom
   *
   * @param {number} steps Steps to zoom the camera (1 to 9999)
   * @returns {Promise<boolean>}
   */
  async zoomCameraExact(steps) {
    return this.ptz({ zoom: steps });
  }

  /**
   * Focus the camera, relative to the current focus
   *
   * @param {number} steps Steps to focus the camera (-9999 to 9999)
   * @returns {Promise<boolean>}
   */
  async focusCamera(steps) {
    return this.ptz({ rfocus: steps });
  }

  /**
   * Focus the camera, to an exact focus
   *
   * @param {number} steps Steps to focus the camera (1 to 9999)
   * @returns {Promise<boolean>}
   */
  async focusCameraExact(steps) {
    return this.ptz({ focus: steps });
  }

  /**
   * Enable auto focus for the camera
   *
   * @returns {Promise<boolean>}
   */
  async enableAutoFocus() {
    return this.ptz({ autofocus: "on" });
  }

  /**
   * Disable auto focus for the camera
   *
   * @returns {Promise<boolean>}
   */
  async disableAutoFocus() {
    return this.ptz({ autofocus: "off" });
  }

  /**
   * Enable a continuous focus motion
   *
   * Set the focus speed to 0 to stop
   *
   * @param {number} focus Focus speed (-100 to 100)
   * @returns {Promise<boolean>}
   */
  async continuousFocus(focus) {
    return this.ptz({ continuousfocusmove: `${focus}` });
  }

  /**
   * Enable a continuous pan/tilt movement
   *
   * Set the pan/tilt speed to 0 to stop
   *
   * @param {number} pan Pan speed (-100 to 100)
   * @param {number} tilt Tilt speed (-100 to 100)
   * @param {number} zoom Zoom speed (-100 to 100)
   * @returns {Promise<boolean>}
   */
  async continuousPanTilt(pan, tilt, zoom) {
    return this.ptz({ continuouspantiltmove: `${pan},${tilt}`, continuouszoommove: `${zoom}` });
  }

  /**
   * Move the camera to a stored preset
   *
   * @param {string} name Name of the preset
   * @returns {Promise<boolean>}
   */
  async goToPreset(name) {
    return this.ptz({ gotoserverpresetname: name.toLowerCase() });
  }

  /**
   * Set the movement speed of the camera
   *
   * @param {number} speed Speed of the camera (1 to 100)
   * @returns {Promise<boolean>}
   */
  async setSpeed(speed) {
    return this.ptz({ speed });
  }

  /**
   * Run a speed dry cycle for the camera
   *
   * @returns {Promise<boolean>}
   */
  async speedDry() {
    return this.ptz({ auxiliary: "speeddry" });
  }

  /**
   * Set the IR cut filter state
   *
   * @param {"on" | "off" | "auto"} state State to set the IR cut filter to (on = day, off = night)
   * @returns {Promise<boolean>}
   */
  async setIRCutFilter(state) {
    return this.ptz({ ircutfilter: state });
  }

  /**
   * Enable the IR light for the camera
   *
   * @returns {Promise<boolean>}
   */
  async enableIR() {
    const resp = await this.#post("/axis-cgi/lightcontrol.cgi", {
      apiVersion: "1.0",
      context: "abc",
      method: "enableLight",
      params: {
        lightID: "led0",
      },
    });
    return resp !== null;
  }

  /**
   * Disable the IR light for the camera
   *
   * @returns {Promise<boolean>}
   */
  async disableIR() {
    const resp = await this.#post("/axis-cgi/lightcontrol.cgi", {
      apiVersion: "1.0",
      context: "abc",
      method: "disableLight",
      params: {
        lightID: "led0",
      },
    });
    return resp !== null;
  }

  /**
   * Get the current position of the camera
   *
   * @returns {Promise<{ pan: number, tilt: number, zoom: number, focus: number, brightness: number, autofocus: "on" | "off", autoiris: "on" | "off" } | null>}
   */
  async getPosition() {
    // Get the raw position data
    const resp = await this.#get("/axis-cgi/com/ptz.cgi?query=position");
    if (resp === null) return null;

    // Parse the data (<key>=<value>\r\n...)
    const pairs = resp.replace(/\r/g, "").split("\n");
    const position = {};
    for (const pair of pairs) {
      const [key, value] = pair.trim().split("=");
      if (key) {
        // Attempt to parse the value as a number, and store it
        position[key] = isNaN(value) ? value : parseFloat(value);
      }
    }
    return position;
  }

  /**
   * Get the current movement speed of the camera
   *
   * @returns {Promise<number | null>}
   */
  async getSpeed() {
    // Get the raw speed data
    const resp = await this.#get("/axis-cgi/com/ptz.cgi?query=speed");
    if (resp === null) return null;

    // Parse the data, ensuring we got back a number
    const [key, value] = resp.trim().split("=");
    return isNaN(value) ? null : parseFloat(value);
  }
}

/**
 * Establishes connections to the Axis cameras
 *
 * `controller.connections.cameras` is an object of Axis camera connections
 *
 * @param {import("../controller")} controller
 * @returns {Promise<void>}
 */
module.exports = async (controller) => {
  const cameras = config.axisCameras.reduce(
    (obj, name) => ({
      ...obj,
      [name]: new Axis(
        name,
        process.env[`AXIS_${name.toUpperCase()}_IP`],
        process.env.AXIS_USERNAME,
        process.env.AXIS_PASSWORD,
      ),
    }),
    {},
  );

  controller.connections.cameras = cameras;
};
