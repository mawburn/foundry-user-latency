export class Logger {
  static LOG_LVL = {
    ALL: 5,
    DEBUG: 4,
    WARN: 3,
    INFO: 2,
    ERROR: 1,
    OFF: 0,
  } as const

  constructor(namespace, loglevel) {
    this.namespace = namespace
    this.log_level = loglevel
  }

  namespace = 'not set'
  log_level = Logger.LOG_LVL.DEBUG

  setLogLevel = lvl => {
    this.log_level = lvl
    return this.log_level
  }

  getLogLevel = () => this.log_level

  log(lvl, mesg) {
    if (lvl === Logger.LOG_LVL.OFF || typeof lvl === 'undefined') {
      // nop
    } else {
      if (lvl >= this.log_level) console.log(this.namespace + ': ' + mesg)
      if (lvl === Logger.LOG_LVL.ERROR) console.error(this.namespace + ': ' + mesg)
    }
  }
}

const logger = new Logger('log.js', Logger.LOG_LVL.INFO)
logger.log(Logger.LOG_LVL.INFO, 'log.js loaded..')
