import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MEDITATIONS } from "@/data/meditations";
import { BREATHING_PATTERNS } from "@/data/breathing";

type Check = { name: string; ok: boolean; detail?: string };

async function head(url: string): Promise<Check> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return { name: url, ok: res.ok, detail: `${res.status} ${res.statusText}` };
  } catch (e: any) {
    return { name: url, ok: false, detail: e?.message || "fetch error" };
  }
}

export default function DebugStatus() {
  const [audioChecks, setAudioChecks] = useState<Check[]>([]);
  const [env, setEnv] = useState<Record<string, string | number | boolean>>({});
  const [ls, setLs] = useState<Record<string, string | null>>({});

  const meditationAudios = useMemo(() => {
    const urls = new Set<string>();
    Object.values(MEDITATIONS).forEach(m => m.audioUrl && urls.add(m.audioUrl));
    return Array.from(urls);
  }, []);

  useEffect(() => {
    (async () => {
      const results: Check[] = [];
      for (const url of meditationAudios) {
        results.push(await head(url));
      }
      setAudioChecks(results);
    })();

    setEnv({
      userAgent: navigator.userAgent,
      language: navigator.language,
      online: navigator.onLine,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      time: new Date().toLocaleString(),
    });

    setLs({
      "nuera:consent:v1": localStorage.getItem("nuera:consent:v1"),
      "nuera:auth_prompt_seen": localStorage.getItem("nuera:auth_prompt_seen"),
      "nuera:personalization_enabled": localStorage.getItem("nuera:personalization_enabled"),
      "nuera:prefs:v1": localStorage.getItem("nuera:prefs:v1"),
      "nuera:gratitude:entries": localStorage.getItem("nuera:gratitude:entries"),
    });
  }, [meditationAudios]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl p-6 pt-12">
        <h1 className="mb-6 text-2xl font-semibold">Nuera — Debug / Status</h1>

        <section className="mb-6 rounded-xl border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">Routes quick links</div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link className="underline" to="/cards">/cards</Link>
            <Link className="underline" to="/reels">/reels</Link>
            <Link className="underline" to="/favorites">/favorites</Link>
            <Link className="underline" to="/profile">/profile</Link>
            <Link className="underline" to="/gratitude/new">/gratitude/new</Link>
            <Link className="underline" to="/meditation/mindful5">/meditation/mindful5</Link>
            <Link className="underline" to="/breathing/box44">/breathing/box44</Link>
          </div>
        </section>

        <section className="mb-6 rounded-xl border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">Environment</div>
          <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-xs">{JSON.stringify(env, null, 2)}</pre>
        </section>

        <section className="mb-6 rounded-xl border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">LocalStorage keys</div>
          <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-xs">{JSON.stringify(ls, null, 2)}</pre>
          <div className="mt-3 text-xs text-muted-foreground">
            <p><b>nuera:consent:v1</b>: first-run consent accepted? (1 = yes)</p>
            <p><b>nuera:auth_prompt_seen</b>: sign-in prompt shown once? (1 = yes)</p>
            <p><b>nuera:personalization_enabled</b>: personalization toggle (1 = on)</p>
          </div>
        </section>

        <section className="mb-6 rounded-xl border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">Meditations data map</div>
          <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-xs">
            {JSON.stringify(Object.keys(MEDITATIONS), null, 2)}
          </pre>
        </section>

        <section className="mb-6 rounded-xl border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">Breathing patterns data map</div>
          <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-xs">
            {JSON.stringify(Object.keys(BREATHING_PATTERNS), null, 2)}
          </pre>
        </section>

        <section className="mb-6 rounded-xl border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">Audio HEAD checks (Meditations)</div>
          {audioChecks.length === 0 ? (
            <div className="text-xs text-muted-foreground">No audio URLs detected.</div>
          ) : (
            <ul className="space-y-2 text-xs">
              {audioChecks.map((c, i) => (
                <li key={i} className={c.ok ? "text-green-600" : "text-red-600"}>
                  {c.ok ? "✅" : "❌"} {c.name} — {c.detail}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border bg-card p-4">
          <div className="mb-2 text-sm font-semibold">Actions</div>
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              className="rounded border px-3 py-1 hover:bg-accent"
              onClick={() => { localStorage.removeItem("nuera:auth_prompt_seen"); setLs(s => ({...s, "nuera:auth_prompt_seen": null})); }}
            >Reset sign-in prompt flag</button>
            <button
              className="rounded border px-3 py-1 hover:bg-accent"
              onClick={() => { localStorage.clear(); location.reload(); }}
            >Clear all localStorage & reload</button>
          </div>
        </section>
      </div>
    </div>
  );
}
