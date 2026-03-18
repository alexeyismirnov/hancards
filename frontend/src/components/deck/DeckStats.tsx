import { useState, useEffect, useCallback } from 'react';
import { Loader2, BookOpen, GraduationCap, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { reviewService } from '@/services/review.service';
import { useAuthContext } from '@/contexts/AuthContext';
import type { DeckStats as DeckStatsType } from '@/types/review';

interface DeckStatsProps {
  deckId: string;
}

export function DeckStats({ deckId }: DeckStatsProps) {
  const { token } = useAuthContext();
  const [stats, setStats] = useState<DeckStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await reviewService.getDeckStats(deckId, token);
      setStats(response);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch deck stats:', err);
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  }, [deckId, token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-card border rounded-xl">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate learning progress percentage
  const learningProgress = stats.totalCards > 0 
    ? Math.round((stats.learnedCards / stats.totalCards) * 100) 
    : 0;

  // Determine ease factor quality
  const getEaseFactorQuality = (easeFactor: number): { label: string; color: string } => {
    if (easeFactor >= 2.5) {
      return { label: 'Excellent', color: 'text-green-600 dark:text-green-400' };
    } else if (easeFactor >= 2.3) {
      return { label: 'Good', color: 'text-blue-600 dark:text-blue-400' };
    } else if (easeFactor >= 2.0) {
      return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
    } else {
      return { label: 'Needs Work', color: 'text-orange-600 dark:text-orange-400' };
    }
  };

  const easeQuality = getEaseFactorQuality(stats.averageEaseFactor);

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Learning Progress</h3>
        <div className="text-sm text-muted-foreground">
          {stats.learnedCards} of {stats.totalCards} learned
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${learningProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{learningProgress}%</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Cards */}
        <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">Total Cards</span>
          </div>
          <span className="text-2xl font-bold">{stats.totalCards}</span>
        </div>

        {/* Learned Cards */}
        <div className="flex flex-col p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Learned</span>
          </div>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.learnedCards}
          </span>
        </div>

        {/* New Cards */}
        <div className="flex flex-col p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <GraduationCap className="h-4 w-4" />
            <span className="text-sm">New</span>
          </div>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.newCards}
          </span>
        </div>

        {/* Due Today */}
        <div className="flex flex-col p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-900">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Due Today</span>
          </div>
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.dueToday}
          </span>
        </div>

        {/* Due This Week */}
        <div className="flex flex-col p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-900">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Due This Week</span>
          </div>
          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.dueThisWeek}
          </span>
        </div>

        {/* Average Ease Factor */}
        <div className="flex flex-col p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Avg Ease Factor</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {stats.averageEaseFactor.toFixed(2)}
            </span>
            <span className={`text-sm ${easeQuality.color}`}>
              ({easeQuality.label})
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          {stats.dueToday > 0 ? (
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-4 w-4" />
              <span>{stats.dueToday} card{stats.dueToday !== 1 ? 's' : ''} due today</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>All caught up for today!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}