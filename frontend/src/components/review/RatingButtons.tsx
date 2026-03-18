import { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { Rating } from '@/types/review';

interface IntervalPreview {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

interface RatingButtonsProps {
  onRate: (rating: Rating) => void;
  disabled?: boolean;
  currentRating?: Rating;
  showIntervals?: IntervalPreview;
}

interface RatingButtonConfig {
  rating: Rating;
  label: string;
  description: string;
  shortcut: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className: string;
}

const RATING_BUTTONS: RatingButtonConfig[] = [
  {
    rating: 'again',
    label: 'Again',
    description: 'Forgot completely',
    shortcut: '1',
    variant: 'destructive',
    className: 'bg-red-600 hover:bg-red-700 text-white',
  },
  {
    rating: 'hard',
    label: 'Hard',
    description: 'Barely remembered',
    shortcut: '2',
    variant: 'outline',
    className: 'border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700',
  },
  {
    rating: 'good',
    label: 'Good',
    description: 'Remembered correctly',
    shortcut: '3',
    variant: 'default',
    className: 'bg-green-600 hover:bg-green-700 text-white',
  },
  {
    rating: 'easy',
    label: 'Easy',
    description: 'Perfect recall',
    shortcut: '4',
    variant: 'outline',
    className: 'border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700',
  },
];

function formatInterval(days: number): string {
  if (days < 1) return '<1d';
  if (days === 1) return '1d';
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

export function RatingButtons({
  onRate,
  disabled = false,
  currentRating,
  showIntervals,
}: RatingButtonsProps) {
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      const key = event.key;
      const ratingMap: Record<string, Rating> = {
        '1': 'again',
        '2': 'hard',
        '3': 'good',
        '4': 'easy',
      };

      if (key in ratingMap) {
        event.preventDefault();
        onRate(ratingMap[key]);
      }
    },
    [disabled, onRate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getIntervalForRating = (rating: Rating): number | undefined => {
    if (!showIntervals) return undefined;
    return showIntervals[rating];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {RATING_BUTTONS.map((config) => {
          const interval = getIntervalForRating(config.rating);
          const isSelected = currentRating === config.rating;

          return (
            <Button
              key={config.rating}
              variant={config.variant}
              onClick={() => onRate(config.rating)}
              disabled={disabled}
              className={`
                h-auto py-4 px-3 flex flex-col items-center gap-1
                ${config.className}
                ${isSelected ? 'ring-2 ring-offset-2 ring-primary' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {/* Label and Shortcut */}
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">{config.label}</span>
                <span className="text-xs opacity-70 bg-black/10 px-1.5 py-0.5 rounded">
                  {config.shortcut}
                </span>
              </div>

              {/* Description */}
              <span className="text-xs opacity-80 text-center leading-tight">
                {config.description}
              </span>

              {/* Interval Preview */}
              {interval !== undefined && (
                <span className="text-xs font-medium mt-1 bg-black/10 px-2 py-0.5 rounded-full">
                  {formatInterval(interval)}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Keyboard Shortcut Hint */}
      <p className="text-center text-xs text-muted-foreground mt-3">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">1</kbd>-
        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">4</kbd> for quick rating
      </p>
    </div>
  );
}