import { html } from "lit";

export default function Request({ code, changeState, verifyCode, changeCode }) {
  return html`
    <div>
      <div class="ad4mConnect__dailog__subtitle">
        Capability request was successfully sent. Please check your AD4M admin
        UI (AD4Min), confirm the request there and enter the 6-digit security
        code below, that AD4Min displays to you.
      </div>
      <div class="ad4mConnect__dailog__input">
        Security code:
        <input
          value=${code}
          @change=${(e: any) => changeCode(e.target.value)}
        />
      </div>
      <div style="height: 12px"></div>
      <div class="ad4mConnect__dailog__btns">
        <button
          class="ad4mConnect__dailog__btn"
          @click=${() => changeState("capabilties_not_matched_first")}
        >
          Back
        </button>
        <div style="width: 24px"></div>
        <button
          class="ad4mConnect__dailog__btn"
          @click=${() => verifyCode(code)}
        >
          Continue
        </button>
      </div>
    </div>
  `;
}
