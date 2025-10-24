import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { setLastMoodSignal } from "@/utils/recommend";

interface MoodCheckInProps {
  onComplete: (moods: string[], text?: string) => void;
}

const MoodCheckIn = ({ onComplete }: MoodCheckInProps) => {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [listening, setListening] = useState(false);

  // NOTE: we renamed "focused" → "unfocused" so it maps to our recommender
  const moods = [
    { id: 'happy',       label: 'Happy',      color: 'from-wellness-energy/20 to-wellness-energy/30' },
    { id: 'calm',        label: 'Calm',       color: 'from-wellness-calm/20 to-wellness-calm/30' },
    { id: 'anxious',     label: 'Anxious',    color: 'from-accent/20 to-accent/30' },
    { id: 'stressed',    label: 'Stressed',   color: 'from-destructive/20 to-destructive/30' },
    { id: 'unfocused',   label: 'Unfocused',  color: 'from-wellness-focus/20 to-wellness-focus/30' },
    { id: 'tired',       label: 'Tired',      color: 'from-wellness-sleep/20 to-wellness-sleep/30' },
    { id: 'excited',     label: 'Excited',    color: 'from-primary/20 to-primary/30' },
    { id: 'sad',         label: 'Sad',        color: 'from-muted/30 to-muted/40' },
  ];

  const toggleMood = (moodId: string) => {
    setSelectedMoods(prev =>
      prev.includes(moodId)
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  function startVoice() {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { alert("Voice input not supported on this device/browser."); return; }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript || "";
      if (text) setFreeText(prev => (prev ? prev + " " : "") + text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }

  const canContinue = selectedMoods.length > 0 || freeText.trim().length > 0;

  const handleComplete = () => {
    if (!canContinue) return;
    const signal = { moods: selectedMoods, text: freeText || undefined };
    setLastMoodSignal(signal);          // ✅ save for the recommender
    onComplete(selectedMoods, freeText); // ✅ pass along to next screen
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-6 pb-24">
      <div className="max-w-md mx-auto pt-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            How do you feel?
          </h1>
          <p className="text-muted-foreground">
            Share what you really feel
          </p>
        </div>

        {/* Floating Mood Bubbles */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {moods.map((mood, index) => (
            <button
              key={mood.id}
              onClick={() => toggleMood(mood.id)}
              className={cn(
                "mood-bubble relative overflow-hidden",
                selectedMoods.includes(mood.id) && "selected",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-r", mood.color)} />
              <span className="relative z-10">{mood.label}</span>
            </button>
          ))}
        </div>

        {/* Free text + mic */}
        <div className="mt-3 flex items-center gap-2">
          <input
            className="flex-1 rounded-md border px-3 py-2 text-sm bg-background"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Share a few words (optional)"
          />
          <button
            type="button"
            onClick={startVoice}
            className={`rounded-full border px-3 py-2 text-sm ${listening ? "bg-primary text-primary-foreground" : "bg-card"}`}
            title="Tap to speak"
          >
            🎤
          </button>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-10 flex justify-center animate-scale-in">
        <Button
          onClick={handleComplete}
          size="lg"
          disabled={!canContinue}
          className="rounded-full px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg group disabled:opacity-50"
        >
          <span className="mr-2">Continue</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default MoodCheckIn;
