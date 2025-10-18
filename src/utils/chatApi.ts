// Sends the whole message array to backend; if it fails, uses a friendly local mock.

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT =
  "You are an empathetic and friendly AI companion in a mental wellness app. You help users in many ways—by listening when they need to talk, supporting them through challenges, celebrating progress, helping them reflect, or simply chatting about everyday life and goals. You respond with kindness, understanding, and encouragement. You focus on helping users improve their overall well-being, but you never diagnose or provide medical advice. You are warm, supportive, and respectful in all responses.";

export async function sendToCompanion(messages: ChatMsg[]): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // we prepend the system message server-side too, but sending it here is harmless
      body: JSON.stringify({ messages, system: SYSTEM_PROMPT }),
    });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    return data.reply as string;
  } catch {
    // Fallback mock: simple empathetic reflection
    const last = [...messages].reverse().find(m => m.role === "user")?.content ?? "";
    return (
      "I’m here with you. " +
      (last
        ? `You said: “${last}”. Thanks for sharing that. ` 
        : "") +
      "Would it help to unpack what feels most present right now, or would you like a small grounding idea (like a 60-second breath)?"
    );
  }
}
