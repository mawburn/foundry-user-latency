export const doPings = function doPings(url, pingInterval, historySize) {

    // TODO: set error codes and display on lable instead of ms
    // TODO: add a graph of response time history on mouseover....
    let pingQ = createBoundedQueue(historySize)
    pingQ.push(1)
    console.log("ping: pingBuff - " + pingQ.toArray)
    game.user.setFlag("world", "pingTimes", pingQ.toArray).catch(err => {
        console.log("error creating pingTimes ringbuffer")
    })
    window.setInterval(function () {
        const startTime = (new Date()).getTime()
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    // set this ping to -1
                    console.log("ping: bad response - " + response)
                    pingQ.push(-1)
                }
                const delta = ((new Date()).getTime() - startTime)
                console.log("ping: sucess - " + delta)
                pingQ.push(delta)
                game.user.setFlag("world", "pingTimes", averageArray(pingQ.toArray))
                console.log("ping: buffer - " + pingQ.toArray)
                console.log("ping: flag = " + game.user.getFlag("world", "pingTimes"))
            })
            .catch(error => {
                console.error("ping: problem with fetch!!!", error)
                pingQ.push(-255)
            })
    }, pingInterval)
}

function averageArray(array) {
    let total = 0
    for(let i = 0; i < array.length; i++) {
        total += array[i]
    }
    return Math.round(total / array.length)
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
        average : averageArray(buffer)
    }
}

averageArray([])