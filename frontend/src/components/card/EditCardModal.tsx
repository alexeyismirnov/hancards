import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/services/card.service';
import { CharacterInput } from '@/components/dictionary/CharacterInput';
import { DictionarySuggestions } from '@/components/dictionary/DictionarySuggestions';
import { DictionaryEntry } from '@/services/dictionary.service';
import { useAuthContext } from '@/contexts/AuthContext';

interface EditCardModalProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, character: string, pinyin: string, meaning: string) => Promise<void>;
  isLoading?: boolean;
}

export function EditCardModal({
  card,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: EditCardModalProps) {
  const { user } = useAuthContext();
  const [character, setCharacter] = useState('');
  const [pinyin, setPinyin] = useState('');
  const [meaning, setMeaning] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<DictionaryEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const charVariant = user?.charVariant || 'simplified';

  useEffect(() => {
    if (card) {
      setCharacter(card.character);
      setPinyin(card.pinyin);
      setMeaning(card.meaning);
    }
  }, [card]);

  const handleSuggestionsFound = useCallback((entries: DictionaryEntry[]) => {
    setSuggestions(entries);
    setShowSuggestions(entries.length > 0);
  }, []);

  const handleSelectSuggestion = useCallback((entry: DictionaryEntry) => {
    // Auto-fill fields with selected suggestion
    // Use the character variant based on user preference
    const selectedChar = charVariant === 'traditional' ? entry.traditional : entry.simplified;
    setCharacter(selectedChar);
    setPinyin(entry.pinyin);
    setMeaning(entry.definitions[0] || '');
    setShowSuggestions(false);
    setSuggestions([]);
    setError('');
  }, [charVariant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!card) return;

    if (!character.trim()) {
      setError('Character is required');
      return;
    }
    if (!pinyin.trim()) {
      setError('Pinyin is required');
      return;
    }
    if (!meaning.trim()) {
      setError('Meaning is required');
      return;
    }

    try {
      await onSubmit(card.id, character.trim(), pinyin.trim(), meaning.trim());
      setError('');
      setSuggestions([]);
      setShowSuggestions(false);
      onOpenChange(false);
    } catch (err) {
      setError('Failed to update card. Please try again.');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
    onOpenChange(newOpen);
  };

  // Hide suggestions when clicking outside or on other inputs
  const handlePinyinFocus = () => setShowSuggestions(false);
  const handleMeaningFocus = () => setShowSuggestions(false);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the character, pinyin, or meaning for this flashcard.
            Dictionary suggestions will appear automatically for Chinese characters.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2 relative">
              <CharacterInput
                value={character}
                onChange={setCharacter}
                onSuggestionsFound={handleSuggestionsFound}
                onError={(err) => err && console.error('Dictionary lookup error:', err)}
                disabled={isLoading}
                id="edit-character"
                label="Character"
                placeholder="汉字"
                autoFocus
                skipInitialLookup
                variant={charVariant}
              />
              {showSuggestions && (
                <DictionarySuggestions
                  entries={suggestions}
                  onSelect={handleSelectSuggestion}
                  variant={charVariant}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pinyin">Pinyin</Label>
              <Input
                id="edit-pinyin"
                placeholder="hàn zì"
                value={pinyin}
                onChange={(e) => {
                  setPinyin(e.target.value);
                  setError('');
                }}
                onFocus={handlePinyinFocus}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-meaning">Meaning</Label>
              <Input
                id="edit-meaning"
                placeholder="Chinese character"
                value={meaning}
                onChange={(e) => {
                  setMeaning(e.target.value);
                  setError('');
                }}
                onFocus={handleMeaningFocus}
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
