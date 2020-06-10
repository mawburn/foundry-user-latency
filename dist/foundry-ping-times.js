
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
	logger(LOG_LVL.INFO,'foundry-ping-times | Initializing foundry-ping-times')

	// Assign custom classes and constants here
	
	// Register custom module settings
	registerSettings()
	
	// Preload Handlebars templates
	await preloadTemplates()

	// Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function() {
	// Do anything after initialization but before
	// ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
	// Do anything once the module is ready
	logger(LOG_LVL.DEBUG, "ready: Defulat log lvl is - " + getLogLevel())
	logger(LOG_LVL.DEBUG, "ready: setting log level - " + setLogLevel(LOG_LVL.DEBUG))
	let pingInterval = 1000 * game.settings.get("response-times", "pingInterval") || 20
	let historySize = game.settings.get( "response-times", "historySize") || 30
	// this sets up the periodic ping
	doPings(window.location.href, pingInterval, historySize)
	// this makes it all
	makePopup()
});

// Add any additional hooks if necessary

Hooks.on('renderPlayerList', (app, html, data) => {
	logger(LOG_LVL.DEBUG, "renderPlayerList called -tk - pingSpan: " + document.getElementById("pingSpan"))
	makePingSpan()
})