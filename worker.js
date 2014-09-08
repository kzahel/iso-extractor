function WorkerThread() {
//    this.worker = new Worker('iso9660.traceur.js')
    this.worker = new Worker('iso9660.js')
    this.worker.addEventListener('message',this.onMessage.bind(this))
    this.worker.addEventListener('error',this.onError.bind(this))
}
WorkerThread.prototype = {
    onMessage: function(evt) {
        console.log('msg from worker',evt)
    },
    onError: function(evt) {
        console.error('error msg from worker',evt)
    },
    send: function(msg, transfers) {
        this.worker.postMessage(msg, transfers)
    }
}


