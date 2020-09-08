
// Import JavaScript modules
import { registerSettings } from './module/settings.js'
import { preloadTemplates } from './module/preloadTemplates.js'
import { WebPing } from './module/webping.js'
import { ChartResponse } from './module/chartResponse.js'
import { Logger } from './module/log.js'

let logger = new Logger("foundry-ping-times", Logger.LOG_LVL.DEBUG)
let chartResponse = new ChartResponse()
let webPing = new WebPing()
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function() {
	logger.log(Logger.LOG_LVL.INFO,'foundry-ping-times | Initializing foundry-ping-times')

	// Assign custom classes and constants here
	
	// Register custom module settings
	registerSettings()
	
	// Preload Handlebars templates
	await preloadTemplates()

	// Register custom sheets (if any)
	logger.log(Logger.LOG_LVL.INFO, "init finished")
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function() {
	logger.log(Logger.LOG_LVL.INFO, "module setup started")
	// Do anything after initialization but before

	// ready
	logger.log(Logger.LOG_LVL.INFO, "module setup finished")
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
	// Do anything once the module is ready
	const mins = game.settings.get("response-times", "pingInterval")
	if (mins >= 300) {
		ui.notifications.warn("Response Times: the interval setting is in seconds not milliseconds.  Your response time check interval is currently set to "+mins+" minutes.")
	}
	logger.log(Logger.LOG_LVL.DEBUG, "ready: default log lvl is - " + logger.getLogLevel())
	logger.log(Logger.LOG_LVL.DEBUG, "ready: setting log level - " + logger.setLogLevel(Logger.LOG_LVL.DEBUG))
	let pingInterval = 1000 * game.settings.get("response-times", "pingInterval") || 20
	let historySize = game.settings.get( "response-times", "historySize") || 30
	//

	chartResponse.registerListeners()
	// this sets up the periodic ping
	webPing.doPings(window.location.href, pingInterval, historySize)
	// this makes the popup with the graph
	chartResponse.makePopup()
	// register a listener on the socket
});

// Add any additional hooks if necessary

Hooks.on('renderPlayerList', (app, html, data) => {
	logger.log(Logger.LOG_LVL.DEBUG, "renderPlayerList called")
	chartResponse.makePingSpan() // TODO: unfortunately I have to create the pingspan every freakin time this gets called - considering putting the gui element someplace else..
})