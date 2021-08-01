import { PlayerList } from '../module/PlayerList'
import MockedSocket from 'socket.io-mock'

interface GameGlobal {
  game: Partial<Game>
  Hooks: Hooks
}

describe('PlayerList', () => {
  const baseGlobal = { ...global }

  beforeEach(() => {
    ;(global as GameGlobal) = {
      ...baseGlobal,
      game: {
        socket: new MockedSocket(),
      },
      Hooks: new Hooks(),
    }
  })

  afterEach(() => {
    global = { ...baseGlobal }
  })

  it('is true', () => {
    const playerList = new PlayerList()
  })
})
