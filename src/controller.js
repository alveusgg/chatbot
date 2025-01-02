// @ts-check

const { relative } = require("node:path");

const Logger = require("./utils/logger");
const { getAllFiles } = require("./utils/file");

class Controller {
  /**
   * TODO: scope the key in cameras down so it's just the ones that are defined
   * 
   * TODO: move these into their own thing
   * 
   * @type {{
   *  api?: import('./connections/api').APIConnection
   *  cameras?: import('./connections/cameras').CamerasConnection
   *  courier?: import('./connections/courier').CourierConnection
   *  database?: import('./connections/database').DatabaseConnection
   *  obs?: import('./connections/obs').OBSConnection
   *  obsBot?: import('./connections/obsbot').OBSBotConnection
   *  twitch?: import('./connections/twitch').TwitchConnection
   *  unifi?: import('./connections/unifi').TwitchConnection
   * }}
   *  unifi?: import('./connections/unifi').Unifi
   */
  #connections = {};
  #logger = new Logger("controller");

  get connections() {
    return this.#connections;
  }

  async load(directory) {
    const files = await getAllFiles(directory);
    for (const file of files) {
      if (!file.endsWith(".js")) continue;

      const name = relative(process.cwd(), file).slice(0, -3);
      this.#logger.log(`Loading ${name}...`);

      const connection = require(file);
      if (typeof connection === "function") await connection(this);
    }
  }
}

module.exports = Controller;
