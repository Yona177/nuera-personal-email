import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Props = { open: boolean; onClose: () => void };

export default function SignInPrompt({ open, onClose }: Props) {
  const nav = useNavigate();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl border bg-card p-6 shadow-2xl">
        <h3 className="mb-2 text-lg font-semibold">Keep your progress</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Save favorites and personalize across devices. We’ll email you a magic link to sign in.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Not now</Button>
          <Button onClick={() => { onClose(); nav("/profile"); }}>
            Get a magic link
          </Button>
        </div>
      </div>
    </div>
  );
}
