import { Ad4mClient } from '@perspect3vism/ad4m';
import { html, css, LitElement } from 'lit';
import { customElement, property, state } from "lit/decorators.js";
import { ad4mConnect } from './core';
import {Html5Qrcode} from "html5-qrcode"

function detectMob() {
  const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];
  
  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
}

const styles = css`
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;700&display=swap');

.ad4mConnect {
  font-family: 'Comfortaa', cursive;
	position: fixed;
  top: 0;
  left: 0;
	height: 100vh;
	width: 100vw;
}

.ad4mConnect__dailog {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 10;
	border-radius: 4px;
	padding: 36px;
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
  max-width: 600px;
  max-height: 400px;
  min-height: 200px;
  background: linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, rgba(38,3,23,1) 41%, rgba(51,4,31,1) 100%);
}

@media only screen and (max-width: 600px) {  
  .ad4mConnect__dailog {
    width: 75%;
  }
}

.ad4mConnect__backdrop {
	position: absolute;
	top: 0;
	left: 0;
	height: 100vh;
	width: 100vw;
	background-color: rgba(0, 0, 0, 0.4);
}

.ad4mConnect__dailog__header__logo {
	height: 30px;
	width: 30px;
}

.ad4mConnect__dailog__title {
	font-weight: bold;
	font-size: 24px;
	margin-left: 20px;
  color: #fff;
}

.ad4mConnect__dailog__header {
	display: flex;
	align-items: center;
}

.ad4mConnect__dailog__subtitle {
	margin: 18px 0;
  color: #fff;
}

.ad4mConnect__dailog__caps {
	align-self: flex-start;
  color: #fff;
  width: 100%;
}

.ad4mConnect__dailog__input {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  margin: 24px 0;
  align-self: flex-start;
}

.ad4mConnect__dailog__input input {
  font-size: 16px;
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 4px;
  padding: 12px;
  margin-left: 12px;
  max-width: 400px;
}

.ad4mConnect__dailog__connection {
	display: flex;
	align-items: center;
	margin: 24px 0;
}

.ad4mConnect__dailog__btn {
	padding: 12px 24px;
	border-radius: 4px;
	border: 1px solid #fff;
}

.ad4mConnect__dailog__btns {
	display: flex;
	align-self: flex-end;
}

.ad4mConnect__locked {
	position: fixed;
	top: 0;
	left: 0;
	background: linear-gradient(90deg, rgba(2, 0, 36, 1) 0%, rgba(38,3,23,1) 41%, rgba(51,4,31,1) 100%);
	height: 100vh;
	width: 100vw;
	padding: 36px;
	display: flex;
	align-items: center;
	flex-direction: column;
  font-family: 'Comfortaa', cursive;
}

.ad4mConnect__dailog__options {
	width: 100%;
}

.ad4mConnect__dailog__option {
	background-color: #eee;
  width: calc(100% - 48px);
	display: flex;
	align-items: center;
	padding: 24px 24px;
	margin-top: 12px;
	border-radius: 4px;
	font-size: 18px;
  cursor: pointer;
}

.ad4mConnect__dailog__option__text {
  font-weight: bold;
}

.lds-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
  margin-top: 24px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.ad4mConnect__disconnect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  padding: 10px 0;
  text-align: center;
  background: red;
}

`

@customElement("ad4m-connect")
export default class Ad4mConnect extends LitElement {
  static styles = [styles];

  @state()
  private _client = null;

  @state()
  private _state = null;

  @state()
  private _code = null;

  @state()
  private _url = null;

  @state()
  private _isMobile = null;

  @property({ type: String, reflect: true })
  appname = null

  @property({ type: String, reflect: true })
  appdesc = null

  @property({ type: String, reflect: true })
  appdomain = null

  @property({ type: String, reflect: true })
  capabilities

  @property({ type: String, reflect: true })
  token

  @property({ type: String, reflect: true })
  url

  @property({ type: String, reflect: true })
  port

  @property({ type: String, reflect: true })
  appiconpath

  @property({ type: String, reflect: true })
  openonshortcut

  getClient() {
    return this._client;
  }

  scanQrcode() {
    const html5QrCode = new Html5Qrcode("reader");
    const ele = document.getElementById('camera-id');
    ele.style.display = 'block';

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      console.log("Trying to connect with text: ", decodedText);
      this._client.connectRemote(decodedText);
      html5QrCode.stop();
      ele.style.display = 'none';
    };
    function onScanFailure(error) {
      console.warn(`Code scan error = ${error}`);
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const aspectRatio = width / height
    const reverseAspectRatio = height / width

    const mobileAspectRatio = reverseAspectRatio > 1.5
      ? reverseAspectRatio + (reverseAspectRatio * 12 / 100)
      : reverseAspectRatio

    const config = {
      fps: 20, // frame per seconds for qr code scanning
      qrbox: { width: 250, height: 250 },
      videoConstraints: {
        facingMode: 'environment',
        aspectRatio: mobileAspectRatio,
      },
    }

    html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, onScanFailure);
  }

  connectedCallback() {
    super.connectedCallback();

    this._isMobile = detectMob();

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.crossOrigin = "anonymous";
    link.href =
      "https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;700&display=swap";
    document.head.appendChild(link);

    const client = ad4mConnect({
      appName: this.appname,
      appDesc: this.appdesc,
      appDomain: this.appdomain,
      capabilities: JSON.parse(this.capabilities),
      port: this.port,
      token: this.token,
      url: this.url
    });

    this._client = client;

    client?.addEventListener('loading', () => {
      this._state = 'loading';
    })

    client?.addEventListener('not_connected', () => {
      this._state = 'not_connected';
    })

    client?.addEventListener('init', () => {
      this._state = 'init';
    })

    client?.addEventListener('capabilties_not_matched', (isFirst) => {
      if (isFirst) {
        this._state = 'capabilties_not_matched_first';
      } else {
        this._state = 'capabilties_not_matched';
      }
    })

    client?.addEventListener('request_capability', (requestId) => {
      this._state = 'request_capability';
    })

    client?.addEventListener('connected_with_capabilities', () => {
      this._state = 'connected_with_capabilities';
    })

    document.addEventListener('fetch-ad4m-client', () => {
      const event = new CustomEvent('return-fetch-ad4m-client', { detail: this._client });
      document.dispatchEvent(event);
    });

    if (this.openonshortcut !== undefined) {
      document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.altKey && event.code === 'KeyA') {
          this._state = "init";
        }
      })
    }

    const containerEle = document.createElement('div');
    containerEle.id = 'camera-id'
    containerEle.style.position = 'absolute';
    containerEle.style.top = '0';
    containerEle.style.left = '0';
    containerEle.style.width = '100vw'
    containerEle.style.height = '100vh'
    containerEle.style.zIndex = '10000';
    containerEle.style.display = 'none';

    const ele = document.createElement('div');
    ele.id = 'reader'
    // @ts-ignore
    ele.width = '100%'
    ele.style.height = '100vh'
    
    containerEle.appendChild(ele)
    document.body.appendChild(containerEle)
  }

  render() {
    const state = this._state;
    if (state === 'loading') {
      return (
        html`
          <div class="ad4mConnect">
            <div class="ad4mConnect__dailog">
                <div class="ad4mConnect__dailog__header">
                    <img 
                        class="ad4mConnect__dailog__header__logo"
                        src="https://i.ibb.co/ydXzRwS/Ad4mLogo.png" 
                        alt="Logo" 
                    />
                    <div class="ad4mConnect__dailog__title">AD4M Connection Wizard</div>
                </div>
                <div
                    class="ad4mConnect__dailog__subtitle"
                >trying to connect to the executor, please wait</div>
                <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
            </div>
            <div class="ad4mConnect__backdrop" />
          </div>
        `
      )
    } else if (state === 'remote_url') {
      return (
        html`
        <div class="ad4mConnect">
          <div class="ad4mConnect__dailog">
              <div class="ad4mConnect__dailog__header">
                  <img 
                      class="ad4mConnect__dailog__header__logo"
                      src="https://i.ibb.co/ydXzRwS/Ad4mLogo.png" 
                      alt="Logo" 
                  />
                  <div class="ad4mConnect__dailog__title">AD4M Connection Wizard</div>
              </div>
              <div
                  class="ad4mConnect__dailog__subtitle"
              >Please enter the url you want to connect too.</div>
              <div class="ad4mConnect__dailog__input">
                  URL: <input value=${this._url} @change=${(e: any) => this._url = e.target.value} />
              </div>
              <div style="height: 12px"></div>
              <div class="ad4mConnect__dailog__btns">
                  <button class="ad4mConnect__dailog__btn" @click=${() => this._state = 'init'}>
                      Back
                  </button>
                  <div style="width: 24px"></div>
                  <button class="ad4mConnect__dailog__btn" @click=${() => this._client.connectRemote(this._url)}>
                      Continue
                  </button>
              </div>
          </div>
          <div class="ad4mConnect__backdrop" />
        </div>
        `
      )
    } else if (state === 'init') {
      return (
        html`
        <div class="ad4mConnect">
          <div class="ad4mConnect__dailog">
              <div class="ad4mConnect__dailog__header">
                  <img 
                      class="ad4mConnect__dailog__header__logo"
                      src="https://i.ibb.co/ydXzRwS/Ad4mLogo.png" 
                      alt="Logo" 
                  />
                  <div class="ad4mConnect__dailog__title">AD4M Connection Wizard</div>
              </div>
              <div
                  class="ad4mConnect__dailog__subtitle"
              >Select a way to connect to executor</div>
              <div class="ad4mConnect__dailog__options">
                  ${!this._isMobile ? 
                    html`<div 
                      class="ad4mConnect__dailog__option"
                      @click=${() => this._client.connectToPort()}
                    >
                      <div class="ad4mConnect__dailog__option__text">Connect locally</div>
                    </div>` 
                  : html`<div 
                      class="ad4mConnect__dailog__option"
                      @click=${() => this.scanQrcode()}
                    >
                      <div class="ad4mConnect__dailog__option__text">Connect using qrcode</div>
                    </div>
                  `}
                  <div 
                      class="ad4mConnect__dailog__option"
                      @click=${() => this._state = 'remote_url'}
                  >
                      <div class="ad4mConnect__dailog__option__text">Connect remote</div>
                  </div>
              </div>
          </div>
          <div class="ad4mConnect__backdrop"></div>
        </div> 
        `
      )
    } else if (state === 'not_connected') {
      return (
        html`
        <div class="ad4mConnect__locked">
          <div class="ad4mConnect__dailog__header">
              <img 
                  class="ad4mConnect__dailog__header__logo"
                  src="https://i.ibb.co/ydXzRwS/Ad4mLogo.png" 
                  alt="Logo" 
              />
              <div class="ad4mConnect__dailog__title">AD4M Connection Wizard</div>
          </div>
          <div class="ad4mConnect__dailog__title">Are you sure ad4m is downloaded and running?</div>
          <div class="ad4mConnect__dailog__subtitle" style="width: 700px">
          Download the latest version <a target="_blank" href="https://github.com/perspect3vism/ad4min/releases/latest">here</a>. We will automatically detect when it is running, if it doesn't connect automatically refresh the page.
          </div>
        </div>
        `
      )
    } else if (state === 'agent_locked') {
      return (
        html`
        <div class="ad4mConnect__locked">
          <div class="ad4mConnect__dailog__header">
              <img 
                  class="ad4mConnect__dailog__header__logo"
                  src="https://i.ibb.co/ydXzRwS/Ad4mLogo.png" 
                  alt="Logo" 
              />
              <div class="ad4mConnect__dailog__title">AD4M Connection Wizard</div>
          </div>
          <div class="ad4mConnect__dailog__subtitle">
              Your agent is locked, please unlock it & refresh the page to continue.
          </div>
        </div>
        `
      )
    } else if (state === 'capabilties_not_matched_first') {
      return (
        html`
        <div class="ad4mConnect">
          <div class="ad4mConnect__dailog">
              <div class="ad4mConnect__dailog__header">
                  <img 
                      class="ad4mConnect__dailog__header__logo"
                      src="https://i.ibb.co/ydXzRwS/Ad4mLogo.png" 
                      alt="Logo" 
                  />
                  <div class="ad4mConnect__dailog__title">AD4M Connection Wizard</div>
              </div>
              <div
                  class="ad4mConnect__dailog__subtitle"
              >${this.appname} needs to connect to your AD4M node/executor and request a capability token for the following capabilities:</div>
              <div class="ad4mConnect__dailog__caps">
                  ${JSON.parse(this.capabilities).map(e => (
                      html`<li>${e.can} => ${e.with.domain}.${e.with.pointers}</li>`
                  ))}
              </div>
              ${ this.appiconpath && html`<div class="ad4mConnect__dailog__connection">
                  <img src="https://i.ibb.co/ydXzRwS/Ad4mLogo.png" alt="App Logo" style="width: 120px" />
                  <img src="https://i.ibb.co/BG0Dz2v/link.png alt="chain" width="40px" style="margin: 0 24px;" />
                  <img src=${this.appiconpath} alt="Logo" style="width: 120px" />
              </div>`}
              <div style="height: 12px" ></div>
              <button class="ad4mConnect__dailog__btn" @click=${() => this._client.requestCapability(true)}>
                  Continue
              </button>
          </div>
          <div class="ad4mConnect__backdrop" />
        </div>
        `
      )
    } else if (state === 'request_capability') {
      return (
        html`
        <div class="ad4mConnect">
            <div class="ad4mConnect__dailog">
                <div class="ad4mConnect__dailog__header">
                    <img 
                        class="ad4mConnect__dailog__header__logo"
                        src="https://i.ibb.co/ydXzRwS/Ad4mLogo.png" 
                        alt="Logo" 
                    />
                    <div class="ad4mConnect__dailog__title">AD4M Connection Wizard</div>
                </div>
                <div
                    class="ad4mConnect__dailog__subtitle"
                >Capability request was successfully sent. Please check your AD4M admin UI (AD4Min), confirm the request there and enter the 6-digit security code below, that AD4Min displays to you.</div>
                <div class="ad4mConnect__dailog__input">
                    Security code: <input value=${this._code} @change=${(e: any) => this._code = e.target.value} />
                </div>
                <div style="height: 12px"></div>
                <div class="ad4mConnect__dailog__btns">
                    <button class="ad4mConnect__dailog__btn" @click=${() => this._state = 'capabilties_not_matched_first'}>
                        Back
                    </button>
                    <div style="width: 24px"></div>
                    <button class="ad4mConnect__dailog__btn" @click=${() => this._client.verifyCode(this._code)}>
                        Continue
                    </button>
                </div>
            </div>
            <div class="ad4mConnect__backdrop" />
        </div>
        `
      )
    } else if (state === 'capabilties_not_matched') {
      return(
        html`
          <div class="ad4mConnect__disconnect">
            Disconnected from Ad4min, please check if ad4min is still runnning.
          </div>
        `
      )
    }
  }
}

export function getAd4mClient(): Promise<Ad4mClient> {
  return new Promise((resolve, reject) => {
    document.addEventListener('return-fetch-ad4m-client', function listener(event) {
      this.removeEventListener('return-fetch-ad4m-client', listener)
      // @ts-ignore
      resolve(event.detail.ad4mClient)
    });

    const event = new CustomEvent('fetch-ad4m-client');
    document.dispatchEvent(event);

    setTimeout(() => {
      reject('No Ad4mClient found')
    }, 5000)
  })
}

export function isConnected() {
  return new Promise((resolve, reject) => {
    document.addEventListener('return-fetch-ad4m-client', function listener(event) {
      // @ts-ignore
      event.detail.addEventListener('connected_with_capabilities', () => {
        this.removeEventListener('return-fetch-ad4m-client', listener)

        resolve(true)
      })
    });

    const event = new CustomEvent('fetch-ad4m-client');
    document.dispatchEvent(event);
  });
}