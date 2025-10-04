import { setConsentAccepted } from "@/utils/consent";
import { Button } from "@/components/ui/button";

type Props = { onAccepted: () => void };

export default function FirstRunConsent({ onAccepted }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <h2 className="mb-2 text-xl font-semibold">Personalized on your device</h2>
        <ul className="mb-6 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>We tailor your experience based on what you like and complete.</li>
          <li>Data is stored on your device. You can clear it anytime.</li>
          <li>No account needed. Sign in later to sync across devices.</li>
        </ul>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => { setConsentAccepted(); onAccepted(); }}
            className="px-5"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
