import {logger, LOG_LVL} from './log.js'

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
        popUp.style.display = 'block'
        //popUp.style.height = "500px"
        popUp.innerHTML = '<canvas id="pingChart" width="400" height="500"></canvas>'
        popUp.addEventListener("click", function (event) {
            logger(LOG_LVL.DEBUG, "makePopup: closing popup -tk")
            popUp.style.display = 'none'
        })
        players.insertAdjacentElement("beforebegin", popUp)
        //makeChart(document.getElementById("pingChart"),game.user.getFlag("world", "pingData").data)
    } else {
        logger(LOG_LVL.DEBUG, "makePopup: popUp already defined, players is: ")
    }
}

export const makePingSpan = function () {
    let pingSpan = document.getElementById("pingSpan") // TODO: probably remove this and the null check since it seems to be null every time I check it in renderPlayerList
    if (typeof pingSpan === "undefined" || pingSpan == null) {
        let pingSpan = document.createElement("span")
        let popUp = document.getElementById("pingPop")
        pingSpan.innerHTML = '<i id="pingText">' + game.user.getFlag("world", "pingData").median + 'ms</i>'
        pingSpan.classList.add("shadow")
        pingSpan.title = "Sliding Window Median Response Time"
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
        logger(LOG_LVL.DEBUG, "makePop: pingSpan already defined, pingSpan is: " + pingSpan)
    }
}

// TODO: Refactor point - need to stop storing in game.user - store local instead.  This point should refresh display updatePing should be replaced?
export const refreshDisplay = function () {
    makeChart(document.getElementById("pingChart"), game.user.getFlag("world", "pingData"))  // TODO: hold the chart object and use update(0) after replacing the data
    // updatePing(document.getElementById("userPing"))  // not doing this on pings now, it's the median anyway, can wait until the user list refreshes ( more frequent anyway )
}


function makeChart(ctx, pingData) {
    let foo = new Array(pingData.data.length)
    let bar = new Array(pingData.data.length)
    for (let i = 0; i < foo.length; i++) {
        foo[i] = i
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
                },{
                    data: bar,
                    label: 'median',
                    borderColor:"red",
                    fill: false,
                    spanGaps: true
                }
            ]
        },
        options: {
            title: {
                display: false,
                text: 'Response Times'
            }
        }
    })

    return myChart  // TODO: for local objects eventually after I give up displaying all users and ditch game.user
}

