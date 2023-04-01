import styles from '../style.module.css'
import { MODULE_NAME } from '../constants'

import type { Pong } from './WebLatency'

interface LatencyTimes {
  [key: string]: number
}

export class PlayerList {
  private playerLatencyTimes: LatencyTimes = {}

  getId = (id: string) => `userLatencyText--${id}`

  registerListeners = () => {
    if ((game as Game).socket) {
      ;(game as Game).socket?.on(`module.${MODULE_NAME}`, (data: Pong) => {
        this.playerLatencyTimes[data.userId] = data.average
        this.updateLatencyText(data.userId)
      })
    } else {
      console.error('Socket init timeout')
      setTimeout(() => {
        this.registerListeners()
      }, 5000)
    }
  }

  updateSelf = (data: Pong) => {
    this.playerLatencyTimes[data.userId] = data.average
    this.updateLatencyText(data.userId)
  }

  updateLatencyText = (playerId: string) => {
    const playerLatency = this.playerLatencyTimes[playerId]
    const hideLatency = (game as Game).settings.get(MODULE_NAME, 'hideLatency')
    const elmId = this.getId(playerId)
    let elm = document.getElementById(elmId) as HTMLSpanElement

    if (!elm) {
      this.makeLatencySpan(playerId)
      elm = document.getElementById(elmId) as HTMLSpanElement
    }

    elm.removeAttribute('class')

    if (!playerLatency || hideLatency) {
      if (elm) {
        elm.classList.add(styles.userSpanHidden)
      }

      return
    }

    const microLatency = (game as Game).settings.get(MODULE_NAME, 'microLatency')

    const level =
      playerLatency <= 100
        ? styles.userSpanGood
        : playerLatency < 250
        ? styles.userSpanLow
        : styles.userSpanBad

    if (microLatency) {
      elm.innerHTML = playerLatency <= 100 ? '+' : playerLatency < 250 ? '&nbsp;' : '-'
      elm.title = `${playerLatency}ms`
      elm.classList.add(styles.microLatency)
    } else {
      elm.classList.remove(styles.microLatency)
      elm.innerHTML = `${playerLatency}<em>ms</em>`
    }

    elm.classList.add(level)
  }

  makeLatencySpan = playerId => {
    const players = document.getElementById('players')

    if (players) {
      const span = document.createElement('span')
      span.id = this.getId(playerId)

      const playerElm = players.querySelector(`li[data-user-id="${playerId}"] .player-name`)

      if (playerElm) {
        playerElm.insertAdjacentElement('afterend', span)
      }
    }
  }
}
