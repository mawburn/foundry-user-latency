import { MODULE_NAME } from '../constants'
import { PlayerList } from './PlayerList'

export interface Pong {
  userId: string
  average: number
}

export class WebLatency {
  private static readonly HISTORY_SIZE = 10
  private static readonly MIN_INTERVAL_SECONDS = 10
  private intervalSeconds: number

  private latencyArr: number[] = []
  private playerList: PlayerList

  constructor() {
    this.playerList = new PlayerList()
    this.playerList.registerListeners()
    this.monitorLatency()
    this.intervalSeconds = 30
  }

  measureLatency = async () => {
    await this.performLatencyMeasurement()
  }

  monitorLatency = async () => {
    while (true) {
      this.setIntervalSetting()
      await this.sleep()
      await this.performLatencyMeasurement()
    }
  }

  setIntervalSetting = () => {
    const interval = (game as Game).settings.get(MODULE_NAME, 'latencyInterval') as number
    const currentInterval = interval ?? this.intervalSeconds
    this.intervalSeconds = Math.max(currentInterval, WebLatency.MIN_INTERVAL_SECONDS) * 1000
  }

  private sleep = () => new Promise(res => setTimeout(res, this.intervalSeconds))

  private performLatencyMeasurement = async () => {
    try {
      const gameInstance = game as Game
      if (!gameInstance.socket?.connected || !gameInstance?.user?.id) return

      const startTime = Date.now()
      await gameInstance.time.sync()
      const delta = Date.now() - startTime

      this.latencyArr.push(delta)
      this.sendPong(gameInstance.user.id, this.computeAverage())
    } catch (err) {
      console.log(err)
    }
  }

  private computeAverage = () => {
    const recentLatencies = this.latencyArr.slice(-WebLatency.HISTORY_SIZE)
    const total = recentLatencies.reduce((a, b) => a + b, 0)
    return Math.round(total / recentLatencies.length)
  }

  private sendPong = (userId: string, average: number) => {
    const gameInstance = game as Game

    const pong: Pong = { userId, average }
    gameInstance.socket?.emit(`module.${MODULE_NAME}`, pong)
    this.playerList.updateSelf(pong)
  }
}
