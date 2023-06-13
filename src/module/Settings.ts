import { MODULE_NAME } from '../constants'

export const registerSettings = () => {
  const gameInstance = game as Game

  gameInstance.settings.register(MODULE_NAME, 'latencyInterval', {
    name: `${gameInstance.i18n.localize('USERLATENCY.Interval')}`,
    hint: `${gameInstance.i18n.localize('USERLATENCY.IntervalHint')}`,
    type: Number,
    // @ts-ignore
    range: {
      min: 10,
      max: 90,
      step: 5,
    },
    default: 30,
    scope: 'world',
    config: true,
  })

  gameInstance.settings.register(MODULE_NAME, 'hideLatency', {
    name: `${gameInstance.i18n.localize('USERLATENCY.Hide')}`,
    type: Boolean,
    default: false,
    scope: 'world',
    config: true,
  })

  gameInstance.settings.register(MODULE_NAME, 'microLatency', {
    name: `${gameInstance.i18n.localize('USERLATENCY.Micro')}`,
    type: Boolean,
    default: false,
    scope: 'world',
    config: true,
  })
}
