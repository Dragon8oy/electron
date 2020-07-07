//Load modules and declare variables
const { app, BrowserWindow, dialog } = require('electron')
const ipc = require('electron').ipcMain
const path = require('path');
const fs = require('fs');
const validTypes = ['txt','json','js','sh','py','html','php', 'css', 'bat', 'dat', 'csv', 'xml', 'log', 'db', 'pl', 'cgi', 'htm', 'jsp', 'asp', 'aspx', 'xhtml', 'odt', 'doc', 'docx', 'obs', 'pps', 'cpp', 'vb', 'swift', 'h', 'c', 'class', 'ods', 'xls', 'cfg', 'dll', 'lnk', 'ini', 'rtf', 'tex', 'yml', 'yaml', 'ts', 'msi', 'desktop'];
var filePath = ''
var fileType
var allowFile
var publicSaveData
var saved = 1

let mainWindow

//Properties of the main window
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 1080,
    icon: path.join(__dirname, 'assets/img/icon.png'),
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  mainWindow.on('close', function(e){
    if(saved == 0) {
      var choice = require('electron').dialog.showMessageBox(this, {
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Unsaved work',
            message: 'You have unsaved work\n Are you sure you want to exit?'
         });
         if(choice == 1){
           e.preventDefault();
         }
    }
  });
}

//Create the window
app.on('ready', () => {
  createWindow()
  mainWindow.loadFile('index.html')
  //Require the main menu
  require('./assets/menu/menu.js')
})

//IPC communications
ipc.on('open-file', function (event, arg) {
  //Run the code to open the file
  openFile()
  //Get the filetype and check it against an array of allowed files
  fileType = filePath.substr(filePath.indexOf(".") + 1)
  allowFile = 0
  for (i = 0; i < validTypes.length; i++) {
    if(fileType == validTypes[i]) {
      allowFile = 1
    }
  }
  if(filePath == 'undefined') {} else {
  if(allowFile == 1) {
    fs.readFile(filePath, function(err, data) {
      mainWindow.webContents.send('open-file', filePath, data);
    });
  } else {
      forceLoad('Unsupported filetype.\n Please submit an issue on GitHub if you belive this is an error.\n (Help > GitHub)\n Press OK to load anyway.')
    }
  }
})

ipc.on('save-file', function (event, saveData, saveAs) {
  //Run the code to save the edited file
  //Find a place to save it if it has no path
  if(saveAs == 1) {
    openFile()
    if(filePath == '' || filePath == 'undefined') {} else {
      mainWindow.webContents.send('confirm', 'Are you sure you want to save?\nWarning: This will overwrite the chosen file.')
      publicSaveData = saveData
    }
  } else {
    if(filePath == '' || filePath == 'undefined') {
      openFile()
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

ipc.on('changeTitle', function (event, data) {
  saved = data
  if(saved == 0) {
    mainWindow.setTitle('Mollusc Text Editor - Unsaved')
  } else {
    mainWindow.setTitle('Mollusc Text Editor')
  }
})

ipc.on('confirm', function (event, data) {
  if(data == 'overwrite') {
    writeFileData(filePath, publicSaveData)
  }
  if(data == 'dont-overwrite') {
    filePath = ''
  }
})

//Selects file and saves the contents
function openFile() {
  filePath = 'undefined'
  filePath = String(dialog.showOpenDialog({
    title: 'Open File',
    properties: ['openFile']
  }))
}

function writeFileData(path, writeContents) {
  fs.writeFile(path, writeContents, function (err) {
    if(err) throw err;
    sendMessage('File saved successfully')
    mainWindow.webContents.send('update-contents', '')
  });
}

function sendMessage (content) {
  mainWindow.webContents.send('messages', content);
}

function forceLoad (content) {
  mainWindow.webContents.send('forceLoad', content);
}

app.on('window-all-closed', function () {
  if(process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if(mainWindow === null) {
    createWindow()
  }
})