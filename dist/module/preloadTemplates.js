export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "modules/foundry-ping-times/templates"
	];

	return loadTemplates(templatePaths);
}
