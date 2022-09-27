import { MODULE_NAME } from '../constants'
import { PlayerList } from './PlayerList'

export interface Pong {
  userId: string
  average: number
}

export class WebLatency {
  private HISTORY_SIZE: number = 10 as const
  private latencyArr: number[] = []
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

  getTimeout = () => {
    const setting = ((game as Game).settings.get(MODULE_NAME, 'latencyInterval') as number) ?? 30

    // force 10 seconds minimum
    return 1000 * (setting >= 10 ? setting : 10)
  }

  doLatencys = async () => {
    await this.latency()
    await this.sleep()
    this.doLatencys()
  }

  average = () => {
    while (this.latencyArr.length > this.HISTORY_SIZE) {
      this.latencyArr.shift()
    }

    const total = this.latencyArr.reduce((a, b) => a + b, 0)

    return Math.round(total / this.latencyArr.length)
  }

  latency = async () => {
    try {
      const startTime = Date.now()
      await (game as Game).time.sync()
      const delta = Date.now() - startTime

      this.latencyArr.push(delta)
      this.pong((game as Game).user?.id, this.average())
    } catch (err) {
      console.log(err)
    }
  }

  pong = (userId, average) => {
    const pong: Pong = {
      userId,
      average,
    }

    ;(game as Game)?.socket?.emit(`module.${MODULE_NAME}`, { ...pong })

    this.playerList.updateSelf({ ...pong })
  }
}
