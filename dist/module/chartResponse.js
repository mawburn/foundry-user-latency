import {WebPing} from './webping.js'
import {Logger} from './log.js'

const logger = new Logger("chartResponse", Logger.LOG_LVL.DEBUG)

export class ChartResponse {

    constructor() {
        // noop
    }

    responseTimesChart = null
    playerPingTimes = {}

    registerListeners() {
        this.playerPingTimes[game.userId] = "--"
        /**
         * {
         *   userid: userid,
         *   username: username,
         *   time: pingtime
         *  }
         */
        game.socket.on('module.response-times', (data) => {
            logger.log(Logger.LOG_LVL.INFO, JSON.stringify(data))
            this.playerPingTimes[data.userid] = data.medianping
            this.updatePingText(data.userid, data.medianping)
        });
    }

    makePopup() {
        game.socket.on('module.response-times', (data) => {
            logger.log(Logger.LOG_LVL.INFO, "got here:" + JSON.stringify(data))
        });
        let popUp = document.getElementById("pingPop")
        if (typeof popUp === "undefined" || popUp === null) {
            let players = document.getElementById("players")
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
                logger.log(Logger.LOG_LVL.DEBUG, "makePopup: closing popup -tk")
                popUp.style.display = 'none'
            })
            players.insertAdjacentElement("beforebegin", popUp)
            //responseTimesChart = makeChart(document.getElementById("pingChart"), pingData)
        } else {
            logger.log(Logger.LOG_LVL.DEBUG, "makePopup: popUp already defined, players is: ")
        }
        this.makePingSpan()
    }

    makePingSpan() {
        let players = document.getElementById("players")
        for (let playerId in this.playerPingTimes) {
            let pingCheck = document.getElementById("pingText_" + playerId)
            if (typeof pingCheck === "undefined" || pingCheck === null) {
                let pingSpan = document.createElement("span")
                pingSpan.innerHTML = '<i id="pingText_' + playerId + '"></i>'
                pingSpan.title = "Sliding Window Median Response Time"
                pingSpan.id = "userPing"
                pingSpan.style = 'flex: 0; padding-left: 3px; padding-right: 3px; background-color: rgb(0,0,0,.4); border-radius: 4px;' // border: 1px solid black;
                if (playerId === game.userId) {
                    pingSpan.classList.add("shadow")
                    pingSpan.addEventListener("click", function () {
                        logger.log(Logger.LOG_LVL.DEBUG, "makePopup: received click, displaying chart")
                        let popUp = document.getElementById("pingPop")
                        popUp.style.bottom = players.offsetHeight + 10 + "px"
                        popUp.style.display = 'block'
                    })
                    let playerList = document.querySelector(".self")
                    if (playerList)
                        playerList.insertAdjacentElement("afterend", pingSpan)
                } else {
                    let playerList = document.querySelector('li[data-user-id="' + playerId + '"]')
                    playerList = playerList.querySelector(".player-name")
                    if (playerList)
                        playerList.insertAdjacentElement("afterend", pingSpan)
                }
            }
        }
    }

    updatePingText(playerId, medianPing) {
        let pingMedian = isNaN(medianPing) ? "--" : medianPing
        let el = document.getElementById("pingText_" + playerId)
        if (el)
            el.innerHTML = '<i id="pingText_"' + playerId + '>' + pingMedian + 'ms</i>'
        else
            this.makePingSpan()
    }

    updateChart(pingData, singlePing, newMedian) {
        let pingInterval = game.settings.get("response-times", "pingInterval") || 20
        let historySize = game.settings.get("response-times", "historySize") || 30
        if (this.responseTimesChart != null) {
            logger.log(Logger.LOG_LVL.DEBUG, "updating chart")
            if (this.responseTimesChart.data.datasets[0].data.length >= historySize) {  // honor sliding window and don't grow forever
                this.responseTimesChart.data.datasets[0].data.shift()
                this.responseTimesChart.data.datasets[1].data.shift()
                //responseTimesChart.data.labels.shift()
            }
            this.responseTimesChart.data.datasets[0].data.push(singlePing) // TODO: implement fixed length queue here too and then stop storing data
            this.responseTimesChart.data.datasets[1].data.push(newMedian)
            if (this.responseTimesChart.data.datasets[0].data.length < historySize)  // now it's populated with 20-whatever, stop unshifting
                this.responseTimesChart.data.labels.unshift(this.responseTimesChart.data.labels[0] - pingInterval)
            this.responseTimesChart.update({duration: 0})
        } else {
            this.responseTimesChart = this.makeChart(document.getElementById("pingChart"), pingData)
            logger.log(Logger.LOG_LVL.DEBUG, "got a request to add to a chart that does not exist, creating it")
            this.updateChart(pingData, singlePing, newMedian) // hmnnn, recursion in a crap language like javascript worries me...
        }
        this.updatePingText(game.user.id, newMedian)
    }

    makeChart(ctx, pingData) {
        let foo = new Array(pingData.data.length)
        const timeInt = game.settings.get("response-times", "pingInterval")
        let bar = new Array(pingData.data.length).fill(pingData.median)
        for (let i = 0; i < foo.length; i++) {
            foo[i] = -((foo.length - i) * timeInt)
        }

        logger.log(Logger.LOG_LVL.DEBUG, "doChart: pingData in doChart - " + JSON.stringify(pingData))
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

        return myChart
    }
}