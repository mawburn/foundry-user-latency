
// Import JavaScript modules
import { registerSettings } from './module/settings.js'
import { preloadTemplates } from './module/preloadTemplates.js'
import { doPings } from './module/webping.js'
import { makePopup } from './module/chartResponse.js'

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function() {
	console.log('foundry-ping-times | Initializing foundry-ping-times')

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

	let pingInterval = game.settings.get("response-times", "pingInterval") || 20000
	let historySize = game.settings.get( "response-times", "historySize") || 30
	// this sets up the periodic ping
	doPings(window.location.href, pingInterval, historySize)
});

// Add any additional hooks if necessary

Hooks.on('renderPlayerList', (app, html, data) => {
	// this does it all
	makePopup()
})