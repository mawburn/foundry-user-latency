import { registerSettings } from './module/settings';
import { WebPing } from './module/Webping';

export const REG_NAME = 'Ping Logger' as const
export const MODULE_NAME = REG_NAME.toLowerCase().replace(' ', '-')

Hooks.once('init', async function () {
  console.log(`${REG_NAME} | Initializing ${REG_NAME}`)

  registerSettings()

  console.log(`${REG_NAME} | Init finished`)
})

Hooks.once('ready', function () {
  console.log(`${REG_NAME} | Is Ready`)

  const webPing = new WebPing()
  webPing.doPings()
})
