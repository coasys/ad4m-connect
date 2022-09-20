import { html } from "lit";

export default function AgentLocked() {
  return html`
    <div>
      <h1 class="heading">Agent locked</h1>
      <p class="body">
        Your agent is locked, please unlock it & refresh the page to continue.
      </p>
    </div>
  `;
}
