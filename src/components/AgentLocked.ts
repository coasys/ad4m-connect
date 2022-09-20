import { html } from "lit";

export default function AgentLocked() {
  return html`
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
  `;
}
