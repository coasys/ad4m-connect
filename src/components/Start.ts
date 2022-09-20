import { html } from "lit";

export default function Start({
  connectToPort,
  isMobile,
  changeState,
  scanQrcode,
}) {
  return html`
    <div class="items">
      <div class="text-center">
        <h1 class="heading">Connect to Ad4m</h1>
        <p class="body">
          Let's connect to your ad4m service, and start surfing the web
          completely decentralized and secure.
        </p>
      </div>
      <div>
        ${!isMobile
          ? html`<button
              class="button button--full"
              @click=${() => connectToPort()}
            >
              Connect
            </button>`
          : html`<button
              class="button button--full"
              @click=${() => scanQrcode()}
            >
              Connect to ad4m
            </button> `}
        <div class="text-center">
          or
          <button
            class="button button--link "
            @click=${() => changeState("remote_url")}
          >
            Connect to a remote host
          </button>
        </div>
      </div>
    </div>
  `;
}
