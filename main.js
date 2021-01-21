//Load modules and declare variables
const { app, BrowserWindow, dialog } = require('electron')
const windowStateKeeper = require('electron-window-state')
const ipc = require('electron').ipcMain
const path = require('path');
const fs = require('fs');
var filePath = ''
var publicSaveData
var saved = 'true'

let mainWindow

//Properties of the main window
function createWindow () {
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
    icon: path.join(__dirname, 'assets/img/icon.png'),
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.on('close', function(e){
    if(saved == 'false') {
      var choice = require('electron').dialog.showMessageBoxSync(this, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Unsaved work',
        message: 'You have unsaved work\n Are you sure you want to exit?'
      });
      if(choice == 1) {
        e.preventDefault();
      }
    }
  });

  mainWindow.on('ready-to-show', function() { 
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
ipc.on('open-file', function (event, arg) {
  //Run the code to open the file
  selectFile()
  if(filePath == 'undefined') {} else {
    fs.readFile(filePath, function(err, data) {
      mainWindow.webContents.send('open-file', filePath, data);
    });
  }
})

ipc.on('save-file', function (event, saveData, saveAs) {
  //Run the code to save the edited file
  //Find a place to save it if it has no path
  if(saveAs == 'true') {
    selectFile()
    if(filePath == '' || filePath == 'undefined') {} else {
      mainWindow.webContents.send('confirm', 'Are you sure you want to save?\nWarning: This will overwrite the chosen file.')
      publicSaveData = saveData
    }
  } else {
    if(filePath == '' || filePath == 'undefined') {
      selectFile()
      if(filePath == '' || filePath == 'undefined') {} else {
        mainWindow.webContents.send('confirm', 'Are you sure you want to save?\nWarning: This will overwrite the chosen file.')
        publicSaveData = saveData
      }
    } else {
      //Save the file normally
      writeFileData(filePath, saveData)
    }
  }
})

ipc.on('confirmLoad', function (event, data) {
  fs.readFile(filePath, function(err, data) {
    mainWindow.webContents.send('open-file', filePath, data);
  });
})

ipc.on('changeTitle', function (event, fileSaveState) {
  if(fileSaveState == 'unsaved') {
    mainWindow.setTitle('Mollusc Text Editor - Unsaved')
    saved='false'
  } else {
    mainWindow.setTitle('Mollusc Text Editor')
    saved='true'
  }
})

ipc.on('confirm', function (event, data) {
  if(data == 'overwrite') {
    writeFileData(filePath, publicSaveData)
  }
  if(data == 'dont-overwrite') {
    filePath=''
  }
})

//Selects file and saves the contents
function selectFile() {
  filePath='undefined'
  filePath=String(dialog.showOpenDialogSync({
    title: 'Select File',
    properties: ['openFile']
  }))
}

function writeFileData(path, writeContents) {
  fs.writeFile(path, writeContents, function (err) {
    if(err) throw err;
    mainWindow.webContents.send('update-contents', '')
  });
}

function sendMessage(content) {
  mainWindow.webContents.send('messages', content);
}

function forceLoad(content) {
  mainWindow.webContents.send('forceLoad', content);
}
