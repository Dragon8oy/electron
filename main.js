//Load modules and declare variables
const { app, BrowserWindow, dialog } = require('electron')
const windowStateKeeper = require('electron-window-state')
const ipc = require('electron').ipcMain
const path = require('path');
const fs = require('fs');
let filePath = 'undefined'
let saved = 'true'
let mainWindow

//Properties of the main window
function createWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 400,
    defaultHeight: 400
  });

  mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    backgroundColor: '#3a3a3a',
    show: false,
    icon: path.join(__dirname, 'build/icon.png'),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  })

  mainWindow.on('closed', () => { mainWindow = null })

  mainWindow.on('close', (event) => {
    if(saved == 'false') {
      let choice = dialog.showMessageBoxSync(mainWindow, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Unsaved work',
        message: 'You have unsaved work\nAre you sure you want to exit?'
      });
      if(choice == 1) {
        event.preventDefault();
      }
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show(); 
    mainWindow.focus(); 
  });

  mainWindowState.manage(mainWindow);
}

//Create the window
app.on('ready', () => {
  createWindow()
  mainWindow.loadFile('index.html')
  //Require the main menu
  require('./assets/js/menu.js')
})

//IPC communications

//Open a file when requested
ipc.on('open-file', (event, override) => {
  //Confirm the user wants to open a new file with unsaved work
  if(saved == 'false' && override == 'false') {
    //Reuse existing communications, sending 'confirm' instead of file, and a message instead of fileContents
    mainWindow.webContents.send('open-file', 'confirm', 'You have unsaved changes\nAre you sure you want to open a new file?')
    return
  }

  //Select a file
  selectFile('open')

  //If a file was selected, send the contents to be loaded
  if(filePath == 'undefined') {} else {
    readFileData(filePath)
  }
})

//Save the file when requested
ipc.on('save-file', (event, saveData, saveAs) => {
  //If no file is chosen, or we're choosing a file, show the a dialogue
  if(filePath == 'undefined' || saveAs == 'true') {
   selectFile('save')
     //If no file was selected, cancel
     if(filePath == 'undefined') {
       return
     }
  }
  //Save the file
  writeFileData(filePath, saveData)
})

//Update the savestate of the file and title when requested
ipc.on('update-save-state', (event, fileSaveState) => {
  if(fileSaveState == 'unsaved') {
    saved='false'
  } else {
    saved='true'
  }
  updateTitle(saved)
})

//Update the title when requested
ipc.on('update-title', (event, fileSaveState) => {
  updateTitle(saved)
})

//Function declarations

//Update the title based off of open file and save state
function updateTitle(fileSaved) {
  //If a file has been opened, use it for the title
  let title
  if(filePath != 'undefined') {
    title=path.basename(filePath)
  } else {
    title='Mollusc Text Editor'
  }

  //Append " - Unsaved" to title if the file is unsaved
  if(fileSaved == 'false') {
    title+=' - Unsaved'
  }
  mainWindow.setTitle(title)
}

//Open a dialog to select a file
function selectFile(dialogType) {
  filePath='undefined'
  if(dialogType == 'open')
    filePath=String(dialog.showOpenDialogSync({
      title: 'Open File',
      properties: ['openFile']
    }))
  else {
    filePath=String(dialog.showSaveDialogSync({
      title: 'Save File',
      properties: ['showOverwriteConfirmation']
    }))
  }
}

//Handle reading file data and sending to renderer
function readFileData(file) {
  fs.readFile(file, 'utf-8', (err, data) => {
    if(err) throw err;
    //Prompt renderer to load the file
    mainWindow.webContents.send('open-file', file, data);
  });
}

//Handle saving the file
function writeFileData(path, writeContents) {
  fs.writeFile(path, writeContents, (err) => {
    if(err) throw err;
    //Prompt renderer to update to the latest save state
    mainWindow.webContents.send('update-contents', '')
  });
}

//Display a message graphically
function sendMessage(content) {
  mainWindow.webContents.send('messages', content);
}
