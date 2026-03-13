import { useState, useCallback, useRef, useEffect } from 'react';
import { DictionaryEntry, lookupCharacter } from '@/services/dictionary.service';

/**
 * Regex to detect Chinese characters (CJK Unified Ideographs)
 */
const CHINESE_CHARACTER_REGEX = /[\u4e00-\u9fff]/;

interface UseDictionaryLookupResult {
  entries: DictionaryEntry[];
  isLoading: boolean;
  error: string | null;
  lookup: (character: string, variant?: 'simplified' | 'traditional') => void;
  clearEntries: () => void;
}

/**
 * Custom hook for dictionary lookup with debouncing
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 * @returns Object with entries, isLoading, error, lookup function, and clearEntries function
 */
export function useDictionaryLookup(debounceMs: number = 300): UseDictionaryLookupResult {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
    setError(null);
  }, []);

  const lookup = useCallback((character: string, variant?: 'simplified' | 'traditional') => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Abort any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Validate character is a Chinese character
    const trimmedChar = character.trim();
    if (!trimmedChar || !CHINESE_CHARACTER_REGEX.test(trimmedChar)) {
      setEntries([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Set up debounced lookup
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        abortControllerRef.current = new AbortController();
        const results = await lookupCharacter(trimmedChar, variant);
        setEntries(results);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        setError('Failed to lookup character. Please try again.');
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, [debounceMs]);

  return {
    entries,
    isLoading,
    error,
    lookup,
    clearEntries,
  };
}
