import { MODULE_NAME } from '../constants'
import type { Pong } from './WebPing'

interface PingTimes {
  [key: string]: {
    userName: string
    ping: number
  }
}

export class PlayerList {
  private cssBase = 'pingLogger_' as const
  private playerPingTimes: PingTimes = {}

  getId = (id: string) => `${this.cssBase}_pingText--${id}`
  getClass = (mod?: string) => `${this.cssBase}_pingSpan${mod ? `--${mod}` : ''}`

  registerListeners = () => {
    if ((game as Game).socket) {
      ;(game as Game).socket?.on(`module.${MODULE_NAME}`, (data: Pong) => {
        this.playerPingTimes[data.userId] = {
          userName: data.userName,
          ping: data.average,
        }

        this.updatePingText(data.userId)
      })
    } else {
      console.error('Socket init timeout')
      setTimeout(() => {
        this.registerListeners()
      }, 5000)
    }
  }

  updateSelf = (data: Pong) => {
    this.playerPingTimes[data.userId] = {
      userName: data.userName,
      ping: data.average,
    }

    this.updatePingText(data.userId)
  }

  updatePingText = async (playerId: string) => {
    const player = this.playerPingTimes[playerId]

    if (!player) {
      return
    }

    const elmId = this.getId(playerId)
    let elm = document.getElementById(elmId) as HTMLSpanElement

    if (!elm) {
      try {
        await this.makePingSpan(playerId)
        elm = document.getElementById(elmId) as HTMLSpanElement
      } catch (err) {
        console.error(err)
        throw new Error(err)
      }
    }

    elm.innerHTML = `${player.ping}<em>ms</em>`
    elm.className = this.getClass()

    const level = player.ping < 100 ? 'good' : player.ping < 250 ? 'low' : 'bad'

    elm.classList.add(this.getClass(level))
  }

  makePingSpan = playerId =>
    new Promise<void>((res, rej) => {
      const players = document.getElementById('players')

      if (players) {
        const span = document.createElement('span')
        span.id = this.getId(playerId)
        span.title = `${this.playerPingTimes[playerId].userName}'s ping`
        span.className = this.getClass()

        const playerElm = players.querySelector(`li[data-user-id="${playerId}"] .player-name`)

        if (playerElm) {
          playerElm.insertAdjacentElement('afterend', span)
        }

        res()
      }

      rej()
    })
}
