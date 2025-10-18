export function buildThankYouMessage(opts: {
  who?: string;
  what: string;
  why?: string;
}) {
  const parts: string[] = [];
  if (opts.who) parts.push(`Hi ${opts.who},`);
  parts.push(`I just wanted to say thank you 🙏`);
  parts.push(`I'm grateful for: ${opts.what}.`);
  if (opts.why) parts.push(`It meant a lot because ${opts.why}.`);
  parts.push(`Appreciate you!`);
  return parts.join(" ");
}

export function openSmsWithMessage(message: string) {
  // Encode for sms: body. For iOS/Android the format sms:&body=... works in most cases.
  const body = encodeURIComponent(message);
  // Using just sms:?body=... to avoid iOS/Android differences with &body vs ?body.
  const href = `sms:&body=${body}`;
  window.location.href = href;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function openMailtoWithMessage(message: string) {
  const subject = encodeURIComponent("Thank you");
  const body = encodeURIComponent(message);
  const href = `mailto:?subject=${subject}&body=${body}`;
  window.location.href = href;
}
