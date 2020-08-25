
// Import JavaScript modules
import { registerSettings } from './module/settings.js'
import { preloadTemplates } from './module/preloadTemplates.js'
import { doPings } from './module/webping.js'
import { makePopup, makePingSpan } from './module/chartResponse.js'
import { logger, LOG_LVL, getLogLevel, setLogLevel} from './module/log.js'

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function() {
	console.log("ping: crap crap")
	logger(LOG_LVL.INFO,'foundry-ping-times | Initializing foundry-ping-times')

	// Assign custom classes and constants here
	
	// Register custom module settings
	registerSettings()
	
	// Preload Handlebars templates
	await preloadTemplates()

	// Register custom sheets (if any)
	logger(LOG_LVL.INFO, "init finished")
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function() {
	logger(LOG_LVL.INFO, "module setup started")
	// Do anything after initialization but before

	// ready
	logger(LOG_LVL.INFO, "module setup finished")
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
	logger(LOG_LVL.DEBUG, "ready: default log lvl is - " + getLogLevel())
	logger(LOG_LVL.DEBUG, "ready: setting log level - " + setLogLevel(LOG_LVL.DEBUG))
	let pingInterval = 1000 * game.settings.get("response-times", "pingInterval") || 20
	let historySize = game.settings.get( "response-times", "historySize") || 30
	// this sets up the periodic ping
	doPings(window.location.href, pingInterval, historySize)
	// this makes the popup with the graph
	makePopup()
	// register a listener on the socket
});

// Add any additional hooks if necessary

Hooks.on('renderPlayerList', (app, html, data) => {
	logger(LOG_LVL.DEBUG, "renderPlayerList called")
	makePingSpan() // TODO: unfortunately I have to create the pingspan every freakin time this gets called - considering putting the gui element someplace else..
})