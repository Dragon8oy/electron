//File executed by index.html
var filePath
var fileContents = 'No file loaded'
var saveContents = 'No file loaded'
var message
const ipc = require('electron').ipcRenderer
function openFile() {
  ipc.send('open-file', '')
}
function saveFile() {
  saveContents = document.getElementById("workspace").value;
  ipc.send('save-file', saveContents)
  fileContents = document.getElementById("workspace").value;
}
function checkSave() {
  saveContents = document.getElementById("workspace").value;
  if(fileContents == saveContents) {
    ipc.send('changeTitle', '1')
  } else {
    ipc.send('changeTitle', '0')
  }
  setInterval(checkSave, 100)
}
ipc.on('open-file', function(event, file, fileCont) {
  filePath = file
  fileContents = fileCont
  document.getElementById("workspace").value = fileContents;
})
ipc.on('messages', function(event, message) {
  window.alert(message)
})
ipc.on('confirmURL', function(event, message, url) {
  if (window.confirm(message)) {
    window.location.href=url;
  };
})
ipc.on('confirm', function(event, message, url) {
  if (window.confirm(message)) {
    ipc.send('confirm', 'overwrite')
  } else {
    ipc.send('confirm', 'dont-overwrite')
  }
})
ipc.on('forceLoad', function(event, message) {
  if (window.confirm(message)) {
    ipc.send('confirmLoad', '')
  };
})
ipc.on('startCheckSave', function(event, data) {
  setInterval(checkSave, 100)
})
