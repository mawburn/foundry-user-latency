// Yes I know about console.debug, console.error, etc.  I have reasons mostly around non-techie users.
export const LOG_LVL = {
    ALL: 5,
    DEBUG: 4,
    WARN: 3,
    INFO: 2,
    ERROR: 1,
    OFF: 0
}

export let log_level = LOG_LVL.DEBUG

export const logger = function logger(lvl, mesg) {
    if (lvl == LOG_LVL.OFF || typeof lvl === "undefined") {
        // nop
    } else {
        if ( lvl >= log_level)
            console.log(mesg)
        if (lvl === LOG_LVL.ERROR)
            console.error(mesg)
    }
}

logger(LOG_LVL.INFO, "log.js loaded..")