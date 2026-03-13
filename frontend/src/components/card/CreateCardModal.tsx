import { useState, useCallback } from 'react';
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
import { CharacterInput } from '@/components/dictionary/CharacterInput';
import { DictionarySuggestions } from '@/components/dictionary/DictionarySuggestions';
import { DictionaryEntry } from '@/services/dictionary.service';
import { useAuthContext } from '@/contexts/AuthContext';

interface CreateCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (character: string, pinyin: string, meaning: string) => Promise<void>;
  isLoading?: boolean;
}

export function CreateCardModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateCardModalProps) {
  const { user } = useAuthContext();
  const [character, setCharacter] = useState('');
  const [pinyin, setPinyin] = useState('');
  const [meaning, setMeaning] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<DictionaryEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const charVariant = user?.charVariant || 'simplified';

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
      await onSubmit(character.trim(), pinyin.trim(), meaning.trim());
      setCharacter('');
      setPinyin('');
      setMeaning('');
      setError('');
      setSuggestions([]);
      setShowSuggestions(false);
      onOpenChange(false);
    } catch (err) {
      setError('Failed to create card. Please try again.');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCharacter('');
      setPinyin('');
      setMeaning('');
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
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>
            Enter the character, pinyin, and meaning for your flashcard.
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
                id="character"
                label="Character"
                placeholder="汉字"
                autoFocus
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
              <Label htmlFor="pinyin">Pinyin</Label>
              <Input
                id="pinyin"
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
              <Label htmlFor="meaning">Meaning</Label>
              <Input
                id="meaning"
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
              {isLoading ? 'Adding...' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
