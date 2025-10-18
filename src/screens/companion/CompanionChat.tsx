import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/utils/analytics";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sendToCompanion } from "@/utils/chatApi";

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };
const STORAGE_KEY = "nuera:companion:session:v1";

const DISCLAIMER_TEXT =
  "I'm here to listen and support you. If you ever feel unsafe or in crisis, please reach out to a trusted person or a professional helpline.";

export default function CompanionChat() {
  const nav = useNavigate();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    track("companion_opened");
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setMessages(JSON.parse(raw));
      } catch { /* ignore */ }
    } else {
      // First time: show disclaimer
      setShowDisclaimer(true);
    }
  }, []);

  // Persist every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSend() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text } as ChatMsg];
    setInput("");
    setMessages(next);
    track("companion_message_sent");

    setLoading(true);
    try {
      const reply = await sendToCompanion(next);
      setMessages([...next, { role: "assistant", content: reply } as ChatMsg]);
      track("companion_message_received");
    } catch (e) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Sorry — I couldn’t reach the server right now. You can keep sharing, or try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetSession() {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    setShowDisclaimer(true);
    track("companion_reset_session");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mx-auto max-w-md p-6 pt-16">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => nav(-1)} className="h-10 w-10 rounded-full p-0">
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-lg font-semibold">AI Companion</h2>
          <div className="w-10" />
        </div>

        {/* Disclaimer modal (first time) */}
        {showDisclaimer && (
          <div className="mb-4 rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold">Before we start</div>
            <p className="text-sm text-muted-foreground">{DISCLAIMER_TEXT}</p>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowDisclaimer(false)}>Continue</Button>
            </div>
          </div>
        )}

        {/* Thread */}
        <div className="mb-4 space-y-3 rounded-xl border bg-card p-3">
          {messages.length === 0 && !showDisclaimer && (
            <div className="text-sm text-muted-foreground">
              Say hello or share what’s on your mind — I’m here to listen.
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-primary text-primary-foreground px-3 py-2"
                  : "mr-auto max-w-[85%] rounded-2xl bg-muted px-3 py-2"
              }
            >
              <div className="whitespace-pre-wrap text-sm">{m.content}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
          />
          <Button onClick={onSend} disabled={loading}>
            {loading ? "…" : "Send"}
          </Button>
          <Button variant="ghost" onClick={resetSession} title="New chat">
            New
          </Button>
        </div>
      </div>
    </div>
  );
}
