import { CardWithProgress } from '@/types/review';
import { Calendar, Clock, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface NextReviewForecastProps {
  cards: CardWithProgress[];
}

interface ForecastGroup {
  label: string;
  count: number;
  urgency: 'overdue' | 'today' | 'tomorrow' | 'thisWeek' | 'later';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function NextReviewForecast({ cards }: NextReviewForecastProps) {
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  
  const tomorrowEnd = new Date(now);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  tomorrowEnd.setHours(23, 59, 59, 999);
  
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);

  // Group cards by next review date
  const groups: Record<string, CardWithProgress[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
    new: [],
  };

  cards.forEach((card) => {
    if (!card.progress) {
      groups.new.push(card);
      return;
    }

    const nextReviewDate = new Date(card.progress.nextReviewDate);
    
    if (nextReviewDate <= now) {
      groups.overdue.push(card);
    } else if (nextReviewDate <= todayEnd) {
      groups.today.push(card);
    } else if (nextReviewDate <= tomorrowEnd) {
      groups.tomorrow.push(card);
    } else if (nextReviewDate <= weekEnd) {
      groups.thisWeek.push(card);
    } else {
      groups.later.push(card);
    }
  });

  // Define forecast groups for display
  const forecastGroups: ForecastGroup[] = [
    {
      label: 'Overdue',
      count: groups.overdue.length,
      urgency: 'overdue',
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-900',
    },
    {
      label: 'Today',
      count: groups.today.length,
      urgency: 'today',
      icon: <Clock className="h-4 w-4" />,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200 dark:border-orange-900',
    },
    {
      label: 'Tomorrow',
      count: groups.tomorrow.length,
      urgency: 'tomorrow',
      icon: <Calendar className="h-4 w-4" />,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderColor: 'border-yellow-200 dark:border-yellow-900',
    },
    {
      label: 'This Week',
      count: groups.thisWeek.length,
      urgency: 'thisWeek',
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-900',
    },
    {
      label: 'Later',
      count: groups.later.length,
      urgency: 'later',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-900',
    },
  ];

  // Calculate totals
  const totalDue = groups.overdue.length + groups.today.length + groups.tomorrow.length + groups.thisWeek.length;
  const totalNew = groups.new.length;

  // Get most urgent group with cards
  const getMostUrgentGroup = (): ForecastGroup | null => {
    for (const group of forecastGroups) {
      if (group.count > 0) {
        return group;
      }
    }
    return null;
  };

  const mostUrgent = getMostUrgentGroup();

  return (
    <div className="w-full">
      {/* Summary Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Review Schedule</h3>
        <div className="flex items-center gap-3 text-sm">
          {totalDue > 0 && (
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              {totalDue} due soon
            </span>
          )}
          {totalNew > 0 && (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {totalNew} new
            </span>
          )}
          {totalDue === 0 && totalNew === 0 && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              All caught up!
            </span>
          )}
        </div>
      </div>

      {/* Urgency Alert */}
      {mostUrgent && mostUrgent.urgency === 'overdue' && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">
              {groups.overdue.length} card{groups.overdue.length !== 1 ? 's' : ''} overdue for review
            </span>
          </div>
        </div>
      )}

      {/* Forecast Groups */}
      <div className="space-y-2">
        {forecastGroups.map((group) => (
          <div
            key={group.urgency}
            className={`flex items-center justify-between p-3 rounded-lg border ${group.bgColor} ${group.borderColor} ${
              group.count === 0 ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={group.color}>{group.icon}</span>
              <span className="font-medium">{group.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${group.color}`}>
                {group.count}
              </span>
              <span className="text-sm text-muted-foreground">
                card{group.count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Cards Section */}
      {totalNew > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">New cards (not yet learned)</span>
            </div>
            <span className="font-semibold">{totalNew}</span>
          </div>
        </div>
      )}

      {/* Visual Bar Chart */}
      {totalDue + totalNew > 0 && (
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">Distribution</div>
          <div className="h-2 rounded-full overflow-hidden flex bg-muted">
            {forecastGroups.map((group) => (
              group.count > 0 && (
                <div
                  key={group.urgency}
                  className={`h-full transition-all duration-300 ${
                    group.urgency === 'overdue' ? 'bg-red-500' :
                    group.urgency === 'today' ? 'bg-orange-500' :
                    group.urgency === 'tomorrow' ? 'bg-yellow-500' :
                    group.urgency === 'thisWeek' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}
                  style={{ 
                    width: `${(group.count / (totalDue + totalNew)) * 100}%` 
                  }}
                  title={`${group.label}: ${group.count} cards`}
                />
              ))
            )}
            {totalNew > 0 && (
              <div
                className="h-full bg-gray-400 transition-all duration-300"
                style={{ 
                  width: `${(totalNew / (totalDue + totalNew)) * 100}%` 
                }}
                title={`New: ${totalNew} cards`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}