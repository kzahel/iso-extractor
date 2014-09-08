function WorkerThread() {
    this.worker = new Worker('iso9660.traceur.js')
//    this.worker = new Worker('iso9660.js')
    this.worker.addEventListener('message',this.onMessage.bind(this))
    this.worker.addEventListener('error',this.onError.bind(this))
    this.tids = {}
    this.tid = 1
}
WorkerThread.prototype = {
    onMessage: function(evt) {
        //console.log('msg from worker',evt)
        if (evt.data.tid) {
            var cbinfo = this.tids[evt.data.tid]
            if (! evt.data.more) {
                delete this.tids[evt.data.tid]
            }
            cbinfo(evt.data)
        }
    },
    onError: function(evt) {
        console.error('error msg from worker',evt)
    },
    send: function(msg, callback) {
        var tid = this.tid
        msg.tid = tid
        this.tids[tid] = callback
        this.tid++
        this.worker.postMessage(msg)
    }
}


