'use strict'

const { groupMemberships } = require('../../config/config2.js');
const { switchToCustomCams } = require('../../utils/switchToCustomCams.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
  const { connections: { obs } } = controller;

  return {
    name: 'customcams',
    aliases: [
      'customcamstl',
      "customcamstr",
      "customcamsbl",
      "customcamsbr",
      "customcamsbig",
    ],
    enabled: !!obs,
    permission: {
      group: 'mods'
    },
    run: async ({ channel, user, args }) => {
      const fullArgs = args.slice(1);

			switchToCustomCams(controller, channel, groupMemberships[user], args[0], fullArgs)
    }
  }
};
