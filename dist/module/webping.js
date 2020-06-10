import { logger, LOG_LVL } from './log.js'
import {refreshDisplay} from './chartResponse.js'

export const doPings = function doPings(url, pingInterval, historySize) {

    // TODO: set error codes and display on lable instead of ms
    // TODO: add a graph of response time history on mouseover....
    let pingQ = createBoundedQueue(historySize)
    pingQ.push(1)
    logger(LOG_LVL.DEBUG, "doPings: pingBuff - " + pingQ.toArray)
    game.user.setFlag("world", "pingArray", pingQ.toArray).catch(err => {
        logger(LOG_LVL.ERROR, "doPings: error creating pingTimes ringbuffer and setting it to user data")
    })
    window.setInterval(function () {
        const startTime = (new Date()).getTime()
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    // set this ping to -1
                    logger(LOG_LVL.DEBUG, "doPings: bad response - " + response)
                    pingQ.push(-1)
                }
                const delta = ((new Date()).getTime() - startTime)
                logger(LOG_LVL.DEBUG, "doPings: sucess - " + delta)
                pingQ.push(delta)
                let data = processArray(pingQ.toArray)
                game.user.setFlag("world", "pingAverage", data.avg)
                game.user.setFlag("world", "pingArray", pingQ.toArray)
                logger(LOG_LVL.DEBUG, "doPings: buffer - " + pingQ.toArray)
                logger(LOG_LVL.DEBUG, "doPings: flag = " + game.user.getFlag("world", "pingAverage"))
                refreshDisplay()
            })
            .catch(error => {
                logger(LOG_LVL.ERROR, "doPings: problem with fetch!!!", error)
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
            processedArray[i] = NaN
            --goodDataSize
        } else if ( array[i] == -255) {    // TODO: fetch error, server, network, etc down.
            processedArray[i] = NaN
            --goodDataSize
        } else if ( array[i] === -1) {      // TODO: bad http response: server had problems.  This is a temp hack, eventually still record the response but mark server problem
            processedArray[i] = NaN
            --goodDataSize
        } else {                            // add it in
            total += array[i]
        }
    }
    // avg, min, max, bad, processedArray
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