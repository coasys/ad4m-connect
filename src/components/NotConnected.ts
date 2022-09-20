import { html } from "lit";

export default function NotConnected() {
  return html`
    <div class="items">
      <div class="text-center">
        <h1 class="heading">Couldn't connect to Ad4m</h1>
        <div class="body">
          Are you sure you have A4dm downloaded and running?
          Download Ad4m, and we will automatically detect when it is
          running. If it doesn't, connect automatically refresh the page.
        </div>
      </div>
        <a
          class="button"
          target="_blank"
          href="https://github.com/perspect3vism/ad4min/releases/latest"
        >
          Download Ad4m
        </a>
      </div>
    </div>
  `;
}
