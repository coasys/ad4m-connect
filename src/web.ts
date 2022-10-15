import { Ad4mClient } from "@perspect3vism/ad4m";
import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ad4mConnect } from "./core";
import { Html5Qrcode } from "html5-qrcode";
import Loading from "./components/Loading";
import RemoteUrl from "./components/RemoteUrl";
import Start from "./components/Start";
import NotConnected from "./components/NotConnected";
import AgentLocked from "./components/AgentLocked";
import CapNotMatchedFirst from "./components/CapNotMatchedFirst";
import CapNotMatched from "./components/CapNotMatching";
import Request from "./components/Request";
import Header from "./components/Header";
import CouldNotMakeRequest from "./components/CouldNotMakeRequest";
import { ClientStates } from "./core";

function detectMob() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

const styles = css`
  @import url("https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;700&display=swap");

  :host {
    --primary-color: #0a33ff;
    --success-color: #52d652;
    --heading-color: #252525;
    --body-color: #707070;
    --background-color: white;
  }

  .wrapper {
    font-family: "Comfortaa", Helvetica, Arial, sans-serif;
    position: fixed;
    top: 0;
    left: 0;
    color: var(--body-color);
    height: 100vh;
    width: 100vw;
  }

  * {
    box-sizing: border-box;
  }

  .items {
    display: flex;
    flex-direction: column;
    gap: 50px;
  }

  .button {
    text-decoration: none;
    cursor: pointer;
    border: 0;
    background: var(--primary-color);
    height: 60px;
    padding: 0px 30px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
    font-family: inherit;
    font-size: 15px;
  }

  .heading {
    color: var(--heading-color);
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    margin-bottom: 15px;
  }

  .body {
    padding: 0;
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }

  .buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .button--full {
    width: 100%;
    display: flex;
  }

  .button--link {
    padding: 0;
    background: none;
    color: var(--primary-color);
    text-decoration: none;
  }

  .button--link:hover {
    text-decoration: underline;
  }

  .button--secondary {
    background: var(--background-color);
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
  }

  .dialog {
    background-color: var(--background-color);
    position: absolute;
    top: 20vh;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
  }

  @media only screen and (max-width: 600px) {
    .dialog {
      width: 75%;
    }
  }

  .dialog__header {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    padding: 0 30px;
  }

  .dialog__connect {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 50px;
    position: relative;
  }

  .dialog__logo svg {
    margin: 0 auto;
    width: 100px;
    text-align: center;
  }

  .dialog__connect-ad4m {
    width: 100px;
    height: 100px;
    color: var(--primary-color);
    background: white;
    padding: 20px;
    box-shadow: 0px 4px 7px 0px rgb(0 0 0 / 8%);
    border-radius: 50%;
  }

  .dialog__connect-app {
    width: 80px;
    height: 80px;
  }

  .dialog__connect-check:before {
    content: "";
    display: block;
    width: 120px;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.2);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateY(-50%) translateX(-50%);
  }

  .dialog__connect-check svg {
    position: relative;
  }

  .text-center {
    text-align: center;
  }

  .dialog__content {
    padding-top: 0;
    padding-left: 30px;
    padding-right: 30px;
    padding-bottom: 30px;
  }

  .input {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .input__label {
    font-size: 12px;
  }

  .input__field {
    border-radius: 8px;
    outline: 0;
    height: 60px;
    padding: 0px 30px;
    font-size: 20px;
    border: 1px solid var(--body-color);
  }

  .input__field:focus {
    border: 1px solid var(--primary-color);
    box-shadow: 0px 0px 0px 1px var(--primary-color);
  }

  .ad4mConnect__backdrop {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    backdrop-filter: blur(6px);
    background-color: rgba(0, 0, 0, 0.05);
  }

  .ad4mConnect__locked {
    position: fixed;
    top: 0;
    left: 0;
    background: linear-gradient(
      90deg,
      rgba(2, 0, 36, 1) 0%,
      rgba(38, 3, 23, 1) 41%,
      rgba(51, 4, 31, 1) 100%
    );
    height: 100vh;
    width: 100vw;
    padding: 36px;
    display: flex;
    align-items: center;
    flex-direction: column;
    font-family: "Comfortaa", cursive;
  }

  .lds-ring {
    display: block;
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto;
    margin-top: 24px;
  }
  .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 4px;
    border: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: var(--primary-color) transparent transparent transparent;
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

  .disconnected {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    padding: 10px 0;
    text-align: center;
    background: red;
  }
`;

@customElement("ad4m-connect")
export default class Ad4mConnect extends LitElement {
  static styles = [styles];

  @state()
  private _client = null;

  @state()
  private _state: ClientStates = null;

  @state()
  private _code = null;

  @state()
  private _url = null;

  @state()
  private _isMobile = null;

  @property({ type: String, reflect: true })
  appname = null;

  @property({ type: String, reflect: true })
  appdesc = null;

  @property({ type: String, reflect: true })
  appdomain = null;

  @property({ type: String, reflect: true })
  capabilities;

  @property({ type: String, reflect: true })
  token;

  @property({ type: String, reflect: true })
  url;

  @property({ type: String, reflect: true })
  port;

  @property({ type: String, reflect: true })
  appiconpath;

  @property({ type: String, reflect: true })
  openonshortcut;

  connectedCallback() {
    super.connectedCallback();

    this.changeUrl = this.changeUrl.bind(this);
    this.connectRemote = this.connectRemote.bind(this);
    this.scanQrcode = this.scanQrcode.bind(this);
    this.connectToPort = this.connectToPort.bind(this);
    this.changeState = this.changeState.bind(this);
    this.renderViews = this.renderViews.bind(this);
    this.requestCapability = this.requestCapability.bind(this);
    this.verifyCode = this.verifyCode.bind(this);
    this.changeCode = this.changeCode.bind(this);
    this.getClient = this.getClient.bind(this);
    this.connected = this.connected.bind(this);

    this._isMobile = detectMob();

    const client = ad4mConnect({
      appName: this.appname,
      appDesc: this.appdesc,
      appDomain: this.appdomain,
      capabilities: JSON.parse(this.capabilities),
      port: this.port,
      token: this.token,
      url: this.url,
      onStateChange: (event: ClientStates) => {
        this._state = event;
        const customEvent = new CustomEvent("authStateChange", {
          detail: event,
        });
        this.dispatchEvent(customEvent);
      },
    });

    this._client = client;

    this.addShortCut();
    this.constructQR();
  }

  getAd4mClient() {
    return this._client.ad4mClient;
  }

  loadFont() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.crossOrigin = "anonymous";
    link.href =
      "https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;700&display=swap";
    document.head.appendChild(link);
  }

  addShortCut() {
    if (this.openonshortcut !== undefined) {
      document.addEventListener("keydown", (event) => {
        if (event.ctrlKey && event.altKey && event.code === "KeyA") {
          this._state = "init";
        }
      });
    }
  }

  constructQR() {
    const containerEle = document.createElement("div");
    containerEle.id = "camera-id";
    containerEle.style.position = "absolute";
    containerEle.style.top = "0";
    containerEle.style.left = "0";
    containerEle.style.width = "100vw";
    containerEle.style.height = "100vh";
    containerEle.style.zIndex = "10000";
    containerEle.style.display = "none";

    const ele = document.createElement("div");
    ele.id = "reader";
    // @ts-ignore
    ele.width = "100%";
    ele.style.height = "100vh";

    containerEle.appendChild(ele);
    document.body.appendChild(containerEle);
  }

  scanQrcode() {
    const html5QrCode = new Html5Qrcode("reader");
    const ele = document.getElementById("camera-id");
    ele.style.display = "block";

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      console.log("Got connection URL from QR code: ", decodedText);
      this._client.connectRemote(decodedText);
      html5QrCode.stop();
      ele.style.display = "none";
    };
    function onScanFailure(error) {
      console.warn(`Code scan error = ${error}`);
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    const reverseAspectRatio = height / width;

    const mobileAspectRatio =
      reverseAspectRatio > 1.5
        ? reverseAspectRatio + (reverseAspectRatio * 12) / 100
        : reverseAspectRatio;

    const config = {
      fps: 20, // frame per seconds for qr code scanning
      qrbox: { width: 250, height: 250 },
      videoConstraints: {
        facingMode: "environment",
        aspectRatio: mobileAspectRatio,
      },
    };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback,
      onScanFailure
    );
  }

  changeUrl(url) {
    this.setAttribute("url", url);
  }

  connectRemote(url) {
    this._client.connectRemote(url);
  }

  requestCapability(bool) {
    this._client.requestCapability(bool);
  }

  connectToPort() {
    this._client.connectToPort();
  }

  changeState(state) {
    this._state = state;
  }

  changeCode(code) {
    this._code = code;
  }

  verifyCode(code) {
    this._client.verifyCode(code);
  }

  connected() {
    return this._state === "connected_with_capabilities";
  }

  renderViews() {
    switch (this._state) {
      case "loading":
        return Loading();
      case "init":
        return Start({
          scanQrcode: this.scanQrcode,
          connectToPort: this.connectToPort,
          isMobile: this._isMobile,
          changeState: this.changeState,
        });
      case "remote_url":
        return RemoteUrl({
          url: this.url,
          changeState: this.changeState,
          changeUrl: this.changeUrl,
          connectRemote: this.connectRemote,
        });
      case "not_connected":
        return NotConnected({ connectToPort: this.connectToPort });
      case "agent_locked":
        return AgentLocked();
      case "capabilties_not_matched":
        return CapNotMatchedFirst({
          changeState: this.changeState,
          requestCapability: this.requestCapability,
          capabilities: this.capabilities,
          appname: this.appname,
          appiconpath: this.appiconpath,
        });
      case "capabilties_not_matched_first":
        return CapNotMatchedFirst({
          changeState: this.changeState,
          requestCapability: this.requestCapability,
          capabilities: this.capabilities,
          appname: this.appname,
          appiconpath: this.appiconpath,
        });
      case "request_capability":
        return Request({
          code: this._code,
          changeCode: this.changeCode,
          changeState: this.changeState,
          verifyCode: this.verifyCode,
        });
      case "could_not_make_request":
        return CouldNotMakeRequest();
      default:
        return Loading();
    }
  }

  render() {
    if (this._state === "connected_with_capabilities") {
      return null;
    } else {
      return html`
        <div class="wrapper">
          <div class="dialog">
            ${Header()}
            <main class="dialog__content">${this.renderViews()}</main>
          </div>
          <div class="ad4mConnect__backdrop" />
        </div>
      `;
    }
  }
}
