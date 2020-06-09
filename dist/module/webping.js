import { logger, LOG_LVL, log_level } from './log.js'

export const doPings = function doPings(url, pingInterval, historySize) {

    // TODO: set error codes and display on lable instead of ms
    // TODO: add a graph of response time history on mouseover....
    let pingQ = createBoundedQueue(historySize)
    pingQ.push(1)
    logger(LOG_LVL.DEBUG, "ping: pingBuff - " + pingQ.toArray)
    game.user.setFlag("world", "pingArray", pingQ.toArray).catch(err => {
        logger(LOG_LVL.ERROR, "error creating pingTimes ringbuffer and setting it to user data")
    })
    window.setInterval(function () {
        const startTime = (new Date()).getTime()
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    // set this ping to -1
                    logger(LOG_LVL.DEBUG, "ping: bad response - " + response)
                    pingQ.push(-1)
                }
                const delta = ((new Date()).getTime() - startTime)
                logger(LOG_LVL.DEBUG, "ping: sucess - " + delta)
                pingQ.push(delta)
                let data = processArray(pingQ.toArray)
                game.user.setFlag("world", "pingAverage", data.avg)
                game.user.setFlag("world", "pingArray", pingQ.toArray)
                logger(LOG_LVL.DEBUG, "ping: buffer - " + pingQ.toArray)
                logger(LOG_LVL.DEBUG, "ping: flag = " + game.user.getFlag("world", "pingAverage"))
            })
            .catch(error => {
                logger(LOG_LVL.ERROR, "ping: problem with fetch!!!", error)
                pingQ.push(-255)
            })
    }, pingInterval)
}

function processArray(array) {
    let total = 0
    let goodDataSize = array.length
    let processedArray = []
    let maxPing = 0
    let minPing = 0
    for(let i = 0; i < array.length; i++) {
        if ( array[i] == 0) {           // false data, ignore, usually first datapoint
            processedArray[i] = 0
            --goodDataSize
        } else if ( array[i] == -255) {    // fetch error, server, network, etc down.
            processedArray[i] = 0
            --goodDataSize
        } else if ( array[i] === -1) {      // bad http response: server had problems.  This is a temp hack, eventually still record the response but mark server problem
            processedArray[i] = 0
            --goodDataSize
        } else {                            // add it in
            total += array[i]
        }
    }
    // avg, min, max, processedArray
    return { avg: Math.round(total / goodDataSize), min: minPing, max: maxPing, bad: array.length - goodDataSize, data: processedArray }
}
// bounded queue
// So I only have to think this through once. probably unnecessary for normal people
const createBoundedQueue = function(length){
    let buffer = new Array();
    return {
        get  : function(key){return buffer[key];},
        push : function(item){
            if (buffer.length == length)
                buffer.pop()
            buffer.unshift(item)
            },
        toArray : buffer,
        average : processArray(buffer)
    }
}