// foo bar!

//blah
var worker = new WorkerThread

chrome.runtime.onMessage.addListener( function(sender, message, sendResponse) {
    console.log('got message',sender,message)
})

function havefile(file) {
    var mainWindow = chrome.app.window.get('index')
    worker.send({command:'parse', file:file},
                function(resp) {
                    var mainWindow = chrome.app.window.get('index')
                    if (resp.path) {
                        if (mainWindow) {
                            var p = mainWindow.contentWindow.document.createElement('li')
                            p.innerText = resp.path
                            mainWindow.contentWindow.document.getElementById('files').appendChild(p)
                        }
                    }
                }
               )

}

function haveentry(entry) {
    var mainWindow = chrome.app.window.get('index')
    //mainWindow.contentWindow.document.getElementById('status').innerHTML = 'have entry: ' + entry.name
    entry.file( havefile )
}

chrome.app.runtime.onLaunched.addListener(function(launchData) {
    console.log('onLaunched with launchdata',launchData)
    if (launchData.items) {
        var launchEntry = launchData.items[0].entry
    }
    var info = {type:'onLaunched',
                launchData: launchData}

    if (chrome.app.window.get('index')) { 
        chrome.app.window.get('index').focus()
        haveentry(launchEntry)
    } else {
        chrome.app.window.create('index.html',
                                 {id:'index'},
                                 function(mainWindow) {
                                     if (launchEntry) {
                                         mainWindow.contentWindow.addEventListener( 'DOMContentLoaded', function() {
                                             haveentry(launchEntry)
                                         })
                                     }
			         });
    }
})

function reload() { chrome.runtime.reload() }