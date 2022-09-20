import { html } from "lit";

export default function RemoveUrl({ url, connectRemote, state, changeUrl }) {
  console.log("reload");

  return html`
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
        <div class="ad4mConnect__dailog__subtitle">
          Please enter the url you want to connect too.
        </div>
        <div class="ad4mConnect__dailog__input">
          URL:
          <input value=${url} @input=${(e: any) => changeUrl(e.target.value)} />
        </div>
        <div style="height: 12px"></div>
        <div class="ad4mConnect__dailog__btns">
          <button
            class="ad4mConnect__dailog__btn"
            @click=${() => (state = "init")}
          >
            Back
          </button>
          <div style="width: 24px"></div>
          <button
            class="ad4mConnect__dailog__btn"
            @click=${() => connectRemote(url)}
          >
            Continue
          </button>
        </div>
      </div>
      <div class="ad4mConnect__backdrop" />
    </div>
  `;
}
