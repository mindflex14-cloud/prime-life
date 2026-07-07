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

  const validImages = (images || []).filter(img => img && typeof img === 'string' && img.trim() !== '');
  const resolvedFullImages = (fullImages && fullImages.length > 0 ? fullImages : validImages)
    .filter(img => img && typeof img === 'string' && img.trim() !== '');

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
  }, [isLightboxOpen, validImages.length]);

  if (validImages.length === 0) return null;

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
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

  const currentImage = validImages[currentIndex];
  const currentFullImage = resolvedFullImages[currentIndex];

  return (
    <>
      <div 
        className="relative w-full h-full overflow-hidden select-none group cursor-pointer"
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={currentIndex}
            src={currentImage}
            alt={`${alt} (Photo ${currentIndex + 1}/${validImages.length})`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className={`${className} touch-pan-y`}
            referrerPolicy="no-referrer"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(e, info) => {
              const swipeThreshold = 50;
              if (info.offset.x < -swipeThreshold) {
                handleNext();
              } else if (info.offset.x > swipeThreshold) {
                handlePrev();
              }
            }}
            onTap={() => setIsLightboxOpen(true)}
            onError={(e) => {
              // Safe fallback on load error
              e.currentTarget.style.display = 'none';
              if (onError) onError();
            }}
          />
        </AnimatePresence>

        {/* Slide overlay controls (only show if there is more than 1 image) */}
        {validImages.length > 1 && (
          <>
            {/* Navigation Arrows */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-white/10 text-cyan-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 cursor-pointer z-15 flex items-center justify-center hover:scale-105 active:scale-95"
              title="Previous Image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-white/10 text-cyan-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 cursor-pointer z-15 flex items-center justify-center hover:scale-105 active:scale-95"
              title="Next Image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pagination Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-y-0 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-xs px-2.5 py-1 rounded-full z-15 border border-white/5">
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDotClick(idx, e)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentIndex 
                      ? 'bg-cyan-400 w-3' 
                      : 'bg-white/40 hover:bg-white'
                  }`}
                  title={`Go to image ${idx + 1}`}
                />
              ))}
            </div>

            {/* Mini Counter Overlay */}
            <div className="absolute top-3 right-3 px-2.5 py-0.5 bg-slate-950/80 backdrop-blur-xs rounded-lg text-[9px] font-mono font-bold text-cyan-400 tracking-wider border border-white/10 uppercase z-15">
              {currentIndex + 1} / {validImages.length}
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
              {validImages.length > 1 && (
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
                Resolution Loaded: High Definition • Card Image {currentIndex + 1} of {validImages.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
