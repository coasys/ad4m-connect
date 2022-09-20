import { html } from "lit";

export default function CapNotMatchedFirst({
  capabilities,
  appname,
  appiconpath,
  requestCapability,
}) {
  return html`
    <div>
      <div>
        <div class="ad4mConnect__dailog__subtitle">
          ${appname} needs to connect to your AD4M node/executor and request a
          capability token for the following capabilities:
        </div>
        <div class="ad4mConnect__dailog__caps">
          ${JSON.parse(capabilities).map(
            (e) =>
              html`<li>${e.can} => ${e.with.domain}.${e.with.pointers}</li>`
          )}
        </div>
        ${appiconpath &&
        html`<div class="ad4mConnect__dailog__connection">
          <img
            src="https://i.ibb.co/ydXzRwS/Ad4mLogo.png"
            alt="App Logo"
            style="width: 120px"
          />
          <img src="https://i.ibb.co/BG0Dz2v/link.png alt="chain" width="40px"
          style="margin: 0 24px;" />
          <img src=${appiconpath} alt="Logo" style="width: 120px" />
        </div>`}
        <div style="height: 12px"></div>
        <button
          class="ad4mConnect__dailog__btn"
          @click=${() => requestCapability(true)}
        >
          Continue
        </button>
      </div>
    </div>
  `;
}
