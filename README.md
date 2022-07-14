# AD4M connection library and wizard for apps

This package makes it easy for AD4M apps to connect to a local or remote AD4M executor by handling all the complex things like finding the local executor port, requesting and storing a capability token, creating and recreating an Ad4mClient.

[](screenshots/Screenshot_executor_url.png)!
[](screenshots/Screenshot_security_code.png)!
## Usage (from Node / Electron)

Install the package:
```npm install -s @perspect3vism/ad4m-connect```

Import `ad4mConnect()`:
```import { ad4mConnect } from '@perspect3vism/ad4m-connect'```
or
```const { ad4mConnect } = require('@perspect3vism/ad4m-connect')```

and then just call that function with parameters of your app:
```js
ad4mConnect({
    // Provide the name of your app to be displayed in the dialog
    appName: "Perspect3ve", 
    // Provide an icon to be displayed in the dialog as well
    appIconPath: path.join(__dirname, "graphics", "Logo.png"), 
    // Name the capabilities your app needs
    // (this is an example with all capabilities)
    capabilities: [{"with":{"domain":"*","pointers":["*"]},"can":["*"]}], 
    // Provide a directory in which the capability token and the executor
    // URL will be stored such that future calls won't even open a dialog
    // but try the token against that URL and resolve immediately
    // if it works.
    dataPath: path.join(homedir(), '.perspect3ve')
})
    .then(({client, capabilityToken, executorUrl}) => {
        // Retrieved `capabilityToken` and selected `executorUrl` are returned
        // but all that is really needed is `client` which is a fully setup
        // (including capability token) and working Ad4mClient.
        //
        // Both, the URL and the token have already been stored on disk
        // in the directory provided as `dataPath`.
        //
        // Consequetive calls
        createWindow(client)
    })
    .catch(()=> {
        console.log("User closed AD4M connection wizard. Exiting...")
        app.exit(0)
        process.exit(0)
    }) 
}
```

## Usage (from a pure web context)

### Svelte project
If it is a Svelte app, easiest solution would be to import the Svelte component directly from source:

```svelte
import { Ad4mConnectDialog } from '@perspect3vism/ad4m-connect/src/Ad4mConnectDialog'
import { onMount } from 'svelte'
//...

let connectDialog
onMount(() => {
    connectDialog.run()
})

function resolve(executorUrl, capToken, ad4mClient) {
   //... 
}

function reject() {
    app.exit(0)
}

<Ad4mConnectDialog
    bind:this={connectDialog}
    appName="Perspect3ve"
    appIconPath="Perspect3veLogo.png"
    executorUrl={executorUrl} 
    capToken={capToken}
    showQrScanner=true
    qrScanRequest={()=>getQrCodeFromCamera()}
    resolve={resolve}
    reject={reject}
></Ad4mConnectDialog>
```

### Other (non-Svelte) project

`Ad4mConnectDialog` compiles to a custom web component in [public/Ad4mConnectDialog.js](public/Ad4mConnectDialog.js).
That can be used in any web view / browser, as done in [public/dialog.html](public/dialog.html) which is used in the the `BrowserWindow` opened by `ad4mConnect` in the Node/Electron case.

```js
import `@perspect3vism/ad4m-connect/public/Ad4mConnectDialog.js`

const tempTarget = document.createElement('div')
const dialog = new Ad4mConnectDialog({ target: tempTarget });
dialog.appName = appName;
dialog.appIconPath = appIconPath;
dialog.executorUrl = executorUrl;
dialog.capToken = capabilityToken;
dialog.capabilities = capabilities
//dialog.showQrScanner = true
dialog.resolve = (executorUrl, capabilityToken, client) => {
    //...
};
dialog.reject = () => {
    //...
}
document.getElementById("container").appendChild(tempTarget)  
dialog.run();
```