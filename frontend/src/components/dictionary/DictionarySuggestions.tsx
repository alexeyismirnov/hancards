import { DictionaryEntry } from '@/services/dictionary.service';
import { CharacterVariant } from '@/services/auth.service';
import { getPinyinToneColors } from '@/lib/toneColors';
import { cn } from '@/lib/utils';

interface DictionarySuggestionsProps {
  entries: DictionaryEntry[];
  onSelect: (entry: DictionaryEntry) => void;
  className?: string;
  variant?: CharacterVariant;
}

/**
 * Dropdown component that displays dictionary suggestions
 * Shows: character (simplified/traditional if different), pinyin with tone colors, 
 * first definition, HSK level badge
 */
export function DictionarySuggestions({
  entries,
  onSelect,
  className,
  variant = 'simplified',
}: DictionarySuggestionsProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md overflow-hidden',
        'max-h-64 overflow-y-auto',
        className
      )}
    >
      <ul className="py-1">
        {entries.map((entry) => (
          <DictionarySuggestionItem
            key={entry.id}
            entry={entry}
            onSelect={onSelect}
            variant={variant}
          />
        ))}
      </ul>
    </div>
  );
}

interface DictionarySuggestionItemProps {
  entry: DictionaryEntry;
  onSelect: (entry: DictionaryEntry) => void;
  variant: CharacterVariant;
}

function DictionarySuggestionItem({ entry, onSelect, variant }: DictionarySuggestionItemProps) {
  const showBoth = entry.traditional !== entry.simplified;
  const pinyinWithColors = getPinyinToneColors(entry.pinyin);
  
  // Determine which character to show as primary based on variant preference
  const primaryChar = variant === 'traditional' ? entry.traditional : entry.simplified;
  const secondaryChar = variant === 'traditional' ? entry.simplified : entry.traditional;
  
  return (
    <li
      className={cn(
        'px-3 py-2 cursor-pointer hover:bg-accent transition-colors',
        'border-b last:border-b-0'
      )}
      onClick={() => onSelect(entry)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Character row */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-medium">{primaryChar}</span>
            {showBoth && (
              <span className="text-sm text-muted-foreground">
                ({secondaryChar})
              </span>
            )}
            {entry.hskLevel && (
              <HSKBadge level={entry.hskLevel} />
            )}
          </div>
          
          {/* Pinyin with tone colors */}
          <div className="mt-0.5 flex items-center gap-1">
            {pinyinWithColors.map((item, index) => (
              <span key={index} className={cn('text-sm', item.toneColor)}>
                {item.syllable}
              </span>
            ))}
          </div>
          
          {/* First definition */}
          <p className="mt-0.5 text-sm text-muted-foreground truncate">
            {entry.definitions[0] || 'No definition'}
          </p>
        </div>
      </div>
    </li>
  );
}

interface HSKBadgeProps {
  level: number;
}

function HSKBadge({ level }: HSKBadgeProps) {
  // HSK level colors (gradient from easier to harder)
  const getBadgeColor = (lvl: number): string => {
    if (lvl <= 2) return 'bg-green-100 text-green-800 border-green-200';
    if (lvl <= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border',
        getBadgeColor(level)
      )}
    >
      HSK {level}
    </span>
  );
}
