

chrome.runtime.getBackgroundPage( function(bg) {
    window.bg = bg

    if (window.launchEntry) {
        bg.haveentry(launchEntry)
    } else if (bg.launchEntry) {
        bg.haveentry(bg.launchEntry)
    }
})

function filechange(evt) {
    var file = evt.target.files[0]
    bg.havefile(file)
}
document.getElementById('choosefile').addEventListener('change', filechange)

function reload() { chrome.runtime.reload() }