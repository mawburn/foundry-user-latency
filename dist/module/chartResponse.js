import { logger, LOG_LVL } from './log.js'

export const makePopup = function () {
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
        popUp.style.display = 'block'
        popUp.innerHTML = '<canvas id="pingChart" width="400" height="500"></canvas>'
        popUp.addEventListener("click", function (event) {
            logger(LOG_LVL.DEBUG, "makePopup: closing popup -tk")
            popUp.style.display = 'none'
        })
        players.insertAdjacentElement("beforebegin", popUp)
    } else {
        logger(LOG_LVL.DEBUG, "makePopup: popUp already defined, players is: " + players)
    }
}

export const makePingSpan = function () {

    if ( typeof pingSpan === "undefined" || pingSpan == null ) {
        let pingSpan = document.createElement("span")
        let popUp = document.getElementById("pingPop")
        pingSpan.innerHTML = '<i id="pingText">' + game.user.getFlag("world", "pingAverage") + 'ms</i>'
        pingSpan.classList.add("shadow")
        pingSpan.title = "Sliding Window Average Response Time"
        pingSpan.id = "userPing"
        pingSpan.style = 'padding-right: 5px;float: right;'
        pingSpan.addEventListener("click", function () {
            logger(LOG_LVL.DEBUG, "makePopup: recieved click, displaying chart")
            popUp.style.display = 'block'
        })

        let playerList = document.querySelector(".self")
        playerList.insertAdjacentElement("beforeend", pingSpan)
        logger(LOG_LVL.DEBUG, "makePop: created pingSpan, playerList is: " + playerList)
    } else {
        logger(LOG_LVL.DEBUG, "makePop: pingSpan already defined, players is: " + players)
    }
}

// TODO: Refactor point - need to stop storing in game.user - store local instead.  This point should refresh display updatePing should be replaced?
export const refreshDisplay = function () {
    doChart(document.getElementById("pingChart"))
    updatePing(document.getElementById("userPing"))
}

function updatePing(ctx) {

}

function doChart(ctx) {

    let pingData = game.user.getFlag("world", "pingArray").reverse()
    let foo = new Array(pingData.length)
    for(let i=0; i<foo.length; i++){
        foo[i] = i
    }

    logger(LOG_LVL.DEBUG,"doChart: pingData in doChart - " + JSON.stringify(pingData))
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