'use client';

import { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goPrev, goNext]);

  if (!images.length) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal container — NOT full screen */}
      <div
        className="relative z-10 flex flex-col items-center max-w-3xl w-[90vw] max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-lg transition-all hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="relative w-full flex items-center justify-center bg-black/30 rounded-2xl overflow-hidden">
          <img
            src={images[currentIndex]}
            alt={`ภาพบรรยากาศในที่ทำงาน ${currentIndex + 1}`}
            className="max-w-full max-h-[70vh] object-contain rounded-2xl select-none"
            draggable={false}
          />

          {/* Prev button */}
          {images.length > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md transition-all hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md transition-all hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Counter / dots */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 mt-4">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
            <span className="ml-3 text-white/80 text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
