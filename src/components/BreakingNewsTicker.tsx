import React, { useState, useEffect } from 'react';
import { Flame, ChevronRight, ChevronLeft } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface BreakingNewsTickerProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  articles,
  onSelectArticle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter strictly for breaking items
  const breakingList = articles.filter((a) => a.isBreaking);

  // If no breaking items exist, return null to avoid false breaking news claim
  if (breakingList.length === 0) {
    return null;
  }

  // Auto-cycle every 6 seconds
  useEffect(() => {
    if (breakingList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingList.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [breakingList.length]);

  const activeArticle = breakingList[currentIndex % breakingList.length];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + breakingList.length) % breakingList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % breakingList.length);
  };

  return (
    <div className="bg-red-950/90 text-white border-y border-red-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-2.5 sm:gap-4">
        {/* Breaking Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white font-black text-xs uppercase tracking-wider shrink-0 shadow-xs animate-pulse">
          <Flame className="w-3.5 h-3.5 fill-white" />
          <span className="font-devanagari-heading font-bold">ब्रेकिंग</span>
        </div>

        {/* Headline Ticker */}
        <div
          onClick={() => onSelectArticle(activeArticle)}
          className="flex-1 min-w-0 cursor-pointer group flex items-center gap-2"
        >
          <p className="text-xs sm:text-sm font-medium font-devanagari-heading text-red-50 group-hover:text-amber-300 transition-colors truncate">
            {activeArticle.title}
          </p>
        </div>

        {/* Counter & Controls (if more than 1) */}
        {breakingList.length > 1 && (
          <div className="flex items-center gap-1 shrink-0 text-red-200 text-xs">
            <span className="tabular-nums font-mono text-[11px] hidden sm:inline">
              {currentIndex + 1}/{breakingList.length}
            </span>
            <button
              onClick={handlePrev}
              className="p-1 rounded hover:bg-white/10 active:scale-95 transition-all"
              aria-label="पिछली ब्रेकिंग खबर"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded hover:bg-white/10 active:scale-95 transition-all"
              aria-label="अगली ब्रेकिंग खबर"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
