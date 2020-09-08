import {ChartResponse} from './chartResponse.js'
import {Logger} from './log.js'

let logger = new Logger("WebPing", Logger.LOG_LVL.DEBUG)
let chartResponse = new ChartResponse()

export class WebPing {

    doPings(url, pingInterval, historySize) {

        // TODO: set error codes and display on lable instead of ms
        // TODO: add a graph of response time history on mouseover....
        let pingQ = this.createBoundedQueue(historySize) // this holds the raw ping data, processed data is pingData
        pingQ.push(5)
        logger.log(Logger.LOG_LVL.DEBUG, "doPings: pingBuff - " + pingQ.toArray)

        let that = this
        window.setInterval(async function () {
            await that.ping(url, pingQ)
        }, pingInterval)
    }

    processArray(array) {
        let total = 0
        let goodData = []       // Data with non error values used to calculate average, median, etc
        let processedArray = [] // Data with graphing data including NaN
        for (let i = 0; i < array.length; i++) {
            if (array[i] == 0) {           // false data, ignore, usually first datapoint
                processedArray[i] = NaN
            } else if (array[i] == -255) {    // TODO: fetch error, server, network, etc down.
                processedArray[i] = NaN
            } else if (array[i] === -1) {      // TODO: bad http response: server had problems.  This is a temp hack, eventually still record the response but mark server problem
                processedArray[i] = NaN
            } else {
                processedArray[i] = array[i]// add it in
                total += array[i]
                goodData.push(array[i])
            }
        }
        // avg, min, max, bad, processedArray
        return {avg: this.average(goodData), median: this.median(goodData), min: Math.min(...goodData), max: Math.max(...goodData), bad: array.length - goodData.length, data: processedArray}
    }

    // bounded queue
    // So I only have to think this through once. probably unnecessary for normal people
    createBoundedQueue = function (length) {
        let buffer = new Array();
        return {
            get: function (key) {
                return buffer[key];
            },
            push: function (item) {
                if (buffer.length == length)
                    buffer.shift()
                buffer.push(item)
            },
            toArray: buffer,
            average: this.processArray(buffer)
        }
    }

// WTF this language's Math has no average or median function?!?  WHY.
    average(array) {
        if (typeof array == "undefined " || array == null)
            return NaN
        let total = 0;
        for (let i = 0; i < array.length; i++) {
            total += array[i];
        }
        return total / array.length;
    }

    median(array) {
        if (typeof array == "undefined " || array == null || array == 1)
            return NaN
        const mid = Math.floor(array.length / 2), nums = [...array].sort((a, b) => a - b);
        return array.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    }

    async ping(url, pingQ) {
        const startTime = (new Date()).getTime()
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    // set this ping to -1
                    logger.log(Logger.LOG_LVL.DEBUG, "doPings: bad response - " + response)
                    pingQ.push(-1)
                }
                const delta = ((new Date()).getTime() - startTime)
                logger.log(Logger.LOG_LVL.DEBUG, "doPings: sucess - " + delta)
                pingQ.push(delta)
                let pingData = this.processArray(pingQ.toArray)
                this.pong(game.user.name, game.user.id, pingData.median)
                logger.log(Logger.LOG_LVL.DEBUG, "doPings: set pingData.data to - " + pingData.data)
                logger.log(Logger.LOG_LVL.DEBUG, "doPings: set pingData.median to - " + pingData.median)
                try {
                    chartResponse.updateChart(pingData, delta, pingData.median)
                    logger.log(Logger.LOG_LVL.DEBUG, "updated chart")
                } catch (e) {
                    logger.log(Logger.LOG_LVL.ERROR, "doPings: error updating chart " + e)
                }
            })
            .catch(error => {
                logger.log(Logger.LOG_LVL.ERROR, "doPings: problem with fetch!!!", error)
                pingQ.push(-255)
            })
    }

    pong(username, userid, medianping) {
        logger.log(Logger.LOG_LVL.DEBUG, "emitting data")
        game.socket.emit('module.response-times', {
            userid: userid,
            username: username,
            medianping: medianping
        });
    }
}