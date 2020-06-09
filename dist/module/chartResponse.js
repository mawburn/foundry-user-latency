import { logger, LOG_LVL, log_level } from './log.js'

const chartResponse = function (event) {
    let popUp = document.getElementById("pingPop")
    if ( popUp.style.display == 'block')
        return
    let players = document.getElementById("players")
    let ctx = document.getElementById("pingChart")
    doChart(ctx)
    popUp.style.position = "absolute"
    popUp.style.bottom = players.offsetHeight + 10 + "px"
    popUp.style.left = players.offsetLeft -14 + "px"
    popUp.style.width = players.offsetWidth +"px"
    popUp.style.display = 'block'
    logger(LOG_LVL.DEBUG, "ping: pingPop: " + popUp + event)
    return
}

export const makePopup = function () {

    let popUp = document.createElement("div")
    popUp.id = 'pingPop'
    popUp.style.padding = '10px'
    popUp.style.display = 'none'
    popUp.style.zIndex = "80"
    popUp.style.background = "black"
    popUp.style.opacity = ".8"
    popUp.style.borderRadius = "5px"
    popUp.style.boxSizing = "border-box"
    popUp.style.boxShadow = "10 10 20px #c4c4c4;"
    popUp.innerHTML = '<canvas id="pingChart" width="400" height="500"></canvas>'
    popUp.addEventListener("click", function (event) {
        logger(LOG_LVL.DEBUG, "ping: closing popup -tk")
        popUp.style.display = 'none'
    })

    let pingSpan = document.createElement("span")
    pingSpan.innerHTML = '<i id="pingText">' + game.user.getFlag("world", "pingAverage") + 'ms</i>'
    pingSpan.classList.add("shadow")
    pingSpan.title = "Sliding Window Average Response Time"
    pingSpan.id = "userPing"
    pingSpan.style = 'padding-right: 5px;float: right;'
    pingSpan.addEventListener("click", chartResponse)

    let playerList = document.querySelector(".self")

    playerList.insertAdjacentElement("beforeend", pingSpan)
    playerList.insertAdjacentElement("beforeend", popUp)
    return pingSpan
}

function doChart(ctx) {

    let pingData = game.user.getFlag("world", "pingArray").reverse()
    let foo = new Array(pingData.length)
    for(let i=0; i<foo.length; i++){
        foo[i] = i
    }

    logger(LOG_LVL.DEBUG,"ping: pingData in doChart - " + JSON.stringify(pingData))
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: foo,
            datasets: [
                {
                    data: pingData,
                    label: 'response time',
                    borderColor: "#d4d4d4",
                    fill: false,
                    spanGaps: false
                }]
        },
        options: {
            title: {
                display:false,
                text: 'Response Times'
            }
        }
    })
    return myChart
}