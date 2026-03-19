import { useState } from 'react';
import { Card } from '@/services/card.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RotateCcw } from 'lucide-react';

interface CardPreviewModalProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardPreviewModal({ card, open, onOpenChange }: CardPreviewModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset flip state when closing
      setIsFlipped(false);
    }
    onOpenChange(newOpen);
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Card Preview</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          {/* Flashcard */}
          <div className="w-full max-w-sm mx-auto flashcard-container">
            <div
              onClick={handleFlip}
              className="flashcard relative cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front of card - Character */}
              <div
                className="w-full aspect-[3/4] rounded-2xl shadow-lg bg-card card-ink-wash flex flex-col items-center justify-center p-8"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-center">
                  <span className="text-8xl md:text-9xl font-character text-primary select-none">
                    {card.character}
                  </span>
                </div>
                <p className="absolute bottom-4 text-sm text-muted-foreground">
                  Tap to reveal
                </p>
              </div>

              {/* Back of card - Pinyin and Meaning */}
              <div
                className="absolute inset-0 w-full aspect-[3/4] rounded-2xl shadow-lg bg-primary text-primary-foreground flex flex-col items-center justify-center p-8"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {/* Character (smaller) */}
                <div className="mb-6">
                  <span className="text-5xl font-character opacity-90">
                    {card.character}
                  </span>
                </div>

                {/* Pinyin */}
                <div className="mb-4">
                  <p className="text-2xl font-medium italic">
                    {card.pinyin}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-16 h-0.5 bg-primary-foreground/30 rounded mb-4" />

                {/* Meaning */}
                <div className="text-center">
                  <p className="text-xl">
                    {card.meaning}
                  </p>
                </div>

                {/* Flip back hint */}
                <div className="absolute bottom-4 flex items-center text-sm opacity-70">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Tap to flip back
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Click the card to flip between character and meaning
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}