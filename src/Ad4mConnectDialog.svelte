<svelte:options tag="ad4m-connect-dialog"></svelte:options>
<script lang="ts">
    import { Ad4mClient } from "@perspect3vism/ad4m";
    import { ApolloClient, InMemoryCache } from "@apollo/client/core";
    import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
    import { createClient } from 'graphql-ws';
    
    export let executorUrl: string
    export let capToken: string
    export let appName: string
    export let appDesc: string
    export let appUrl: string
    export let appIconPath: string
    export let capabilities: Array<object>
    export let showQrScanner: string|void
    export let searchAvailablePort: boolean
    export let resolve: (executorUrl: string, capToken: string, client: Ad4mClient)=>void
    export let reject: ()=>void
    export let qrScanRequest: ()=>string

    let requestId: string|undefined
    let code: string
    let validCode = true
    let corruptedJwt = false
    let requestError = false

    function generateCient(uri:string, authorization: string|void) {
        const wsLink = new GraphQLWsLink(
        createClient({
            url: uri,
            connectionParams: () => {
                return {
                    headers: { authorization }
                }
            },
        }));
        let apolloClient = new ApolloClient({
            link: wsLink,
            cache: new InMemoryCache({ resultCaching: false, addTypename: false }),
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: "no-cache",
                },
                query: {
                    fetchPolicy: "no-cache",
                }
            },
        })
        return new Ad4mClient(apolloClient)
    }

    export async function run() {
        if(executorUrl && capToken) {
            try {
                const ad4m = generateCient(executorUrl, capToken)
                await ad4m.agent.status()
                resolve(executorUrl, capToken, ad4m)
            }
            catch(e) {
                // jwt invalid, inform user
                corruptedJwt = true
            }
        }
    }


    async function requestCapability() {
        try {
            let ad4mClientWithoutJwt = generateCient(executorUrl, '')
            requestId = await ad4mClientWithoutJwt.agent.requestCapability(appName, appDesc, appUrl, JSON.stringify(capabilities));
            console.log("auth request id: ", requestId);
            requestError = undefined
        } catch (err) {
            requestError = err
            console.log(err);
        }
    }
    async function generateJwt() {
        try {
            let ad4mClientWithoutJwt = generateCient(executorUrl, '')
            let jwt = await ad4mClientWithoutJwt.agent.generateJwt(requestId!, code);
            console.log("auth jwt: ", jwt);
            await checkJwt(jwt)
        } catch (err) {
            console.log(err);
            validCode = false
        }
    }

    async function checkJwt(capabilityToken: string) {
        let ad4mClientJwt = generateCient(executorUrl, capabilityToken)
        try {
            let status = await ad4mClientJwt.agent.status()
            console.log('agent status:', status)
            setTimeout(() => {}, 100)
            resolve(executorUrl, capabilityToken, ad4mClientJwt)
        }
        catch (e) {
            console.log(e)
        }
    }

    async function searchPort() {
        for (let p = 12000; p <= 12010; p++) {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 2000);

            const res = await fetch(`http://localhost:${p}/graphql`, {
                signal: controller.signal,
                mode: 'no-cors'
            });

            if (res.status == 0) {
                executorUrl = `ws://localhost:${p}/graphql`
                return
            }
        }
    }
</script>

<div class="right material-icons pointer" on:click={reject}>close</div>
<div class="dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-content"
    scrimClickAction=""
    escapeKeyAction=""
>
    <div class="dialog-title">
        <img class="title-logo" src="Ad4mLogo.png" alt="Logo"> AD4M Connection Wizard
    </div>
    <div class="dialog-content">
        {#if !requestId}
            <span class="app-name">{appName}</span> needs to connect to your AD4M node/executor and request a capability token
            for the following capabilities:
            {#if capabilities && capabilities.length}
                <ul>
                    {#each capabilities as cap}
                        <li>{cap.can} => {cap.with.domain}.{cap.with.pointers}</li>
                    {/each}
                </ul>
            {/if}
            
            {#if appIconPath}
                <div class="icons-connection">
                    <img src="{appIconPath}" alt="App Logo" style="width: 150px">
                    <span class="material-icons link-icon">link</span>
                    <img src="Ad4mLogo.png" alt="Logo" style="width: 150px">
                </div>
            {/if}

            Please enter or correct the AD4M executor URL:
            
            <div class="textfield">
                <input class:error={requestError} bind:value={executorUrl} id="executor-url" />
                {#if !executorUrl && searchAvailablePort }
                    {#await searchPort()}
                    {/await}
                {/if}
                {#if showQrScanner}
                    <div on:click={()=>{executorUrl = qrScanRequest()}}>
                        <span class="material-icons">qr_code</span>
                    </div>
                {/if}
            </div>
            {#if requestError}
                <span class="error">{requestError}</span>
            {/if}

            

            <p></p>

            <button class="button primary right" on:click={requestCapability}>
                Continue
            </button>
        {/if}

        {#if requestId}
            Capability request was successfully sent.
            Please check your AD4M admin UI (AD4Min), 
            confirm the request there and 
            <span class="app-name">
                enter the 6-digit security code below, that AD4Min displays to you.
            </span>
            <div class="textfield" label="Security Code">
                <span>Security Code:</span>
                <input class:error={!validCode} bind:value={code} id="security-code-input" />
            </div>
        
            <p>
                <button class="button" on:click={()=>requestId=undefined}>
                    Back
                </button>
                <button class="button primary right" on:click={generateJwt}>
                    Submit
                </button>
            </p>
        {/if}
    </div>
</div>


<style>

  .dialog {
    padding: 20px;
    font-family: sans-serif;
  } 

  h2 {
    text-align: center;
    font-size: 24px;
  }

  .dialog-title {
    margin: 30px;
    text-align: center;
    line-height: 42px;
    font-size: 30px;
  }

  .title-logo {
    height: 42px;
    margin-bottom: -12px;
  } 

  .app-name {
    font-weight: bold;
  } 

  .icons-connection {
    margin: 20px 0;
    text-align: center;
  } 

  .link-icon {
    position: relative;
    top: -50px;
  }

  .textfield {
    display: flex;
    margin: 15px;
  } 

  font-face {
    font-family: 'Material Icons';
    font-style: normal;
    font-weight: 400;
    src: url(https://fonts.gstatic.com/s/materialicons/v134/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2) format('woff2');
  }

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

#executor-url {
    flex: auto;
}

#security-code-input {
    margin: 0 10px;
}

.button {
    font-size: 18px;
    background-color: #9db2ef;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    padding: 5px 10px;
}

.primary {
    background-color: #4383eb;
}

.right {
    float: right;
}

.pointer {
    cursor: pointer;
}

.error {
  border-style: dotted;
  border-color: red;
  color: red;
}
</style>