import { MODULE_NAME } from '../constants'
import { PlayerList } from './PlayerList'

export interface Pong {
  userId: string
  average: number
}
export class WebPing {
  private HISTORY_SIZE: number = 30 as const
  private url: string = window.location.href
  private pingArr: number[] = []
  private playerList: PlayerList

  constructor() {
    this.playerList = new PlayerList()
    this.playerList.registerListeners()
  }

  sleep = () =>
    new Promise<void>(res => {
      const interval = this.getTimeout()

      setTimeout(() => {
        res()
      }, interval)
    })

  getTimeout = () =>
    1000 * ((game as Game).settings.get(MODULE_NAME, 'pingInterval') as number) ?? 30

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
    try {
      const startTime = Date.now()
      await fetch(this.url, { method: 'HEAD' })
      const delta = Date.now() - startTime

      this.pingArr.push(delta)
      this.pong((game as Game).user?.id, this.average())
    } catch (err) {
      console.log(err)
    }
  }

  pong(userId, average) {
    const pong: Pong = {
      userId,
      average,
    }

    ;(game as Game)?.socket?.emit(`module.${MODULE_NAME}`, { ...pong })

    this.playerList.updateSelf({ ...pong })
  }
}
