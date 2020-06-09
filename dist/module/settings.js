export const registerSettings = function () {
    // Register any custom module settings here
    game.settings.register("response-times", "pingInterval", {
        name: "Response Check Interval (seconds)",
        hint: "Time in seconds between response time testing.  Best to set it over 5!",
        type: Number,
        default: 20,
        scope: "world",
        config: true
    })

    game.settings.register("response-times", "historySize", {
        name: "History Size ( sliding window for average ) - ie last x samples",
        hint: "The number of samples to average over, also the fixed buffer size.",
        type: Number,
        default: 30,
        scope: "world",
        config: true
    })
}
