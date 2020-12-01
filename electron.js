
// const ejse = require('ejs-electron');
// const dbsave = require('./js/modules/db/db-save.mjs');
const { app, BrowserWindow, ipcMain, Menu} = require('electron');
const { autoUpdater } = require('electron-updater');
// import * as dbsave from './js/modules/db/db-save.mjs';
// import {app, BrowserWindow, ipcMain, Menu} from 'node_modules/electron';
// import * as autoUpdater from 'node_modules/electron-updater';
let win;
function createWindow () {
  // Create the browser window.
    win = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 640,
    minHeight: 480,
    frame: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
    }
  });

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  // win.webContents.openDevTools()
  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  const isMac = process.platform === 'darwin';
  const menuTemp = 
   [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {label: 'Export all terms',click() {consol}},
      {label: 'Import terms'},
      {type: 'separator'},
     isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }];

  const menu = Menu.buildFromTemplate(menuTemp);
  Menu.setApplicationMenu(menu);

 
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  win.webContents.send('update_available');
});autoUpdater.on('update-downloaded', () => {
  win.webContents.send('update_downloaded');
});


ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});
