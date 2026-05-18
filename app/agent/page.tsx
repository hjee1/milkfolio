import { AgentClient } from "./AgentClient";

// Server Component shell — the real work happens client-side after the
// password gate. Data is fetched lazily via the Server Action in actions.ts
// so we don't ship parsed dashboard data to unauthenticated visitors.
export default function AgentPage() {
  return <AgentClient />;
}
