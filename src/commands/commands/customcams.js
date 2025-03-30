'use strict'

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
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
      group: 'operator'
    },
    run: async ({ args }) => {
      const fullArgs = args.slice(1);
      // TODO switch to custom cams

			// switchToCustomCams(controller, channel, accessProfile, userCommand, fullArgs)
    }
  }
};
