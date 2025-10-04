const KEY = "nuera:consent:v1";

export function hasConsent(): boolean {
  return localStorage.getItem(KEY) === "1";
}
export function setConsentAccepted() {
  localStorage.setItem(KEY, "1");
}
