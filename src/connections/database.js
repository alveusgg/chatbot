const { readFileSync, writeFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");

const onChangePromise = import("on-change"); // ESM-only module

const defaults = { cloudServer: "space", timeRestrictionDisabled: false, blockedUsers: {}, enabledSubs: false, lockoutCams: {}, lockoutPTZ: {} };
const file = "data/database.json";

/**
 * @typedef {Database} DatabaseConnection
 */

/**
 * @typedef {{
 *  pan: number,
 *  tilt: number,
 *  zoom: number,
 *  focus: number,
 *  brightness: number,
 *  autofocus: 'on' | 'off',
 *  autoiris: 'on' | 'off'
 * }} CameraPreset
 * 
 * @typedef {{
 *  isRoaming: boolean,
 *  roamTime?: string,
 *  roamSpeed?: string,
 *  roamIndex?: number,
 *  roamDirection?: 'forward' | 'reverse',
 *  roamList?: Array<string>,
 *  speed?: number,
 *  presets: Record<string
 * }} CameraEntry
 * 
 * @typedef {{
 *  list: Array<string>,
 *  command: string
 * }} LayoutPreset
 * 
 * @typedef {{
 *  timeRestrictionDisabled: boolean,
 *  customcam: Array<string>,
 *  customcambig: true,
 *  customcamsbig: true,
 *  customcamscommand: string,
 *  layoutpresets: Record<string, LayoutPreset>
 * }} DatabaseProperties
 * 
 * @typedef {Record<string, CameraEntry> & DatabaseProperties} DatabaseFile
 */

class Database {
  #data = {};
  #file = "";

  /**
   * Create a new database connection
   *
   * Defaults to an empty object if the file does not exist
   * Otherwise, loads the JSON file and parses it
   *
   * @param {string} file File to load from and save the database to
   * @returns {Promise<any>}
   */
  constructor(file) {
    this.#file = file;
    if (existsSync(file)) this.#data = JSON.parse(readFileSync(file, "utf8"));

    // Save database on exit
    process.on("exit", () => {
      this.#save();
    });

    // Load on-change module as it is ESM-only
    // Observe the data and save on any change
    return onChangePromise.then(({ default: onChange }) =>
      onChange(this.#data, () => this.#save()),
    );
  }

  #save() {
    writeFileSync(this.#file, JSON.stringify(this.#data));
  }
}

/**
 * Loads the database and adds it to the controller
 *
 * `controller.connections.database` is the database connection
 *
 * @param {import("../controller")} controller
 * @returns {Promise<void>}
 */
module.exports = async (controller) => {
  const database = await new Database(join(process.cwd(), file));
  for (const [key, value] of Object.entries(defaults)) database[key] ??= value;

  // Add database to controller
  controller.connections.database = database;
};
