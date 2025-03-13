// @ts-check
'use strict'

const Logger = require('../../utils/logger.js');
const checkBooleanArgument = require('../utils/checkBooleanArgument.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database } }) => {
  return {
    name: 'ptzroam',
    enabled: !!obs && !!cameras && !!database,
    arguments: [
      {
        camera: { type: 'string', optional: true },
        seconds: { type: 'number' },
        speed: { type: 'number', optional: true },
        presets: { type: 'array', items: 'string' }
      },
      {
        
      }
    ],
    permission: {
      group: 'operator'
    },
    run: async ({ args: _args }) => {
      if (_args.length < 4) {
        // Invalid command
        return;
      }

      const { args, camera, specificCamera, currentScene } = ptzCommandSetup(obs, cameras, database, _args);
      const speed = await camera.getSpeed();

      if (_args.length === 2) {
        if (checkBooleanArgument(args[1])) {
          database[currentScene].isRoaming = true;

          if (speed !== null) {
            database[currentScene].speed = speed;
          }

          // TODO clear timeout stuff what does that do
        } else {
          database[currentScene].isRoaming = false;
        }

        return;
      }

      let startingListPos = 0;

      if (isNaN(parseInt(args[1]))) {
        // Invalid command
        return;
      }

      if (!isNaN(parseInt(args[1]))) {
        // Time provided
        database[currentScene].roamTime = args[1];
        startingListPos = 2;
      }


    }
  }
};
