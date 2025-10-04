import { useMemo } from "react";
import { loadGratitudeEntries } from "@/store/gratitude";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function GratitudeHistory() {
  const nav = useNavigate();
  const entries = useMemo(() => loadGratitudeEntries(), []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md p-6 pt-16">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => nav(-1)} className="h-10 w-10 rounded-full p-0"><ArrowLeft size={20}/></Button>
          <h2 className="text-lg font-semibold">Gratitude History</h2>
          <div className="w-10" />
        </div>

        {entries.length === 0 ? (
          <p className="text-muted-foreground">No entries yet.</p>
        ) : (
          <div className="space-y-4">
            {entries.map(e => (
              <div key={e.id} className="rounded-xl border p-4 bg-card">
                <div className="text-xs text-muted-foreground mb-2">
                  {new Date(e.createdAt).toLocaleString()}
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {e.items.map(i => (
                    <li key={i.id}>
                      <span className="font-medium">{i.what}</span>
                      {i.why ? <span className="text-muted-foreground"> — {i.why}</span> : null}
                      {i.category ? <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{i.category}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
