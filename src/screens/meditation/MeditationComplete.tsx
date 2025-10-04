import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import SignInPrompt from "@/components/modals/SignInPrompt";
import { hasSeenAuthPrompt, markAuthPromptSeen } from "@/utils/authPrompt";

export default function MeditationComplete() {
  const nav = useNavigate();
  const { meditationId } = useParams();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Try to show the sign-in prompt only if the user hasn't seen it yet
    if (!hasSeenAuthPrompt()) {
      const t = setTimeout(() => setShowPrompt(true), 300); // small delay so UI settles
      return () => clearTimeout(t);
    }
  }, []);

  const closePrompt = () => {
    setShowPrompt(false);
    markAuthPromptSeen(); // remember we showed it once
  };

  return (
    <div className="min-h-screen bg-gradient-calm">
      <div className="mx-auto max-w-md p-6 pt-16 text-center">
        <h1 className="mb-2 text-2xl font-semibold">Nice job ✨</h1>
        <p className="mb-8 text-muted-foreground">
          You completed {meditationId ? meditationId.replace(/-/g, " ") : "your session"}.
        </p>
        <Button onClick={() => nav(-1)}>Back</Button>
      </div>

      {/* Sign-in prompt (shows once) */}
      <SignInPrompt open={showPrompt} onClose={closePrompt} />
    </div>
  );
}
