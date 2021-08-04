import { MODULE_NAME } from '../constants'

export const registerSettings = () => {
  ;(game as Game).settings.register(MODULE_NAME, 'pingInterval', {
    name: 'Ping Interval in Seconds',
    hint: 'Time in seconds between ping requests. 10s minimum. Between 20-40 should be enough.',
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
}
