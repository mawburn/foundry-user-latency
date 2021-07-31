import { MODULE_NAME } from '../ping-logger'
import { Pong } from './Webping'

interface PingTimes {
  [key: string]: {
    userName: string
    ping: number
  }
}

export default class PlayerList {
  private playerPingTimes: PingTimes = {}
  private _game = game as Game

  constructor() {
    this.registerListeners()
  }

  registerListeners() {
    if (this._game.socket) {
      this._game.socket.on(`module.${MODULE_NAME}`, (data: Pong) => {
        this.playerPingTimes[data.userId] = {
          userName: data.userName,
          ping: data.average,
        }

        this.updatePingText(data.userId)
      })
    } else {
      setTimeout(() => {
        this.registerListeners()
      }, 5000)
    }
  }

  updatePingText = async (playerId: string) => {
    const player = this.playerPingTimes[playerId]

    if (!player) {
      return
    }

    const elm = document.getElementById(`pingText_${playerId}`) as HTMLSpanElement

    if (!elm) {
      try {
        await this.makePingSpan(playerId)
      } catch (err) {
        console.error(err)
        throw new Error(err)
      }
    }

    elm.innerText = `${player.ping}ms`
    elm.className = 'pingSpan'

    const level = player.ping < 100 ? 'Good' : player.ping < 250 ? 'Low' : 'Bad'

    elm.classList.add(`ping${level}`)
  }

  makePingSpan = playerId =>
    new Promise<void>((res, rej) => {
      const players = document.getElementById('players')

      if (players) {
        const span = document.createElement('span')
        span.id = `pingText_${playerId}`
        span.title = `${this.playerPingTimes[playerId].userName}'s ping`
        span.className = 'pingSpan'

        const playerElm = players.querySelector(`li[data-user-id="${playerId}"] .player-name`)

        if (playerElm) {
          playerElm.insertAdjacentElement('afterend', span)
        }

        res()
      }

      rej()
    })
}
