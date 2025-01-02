const { join } = require("node:path");

try {
  process.chdir('./src');
}
catch (err) {
  console.log('chdir: ' + err);
}

const Controller = require("./controller");
const Logger = require("./utils/logger");

// Load any ENV variables from .env file
const envFile = process.env.NODE_ENV == 'development' ? `.env.development.local` : '.env';
require('dotenv').config({ path: join(process.cwd(), envFile) });

const logger = new Logger('index')

const main = async () => {
  // Create our controller object
  const controller = new Controller();

  // Get all our connections
  await controller.load("./connections");

  // Init legacy commands
  await controller.load("./modules");

  controller.initCommandManager();

  controller.initListeners();
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
