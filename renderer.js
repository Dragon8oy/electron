//File executed by index.html
const electron = require('electron')
const ipc = require('electron').ipcRenderer
var fileContents = 'No file loaded'

//Tell main.js to open a file
function openFile(override) {
  ipc.send('open-file', override)
}

//Tell main.js to update the title
function updateTitle() {
  checkSave()
  ipc.send('updateTitle')
}

//Update the last saved contents and title
function updateContents() {
  fileContents = document.getElementById("workspace").value;
  updateTitle()
}

//Send contents of file to main.js to be written
function saveFile(saveAs) {
  let saveContents = document.getElementById("workspace").value;
  if(saveAs == 'true') {
    ipc.send('save-file', saveContents, saveAs)
  } else {
    ipc.send('save-file', saveContents)
  }
}

//Check whether or not the changes are saved, and tell main.js to change the state accordingly
function checkSave() {
  let saveContents = document.getElementById("workspace").value;
  if(fileContents == saveContents) {
    ipc.send('updateSaveState', 'saved')
  } else {
    ipc.send('updateSaveState', 'unsaved')
  }
}

//Toggle the search bar
function toggleSearch() {
  document.getElementById("searchMenu").classList.toggle('fade');
}

//IPC communications

//Load contents of a file, or confirm the user wants to open a fle
ipc.on('open-file', function(event, file, fileContents) {
  //Confirm the user wants to load a file if it'll cause unsaved work to be lost
  if(file == 'confirm') {
    //Send the confirm box
    if(window.confirm(fileContents)) {
      //Open a file and ignore unsaved work
      openFile('true')
    }
    //Exit early
    return
  }

  //Load the file's contents
  document.getElementById("workspace").value = fileContents;
  updateContents()
})

//Handle events from menu.js -> main.js -> renderer.js
ipc.on('menu', function(event, action) {
  if(action == 'open') {
    openFile('false')
  } else if(action == 'save') {
    saveFile()
  } else if(action == 'saveas') {
    saveFile('true')
  } else if(action == 'find') {
    toggleSearch()
  } else if(action == 'undo' || action == 'redo') {
    updateTitle()
  }
})

//Display messages sent from main.js
ipc.on('messages', function(event, message) {
  window.alert(message)
})

//Update fileContents to file after it's been saved
ipc.on('update-contents', function(event) {
  updateContents()
})
