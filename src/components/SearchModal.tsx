import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Newspaper, ArrowRight } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onSearchServer: (query: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle,
  onSearchServer
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed
    ? articles.filter(
        (art) =>
          art.title.toLowerCase().includes(trimmed) ||
          art.summary.toLowerCase().includes(trimmed) ||
          art.categories.some((c) => c.toLowerCase().includes(trimmed))
      )
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearchServer(query.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="समाचार, स्थान या विषय खोजें (उदा. महासमुंद, पिथौरा, खेल)..."
            className="flex-1 bg-transparent text-sm sm:text-base font-devanagari-heading text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            रद्द करें
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-400 shrink-0">सुझाव:</span>
          {['महासमुंद', 'पिथौरा', 'बसना', 'सरायपाली', 'छत्तीसगढ़', 'ब्रेकिंग', 'अपराध'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-600 shrink-0 whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {trimmed && filtered.length > 0 ? (
            filtered.map((art) => (
              <div
                key={art.id}
                onClick={() => {
                  onSelectArticle(art);
                  onClose();
                }}
                className="p-3 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50/40 cursor-pointer transition-all flex gap-3 group"
              >
                {art.imageUrl ? (
                  <img
                    src={art.imageUrl}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <Newspaper className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-red-600 uppercase font-devanagari-heading block">
                    {art.categories[0] || 'समाचार'}
                  </span>
                  <h4 className="font-devanagari-heading font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-red-700 line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {art.relativeTime || art.publishedFormatted}
                  </span>
                </div>
              </div>
            ))
          ) : trimmed ? (
            <div className="py-12 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-devanagari-heading font-bold text-slate-800 text-sm">
                "{query}" से संबंधित कोई समाचार नहीं मिला
              </p>
              <button
                onClick={() => {
                  onSearchServer(query.trim());
                  onClose();
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold"
              >
                <span>ब्लॉगर सर्वर पर खोजें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              कृपया खोजने के लिए कोई शब्द टाइप करें
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
