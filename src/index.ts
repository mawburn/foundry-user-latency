import styles from 'bundle-text:./style.module.css'
import { REG_NAME } from './constants'

Hooks.once('init', async function () {
  console.log(`${REG_NAME} | Initializing ${REG_NAME}`)
  const style = document.createElement('style')
  style.textContent = styles
  document.appendChild(style)

  // TODO: Register custom module settings

  console.log(`${REG_NAME} | Init finished`)
})

Hooks.once('ready', function () {
  console.log(`${REG_NAME} | Is Ready`)

  // wait for things to get loaded
  setTimeout(() => {
    // TODO: Do stuff
  }, 10000)
})
