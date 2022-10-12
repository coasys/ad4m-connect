import { html } from "lit";

export default function CouldNotMakeRequest() {
  return html`
    <div class="items">
      <div class="text-center">
        <h1 class="heading">Request to AD4M blocked</h1>
        <div class="body">
          Its possible your browser is blocking requests to your local machine. Please remove any browser shields/protection that may be running for this page.
          Alternatively allow requests to localhost:3000 in your browser settings.
        </div>
      </div>

      <div class="buttons">
      <button class="button button--full button--secondary" @click=${() =>
        location.reload()}>
        Try again
      </button>
        <a
          class="button button--full"
          target="_blank"
          href="https://github.com/perspect3vism/ad4min/releases/latest"
        >
          Download Ad4m
        </a>
      </div>
      </div>
    </div>
  `;
}
