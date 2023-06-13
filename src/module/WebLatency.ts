import { MODULE_NAME } from '../constants'
import { PlayerList } from './PlayerList'

export interface Pong {
  userId: string
  average: number
}

const gameInstance = game as Game

export class WebLatency {
  private static readonly HISTORY_SIZE = 10
  private static readonly MIN_INTERVAL_SECONDS = 10

  private latencyArr: number[] = []
  private playerList: PlayerList

  constructor() {
    this.playerList = new PlayerList()
    this.playerList.registerListeners()
    this.monitorLatency()
  }

  measureLatency = async () => {
    await this.performLatencyMeasurement()
  }

  monitorLatency = async () => {
    while (true) {
      await this.sleep()
      await this.performLatencyMeasurement()
    }
  }

  getIntervalSetting = () => {
    console.log(gameInstance, gameInstance.settings)
    return (gameInstance.settings.get(MODULE_NAME, 'latencyInterval') as number) ?? 30
  }

  private sleep = () => {
    const intervalSeconds = Math.max(this.getIntervalSetting(), WebLatency.MIN_INTERVAL_SECONDS)
    return new Promise(res => setTimeout(res, intervalSeconds * 1000))
  }

  private performLatencyMeasurement = async () => {
    try {
      const startTime = Date.now()
      await (game as any).time.sync()
      const delta = Date.now() - startTime

      this.latencyArr.push(delta)
      this.sendPong((game as any).user?.id, this.computeAverage())
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
    const pong: Pong = { userId, average }
    gameInstance.socket?.emit(`module.${MODULE_NAME}`, pong)
    this.playerList.updateSelf(pong)
  }
}
