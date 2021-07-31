import { MODULE_NAME } from '../ping-logger'

export class WebPing {
  private HISTORY_SIZE: number = 30 as const
  url: string = window.location.href
  pingArr: number[] = []
  intervalObj: NodeJS.Timer | undefined
  interval: number = 30

  sleep = () =>
    new Promise<void>(res => {
      this.getTimeout()

      setTimeout(() => {
        res()
      }, this.interval)
    })

  getTimeout = () => {
    this.interval = 1000 * ((game as Game).settings.get(MODULE_NAME, 'pingInterval') as number)
  }

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
    let delta = 0

    try {
      await fetch(this.url).then(res => {
        if (!res.ok) {
          throw new Error('Bad response from server')
        }
      })

      delta = new Date().getTime() - startTime
    } catch (err) {
      console.log(err)
    }

    this.pingArr.push(delta)
    this.pong((game as Game)?.user?.name, (game as Game)?.user?.id, this.average())
  }

  pong(userName, userId, average) {
    ;(game as Game)?.socket?.emit(`module.${MODULE_NAME}`, {
      userId,
      userName,
      average,
    })
  }
}
