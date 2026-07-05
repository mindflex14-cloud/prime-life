import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  onError?: () => void;
}

export const SwipeableImageCarousel: React.FC<SwipeableImageCarouselProps> = ({
  images,
  alt,
  className = "w-full h-full object-cover",
  onError
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const touchStartXRef = useRef<number | null>(null);
  const mouseStartXRef = useRef<number | null>(null);

  if (!images || images.length === 0) return null;

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const threshold = 50; // min distance for swipe
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  // Mouse Swipe Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartXRef.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartXRef.current === null) return;
    const diffX = mouseStartXRef.current - e.clientX;
    const threshold = 50;
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    mouseStartXRef.current = null;
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const currentImage = images[currentIndex];

  return (
    <div 
      className="relative w-full h-full overflow-hidden select-none group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={currentIndex}
          src={currentImage}
          alt={`${alt} (Photo ${currentIndex + 1}/${images.length})`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={className}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Safe fallback on load error
            e.currentTarget.style.display = 'none';
            if (onError) onError();
          }}
        />
      </AnimatePresence>

      {/* Slide overlay controls (only show if there is more than 1 image) */}
      {images.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            title="Previous Image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            title="Next Image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-y-0 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/40 backdrop-blur-xs px-2.5 py-1 rounded-full z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleDotClick(idx, e)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'bg-cyan-400 w-3' 
                    : 'bg-white/60 hover:bg-white'
                }`}
                title={`Go to image ${idx + 1}`}
              />
            ))}
          </div>

          {/* Mini Counter Overlay */}
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-950/70 backdrop-blur-xs rounded-md text-[9px] font-mono font-bold text-white tracking-wider border border-white/5 uppercase z-10">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};
