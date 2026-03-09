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
import { Deck } from '@/services/deck.service';

interface EditDeckModalProps {
  deck: Deck | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, name: string) => Promise<void>;
  isLoading?: boolean;
}

export function EditDeckModal({
  deck,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: EditDeckModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (deck) {
      setName(deck.name);
    }
  }, [deck]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deck) return;

    if (!name.trim()) {
      setError('Deck name is required');
      return;
    }

    try {
      await onSubmit(deck.id, name.trim());
      setError('');
      onOpenChange(false);
    } catch (err) {
      setError('Failed to update deck. Please try again.');
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
          <DialogTitle>Rename Deck</DialogTitle>
          <DialogDescription>
            Enter a new name for your deck.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="deck-name" className="sr-only">
              Deck Name
            </Label>
            <Input
              id="deck-name"
              placeholder="e.g., HSK 1 Vocabulary"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
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
