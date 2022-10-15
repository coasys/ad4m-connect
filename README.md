# AD4M connection library and wizard for apps

This package makes it easy for AD4M apps to connect to a local or remote AD4M executor by handling all the complex things like finding the local executor port, requesting and storing a capability token, creating and recreating an Ad4mClient.

![](screenshots/Screenshot_executor_url.png)
![](screenshots/Screenshot_security_code.png)

## Usage (from Node / Electron)

Install the package:
`npm install -s @perspect3vism/ad4m-connect`

Import `ad4mConnect()`:

```js
import { ad4mConnect } from "@perspect3vism/ad4m-connect/electron";
```

or

```js
const { ad4mConnect } = require("@perspect3vism/ad4m-connect/electron");
```

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

`ad4m-connect` provides a web-component that you can use just by importing the package.
Properties exposed:

- `appName(required)`: Name of the application using ad4m-connect.
- `appDesc(required)`: Description of the application using ad4m-connect.
- `appDomain(required)`: Domain of the application using ad4m-connect.
- `capabilities(required)`: Capabilities requested by the application.
- `appiconpath`: Icon for the app using ad4m-connect.

```html
<ad4m-connect
  appName="ad4m-react-example"
  appDesc="ad4m-react-example"
  appDomain="http://localhost:3000"
  capabilities='[{"with":{"domain":"*","pointers":["*"]},"can": ["*"]}]'
  appiconpath="./Ad4mLogo.png"
></ad4m-connect>
```

`ad4m-connect` also provides helper methods to check if the client is connected to executor called `isConnected` & `getAd4mClient` to get the client itself to use across the app.

```js
import {
  getAd4mClient,
  onAuthStateChanged,
} from "@perspect3vism/ad4m-connect/web";

onAuthStateChanged(async (connected) => {
  if (connected) {
    alert("Connected  to Ad4m!");
  } else {
    alert("Not connected to Ad4m!");
  }
});
```
