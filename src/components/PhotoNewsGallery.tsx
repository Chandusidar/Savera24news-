import React, { useState } from 'react';
import { Image as ImageIcon, ExternalLink, BookOpen, X, ZoomIn } from 'lucide-react';
import { NewsArticle } from '../types/news';

interface PhotoNewsGalleryProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

interface PhotoItem {
  imageUrl: string;
  article: NewsArticle;
}

export const PhotoNewsGallery: React.FC<PhotoNewsGalleryProps> = ({
  articles,
  onSelectArticle
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  // Extract all valid photos across articles
  const photoItems: PhotoItem[] = [];
  articles.forEach((art) => {
    if (art.imageUrl) {
      photoItems.push({ imageUrl: art.imageUrl, article: art });
    }
    // Also include any other inline images found in article
    art.allImages.forEach((img) => {
      if (img !== art.imageUrl && !photoItems.some((p) => p.imageUrl === img)) {
        photoItems.push({ imageUrl: img, article: art });
      }
    });
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Gallery Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-100 text-red-600">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-devanagari-heading text-slate-900">
              फोटो न्यूज़ गैलरी
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              सवेरा 24 न्यूज़ - चित्रों के माध्यम से ताज़ा घटनाक्रम
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {photoItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-devanagari-heading font-bold text-slate-800 text-lg">
            फिलहाल कोई फोटो समाचार उपलब्ध नहीं है
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            नई तस्वीरें लोड करने के लिए होम स्क्रीन पर जाएं या रीफ्रेश करें।
          </p>
        </div>
      ) : (
        /* Photo Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {photoItems.map((item, index) => (
            <div
              key={`${item.article.id}-${index}`}
              onClick={() => setSelectedPhoto(item)}
              className="group relative bg-slate-900 rounded-xl overflow-hidden aspect-4/3 cursor-pointer shadow-xs hover:shadow-md transition-all duration-200"
            >
              <img
                src={item.imageUrl}
                alt={item.article.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 group-hover:opacity-90 transition-all duration-300"
              />
              {/* Gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Photo Caption */}
              <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 text-white">
                <span className="text-[10px] uppercase font-bold text-amber-300 font-devanagari-heading block truncate">
                  {item.article.categories[0] || 'फोटो'}
                </span>
                <p className="text-xs font-devanagari-heading font-medium text-slate-100 line-clamp-2 leading-tight mt-0.5">
                  {item.article.title}
                </p>
              </div>

              {/* Zoom Indicator */}
              <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <span className="text-xs sm:text-sm font-devanagari-heading font-medium text-slate-300 truncate max-w-xs sm:max-w-md">
              {selectedPhoto.article.title}
            </span>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              aria-label="बंद करें"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Centered Image */}
          <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.article.title}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
          </div>

          {/* Bottom Actions */}
          <div className="bg-slate-900/90 rounded-2xl p-4 max-w-2xl mx-auto w-full border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-devanagari-heading font-semibold line-clamp-1">
                {selectedPhoto.article.title}
              </p>
              <span className="text-[11px] text-slate-400">
                {selectedPhoto.article.publishedFormatted}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const art = selectedPhoto.article;
                  setSelectedPhoto(null);
                  onSelectArticle(art);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>पूरी खबर पढ़ें</span>
              </button>

              <a
                href={selectedPhoto.article.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
