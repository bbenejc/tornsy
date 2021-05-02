const timers = {};

onmessage = function(e) {
    if(e.data.set) {
        if(e.data.set in timers) clearTimeout(timers[e.data.set]);
        timers[e.data.set] = setTimeout(() => postMessage({tick: e.data.set, interval: e.data.interval}), e.data.interval);
    }
    else if(e.data.clear) {
        if(e.data.clear in timers) {
            clearTimeout(timers[e.data.clear]);
            delete timers[e.data.clear];
        }
    }
}
    