import { registerSettings } from './module/settings'
import { WebLatency } from './module/WebLatency'
import { REG_NAME } from './constants'

Hooks.once('init', async function () {
  console.log(`${REG_NAME} | Initializing ${REG_NAME}`)

  registerSettings()

  console.log(`${REG_NAME} | Init finished`)
})

Hooks.once('ready', function () {
  console.log(`${REG_NAME} | Is Ready`)

  const webLatency = new WebLatency()
  webLatency.doLatencies()

  setTimeout(() => {
    webLatency.doLatencies()
  }, 10000)
})
