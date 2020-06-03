export const registerSettings = function () {
    // Register any custom module settings here
    game.settings.register("response-times", "pingInterval", {
        name: "Response Check Interval",
        hint: "Time in milliseconds between response time testing.  Do not set lower than about 5000!",
        type: Number,
        default: 20000,
        scope: "world",
        config: true
    })

    game.settings.register("response-times", "historySize", {
        name: "History Size ( sliding window for average )",
        hint: "The number of samples to average over, also the fixed buffer size.",
        type: Number,
        default: 30,
        scope: "world",
        config: true
    })
}
