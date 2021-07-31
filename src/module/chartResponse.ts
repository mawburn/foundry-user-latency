import { Chart } from 'chart.js'

import { Logger } from './log'

const logger = new Logger('chartResponse', Logger.LOG_LVL.DEBUG)

export class ChartResponse {
  responseTimesChart
  playerPingTimes: object

  constructor() {
    console.log('init chart')
    this.responseTimesChart = this.makeChart(document.getElementById('pingChart'))
    this.playerPingTimes = {}
  }

  registerListeners() {
    const userId = (game as Game).userId

    if (userId) {
      this.playerPingTimes[userId] = '--'
      /**
       * {
       *   userid: userid,
       *   username: username,
       *   time: pingtime
       *  }
       */
      ;(game as Game)?.socket?.on('module.response-times', data => {
        logger.log(Logger.LOG_LVL.INFO, JSON.stringify(data))
        this.playerPingTimes[data.userid] = data.medianping
        this.updatePingText(data.userid, data.medianping)
      })
    }
  }

  makePopup() {
    ;(game as Game)?.socket?.on('module.response-times', data => {
      logger.log(Logger.LOG_LVL.INFO, 'got here:' + JSON.stringify(data))
    })
    let popUp = document.getElementById('pingPop')
    if (typeof popUp === 'undefined' || popUp === null) {
      const players = document.getElementById('players')

      if (players) {
        popUp = document.createElement('div')
        popUp.id = 'pingPop'
        popUp.style.padding = '10px'
        popUp.style.display = 'none'
        popUp.style.zIndex = '80'
        popUp.style.background = 'black'
        popUp.style.opacity = '.8'
        popUp.style.borderRadius = '5px'
        popUp.style.boxSizing = 'border-box'
        popUp.style.boxShadow = '10 10 20px #c4c4c4;'
        popUp.style.position = 'absolute'
        popUp.style.bottom = players.offsetHeight + 10 + 'px'
        //popUp.style.left = players.offsetLeft -14 + "px"
        popUp.style.width = players.offsetWidth + 'px'
        popUp.style.marginLeft = players.offsetLeft + 'px'
        popUp.style.marginBottom = '15 px'
        //popUp.style.height = "500px"
        popUp.innerHTML = '<canvas id="pingChart" width="400" height="500"></canvas>'
        popUp.addEventListener('click', function (event) {
          logger.log(Logger.LOG_LVL.DEBUG, 'makePopup: closing popup -tk')

          if (popUp) {
            popUp.style.display = 'none'
          }
        })
        players.insertAdjacentElement('beforebegin', popUp)
        //responseTimesChart = makeChart(document.getElementById("pingChart"), pingData)
      }
    } else {
      logger.log(Logger.LOG_LVL.DEBUG, 'makePopup: popUp already defined, players is: ')
    }
    this.makePingSpan()
  }

  makePingSpan() {
    const players = document.getElementById('players')
    for (const playerId in this.playerPingTimes) {
      const pingCheck = document.getElementById('pingText_' + playerId)
      if (typeof pingCheck === 'undefined' || pingCheck === null) {
        const pingSpan = document.createElement('span')

        if (pingSpan) {
          pingSpan.innerHTML = '<i id="pingText_' + playerId + '"></i>'
          pingSpan.title = 'Sliding Window Median Response Time'
          pingSpan.id = 'userPing'
          pingSpan.setAttribute(
            'style',
            'flex: 0; padding-left: 3px; padding-right: 3px; background-color: rgb(0,0,0,.4); border-radius: 4px;'
          )

          if (playerId === (game as Game).userId) {
            pingSpan.classList.add('shadow')
            pingSpan.addEventListener('click', function () {
              logger.log(Logger.LOG_LVL.DEBUG, 'makePopup: received click, displaying chart')
              const popUp = document.getElementById('pingPop')

              if (popUp && players) {
                popUp.style.bottom = players.offsetHeight + 10 + 'px'
                popUp.style.display = 'block'
              }
            })
            const playerList = document.querySelector('.self')
            if (playerList) playerList.insertAdjacentElement('afterend', pingSpan)
          } else {
            const playerList = document.querySelector(`li[data-user-id="${playerId}"] .player-name`)
            if (playerList) playerList.insertAdjacentElement('afterend', pingSpan)
          }
        }
      }
    }
  }

  updatePingText(playerId, medianPing) {
    const pingMedian = isNaN(medianPing) ? '--' : medianPing
    const el = document.getElementById('pingText_' + playerId)
    if (el) el.innerHTML = '<i id="pingText_"' + playerId + '>' + pingMedian + 'ms</i>'
    else this.makePingSpan()
  }

  updateChart(pingData, singlePing, newMedian) {
    const pingInterval =
      ((game as Game).settings.get('response-times', 'pingInterval') as number) || 20
    const historySize =
      ((game as Game).settings.get('response-times', 'historySize') as number) || 30

    logger.log(Logger.LOG_LVL.DEBUG, 'updating chart')
    if (this.responseTimesChart.data.datasets[0].data.length >= historySize) {
      // honor sliding window and don't grow forever
      this.responseTimesChart.data.datasets[0].data.shift()
      this.responseTimesChart.data.datasets[1].data.shift()
      //responseTimesChart.data.labels.shift()
    }
    this.responseTimesChart.data.datasets[0].data.push(singlePing) // TODO: implement fixed length queue here too and then stop storing data
    this.responseTimesChart.data.datasets[1].data.push(newMedian)
    if (this.responseTimesChart.data.datasets[0].data.length < historySize)
      // now it's populated with 20-whatever, stop unshifting
      this.responseTimesChart.data.labels.unshift(
        this.responseTimesChart.data.labels[0] - pingInterval
      )
    this.responseTimesChart.update({ duration: 0 })

    this.updatePingText((game as Game)?.user?.id, newMedian)
  }

  makeChart(ctx) {
    console.log(ctx)
    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            label: 'response time',
            borderColor: '#d4d4d4',
            fill: false,
            spanGaps: false,
          },
          {
            data: [],
            label: 'median',
            borderColor: 'red',
            fill: false,
            spanGaps: true,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: false,
            text: 'Response Times',
          },

          legend: {
            labels: {
              boxWidth: 5,
            },
          },
        },
        scales: {
          xAxes: {
            display: true,
            title: {
              display: true,
              text: 'sec',
            },
          },

          yAxes: {
            display: true,
            title: {
              display: true,
              text: 'ms',
            },
          },
        },
      },
    })

    return myChart
  }
}
