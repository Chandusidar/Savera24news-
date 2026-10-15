import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, ExternalLink, Clock, User, Type, Check, PlayCircle } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface ArticleReaderProps {
  article: NewsArticle;
  onBack: () => void;
  onSelectRelated?: (article: NewsArticle) => void;
  relatedArticles?: NewsArticle[];
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({
  article,
  onBack,
  onSelectRelated,
  relatedArticles = []
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isCopied, setIsCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: article.originalUrl
        });
      } catch {
        // Dismissed
      }
    } else {
      navigator.clipboard.writeText(`${article.title}\n\n${article.originalUrl}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg leading-relaxed';
      case 'xlarge':
        return 'text-xl leading-loose';
      default:
        return 'text-base leading-relaxed';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Top Sticky Reader Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Back Navigation */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 -ml-2 rounded-lg text-slate-700 hover:text-red-600 hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="वापस जाएं"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-devanagari-heading font-semibold text-sm">वापस</span>
          </button>

          {/* Reader Tools */}
          <div className="flex items-center gap-2">
            {/* Font size toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 rounded ${fontSize === 'normal' ? 'bg-white shadow-xs text-red-600' : 'text-slate-600'}`}
                title="सामान्य फ़ॉन्ट"
              >
                अ
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded ${fontSize === 'large' ? 'bg-white shadow-xs text-red-600' : 'text-slate-600'}`}
                title="बड़ा फ़ॉन्ट"
              >
                अ+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-1 rounded ${fontSize === 'xlarge' ? 'bg-white shadow-xs text-red-600' : 'text-slate-600'}`}
                title="अधिक बड़ा फ़ॉन्ट"
              >
                अ++
              </button>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-700 hover:text-red-600 hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="शेयर करें"
              title="शेयर करें"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Categories / Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {article.isBreaking && (
            <span className="bg-red-600 text-white font-devanagari-heading font-bold text-xs px-2.5 py-0.5 rounded-md uppercase">
              ब्रेकिंग न्यूज़
            </span>
          )}
          {article.categories.map((cat, i) => (
            <span
              key={i}
              className="text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-devanagari-heading text-slate-950 leading-tight mb-4">
          {article.title}
        </h1>

        {/* Author & Timestamp */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 border-y border-slate-100 text-xs text-slate-500 mb-6 font-medium">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            <span className="font-devanagari-heading">{article.author}</span>
          </div>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>प्रकाशित: {article.publishedFormatted}</span>
          </div>
        </div>

        {/* Featured Image */}
        {article.imageUrl && !imageError && (
          <figure className="mb-6 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
            <img
              src={article.imageUrl}
              alt={article.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full max-h-[460px] object-cover"
            />
            <figcaption className="p-2.5 text-xs text-slate-500 text-center bg-slate-50 border-t border-slate-100">
              सवेरा 24 न्यूज़ विशेष चित्र
            </figcaption>
          </figure>
        )}

        {/* Embedded Video (if present) */}
        {article.videoData && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-black">
            {article.videoData.type === 'youtube' && article.videoData.embedUrl ? (
              <div className="aspect-16/9 w-full">
                <iframe
                  src={article.videoData.embedUrl}
                  title="यूट्यूब वीडियो रिपोर्ट"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <video
                controls
                src={article.videoData.videoUrl}
                className="w-full max-h-[400px] aspect-16/9"
              />
            )}
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium">
                <PlayCircle className="w-4 h-4 text-red-500" />
                वीडियो रिपोर्ट देखें (ध्वनि स्वयं प्रारंभ नहीं होगी)
              </span>
            </div>
          </div>
        )}

        {/* Article Body HTML Content (Fully Sanitized) */}
        <div
          className={`article-rendered-content ${getFontSizeClass()} font-devanagari-heading`}
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        {/* Official Blogger Article Link Card */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-linear-to-r from-red-50 to-amber-50 border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 font-devanagari-heading text-sm sm:text-base">
              मूल Blogger समाचार एवं प्रतिक्रियाएं
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              इस समाचार को savera24news.in के मूल ब्लॉगर पोर्टल पर खोलें।
            </p>
          </div>
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all shrink-0"
          >
            <span>मूल Blogger लेख खोलें</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Share Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium shadow-xs active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>खबर शेयर करें</span>
          </button>
          {isCopied && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Check className="w-4 h-4" /> लिंक कॉपी हो गया
            </span>
          )}
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && onSelectRelated && (
          <section className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold font-devanagari-heading text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-5 bg-red-600 rounded-xs" />
              <span>अन्य प्रमुख खबरें</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedArticles.slice(0, 4).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelated(rel)}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-red-200 cursor-pointer transition-all flex gap-3 group"
                >
                  {rel.imageUrl ? (
                    <img
                      src={rel.imageUrl}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
                      24
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs sm:text-sm font-devanagari-heading font-semibold text-slate-900 group-hover:text-red-600 line-clamp-2 leading-snug">
                      {rel.title}
                    </h5>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {rel.relativeTime || rel.publishedFormatted}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
