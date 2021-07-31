import { MODULE_NAME } from '../ping-logger'
import { Pong } from './WebPing'

interface PingTimes {
  [key: string]: {
    userName: string
    ping: number
  }
}

export class PlayerList {
  private playerPingTimes: PingTimes = {}
  private _game = game as Game

  registerListeners = () => {
    if (this._game.socket) {
      console.log('socket registered')
      this._game.socket.on(`module.${MODULE_NAME}`, (data: Pong) => {
        console.log('data', data, this.playerPingTimes)

        this.playerPingTimes[data.userId] = {
          userName: data.userName,
          ping: data.average,
        }

        this.updatePingText(data.userId)
      })
    } else {
      console.log('timeout')
      setTimeout(() => {
        this.registerListeners()
      }, 5000)
    }
  }

  updatePingText = async (playerId: string) => {
    console.log(playerId)
    const player = this.playerPingTimes[playerId]
    console.log(player)

    if (!player) {
      return
    }

    let elm = document.getElementById(`pingText_${playerId}`) as HTMLSpanElement

    if (!elm) {
      try {
        await this.makePingSpan(playerId)
        elm = document.getElementById(`pingText_${playerId}`) as HTMLSpanElement
      } catch (err) {
        console.error(err)
        throw new Error(err)
      }
    }

    console.log(elm)

    elm.innerText = `${player.ping}ms`
    elm.className = 'pingSpan'

    const level = player.ping < 100 ? 'Good' : player.ping < 250 ? 'Low' : 'Bad'

    elm.classList.add(`ping${level}`)
  }

  makePingSpan = playerId =>
    new Promise<void>((res, rej) => {
      const players = document.getElementById('players')

      console.log('players', playerId, players, this.playerPingTimes)

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
