/**
 * Savera 24 News (सवेरा 24 न्यूज़)
 * Official News Application for https://www.savera24news.in/
 * "सच की राह सवेरा के साथ"
 * Integrated with Blogger RSS 2.0 Feed (https://www.savera24news.in/feeds/posts/default?alt=rss)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { CategoryNav } from './components/CategoryNav';
import { NewsCard } from './components/NewsCard';
import { ArticleReader } from './components/ArticleReader';
import { PhotoNewsGallery } from './components/PhotoNewsGallery';
import { VideoNewsFeed } from './components/VideoNewsFeed';
import { CategoriesSheet } from './components/CategoriesSheet';
import { BottomNav } from './components/BottomNav';
import { SearchModal } from './components/SearchModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallModal } from './components/PWAInstallModal';
import { fetchBloggerRssFeed } from './services/bloggerRssService';
import { FEED_CONFIG } from './config/feedConfig';
import { NewsArticle, NavigationTab, APP_CATEGORIES } from './types/news';
import { AlertCircle, RefreshCw, Flame, ChevronDown, Newspaper, Rss, ExternalLink } from 'lucide-react';

export default function App() {
  // Navigation & View States
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  // Data States
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedSourceUrl, setFeedSourceUrl] = useState<string>(FEED_CONFIG.RSS_FEED_URL);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Load news from Blogger RSS Feed
  const loadRssFeed = useCallback(
    async (catId: string, query: string = '', isRefresh: boolean = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const catObj = APP_CATEGORIES.find((c) => c.id === catId);
        const bloggerCategory = catObj && catObj.id !== 'all' ? catObj.bloggerTag : undefined;

        const result = await fetchBloggerRssFeed({
          category: bloggerCategory,
          q: query || undefined,
          limit: 35,
          forceRefresh: isRefresh
        });

        // Filter strictly if 'breaking' tab is selected
        let finalArticles = result.articles;
        if (catId === 'breaking') {
          finalArticles = finalArticles.filter((a) => a.isBreaking);
        }

        setArticles(finalArticles);
        setIsFromCache(result.isFromCache);
        setFeedSourceUrl(result.feedUrl);
      } catch (err: unknown) {
        const errStr = err instanceof Error ? err.message : 'समाचार लोड करने में त्रुटि। कृपया इंटरनेट कनेक्शन जांचें।';
        setErrorMessage(errStr);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadRssFeed(selectedCategory, searchQuery);
  }, [loadRssFeed, selectedCategory, searchQuery]);

  // Handle URL param or browser back navigation
  useEffect(() => {
    const handlePopState = () => {
      if (activeArticle) {
        setActiveArticle(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeArticle]);

  // Open Article Reader
  const handleSelectArticle = (article: NewsArticle) => {
    setActiveArticle(article);
    window.history.pushState({ articleId: article.id }, '', `#article-${encodeURIComponent(article.id)}`);
  };

  // Close Article Reader
  const handleBackFromArticle = () => {
    setActiveArticle(null);
    if (window.location.hash.startsWith('#article')) {
      window.history.back();
    }
  };

  // Category change
  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSearchQuery('');
    if (currentTab !== 'home') {
      setCurrentTab('home');
    }
  };

  // Tab change
  const handleTabChange = (tab: NavigationTab) => {
    if (activeArticle) {
      setActiveArticle(null);
    }
    setCurrentTab(tab);
    if (tab === 'breaking') {
      setSelectedCategory('breaking');
    } else if (tab === 'home' && selectedCategory === 'breaking') {
      setSelectedCategory('all');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manual Refresh
  const handleRefresh = () => {
    loadRssFeed(selectedCategory, searchQuery, true);
  };

  // Filtered breaking news items for ticker
  const breakingNewsItems = articles.filter((a) => a.isBreaking);

  // If Article Reader is active, show it full-screen
  if (activeArticle) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <ArticleReader
          article={activeArticle}
          onBack={handleBackFromArticle}
          onSelectRelated={handleSelectArticle}
          relatedArticles={articles.filter((a) => a.id !== activeArticle.id)}
        />
        <OfflineIndicator />
      </div>
    );
  }

  const currentCategoryObj = APP_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col text-slate-900 pb-20">
      {/* 1. Header with authentic Savera 24 News Branding */}
      <Header
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* 2. Breaking News Strip (Validated strictly from RSS; never fake) */}
      <BreakingNewsTicker
        articles={articles}
        onSelectArticle={handleSelectArticle}
      />

      {/* 3. Horizontal Categories Navigation */}
      {currentTab === 'home' && (
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      )}

      {/* Main View Router based on Bottom Navigation */}
      <main className="flex-1">
        {/* Tab: PHOTOS */}
        {currentTab === 'photos' && (
          <PhotoNewsGallery
            articles={articles}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {/* Tab: VIDEOS */}
        {currentTab === 'videos' && (
          <VideoNewsFeed
            articles={articles}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {/* Tab: CATEGORIES */}
        {currentTab === 'categories' && (
          <CategoriesSheet
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}

        {/* Tab: BREAKING NEWS DEDICATED SCREEN */}
        {currentTab === 'breaking' && (
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="mb-6 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-devanagari-heading text-slate-900">
                  सवेरा ब्रेकिंग न्यूज़
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Blogger RSS से सत्यापित एवं प्रमाणित ताज़ा घटनाक्रम
                </p>
              </div>
            </div>

            {breakingNewsItems.length === 0 && !isLoading ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 max-w-md mx-auto">
                <Flame className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-devanagari-heading font-bold text-slate-800 text-lg">
                  इस समय कोई ब्रेकिंग अलर्ट नहीं है
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  सवेरा 24 न्यूज़ केवल प्रमाणित घटनाओं को ही ब्रेकिंग के रूप में प्रकाशित करता है। अन्य ताज़ा खबरें देखने के लिए होम स्क्रीन पर जाएं।
                </p>
                <button
                  onClick={() => handleTabChange('home')}
                  className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-xs shadow-xs"
                >
                  मुख्य खबरें देखें
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {breakingNewsItems.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    onRead={handleSelectArticle}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: HOME (LATEST NEWS FEED VIA BLOGGER RSS) */}
        {currentTab === 'home' && (
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {/* Dedicated "ताज़ा खबरें (Latest News)" Section Header with RSS Badge */}
            <div className="mb-5 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-6 bg-red-600 rounded-xs" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-xl font-bold font-devanagari-heading text-slate-900">
                      {searchQuery ? `खोज परिणाम: "${searchQuery}"` : currentCategoryObj?.hindiName || 'ताज़ा खबरें (Latest News)'}
                    </h2>
                    {/* RSS Live Source Indicator */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 font-devanagari-heading">
                      <Rss className="w-2.5 h-2.5 text-red-600" />
                      <span>लाइव RSS</span>
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    सवेरा 24 न्यूज़ आधिकारिक ब्लॉगर RSS फीड से वास्तविक समय में अपडेटेड
                  </p>
                </div>
              </div>

              {/* Feed Info & RSS Source Link */}
              <div className="flex items-center gap-2 ml-auto">
                {isFromCache && (
                  <span className="text-[10px] sm:text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    कैश्ड
                  </span>
                )}
                {!isLoading && articles.length > 0 && (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {articles.length} खबरें
                  </span>
                )}
                <a
                  href={FEED_CONFIG.RSS_FEED_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-600 transition-colors p-1"
                  title="Blogger XML RSS Feed खोलें"
                >
                  <span>RSS XML</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {searchQuery && (
                <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600">"{searchQuery}" के परिणाम</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    खोज फ़िल्टर हटाएं
                  </button>
                </div>
              )}
            </div>

            {/* Loading Skeleton State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                    <div className="w-full aspect-16/10 bg-slate-200 rounded-xl" />
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-5 bg-slate-200 rounded w-4/5" />
                    <div className="h-3.5 bg-slate-200 rounded w-full" />
                    <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State: Honest and transparent with Retry */}
            {errorMessage && !isLoading && (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-red-200 max-w-lg mx-auto shadow-sm my-6">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="font-devanagari-heading font-bold text-slate-900 text-lg">
                  RSS फीड लोड नहीं हो सकी
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {errorMessage}
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>पुनः प्रयास करें (Retry)</span>
                  </button>
                  <a
                    href={FEED_CONFIG.WEBSITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
                  >
                    वेबसाइट पर जाएं
                  </a>
                </div>
              </div>
            )}

            {/* Empty State: Clear and honest, no fabricated results */}
            {!isLoading && !errorMessage && articles.length === 0 && (
              <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-slate-200 max-w-md mx-auto shadow-xs my-6">
                <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-devanagari-heading font-bold text-slate-800 text-lg">
                  इस श्रेणी में कोई समाचार उपलब्ध नहीं है
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  इस समय इस श्रेणी के लिए Blogger RSS फीड में कोई पोस्ट नहीं मिली है।
                </p>
                <button
                  onClick={() => handleCategorySelect('all')}
                  className="mt-5 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-xs shadow-xs"
                >
                  सभी समाचार देखें
                </button>
              </div>
            )}

            {/* News Cards Grid */}
            {!isLoading && !errorMessage && articles.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {articles.map((article, index) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      onRead={handleSelectArticle}
                      featured={index === 0 && selectedCategory === 'all' && !searchQuery}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Bottom Tab Navigation (Android-ready thumb zone) */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        breakingCount={breakingNewsItems.length}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles}
        onSelectArticle={handleSelectArticle}
        onSearchServer={(q) => {
          setSearchQuery(q);
          setSelectedCategory('all');
          setCurrentTab('home');
        }}
      />

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
