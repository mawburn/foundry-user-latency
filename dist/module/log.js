// Yes I know about console.debug, console.error, etc.  I have reasons mostly around non-techie users.
export const LOG_LVL = {
    ALL: 5,
    DEBUG: 4,
    WARN: 3,
    INFO: 2,
    ERROR: 1,
    OFF: 0
}

const namespace = "ping: "
let log_level = LOG_LVL.DEBUG

export const setLogLevel = function (lvl) {
    log_level = lvl
    return log_level
}

export const getLogLevel = function () {
    return log_level
}

export const logger = function logger(lvl, mesg) {
    if (lvl == LOG_LVL.OFF || typeof lvl === "undefined") {
        // nop
    } else {
        if ( lvl >= log_level)
            console.log(namespace + mesg)
        if (lvl === LOG_LVL.ERROR)
            console.error(namespace + mesg)
    }
}

logger(LOG_LVL.INFO, "log.js loaded..")