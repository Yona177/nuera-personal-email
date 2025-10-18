import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SEED_CARDS } from '@/data/cards';
import { useCardActions } from '@/hooks/useCardActions';
import type { Card } from '@/types/card';

// 👇 Recommender imports
import {
  rankCards,
  getLastMoodSignal,
  recordPositive,
  recordNegative
} from '@/utils/recommend';

const SwipeCards = () => {
  // Rank the initial deck based on the last mood signal (moods + free text) and prefs
  const [cards, setCards] = useState<Card[]>(() => {
    const sig = getLastMoodSignal();
    return rankCards(SEED_CARDS, sig);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { onSwipeRight, onSwipeLeft } = useCardActions();

  const currentCard = cards[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentCard) {
      if (direction === 'right') {
        // ✅ record a positive preference for this card type
        recordPositive(currentCard);
        onSwipeRight(currentCard);
      } else {
        // 👎 slight penalty
        recordNegative(currentCard);
        onSwipeLeft(currentCard);
      }
    }

    setSwipeDirection(direction);

    // advance to next card after the swipe animation
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // loop back to start
        setCurrentIndex(0);
      }
      setSwipeDirection(null);
    }, 300);
  };

  const handleReset = () => {
    // Optional: re-rank the full deck on reset for a “fresh start” using latest prefs + last mood
    const sig = getLastMoodSignal();
    const reRanked = rankCards(SEED_CARDS, sig);
    setCards(reRanked);
    setCurrentIndex(0);
    setSwipeDirection(null);
  };

  if (!currentCard) return null;

  return (
    <div className="min-h-screen bg-gradient-calm p-6 pb-32">
<div className="max-w-sm mx-auto pt-16 pt-4">
  {/* Reset mood button */}
  <div className="flex items-center mb-4">
    <button
  onClick={() => navigate('/mood-check')}
      className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <span className="mr-1">←</span> Reset mood
    </button>
  </div>

  {/* Card Stack */}
  <div className="relative h-[500px] mb-8">
          {/* Next card (background) */}
          {currentIndex < cards.length - 1 && (
            <div className="absolute inset-0 swipe-card bg-card/50 scale-95 -rotate-1" />
          )}

          {/* Current card */}
          <div
            ref={cardRef}
            className={cn(
              "absolute inset-0 swipe-card cursor-pointer touch-manipulation",
              swipeDirection === 'left' && "animate-swipe-left",
              swipeDirection === 'right' && "animate-swipe-right"
            )}
          >
            {(currentCard.image || currentCard.imageUrl) && (
              <div
                className="w-full h-48 rounded-2xl bg-cover bg-center mb-6"
                style={{ backgroundImage: `url(${currentCard.image || currentCard.imageUrl})` }}
              />
            )}

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">
                  {currentCard.title}
                </h2>
                {currentCard.duration && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {currentCard.duration}
                  </span>
                )}
              </div>

              {currentCard.subtitle && (
                <p className="text-sm text-muted-foreground mb-2">{currentCard.subtitle}</p>
              )}

              {currentCard.content && (
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {currentCard.content}
                </p>
              )}
            </div>

            {/* Swipe Indicators */}
            <div
              className={cn(
                "swipe-indicator left",
                swipeDirection === 'left' && "opacity-100"
              )}
            >
              ✕
            </div>
            <div
              className={cn(
                "swipe-indicator right",
                swipeDirection === 'right' && "opacity-100"
              )}
            >
              ♥
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-6">
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleSwipe('left')}
            className="rounded-full w-16 h-16 border-destructive/30 text-destructive hover:bg-destructive/10 shadow-lg"
          >
            <X size={24} />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="rounded-full w-12 h-12 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={20} />
          </Button>

          <Button
            size="lg"
            onClick={() => handleSwipe('right')}
            className="rounded-full w-16 h-16 bg-gradient-to-r from-wellness-energy to-wellness-energy/80 hover:from-wellness-energy/90 hover:to-wellness-energy/70 shadow-lg"
          >
            <Heart size={24} />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {cards.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwipeCards;
