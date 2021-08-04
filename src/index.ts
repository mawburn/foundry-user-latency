import './style.scss'
import { registerSettings } from './module/settings'
import { WebPing } from './module/WebPing'
import { REG_NAME } from './constants'

Hooks.once('init', async function () {
  console.log(`${REG_NAME} | Initializing ${REG_NAME}`)

  registerSettings()

  console.log(`${REG_NAME} | Init finished`)
})

Hooks.once('ready', function () {
  console.log(`${REG_NAME} | Is Ready`)

  const webPing = new WebPing()

  // wait for things to get loaded
  setTimeout(() => {
    webPing.doPings()
  }, 10000)
})
