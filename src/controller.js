const { relative } = require("node:path");

const Logger = require("./utils/logger");
const { getAllFiles } = require("./utils/file");
const CommandManager = require("./commands");
const sceneChange = require("./listeners/scene-change.js");
const cloudSceneChange = require("./listeners/cloud-scene-change.js");
const { useNewListeners, useNewScheduler } = require("./config/config.js");
const Scheduler = require("./scheduler/index.js");

class Controller {
  /**
   * @type {{
   *  cameras?: import('./connections/cameras').CamerasConnection
   *  courier?: import('./connections/courier').CourierConnection
   *  database?: import('./connections/database').DatabaseConnection
   *  feeder?: import('./connections/feeder.js').FeederConnection
   *  obs?: import('./connections/obs').OBSConnection
   *  obsBot?: import('./connections/obsbot').OBSBotConnection
   *  twitch?: import('./connections/twitch').TwitchConnection
   *  unifi?: object
   * }}
   */
  #connections = {};
  #logger = new Logger("controller");
  /**
   * @type {import('./commands/index.js') | undefined}
   */
  #commandManager

  get connections() {
    return this.#connections;
  }

  get commandManager() {
    return this.#commandManager;
  }

  initCommandManager() {
    if (this.#connections.twitch) {
      this.#commandManager = new CommandManager(this);
    } else {
      this.#logger.warn('Twitch connection not found. Twitch chat messages will not be handled.');
    }
  }

  initListeners() {
    if (!useNewListeners) {
      return;
    }

    if (this.#connections.obs?.local) {
      this.#connections.obs?.local.sceneChange(sceneChange.bind(null, this));
    } else {
      this.#logger.warn("Local OBS connection not found. Scene changes will not be handled.");
    }

    if (this.#connections.obs?.cloud) {
      this.#connections.obs.cloud.sceneChange(cloudSceneChange.bind(null, this));
    } else {
      this.#logger.warn("Cloud OBS connection not found. Scene changes will not be handled.");
    }
  }

  initScheduler() {
    if (!useNewScheduler) {
      return;
    }

    new Scheduler(this);
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
