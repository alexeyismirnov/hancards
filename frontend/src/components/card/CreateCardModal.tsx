import { useState } from 'react';
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
  const [character, setCharacter] = useState('');
  const [pinyin, setPinyin] = useState('');
  const [meaning, setMeaning] = useState('');
  const [error, setError] = useState('');

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
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>
            Enter the character, pinyin, and meaning for your flashcard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="character">Character</Label>
              <Input
                id="character"
                placeholder="汉字"
                value={character}
                onChange={(e) => {
                  setCharacter(e.target.value);
                  setError('');
                }}
                disabled={isLoading}
                autoFocus
              />
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
