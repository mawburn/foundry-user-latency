import {logger, LOG_LVL} from './log.js'

export let responseTimesChart = null // not proud of this TODO: fix global variable dependancy

export const makePopup = function () { // TODO: fix location when people join or when the list is expanded.
    let players = document.getElementById("players")
    let popUp = document.getElementById("pingPop")
    if (typeof popUp === "undefined" || popUp == null) {
        popUp = document.createElement("div")
        popUp.id = 'pingPop'
        popUp.style.padding = '10px'
        popUp.style.display = 'none'
        popUp.style.zIndex = "80"
        popUp.style.background = "black"
        popUp.style.opacity = ".8"
        popUp.style.borderRadius = "5px"
        popUp.style.boxSizing = "border-box"
        popUp.style.boxShadow = "10 10 20px #c4c4c4;"
        popUp.style.position = "absolute"
        popUp.style.bottom = players.offsetHeight + 10 + "px"
        //popUp.style.left = players.offsetLeft -14 + "px"
        popUp.style.width = players.offsetWidth + "px"
        popUp.style.marginLeft = players.offsetLeft + "px"
        popUp.style.marginBottom = "15 px"
        //popUp.style.height = "500px"
        popUp.innerHTML = '<canvas id="pingChart" width="400" height="500"></canvas>'
        popUp.addEventListener("click", function (event) {
            logger(LOG_LVL.DEBUG, "makePopup: closing popup -tk")
            popUp.style.display = 'none'
        })
        players.insertAdjacentElement("beforebegin", popUp)
        //responseTimesChart = makeChart(document.getElementById("pingChart"),game.user.getFlag("world", "pingData").data)
    } else {
        logger(LOG_LVL.DEBUG, "makePopup: popUp already defined, players is: ")
    }
}

export const makePingSpan = function () {
    let players = document.getElementById("players")
    let pingSpan = document.getElementById("pingSpan") // TODO: probably remove this and the null check since it seems to be null every time I check it in renderPlayerList
    if (typeof pingSpan === "undefined" || pingSpan == null) {
        let pingSpan = document.createElement("span")
        let popUp = document.getElementById("pingPop")
        let ping = game.user.getFlag("world", "pingData").median
        if (ping == null || ping == 0 || typeof ping == "undefined")
            ping = "-- "
        pingSpan.innerHTML = '<i id="pingText">' + ping + 'ms</i>'
        pingSpan.classList.add("shadow")
        pingSpan.title = "Sliding Window Median Response Time"
        pingSpan.id = "userPing"
        pingSpan.style = 'padding-right: 5px;float: right;'
        pingSpan.addEventListener("click", function () {
            logger(LOG_LVL.DEBUG, "makePopup: recieved click, displaying chart")
            popUp.style.bottom = players.offsetHeight + 10 + "px"
            popUp.style.display = 'block'
        })

        let playerList = document.querySelector(".self")
        playerList.insertAdjacentElement("beforeend", pingSpan)
        logger(LOG_LVL.DEBUG, "makePop: created pingSpan, playerList is: " + playerList)
    } else {
        logger(LOG_LVL.DEBUG, "makePop: pingSpan already defined, pingSpan is: " + pingSpan)
    }
}

// TODO: Refactor point - need to stop storing in game.user - store local instead.  This point should refresh display updatePing should be replaced?
// export const refreshDisplay = function (chart) {
//     updateChart(chart)
//     //makeChart(document.getElementById("pingChart"), game.user.getFlag("world", "pingData"))  // TODO: hold the chart object and use update(0) after replacing the data
//     // updatePing(document.getElementById("userPing"))  // not doing this on pings now, it's the median anyway, can wait until the user list refreshes ( more frequent anyway )
// }

export const updateChart = function (singlePing, newMedian) {
    let pingInterval = game.settings.get("response-times", "pingInterval") || 20
    let historySize = game.settings.get( "response-times", "historySize") || 30
    if (responseTimesChart != null) {
        logger(LOG_LVL.DEBUG, "updating chart")
        if ( responseTimesChart.data.datasets[0].data.length >= historySize) {  // honor sliding window and don't grow forever
            responseTimesChart.data.datasets[0].data.shift()
            responseTimesChart.data.datasets[1].data.shift()
            //responseTimesChart.data.labels.shift()
        }
        responseTimesChart.data.datasets[0].data.push(singlePing) // TODO: implement fixed length queue here too and then stop storing data
        responseTimesChart.data.datasets[1].data.push(newMedian)
        if ( responseTimesChart.data.datasets[0].data.length < historySize)  // now it's populated with 20-whatever, stop unshifting
            responseTimesChart.data.labels.unshift(responseTimesChart.data.labels[0] - pingInterval)
        responseTimesChart.update({duration: 0})
    } else {
        responseTimesChart = makeChart(document.getElementById("pingChart"), game.user.getFlag("world", "pingData"))
        logger(LOG_LVL.DEBUG, "got a request to add to a chart that does not exist, creating it")
        updateChart(singlePing, newMedian) // hmnnn, recursion in a crap language like javascript worries me...
    }
}

function makeChart(ctx, pingData) {
    let foo = new Array(pingData.data.length)
    const timeInt = game.settings.get("response-times", "pingInterval")
    let bar = new Array(pingData.data.length)
    for (let i = 0; i < foo.length; i++) {
        foo[i] = -((foo.length - i) * timeInt)
        bar[i] = pingData.median // there probably is a way to fill an array of length i with a constant, but then, this is javascript...
    }

    logger(LOG_LVL.DEBUG, "doChart: pingData in doChart - " + JSON.stringify(pingData))
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: foo,
            datasets: [
                {
                    data: pingData.data,
                    label: 'response time',
                    borderColor: "#d4d4d4",
                    fill: false,
                    spanGaps: false
                }, {
                    data: bar,
                    label: 'median',
                    borderColor: "red",
                    fill: false,
                    spanGaps: true
                }
            ]
        },
        options: {
            title: {
                display: false,
                text: 'Response Times'
            },
            legend: {
                labels: {
                    boxWidth: 5
                }
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'sec'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'ms'
                    }
                }]
            }//,
            // pan: {
            //     enabled: false
            // },
            // zoom: {
            //     enabled: false
            // },
            // tooltips: {
            //     enabled: true
            // },
            // animation: {
            //     duration: 0 // general animation time
            // },
            // hover: {
            //     animationDuration: 0 // duration of animations when hovering an item
            // },
            // responsiveAnimationDuration: 0 // animation duration after a resize
        }
    })

    return myChart  // TODO: for local objects eventually after I give up displaying all users and ditch game.user
}

