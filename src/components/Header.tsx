import React, { useState } from 'react';
import { RefreshCw, Search, Share2, Download, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSearch: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  onOpenSearch,
  onOpenInstallModal
}) => {
  const { isInstallable, isInstalled } = usePWAInstall();
  const [logoLoaded, setLogoLoaded] = useState(true);

  // Official logo from savera24news.in
  const officialLogoUrl = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhRqK5Wo9jbSgdWqrCWCX-d7HLpA72eqjOOy8dP5ZCL59N-ChAwdS_Swpd4PAgibsUYeg_sZgLH1GzObpDm2Scj36D8gbz69045RNqUVS8ILJT8IiRwI5s9LH2Y2ReDi_U2O_GB7bsRpjdbVdDcwAZXYuGQXjf7HzzPTUxBzdG1_kVeNr2COPJOorhz6s0s/s1600/207779.jpg';

  // Format today's Hindi date
  const todayHindi = new Intl.DateTimeFormat('hi-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'सवेरा 24 न्यूज़ (Savera 24 News)',
          text: 'सवेरा 24 न्यूज़ - सच की राह सवेरा के साथ। छत्तीसगढ़ और देश-विदेश की ताज़ा खबरें।',
          url: window.location.origin
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('ऐप लिंक कॉपी हो गया है!');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-red-700 text-white shadow-md">
      {/* Top Utility Strip */}
      <div className="bg-red-800 text-red-100 text-xs px-4 py-1.5 border-b border-red-900/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-devanagari-heading tracking-wide truncate">{todayHindi}</span>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://www.savera24news.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
              title="ऑफिशियल वेबसाइट देखें"
            >
              <span>www.savera24news.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Brand Header */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3 min-w-0">
          <a href="/" className="flex items-center gap-2.5 group">
            {logoLoaded ? (
              <img
                src={officialLogoUrl}
                alt="सवेरा 24 न्यूज़ लोगो"
                referrerPolicy="no-referrer"
                onError={() => setLogoLoaded(false)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover bg-white p-0.5 shadow-sm group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white flex items-center justify-center text-red-700 font-black text-xl shadow-sm">
                24
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black font-devanagari-heading tracking-tight leading-none text-white drop-shadow-xs">
                सवेरा 24 न्यूज़
              </span>
              <span className="text-[11px] sm:text-xs font-medium text-amber-200 font-devanagari-heading tracking-wide mt-0.5">
                सच की राह सवेरा के साथ
              </span>
            </div>
          </a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            aria-label="ताज़ा करें"
            title="समाचार रीफ्रेश करें"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
          </button>

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            aria-label="समाचार खोजें"
            title="सर्च करें"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Share App Button */}
          <button
            onClick={handleShareApp}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            aria-label="ऐप शेयर करें"
            title="ऐप शेयर करें"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* PWA Install Trigger (shown if not standalone) */}
          {!isInstalled && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold text-xs shadow-xs active:scale-95 transition-all shrink-0"
              title="ऐप इंस्टॉल करें"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ऐप डाउनलोड</span>
              <span className="sm:hidden">इंस्टॉल</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
