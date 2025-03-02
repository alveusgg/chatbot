const osc = require("osc");

const Logger = require("../utils/logger");

/**
 * @typedef {OBSBot} OBSBotConnection
 */

class OBSBot {
  #logger;
  #client;
  #connected = false;
  #tracking = false;
  #zoom = 0;
  #fov = 0;

  /**
   * Establishes a connection to an OBSBot camera
   *
   * @param {string} name Name of the camera (for logging)
   * @param {string} host Hostname or IP address of the camera
   * @param {number} port Port number of the camera
   */
  constructor(name, host, port) {
    this.#logger = new Logger(`connections/obsbot/${name}`);

    // Create an osc.js UDP Port listening on port.
    this.#client = new osc.UDPPort({
      localAddress: "0.0.0.0",
      localPort: port,
      remoteAddress: host,
      remotePort: port,
      metadata: true,
    });

    // Listen for incoming OSC messages.
    this.#client.on("message", (oscMsg, timeTag, info) => {
      const address = oscMsg.address.replace("/OBSBOT/WebCam/General/", "");
      const args = oscMsg.args; // array of objects

      switch (address) {
        case "ConnectedResp":
          this.#connected = args[0]?.value === 1; // (1->lock; 0->unlock)
          this.#logger.log(
            `Connection Status: ${
              this.#connected ? "Connected" : "Disconnected"
            }`,
          );
          break;
        case "DeviceInfo":
          // this.#logger.log(`Presets: ${preset1}, ${preset2}, ${preset3}`);
          break;
        case "AiTrackingInfo":
          this.#tracking = args[0]?.value !== 1; // (1->lock; 0->unlock)
          this.#logger.log(
            `AI Tracking Status: ${this.#tracking ? "Unlocked" : "Locked"}`,
          );
          break;
        case "ZoomInfo":
          this.#zoom = parseInt(args[0]?.value) || 0; // (0~100)
          this.#fov = parseInt(args[1]?.value) || 0; // 0->86°; 1->78°; 2->65°
          this.#logger.log(`Zoom: ${this.#zoom}% | FOV: ${this.#fov}`);
          break;
        case "PresetPositionInfo":
          const preset1 = args[1]?.value || "none";
          const preset2 = args[3]?.value || "none";
          const preset3 = args[5]?.value || "none";
          this.#logger.log(`Presets: ${preset1}, ${preset2}, ${preset3}`);
          break;
        default:
          this.#logger.log("Unhandled OSC Message:", oscMsg);
      }
    });

    this.#client.on("error", (err) => {
      this.#logger.error("OBSBot Server ERROR", err);
    });

    // When the port is read, send an OSC message to, say, SuperCollider
    this.#client.on("ready", () => {
      this.#logger.log("OBSBot Server Ready");
      this.getConnected();
    });

    this.connect();
  }

  /**
   * Send a command to the camera
   *
   * @param {string} command Command to send
   * @param {number} value Value to send with the command
   * @private
   */
  #send(command, value) {
    this.#client.send({
      address: command,
      args: [
        {
          type: "i",
          value: value,
        },
      ],
    });
  }

  /**
   * Connects to the camera
   *
   * This is automatically called when the class is instantiated
   */
  connect() {
    this.#client.open();
  }

  /**
   * Disconnects from the camera
   */
  disconnect() {
    this.#client.close();
  }

  /**
   * Request the connection status from the camera
   */
  getConnected() {
    this.#send("/OBSBOT/WebCam/General/Connected", 0);
  }

  /**
   * Request device information from the camera
   */
  getInfo() {
    this.#send("/OBSBOT/WebCam/General/GetDeviceInfo", 0);
  }

  /**
   * Request zoom information from the camera
   */
  getZoomInfo() {
    this.#send("/OBSBOT/WebCam/General/GetZoomInfo", 0);
  }

  /**
   * Request tracking information from the camera
   */
  getTrackingInfo() {
    this.#send("/OBSBOT/WebCam/General/GetAiTrackingInfo", 0);
  }

  /**
   * Request preset position information from the camera
   */
  getPresetPosition() {
    this.#send("/OBSBOT/WebCam/General/GetPresetPositionInfo", 0);
  }

  /**
   * Apply a preset position to the camera
   *
   * @param {number} preset Preset position to apply (1-3)
   */
  setPreset(preset) {
    const parsed = parseInt(preset);
    if (isNaN(parsed) || parsed < 1 || parsed > 3) return; // TODO: Throw error?

    // 0->Preset Position 1；1->Preset Position 2；2->Preset Position 3
    this.#send("/OBSBOT/WebCam/General/TriggerPreset", parsed - 1);
    this.#logger.log(`Setting Preset: ${parsed - 1}`);
  }

  /**
   * Wake the camera from sleep
   */
  wake() {
    this.#send("/OBSBOT/WebCam/General/WakeSleep", 1);
    this.#logger.log("Awaking Device");
  }

  /**
   * Put the camera to sleep
   */
  sleep() {
    this.#send("/OBSBOT/WebCam/General/WakeSleep", 0);
    this.#logger.log("Sleeping Device");
  }

  /**
   * Lock/disable tracking on the camera
   */
  lockTracking() {
    this.#send("/OBSBOT/WebCam/General/ToggleAILock", 1);
    this.#logger.log("Locked Tracking");
  }

  /**
   * Unlock/enable tracking on the camera
   */
  unlockTracking() {
    this.#send("/OBSBOT/WebCam/General/ToggleAILock", 0);
    this.#logger.log("Unlocked Tracking");
  }

  /**
   * Enable/disable tracking on the camera
   *
   * @param {0|"0"|"off"|"no"|1|"1"|"on"|"yes"} value Value to set
   */
  setTracking(value) {
    const parsed =
      value === "1" || value === "on" || value === "yes"
        ? 1
        : value === "0" || value === "off" || value === "no"
        ? 0
        : value;
    if (parsed !== 0 && parsed !== 1) return; // TODO: Throw error?

    // 1->Target lock; 0->Target unlock
    this.#send("/OBSBOT/WebCam/General/ToggleAILock", parsed);
    this.#logger.log(`Setting Tracking: ${parsed ? "Locked" : "Unlocked"}`);
  }

  /**
   * Set the zoom level on the camera
   *
   * @param {number|string} zoom Zoom level to set (0-100)
   */
  setZoom(zoom) {
    const parsed = parseInt(zoom);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) return; // TODO: Throw error?

    // percentage 0-100, each number corresponds to a zoom value of 1%.
    this.#send("/OBSBOT/WebCam/General/SetZoom", parsed);
    this.#logger.log(`Setting Zoom: ${parsed}%`);
  }

  /**
   * Set the FOV mode on the camera
   *
   * @param {number|string} fov FOV mode to apply (1-3)
   */
  setFOV(fov) {
    const parsed = parseInt(fov);
    if (isNaN(parsed) || parsed < 1 || parsed > 3) return; // TODO: Throw error?

    // 0->86°；1->78°；2->65°
    this.#send("/OBSBOT/WebCam/General/SetView", parsed - 1);
    this.#logger.log(`Setting FOV: ${parsed - 1}`);
  }

  /**
   * Reset the camera's position
   */
  resetPosition() {
    this.#send("/OBSBOT/WebCam/General/ResetGimbal", 0);
    this.#logger.log("Resetting Gimbal Position");
  }

  /**
   * Tilt the camera by a relative amount
   *
   * Note that movement will be approximate as the movement is done based on time, not the actual position of the camera
   *
   * @param {number|string} value Distance to tilt
   */
  tilt(value) {
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed === 0) return; // TODO: Throw error?

    // It takes ~7secs to fully tilt
    const time = Math.min(Math.abs(parsed) * (5600 / 180), 7500);

    if (parsed > 0) this.gimbalUp();
    else this.gimbalDown();

    setTimeout(this.stop.bind(this), time);
  }

  /**
   * Pan the camera by a relative amount
   *
   * Note that movement will be approximate as the movement is done based on time, not the actual position of the camera
   *
   * @param {number|string} value Distance to pan
   */
  pan(value) {
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed === 0) return; // TODO: Throw error?

    // It takes ~10secs to fully pan
    const time = Math.min(Math.abs(parsed) * (9000 / 340), 11000);

    if (parsed > 0) this.gimbalRight();
    else this.gimbalLeft();

    setTimeout(this.stop.bind(this), time);
  }

  /**
   * Stop the camera's movement
   */
  stop() {
    this.#send("/OBSBOT/WebCam/General/SetGimbalUp", 0);
    this.#logger.log("Stopping Gimbal");
  }

  /**
   * Move the camera up
   *
   * Movement will continue until `stop()` is called
   */
  gimbalUp() {
    this.#send("/OBSBOT/WebCam/General/SetGimbalUp", 1);
    this.#logger.log("Moving Gimbal Up");
  }

  /**
   * Move the camera down
   *
   * Movement will continue until `stop()` is called
   */
  gimbalDown() {
    this.#send("/OBSBOT/WebCam/General/SetGimbalDown", 1);
    this.#logger.log("Moving Gimbal Down");
  }

  /**
   * Move the camera left
   *
   * Movement will continue until `stop()` is called
   */
  gimbalLeft() {
    this.#send("/OBSBOT/WebCam/General/SetGimbalLeft", 1);
    this.#logger.log("Moving Gimbal Left");
  }

  /**
   * Move the camera right
   *
   * Movement will continue until `stop()` is called
   */
  gimbalRight() {
    this.#send("/OBSBOT/WebCam/General/SetGimbalRight", 1);
    this.#logger.log("Moving Gimbal Right");
  }
}

/**
 * Establishes connections to the OBSBot camera
 *
 * `controller.connections.obsBot` is the OBSBot connection
 * 
 * @param {import("../controller")} controller
 * @returns {Promise<void>}
 */
module.exports = async (controller) => {
  const obsBot = new OBSBot(
    "NutHouse",
    process.env.OBSBOT_HOST,
    process.env.OBSBOT_PORT,
  );

  controller.connections.obsBot = obsBot;
};
