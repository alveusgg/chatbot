/**
 * @type {Record<string, number>}
 */
const audioNameToIdMap = {
  alarm: 37,
  siren: 49,
  emergency: 40,
  trespassing: 43,
  camera: 33,
  hello: 1,
  despacito: 0,
  ringtone: 35,
  dog: 44
}

const aliases = [
  'ptzplayaudio',
  'playclip',
  'playaudio'
]

/**
 * @type {Array<import('./types.d.ts').Command>}
 */
const commands = aliases.map(alias => ({
  name: alias,
  enabled: true,
  permission: {
    group: 'operator'
  },
  run: async ({ controller, args }) => {
    if (!controller.connections.cameras) {
      return;
    }

    const speaker = controller.connections.cameras.speaker
    
    const [, audioName] = args

    // Defaults to alarm
    let audioId = 37 // Default to alarm
    if (audioName) {
      if (audioName in audioNameToIdMap) {
        audioId = audioNameToIdMap[audioName]
      } else if (audioName !== '') {
        const result = Number.parseInt(audioName)
        if (isNaN(result)) {
          return;
        }

        audioId = result
      }
    }

    await speaker.playAudioClip(audioId)
  }
}))

module.exports = commands
