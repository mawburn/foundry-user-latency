import { PlayerList } from './module/PlayerList'
import { registerSettings } from './module/settings'
import { WebPing } from './module/WebPing'

export const REG_NAME = 'Ping Logger' as const
export const MODULE_NAME = REG_NAME.toLowerCase().replace(' ', '-')

let playerlist: PlayerList | null = null
let webPing: WebPing | null = null

Hooks.once('init', async function () {
  console.log(`${REG_NAME} | Initializing ${REG_NAME}`)

  registerSettings()

  console.log(`${REG_NAME} | Init finished`)
})

Hooks.once('ready', function () {
  console.log(`${REG_NAME} | Is Ready`)

  playerlist = new PlayerList()
  playerlist.registerListeners()

  webPing = new WebPing()
  webPing.doPings()
})
