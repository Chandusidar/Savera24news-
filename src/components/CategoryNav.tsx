import React, { useRef, useEffect } from 'react';
import { APP_CATEGORIES, CategoryItem } from '../types/news';

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected button into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeBtn = scrollRef.current.querySelector('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-[92px] sm:top-[98px] z-20 shadow-xs">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar"
        >
          {APP_CATEGORIES.map((cat: CategoryItem) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                data-active={isActive}
                onClick={() => onSelectCategory(cat.id)}
                className={`min-h-[38px] px-3.5 py-1.5 text-xs sm:text-sm font-devanagari-heading font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-red-600 hover:bg-slate-100'
                }`}
              >
                {cat.hindiName}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
