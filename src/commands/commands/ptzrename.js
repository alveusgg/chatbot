'use strict'

const Logger = require('../../utils/logger.js');
const ptzCommandSetup = require('../utils/ptzCommandSetup.js');

const logger = new Logger();

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { api, obs, cameras, database } }) => {
  return {
    name: 'ptzrename',
    enabled: !!obs && !!cameras && !!database,
    permission: {
      group: 'operator'
    },
    run: async ({ args: _args }) => {
      const { args, camera, specificCamera, currentScene } = ptzCommandSetup(obs, cameras, database, _args);
      
      if (specificCamera) {
        if (args[1] && args[2]) {
          
        }
      } else {
        if (database[currentScene].presets[args[1]] !== null) {
          const response = delete database[currentScene].presets[args[1]];

          if (response !== true) {
						logger.log(`Failed to remove preset ${args[1]}: ${response} ${database[currentScene]}`);
          }
        }
      }
    }
  }
};
