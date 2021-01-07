//File executed by index.html
const electron = require('electron')
const ipc = require('electron').ipcRenderer
var fileContents = 'No file loaded'
var saveContents = fileContents

//Tell main.js to open a file
function openFile() {
  ipc.send('open-file', '')
}

//Send contents of file to main.js to be written
function saveFile(saveAs) {
  saveContents = document.getElementById("workspace").value;
  if(saveAs == 'true') {
    ipc.send('save-file', saveContents, saveAs)
  } else {
    ipc.send('save-file', saveContents)
  }
}

//Check whether or not the changes are saved, and tell main.js to change the title accordingly
function checkSave() {
  saveContents = document.getElementById("workspace").value;
  if(fileContents == saveContents) {
    ipc.send('changeTitle', '1')
  } else {
    ipc.send('changeTitle', '0')
  }
}

//Toggle the search bar
function toggleSearch() {
  var searchBar = document.getElementById("searchMenu");
  if (searchBar.style.display === "none") {
    searchBar.classList.toggle('fade');
  } else {
    searchBar.classList.toggle('fade');
  }
}

//IPC communications
ipc.on('open-file', function(event, file, fileCont) {
  let filePath = file
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
    saveFile('true')
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
