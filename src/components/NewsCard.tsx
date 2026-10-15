import React, { useState } from 'react';
import { Share2, Clock, Newspaper, PlayCircle, ExternalLink } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface NewsCardProps {
  article: NewsArticle;
  onRead: (article: NewsArticle) => void;
  featured?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onRead,
  featured = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.originalUrl
        });
      } catch {
        // User dismiss
      }
    } else {
      navigator.clipboard.writeText(`${article.title}\n\n${article.originalUrl}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const primaryCategory = article.categories[0] || 'सवेरा समाचार';

  return (
    <article
      onClick={() => onRead(article)}
      className={`group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer ${
        featured ? 'md:col-span-2 md:grid md:grid-cols-2 md:items-stretch' : ''
      }`}
    >
      {/* Article Image Container */}
      <div className={`relative overflow-hidden bg-slate-100 ${featured ? 'aspect-16/10 md:aspect-auto' : 'aspect-16/10'}`}>
        {article.imageUrl && !imageError ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full min-h-[180px] flex flex-col items-center justify-center p-6 bg-linear-to-br from-red-50 to-slate-100 text-slate-400">
            <Newspaper className="w-10 h-10 text-red-300 mb-2" />
            <span className="text-xs font-devanagari-heading text-slate-500 font-medium">सवेरा 24 न्यूज़</span>
          </div>
        )}

        {/* Video Badge Overlay if article contains video */}
        {article.videoData && (
          <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 shadow-sm">
            <PlayCircle className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>वीडियो</span>
          </div>
        )}

        {/* Breaking Ribbon */}
        {article.isBreaking && (
          <div className="absolute top-2.5 left-2.5 bg-red-600 text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold font-devanagari-heading tracking-wide uppercase shadow-sm">
            ब्रेकिंग
          </div>
        )}
      </div>

      {/* Article Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Metadata: Unboxed Text with Separators */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
            <span className="text-red-600 font-semibold font-devanagari-heading">
              {primaryCategory}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{article.relativeTime || article.publishedFormatted}</span>
            </span>
          </div>

          {/* Headline */}
          <h2 className={`font-devanagari-heading font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2.5 ${
            featured ? 'text-lg sm:text-xl md:text-2xl' : 'text-base sm:text-lg'
          }`}>
            {article.title}
          </h2>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {article.summary}
          </p>
        </div>

        {/* Action Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <button
            type="button"
            className="text-xs sm:text-sm font-semibold font-devanagari-heading text-red-600 group-hover:text-red-700 flex items-center gap-1"
          >
            <span>पूरा पढ़ें</span>
            <span aria-hidden="true">→</span>
          </button>

          <div className="flex items-center gap-1">
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 active:scale-95 transition-all"
              title="मूल Blogger लेख खोलें"
              aria-label="मूल Blogger लेख खोलें"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="शेयर करें"
              title="शेयर करें"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {isCopied && (
              <span className="text-[11px] text-emerald-600 font-medium">कॉपी हुआ!</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
