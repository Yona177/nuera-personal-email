// Vercel Edge Function: /api/chat
export const config = { runtime: "edge" };

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"; // good price/perf

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500 });
  }

  try {
    const { messages = [], system } = await req.json();

    // Build OpenAI messages: system + conversation
    const openAiMessages = [
      { role: "system", content: (system as string) || "You are a helpful, empathetic assistant." },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: openAiMessages,
        temperature: 0.7,
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return new Response(JSON.stringify({ error: "OpenAI error", detail: text }), { status: 500 });
    }
    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || "…";

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), { status: 500 });
  }
}
