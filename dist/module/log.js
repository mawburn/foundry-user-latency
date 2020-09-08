export class Logger
{
    constructor(namespace, loglevel) {
        this.namespace = namespace // wtf no private fields firefox...
        this.log_level = loglevel
    }
    static LOG_LVL = {
        ALL: 5,
        DEBUG: 4,
        WARN: 3,
        INFO: 2,
        ERROR: 1,
        OFF: 0
    }

    namespace = "not set"
    log_level = Logger.LOG_LVL.DEBUG

    setLogLevel = function (lvl) {
        this.log_level = lvl
        return this.log_level
    }

    getLogLevel = function () {
        return this.log_level
    }

    log(lvl, mesg) {
        if (lvl == Logger.LOG_LVL.OFF || typeof lvl === "undefined") {
            // nop
        } else {
            if (lvl >= this.log_level)
                console.log(this.namespace +': ' + mesg)
            if (lvl === Logger.LOG_LVL.ERROR)
                console.error(this.namespace +': ' + mesg)
        }
    }
}

let logger = new Logger("log.js", Logger.LOG_LVL.INFO)
logger.log(Logger.LOG_LVL.INFO, "log.js loaded..")