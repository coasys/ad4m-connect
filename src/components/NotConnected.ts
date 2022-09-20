import { html } from "lit";

export default function NotConnected() {
  return html`
    <div>
      <div>Are you sure ad4m is downloaded and running?</div>
      <div>
        Download the latest version
        <a
          target="_blank"
          href="https://github.com/perspect3vism/ad4min/releases/latest"
          >here
        </a>
        . We will automatically detect when it is running, if it doesn't connect
        automatically refresh the page.
      </div>
    </div>
  `;
}
