import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowLeft, PartyPopper, CheckCircle, XCircle } from 'lucide-react';

interface ReviewCompleteProps {
  totalCards: number;
  correctCount?: number;
  onReviewAgain: () => void;
  onExit: () => void;
}

export function ReviewComplete({
  totalCards,
  correctCount,
  onReviewAgain,
  onExit,
}: ReviewCompleteProps) {
  // Calculate statistics
  const incorrectCount = correctCount !== undefined ? totalCards - correctCount : undefined;
  const accuracyPercentage = correctCount !== undefined 
    ? Math.round((correctCount / totalCards) * 100) 
    : undefined;

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
        {/* Accuracy Display */}
        {accuracyPercentage !== undefined && (
          <div className="mb-6">
            <div className="text-5xl font-bold text-primary mb-2">
              {accuracyPercentage}%
            </div>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
        )}

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Correct Count */}
          <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <CheckCircle className="h-5 w-5" />
              <span className="text-2xl font-bold">{correctCount ?? 0}</span>
            </div>
            <span className="text-xs text-muted-foreground">Correct</span>
          </div>

          {/* Incorrect Count */}
          <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 mb-1">
              <XCircle className="h-5 w-5" />
              <span className="text-2xl font-bold">{incorrectCount ?? 0}</span>
            </div>
            <span className="text-xs text-muted-foreground">Needs Review</span>
          </div>
        </div>

        {/* Encouragement Message */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🎉</span>
          <span className="text-lg font-semibold">Great job!</span>
          <span className="text-2xl">🎉</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {accuracyPercentage !== undefined && accuracyPercentage >= 80
            ? "Excellent work! You're making great progress!"
            : accuracyPercentage !== undefined && accuracyPercentage >= 60
            ? "Good effort! Keep practicing to improve."
            : "Keep going! Regular practice is the key to mastery."}
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
