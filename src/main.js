const { ipcMain, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')
const { homedir } = require('os')
const ad4mDir = path.join(homedir(), '.ad4m')

const CAP_TOKEN_FILENAME = 'capability-token'
const EXECUTOR_URL_FILENAME = 'executor-url'

function ensureDir(dataPath) {
    if (fs.existsSync(dataPath)===false) {
        fs.mkdirSync(dataPath,777);
    }
}

function setExecutorUrl(executorUrl, dataPath) {
    ensureDir(dataPath)
    fs.writeFileSync(path.join(dataPath, EXECUTOR_URL_FILENAME), executorUrl)
}

function getExecutorUrl(dataPath) {
    let executorUrl
    try {
        executorUrl = fs.readFileSync(path.join(dataPath, EXECUTOR_URL_FILENAME), {encoding:'utf8', flag:'r'})
        console.log("Found executor URL in config file:", executorUrl)
    } catch(e) {
        try {
            const portPath = path.join(ad4mDir, 'executor-port')
            console.log("No executor URL config file found. Trying to read local ad4m executor port from file:", portPath )
            const executorPort = fs.readFileSync(portPath, {flag:'r'}).toString()
            console.log("Found port:", executorPort)
            executorUrl = `ws://localhost:${executorPort}/graphql`
            console.log("Using executor URL:", executorUrl)
        } catch(err) {
            console.error(err)
            console.log("Couldn't read executor port from file. User has to enter URL manually")
            executorUrl = ""
        }
    }
    return executorUrl
}

function setCapToken(capToken, dataPath) {
    ensureDir(dataPath)
    fs.writeFileSync(path.join(dataPath, CAP_TOKEN_FILENAME), capToken)
}

function getCapToken(dataPath) {
    try {
        const capToken = fs.readFileSync(path.join(dataPath, CAP_TOKEN_FILENAME), {encoding:'utf8', flag:'r'})
        console.log("Found capability token in config file.")
        return capToken
    } catch(e) {
        console.log("No capability token found.")
        return ""
    }
}
  


export function ad4mConnect(
    appName,
    appIconPath,
    dataPath
 ){
    return new Promise((resolve, reject) => {
        const executorUrl = getExecutorUrl(dataPath)
        const capabilityToken = getCapToken(dataPath)

        ipcMain.on('get', (event, arg) => {
            event.returnValue = {appName, appIconPath, executorUrl, capabilityToken}
        })
    
        ipcMain.on('resolve', (event, arg) => {
            let { executorUrl, capabilityToken, client } = arg
            setExecutorUrl(executorUrl, dataPath)
            setCapToken(capabilityToken, dataPath)
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
        
        win.loadURL(`file://${__dirname}/../public/dialog.html`)  
    })
    
}