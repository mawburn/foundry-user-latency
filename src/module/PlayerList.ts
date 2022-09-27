import { MODULE_NAME } from '../constants'
import type { Pong } from './WebLatency'

interface LatencyTimes {
  [key: string]: number
}

export class PlayerList {
  private cssBase = 'userLatency_' as const
  private playerLatencyTimes: LatencyTimes = {}

  getId = (id: string) => `${this.cssBase}LatencyText--${id}`
  getClass = (mod?: string) => `${this.cssBase}LatencySpan${mod ? `--${mod}` : ''}`

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

    if (!playerLatency) {
      return
    }

    const elmId = this.getId(playerId)
    let elm = document.getElementById(elmId) as HTMLSpanElement

    if (!elm) {
      this.makeLatencySpan(playerId)
      elm = document.getElementById(elmId) as HTMLSpanElement
    }

    elm.innerHTML = `${playerLatency}<em>ms</em>`
    elm.className = this.getClass()

    const level = playerLatency <= 100 ? 'good' : playerLatency < 250 ? 'low' : 'bad'

    elm.classList.add(this.getClass(level))
  }

  makeLatencySpan = playerId => {
    const players = document.getElementById('players')

    if (players) {
      const span = document.createElement('span')
      span.id = this.getId(playerId)
      span.className = this.getClass()

      const playerElm = players.querySelector(`li[data-user-id="${playerId}"] .player-name`)

      if (playerElm) {
        playerElm.insertAdjacentElement('afterend', span)
      }
    }
  }
}
