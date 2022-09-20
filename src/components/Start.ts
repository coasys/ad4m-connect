import { html } from "lit";

export default function Start({
  connectToPort,
  isMobile,
  changeState,
  scanQrcode,
}) {
  return html`
    <div>
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
        or
        <button
          class="button button--link "
          @click=${() => changeState("remote_url")}
        >
          Connect remote
        </button>
      </div>
    </div>
  `;
}
