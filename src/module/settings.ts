import { MODULE_NAME } from '../constants'

export const registerSettings = () => {
  ;(game as Game).settings.register(MODULE_NAME, 'pingInterval', {
    name: `${(game as any).i18n.localize('PINGLOGGER.Interval')}`,
    hint: `${(game as any).i18n.localize('PINGLOGGER.IntervalHint')}`,
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
