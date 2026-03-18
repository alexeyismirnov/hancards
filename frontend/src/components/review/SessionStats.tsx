import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

interface SessionStatsProps {
  totalCards: number;
  correctCount: number;
  incorrectCount: number;
  duration?: number; // in seconds
}

export function SessionStats({
  totalCards,
  correctCount,
  incorrectCount,
  duration,
}: SessionStatsProps) {
  // Calculate accuracy percentage
  const accuracyPercentage = totalCards > 0 
    ? Math.round((correctCount / totalCards) * 100) 
    : 0;

  // Format duration as mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate average time per card
  const avgTimePerCard = duration && totalCards > 0 
    ? Math.round(duration / totalCards) 
    : undefined;

  // Determine performance message based on accuracy
  const getPerformanceMessage = (): { message: string; emoji: string } => {
    if (accuracyPercentage >= 90) {
      return { message: "Outstanding! You've mastered this material!", emoji: "🌟" };
    } else if (accuracyPercentage >= 80) {
      return { message: "Excellent work! Keep up the great progress!", emoji: "🎉" };
    } else if (accuracyPercentage >= 70) {
      return { message: "Good job! You're making solid progress!", emoji: "👍" };
    } else if (accuracyPercentage >= 60) {
      return { message: "Nice effort! Keep practicing to improve.", emoji: "💪" };
    } else if (accuracyPercentage >= 50) {
      return { message: "You're learning! Review the cards again.", emoji: "📚" };
    } else {
      return { message: "Keep going! Regular practice builds mastery.", emoji: "🌱" };
    }
  };

  const { message, emoji } = getPerformanceMessage();

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Stats Card */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        {/* Accuracy Display with Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Accuracy</span>
            <span className="text-2xl font-bold text-primary">{accuracyPercentage}%</span>
          </div>
          {/* Visual Progress Bar */}
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500 ease-out rounded-full"
              style={{ 
                width: `${accuracyPercentage}%`,
                background: accuracyPercentage >= 80 
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
                  : accuracyPercentage >= 60 
                    ? 'linear-gradient(90deg, #eab308, #ca8a04)'
                    : 'linear-gradient(90deg, #ef4444, #dc2626)'
              }}
            />
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Correct Count */}
          <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
              <CheckCircle className="h-5 w-5" />
              <span className="text-3xl font-bold">{correctCount}</span>
            </div>
            <span className="text-sm text-muted-foreground">Correct</span>
            <span className="text-xs text-green-600 dark:text-green-400">(Good + Easy)</span>
          </div>

          {/* Incorrect Count */}
          <div className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
              <XCircle className="h-5 w-5" />
              <span className="text-3xl font-bold">{incorrectCount}</span>
            </div>
            <span className="text-sm text-muted-foreground">Needs Review</span>
            <span className="text-xs text-red-600 dark:text-red-400">(Again + Hard)</span>
          </div>
        </div>

        {/* Session Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 pb-4 border-b">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{totalCards} cards reviewed</span>
            </div>
          </div>
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(duration)}</span>
            </div>
          )}
        </div>

        {/* Average Time Per Card */}
        {avgTimePerCard !== undefined && (
          <div className="text-center text-sm text-muted-foreground mb-4">
            Average: {avgTimePerCard}s per card
          </div>
        )}

        {/* Performance Message */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl">{emoji}</span>
            <span className="text-lg font-semibold">{message}</span>
            <span className="text-2xl">{emoji}</span>
          </div>
        </div>
      </div>
    </div>
  );
}