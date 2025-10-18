import { Button } from "@/components/ui/button";
import { copyToClipboard, openMailtoWithMessage, openSmsWithMessage } from "@/utils/share";

type Props = {
  open: boolean;
  message: string;
  onSent: (channel: "sms" | "copy" | "skip" | "email") => void;
  onClose: () => void;
};

export default function ThankYouPrompt({ open, message, onSent, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl border bg-card p-6 shadow-2xl">
        <h3 className="mb-2 text-lg font-semibold">Send a thank-you?</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          A quick message can brighten someone’s day. We’ll open your Messages app with this prefilled note.
        </p>
        <div className="mb-4 rounded bg-muted p-3 text-sm">{message}</div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              const ok = await copyToClipboard(message);
              onSent("copy");
              if (ok) onClose();
            }}
          >
            Copy message
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              onSent("email");
              openMailtoWithMessage(message);
              onClose();
            }}
          >
            Email
          </Button>
          <Button
            onClick={() => {
              onSent("sms");
              openSmsWithMessage(message);
              onClose();
            }}
          >
            Send via Messages
          </Button>
          <Button variant="ghost" onClick={() => { onSent("skip"); onClose(); }}>
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
