import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FlipHorizontal, X } from 'lucide-react';

interface ReviewControlsProps {
  currentIndex: number;
  totalCards: number;
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onExit: () => void;
}

export function ReviewControls({
  currentIndex,
  totalCards,
  isFlipped,
  onFlip,
  onNext,
  onPrevious,
  onExit,
}: ReviewControlsProps) {
  const isFirstCard = currentIndex === 0;
  const isLastCard = currentIndex === totalCards - 1;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Show Answer / Flip Button */}
      {!isFlipped && (
        <Button
          onClick={onFlip}
          className="w-full h-14 text-lg"
          size="lg"
        >
          <FlipHorizontal className="h-5 w-5 mr-2" />
          Show Answer
        </Button>
      )}

      {/* Navigation Buttons */}
      {isFlipped && (
        <div className="flex items-center justify-between gap-4">
          {/* Previous Button */}
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstCard}
            className="flex-1 h-12"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </Button>

          {/* Next Button */}
          <Button
            onClick={onNext}
            className="flex-1 h-12"
          >
            {isLastCard ? 'Finish' : 'Next'}
            {!isLastCard && <ChevronRight className="h-5 w-5 ml-1" />}
          </Button>
        </div>
      )}

      {/* Exit Button */}
      <div className="flex justify-center pt-2">
        <Button
          variant="ghost"
          onClick={onExit}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-2" />
          Exit Review
        </Button>
      </div>
    </div>
  );
}
