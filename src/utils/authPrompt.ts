// Shows the sign-in prompt only once per user
const AUTH_SEEN_KEY = "nuera:auth_prompt_seen";

export function hasSeenAuthPrompt(): boolean {
  return localStorage.getItem(AUTH_SEEN_KEY) === "1";
}

export function markAuthPromptSeen() {
  localStorage.setItem(AUTH_SEEN_KEY, "1");
}
