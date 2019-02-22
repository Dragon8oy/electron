const {Menu} = require('electron')
const electron = require('electron')
const ipc = require('electron').ipcRenderer
const app = electron.app

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      }
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'Ctrl+O',
        click (item, focusedWindow) {
          focusedWindow.webContents.send('menu', 'open')
        }
      },
      {
        label: 'Save',
        accelerator: 'Ctrl+S',
        click (item, focusedWindow) {
          focusedWindow.webContents.send('menu', 'save')
        }
      },
      {
        label: 'Save As',
        accelerator: 'Ctrl+Shift+S',
        click (item, focusedWindow) {
          focusedWindow.webContents.send('menu', 'saveas')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Find',
        accelerator: 'Ctrl+F',
        click (item, focusedWindow) {
          focusedWindow.webContents.send('menu', 'find')
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'GitHub',
        click () { require('electron').shell.openExternal('https://dragon8oy.github.io/electron') }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
