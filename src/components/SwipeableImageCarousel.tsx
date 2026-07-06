import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize, X } from 'lucide-react';

interface SwipeableImageCarouselProps {
  images: string[];
  fullImages?: string[]; // Optional high-resolution images
  alt: string;
  className?: string;
  onError?: () => void;
}

export const SwipeableImageCarousel: React.FC<SwipeableImageCarouselProps> = ({
  images,
  fullImages,
  alt,
  className = "w-full h-full object-cover",
  onError
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const mouseStartXRef = useRef<number | null>(null);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  if (!images || images.length === 0) return null;

  const resolvedFullImages = fullImages && fullImages.length > 0 ? fullImages : images;

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
  const currentFullImage = resolvedFullImages[currentIndex];

  return (
    <>
      <div 
        className="relative w-full h-full overflow-hidden select-none group cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={() => setIsLightboxOpen(true)}
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

        {/* Zoom Overlay on Hover */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
          <div className="p-3 bg-slate-950/80 rounded-full text-white shadow-lg border border-white/10 flex items-center gap-1.5 backdrop-blur-xs transform scale-90 group-hover:scale-100 transition-transform">
            <Maximize className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1">Expand Detail</span>
          </div>
        </div>

        {/* Slide overlay controls (only show if there is more than 1 image) */}
        {images.length > 1 && (
          <>
            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-15"
              title="Previous Image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-15"
              title="Next Image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pagination Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-y-0 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/40 backdrop-blur-xs px-2.5 py-1 rounded-full z-15">
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
            <div className="absolute top-3 right-3 px-2 py-0.5 bg-slate-950/70 backdrop-blur-xs rounded-md text-[9px] font-mono font-bold text-white tracking-wider border border-white/5 uppercase z-15">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* STUNNING LIGHTBOX MODAL */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-4 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors cursor-pointer z-50 border border-white/10"
              title="Close View"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Main Lightbox Content */}
            <div className="relative max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={currentIndex}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                src={currentFullImage}
                alt={`${alt} Full`}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />

              {/* Lightbox Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute -left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all cursor-pointer border border-white/5 hover:scale-105"
                    title="Previous"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute -right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all cursor-pointer border border-white/5 hover:scale-105"
                    title="Next"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Panel */}
            <div className="mt-4 text-center text-white/80 z-10 space-y-1 select-none">
              <h4 className="text-sm font-bold font-mono tracking-wide uppercase text-cyan-400">{alt}</h4>
              <p className="text-xs font-mono text-slate-400">
                Resolution Loaded: High Definition • Card Image {currentIndex + 1} of {images.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
