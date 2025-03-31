const { join } = require("node:path");

try {
  process.chdir('./src');
}
catch (err) {
  console.log('chdir: ' + err);
}

const Controller = require("./controller");
const CommandManager = require("./commands");
const Logger = require("./utils/logger");
const sceneChange = require("./listeners/scene-change");
const cloudSceneChange = require("./listeners/cloud-scene-change");

// Load any ENV variables from .env file
const envFile = process.env.NODE_ENV == 'development' ? `.env.development.local` : '.env';
require('dotenv').config({ path: join(process.cwd(), envFile) });

const logger = new Logger('index')

const main = async () => {
  // Create our controller object
  const controller = new Controller();

  // Get all our connections
  await controller.load("./connections");

  // Get all our modules
  // await controller.load("./modules");

  // Load our commands
  if (controller.connections.twitch) {
    new CommandManager(controller)
  } else {
    logger.warn('Twitch connection not found. Twitch chat messages will not be handled.')
  }

  // Listen for scene changes
  if (controller.connections.obs?.local) {
    controller.connections.obs?.local.sceneChange(sceneChange.bind(null, controller));
  } else {
		logger.warn("Local OBS connection not found. Scene changes will not be handled.");
  }

  if (controller.connections.obs?.cloud) {
    controller.connections.obs.cloud.sceneChange(cloudSceneChange.bind(null, controller));
  } else {
		logger.warn("Cloud OBS connection not found. Scene changes will not be handled.");
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
