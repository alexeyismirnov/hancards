import { useState, useEffect } from 'react';
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
  const [character, setCharacter] = useState('');
  const [pinyin, setPinyin] = useState('');
  const [meaning, setMeaning] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (card) {
      setCharacter(card.character);
      setPinyin(card.pinyin);
      setMeaning(card.meaning);
    }
  }, [card]);

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
      onOpenChange(false);
    } catch (err) {
      setError('Failed to update card. Please try again.');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
          <DialogDescription>
            Update the character, pinyin, or meaning for this flashcard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-character">Character</Label>
              <Input
                id="edit-character"
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
              <Label htmlFor="edit-pinyin">Pinyin</Label>
              <Input
                id="edit-pinyin"
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
              <Label htmlFor="edit-meaning">Meaning</Label>
              <Input
                id="edit-meaning"
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
