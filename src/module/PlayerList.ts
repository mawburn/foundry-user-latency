import { MODULE_NAME } from '../constants'

import type { Pong } from './WebLatency'

interface LatencyTimes {
  [key: string]: number
}

export class PlayerList {
  private cssBase = 'userLatency_' as const
  private playerLatencyTimes: LatencyTimes = {}

  getId = (id: string) => `${this.cssBase}latencyText--${id}`
  getClass = (mod?: string) => `${this.cssBase}latencySpan${mod ? `--${mod}` : ''}`

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

    if (!playerLatency || hideLatency) {
      if (elm) {
        elm.className = this.getClass('hidden')
      }

      return
    } else {
      elm.classList.remove(this.getClass('hidden'))
    }

    if (!elm) {
      this.makeLatencySpan(playerId)
      elm = document.getElementById(elmId) as HTMLSpanElement
    }

    const microLatency = (game as Game).settings.get(MODULE_NAME, 'microLatency')

    const level = playerLatency <= 100 ? 'good' : playerLatency < 250 ? 'low' : 'bad'

    if (microLatency) {
      elm.innerHTML = level === 'good' ? '+' : level === 'low' ? '&nbsp;' : '-'
      elm.title = `${playerLatency}ms`
      elm.classList.add('microLatency')
    } else {
      elm.classList.remove('microLatency')
      elm.innerHTML = `${playerLatency}<em>ms</em>`
    }

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
