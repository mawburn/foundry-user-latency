import { MODULE_NAME } from '../constants'

export const registerSettings = () => {
  ;(game as Game).settings.register(MODULE_NAME, 'latencyInterval', {
    name: `${(game as any).i18n.localize('USERLATENCY.Interval')}`,
    hint: `${(game as any).i18n.localize('USERLATENCY.IntervalHint')}`,
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
