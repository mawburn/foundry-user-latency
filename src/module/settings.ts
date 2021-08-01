import { MODULE_NAME } from '../constants'

export const registerSettings = function () {
  ;(game as Game).settings.register(MODULE_NAME, 'pingInterval', {
    name: 'Response Check Interval in Seconds',
    hint: 'Time in seconds between response time testing. Best to set it over 10!',
    type: Number,
    default: 30,
    scope: 'world',
    config: true,
  })
}
