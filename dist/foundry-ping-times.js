
// Import JavaScript modules
import { registerSettings } from './module/settings.js'
import { preloadTemplates } from './module/preloadTemplates.js'
import { doPings } from './module/webping.js'

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
	// this sets up the periodic ping
	doPings(window.location.href, 20000, 30)
	//game.user.setFlag("world", "pingTimes", 23)
});

// Add any additional hooks if necessary

Hooks.on('renderPlayerList', (app, html, data) => {
	let playerList = document.querySelector(".self" )
	playerList.insertAdjacentHTML("beforeend", '<span title="Average Response Time of Server" style="padding-right: 5px;float: right;"><i>'+ game.user.getFlag("world", "pingTimes") +'ms</i></span>')
})