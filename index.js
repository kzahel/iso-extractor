

chrome.runtime.getBackgroundPage( function(bg) {
    window.bg = bg

    if (window.launchEntry) {
        haveentry(launchEntry)
    } else if (bg.launchEntry) {
        haveentry(bg.launchEntry)
    }
})

function reload() { chrome.runtime.reload() }