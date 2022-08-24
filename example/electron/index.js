const { app, BrowserWindow } = require('electron')
const path = require('path')
const { ad4mConnect } = require('ad4m-connect/electron')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        //enableRemoteModule: true,
        contextIsolation: false,
        webSecurity: false
      },
      minimizable: true,
      alwaysOnTop: false,
      frame: true,
      transparent: false,
      icon: path.join(__dirname, '../public', 'Ad4mLogo.png')
  })

  mainWindow.loadFile('index.html')

  mainWindow.webContents.openDevTools()
}

app.whenReady().then(async () => {
  console.log('1')

  await ad4mConnect({
    appName: 'Ad4m',
    appDesc: 'Ad4m is a simple and easy to use application for managing your files and folders.',
    capabilities: [{"with":{"domain":"*","pointers":["*"]},"can": ["*"]}]
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}).catch(e => console.log(e)).finally(e => console.log(e))

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})