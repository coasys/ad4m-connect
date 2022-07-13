const { ipcMain, BrowserWindow } = require('electron')
const path = require('path')

//interface ConnectionInit {
//    client: Ad4mClient
//    capabilityToken: string
//   executorUrl: string
//}

export function ad4mConnect(
    appName,//: string, 
    appIconPath,//: string, 
    executorUrl,//: string, 
    capabilityToken,//: string)
 ){
    return new Promise((resolve, reject) => {
        ipcMain.on('get', (event, arg) => {
            event.returnValue = {appName, appIconPath, executorUrl, capabilityToken}
        })
    
        ipcMain.on('resolve', (event, arg) => {
            let { executorUrl, capabilityToken, client } = arg
            resolve({ executorUrl, capabilityToken, client})
        })

        ipcMain.on('reject', (event, arg) => {
            reject()
        })

        
        const win = new BrowserWindow({
            width: 400,
            height: 600,
            webPreferences: {
            nodeIntegration: true,
            //enableRemoteModule: true,
            contextIsolation: false
            },
            minimizable: true,
            alwaysOnTop: false,
            frame: true,
            transparent: false,
            icon: path.join(__dirname, '../public', 'Ad4mLogo.png')
        })
        
        // and load the index.html of the app.
        win.loadURL(`file://${__dirname}/../public/dialog.html`)
        
        // Open the DevTools.
        //win.webContents.openDevTools()
        
          
    })
    
}