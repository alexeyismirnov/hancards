import { useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDictionaryLookup } from '@/hooks/useDictionaryLookup';
import { DictionaryEntry } from '@/services/dictionary.service';
import { CharacterVariant } from '@/services/auth.service';
import { Loader2 } from 'lucide-react';

interface CharacterInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionsFound: (entries: DictionaryEntry[]) => void;
  onError?: (error: string | null) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  variant?: CharacterVariant;
  /**
   * If true, skip the dictionary lookup for the initial value.
   * Use this when the input is pre-filled (e.g., in edit mode) to prevent
   * auto-suggest from triggering on existing data.
   */
  skipInitialLookup?: boolean;
}

/**
 * Input component for Chinese characters with dictionary auto-suggest
 * Triggers debounced lookup when a Chinese character is detected
 */
export function CharacterInput({
  value,
  onChange,
  onSuggestionsFound,
  onError,
  disabled = false,
  id = 'character',
  label = 'Character',
  placeholder = '汉字',
  autoFocus = false,
  variant = 'simplified',
  skipInitialLookup = false,
}: CharacterInputProps) {
  const { entries, isLoading, error, lookup, clearEntries } = useDictionaryLookup(300);
  
  // Track if the initial value has been processed (for skipInitialLookup)
  const initialLookupSkipped = useRef(false);

  // Handle value changes
  const handleChange = useCallback((newValue: string) => {
    onChange(newValue);
    
    // If the input is cleared, clear the suggestions
    if (!newValue.trim()) {
      clearEntries();
    }
  }, [onChange, clearEntries]);

  // Trigger lookup when value changes and contains a Chinese character
  useEffect(() => {
    // Skip the initial lookup if skipInitialLookup is true and we haven't processed yet
    if (skipInitialLookup && !initialLookupSkipped.current) {
      initialLookupSkipped.current = true;
      return;
    }
    
    if (value.trim()) {
      lookup(value, variant);
    }
  }, [value, variant, lookup, skipInitialLookup]);

  // Notify parent when suggestions are found
  useEffect(() => {
    if (entries.length > 0) {
      onSuggestionsFound(entries);
    }
  }, [entries, onSuggestionsFound]);

  // Notify parent of errors
  useEffect(() => {
    if (onError) {
      onError(error);
    }
  }, [error, onError]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          autoFocus={autoFocus}
          className={isLoading ? 'pr-10' : ''}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
