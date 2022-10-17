import { html } from "lit";
import { getAd4mClient } from "../utils";

function handleSubmit(e) {
  const form = e.target;
  const input = form.elements["password"];
}

export default function AgentLocked({ unlockAgent }) {
  return html`
    <div>
      <h1 class="heading">Agent locked</h1>
      <p class="body">
        Your agent is locked, please unlock it & refresh the page to continue.
      </p>
    </div>
  `;
}
