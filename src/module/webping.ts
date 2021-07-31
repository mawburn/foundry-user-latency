import { MODULE_NAME } from '../ping-logger'

export interface Pong {
  userId: string
  userName: string
  average: number
}
export class WebPing {
  private HISTORY_SIZE: number = 30 as const
  private url: string = window.location.href
  private pingArr: number[] = []
  private _game = game as Game

  constructor() {
    new PlayerList()
  }

  sleep = () =>
    new Promise<void>(res => {
      const interval = this.getTimeout()

      setTimeout(() => {
        res()
      }, interval)
    })

  getTimeout = () => 1000 * (this._game.settings.get(MODULE_NAME, 'pingInterval') as number) ?? 30

  doPings = async () => {
    await this.ping()
    await this.sleep()
    this.doPings()
  }

  average = () => {
    while (this.pingArr.length > this.HISTORY_SIZE) {
      this.pingArr.shift()
    }

    const total = this.pingArr.reduce((a, b) => a + b, 0)

    return Math.ceil(total / this.pingArr.length)
  }

  ping = async () => {
    const startTime = new Date().getTime()

    try {
      await fetch(this.url).then(res => {
        if (!res.ok) {
          throw new Error('Bad response from server')
        }
      })

      const delta = new Date().getTime() - startTime
      this.pingArr.push(delta)
      this.pong(this._game.user?.name, this._game.user?.id, this.average())
    } catch (err) {
      console.log(err)
    }
  }

  pong(userName, userId, average) {
    this._game?.socket?.emit(`module.${MODULE_NAME}`, {
      userId,
      userName,
      average,
    } as Pong)
  }
}
