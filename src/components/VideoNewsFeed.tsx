import React, { useState } from 'react';
import { Play, PlayCircle, ExternalLink, Film, X, BookOpen } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface VideoNewsFeedProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const VideoNewsFeed: React.FC<VideoNewsFeedProps> = ({
  articles,
  onSelectArticle
}) => {
  const [activeVideoArticle, setActiveVideoArticle] = useState<NewsArticle | null>(null);

  // Filter articles with video
  const videoArticles = articles.filter((a) => a.videoData !== null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Feed Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-100 text-red-600">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-devanagari-heading text-slate-900">
              वीडियो न्यूज़ बुलेटिन
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              सवेरा 24 न्यूज़ - वीडियो रिपोर्ट एवं विशेष कवरेज
            </p>
          </div>
        </div>
      </div>

      {/* Video Content Grid or Empty State */}
      {videoArticles.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 sm:p-12 text-center border border-slate-200 shadow-xs max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="font-devanagari-heading font-bold text-slate-900 text-lg sm:text-xl">
            वर्तमान में कोई वीडियो समाचार उपलब्ध नहीं है
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            सवेरा 24 न्यूज़ के लाइव ब्लॉगर फीड में इस समय कोई यूट्यूब या वीडियो रिपोर्ट टैग नहीं है। नए वीडियो अपडेट होते ही यहां स्वतः प्रदर्शित होंगे।
          </p>
          <div className="mt-6">
            <a
              href="https://www.youtube.com/results?search_query=savera+24+news"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>सवेरा 24 यूट्यूब चैनल देखें</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videoArticles.map((article) => {
            const video = article.videoData!;
            const videoThumb = video.type === 'youtube' && video.videoId
              ? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
              : article.imageUrl;

            return (
              <div
                key={article.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Thumbnail with Play Trigger */}
                <div
                  onClick={() => setActiveVideoArticle(article)}
                  className="relative aspect-16/9 bg-black cursor-pointer overflow-hidden"
                >
                  <img
                    src={videoThumb}
                    alt={article.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-13 h-13 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[11px] text-white font-medium">
                    वीडियो
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-red-600 uppercase font-devanagari-heading block mb-1">
                      {article.categories[0] || 'विशेष रिपोर्ट'}
                    </span>
                    <h3
                      onClick={() => onSelectArticle(article)}
                      className="font-devanagari-heading font-bold text-slate-900 group-hover:text-red-600 line-clamp-2 leading-snug cursor-pointer text-sm sm:text-base mb-2"
                    >
                      {article.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-[11px] text-slate-500">
                      {article.relativeTime || article.publishedFormatted}
                    </span>
                    <button
                      onClick={() => onSelectArticle(article)}
                      className="text-xs font-semibold text-slate-700 hover:text-red-600 flex items-center gap-1"
                    >
                      <span>खबर पढ़ें</span>
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Modal Player (Zero Autoplay Sound) */}
      {activeVideoArticle && activeVideoArticle.videoData && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-slate-950 flex items-center justify-between text-white border-b border-white/10">
              <span className="text-xs sm:text-sm font-devanagari-heading font-bold truncate max-w-lg">
                {activeVideoArticle.title}
              </span>
              <button
                onClick={() => setActiveVideoArticle(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                aria-label="बंद करें"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-16/9 bg-black w-full">
              {activeVideoArticle.videoData.type === 'youtube' && activeVideoArticle.videoData.embedUrl ? (
                <iframe
                  src={activeVideoArticle.videoData.embedUrl}
                  title={activeVideoArticle.title}
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video
                  controls
                  src={activeVideoArticle.videoData.videoUrl}
                  className="w-full h-full"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 flex items-center justify-between gap-3 text-white">
              <span className="text-xs text-slate-400">
                ध्वनि और प्लेबैक नियंत्रण आपके हाथ में है।
              </span>
              <button
                onClick={() => {
                  const art = activeVideoArticle;
                  setActiveVideoArticle(null);
                  onSelectArticle(art);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>पूरा समाचार पढ़ें</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
