import { ChartResponse } from './module/chartResponse'
import { Logger } from './module/log'
import { registerSettings } from './module/settings'
import { WebPing } from './module/webping'

const logger = new Logger('foundry-ping-times', Logger.LOG_LVL.DEBUG)
const chartResponse = new ChartResponse()
const webPing = new WebPing()
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  logger.log(Logger.LOG_LVL.INFO, 'foundry-ping-times | Initializing foundry-ping-times')

  // Assign custom classes and constants here

  // Register custom module settings
  registerSettings()

  // Register custom sheets (if any)
  logger.log(Logger.LOG_LVL.INFO, 'init finished')
})

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
  logger.log(Logger.LOG_LVL.INFO, 'module setup started')
  // Do anything after initialization but before

  // ready
  logger.log(Logger.LOG_LVL.INFO, 'module setup finished')
})

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function () {
  const interval = (game as Game).settings.get('response-times', 'pingInterval') as number

  // Do anything once the module is ready
  const mins = interval

  if (mins >= 300) {
    ui?.notifications?.warn(
      'Response Times: the interval setting is in seconds not milliseconds.  Your response time check interval is currently set to ' +
        mins +
        ' minutes.'
    )
  }
  logger.log(Logger.LOG_LVL.DEBUG, 'ready: default log lvl is - ' + logger.getLogLevel())
  logger.log(
    Logger.LOG_LVL.DEBUG,
    'ready: setting log level - ' + logger.setLogLevel(Logger.LOG_LVL.DEBUG)
  )
  const pingInterval = 1000 * interval || 20
  const historySize = (game as Game).settings.get('response-times', 'historySize') || 30
  //

  chartResponse.registerListeners()
  // this sets up the periodic ping
  webPing.doPings(window.location.href, pingInterval, historySize)
  // this makes the popup with the graph
  chartResponse.makePopup()
  // register a listener on the socket
})

// Add any additional hooks if necessary

Hooks.on('renderPlayerList', (app, html, data) => {
  logger.log(Logger.LOG_LVL.DEBUG, 'renderPlayerList called')
  chartResponse.makePingSpan() // TODO: unfortunately I have to create the pingspan every freakin time this gets called - considering putting the gui element someplace else..
})
