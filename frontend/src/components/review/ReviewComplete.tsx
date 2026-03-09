import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowLeft, PartyPopper } from 'lucide-react';

interface ReviewCompleteProps {
  totalCards: number;
  onReviewAgain: () => void;
  onExit: () => void;
}

export function ReviewComplete({
  totalCards,
  onReviewAgain,
  onExit,
}: ReviewCompleteProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Celebration Icon */}
      <div className="mb-6 text-primary">
        <PartyPopper className="h-20 w-20" />
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold mb-2">
        Session Complete!
      </h2>

      {/* Summary */}
      <p className="text-lg text-muted-foreground mb-8">
        You reviewed <span className="font-semibold text-foreground">{totalCards}</span> card{totalCards !== 1 ? 's' : ''}.
      </p>

      {/* Stats Card */}
      <div className="w-full max-w-sm bg-card border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-4xl">🎉</span>
          <span className="text-2xl font-bold">Great job!</span>
          <span className="text-4xl">🎉</span>
        </div>
        <p className="text-muted-foreground">
          Keep up the good work! Regular practice is the key to mastering Chinese characters.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button
          onClick={onReviewAgain}
          className="flex-1 h-12"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Review Again
        </Button>
        <Button
          variant="outline"
          onClick={onExit}
          className="flex-1 h-12"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Deck
        </Button>
      </div>
    </div>
  );
}
