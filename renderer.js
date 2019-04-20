//File executed by index.html
const electron = require('electron')
const ipc = require('electron').ipcRenderer
var filePath
var fileContents = 'No file loaded'
var saveContents = 'No file loaded'
var message

//Functions
function openFile() {
  ipc.send('open-file', '')
}
function saveFile(saveAs) {
  saveContents = document.getElementById("workspace").value;
  if(saveAs == '1') {
    ipc.send('save-file', saveContents, saveAs)
  } else {
    ipc.send('save-file', saveContents)
  }
}
function checkSave() {
  saveContents = document.getElementById("workspace").value;
  if(fileContents == saveContents) {
    ipc.send('changeTitle', '1')
  } else {
    ipc.send('changeTitle', '0')
  }
}
function toggleSearch() {
  var x = document.getElementById("searchMenu");
  if (x.style.display === "none") {
    x.classList.toggle('fade');
  } else {
    x.classList.toggle('fade');
  }
}

//IPC
ipc.on('open-file', function(event, file, fileCont) {
  filePath = file
  fileContents = fileCont
  document.getElementById("workspace").value = fileContents;
})
ipc.on('menu', function(event, action) {
  if(action == 'open') {
    openFile()
  }
  if(action == 'save') {
    saveFile()
  }
  if(action == 'saveas') {
    saveFile('1')
  }
  if(action == 'find') {
    toggleSearch()
  }
})
ipc.on('messages', function(event, message) {
  window.alert(message)
})
ipc.on('update-contents', function(event) {
  fileContents = document.getElementById("workspace").value;
  checkSave()
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
