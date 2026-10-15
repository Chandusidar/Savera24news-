/**
 * Savera 24 News - Blogger Feed Service
 * Fetches, sanitizes, caches, and parses Blogger JSON feeds safely.
 */

import DOMPurify from 'dompurify';
import { RawBloggerFeed, RawBloggerEntry, NewsArticle, VideoInfo } from '../types/news';

const LOCAL_STORAGE_CACHE_KEY = 'savera24_feed_cache_v2';
const LOCAL_STORAGE_TIMESTAMP_KEY = 'savera24_cache_timestamp_v2';
const DEFAULT_MAX_RESULTS = 30;

/**
 * Clean and upgrade Blogger thumbnail URLs to high-resolution versions
 */
export function upgradeImageUrl(url?: string): string {
  if (!url) return '';
  // Upgrade blogger /s72-.../ or /s150/ or /w640-.../ to /s1600/ or /w1200/
  if (url.includes('blogger.googleusercontent.com') || url.includes('bp.blogspot.com')) {
    return url
      .replace(/\/s[0-9]+(-[a-z0-9\-]+)?\//g, '/s1600/')
      .replace(/\/w[0-9]+(-[a-z0-9\-]+)?\//g, '/w1200/')
      .replace(/=s[0-9]+(-[a-z0-9\-]+)?/g, '=s1600');
  }
  return url;
}

/**
 * Safely extract all image URLs embedded in article HTML content
 */
export function extractImagesFromHtml(html: string): string[] {
  if (!html) return [];
  const images: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const src = match[1];
    if (src && !src.includes('clear.cache.gif') && !src.includes('pixel') && !images.includes(src)) {
      images.push(upgradeImageUrl(src));
    }
  }
  return images;
}

/**
 * Detect YouTube or HTML5 embedded video in article HTML
 */
export function extractVideoFromHtml(html: string): VideoInfo | null {
  if (!html) return null;

  // 1. YouTube Iframe Embed
  const iframeMatch = html.match(/src=["'](?:https?:)?\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (iframeMatch && iframeMatch[1]) {
    const videoId = iframeMatch[1];
    return {
      type: 'youtube',
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`
    };
  }

  // 2. YouTube direct link (watch?v= or youtu.be/)
  const linkMatch = html.match(/(?:https?:)?\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (linkMatch && linkMatch[1]) {
    const videoId = linkMatch[1];
    return {
      type: 'youtube',
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`
    };
  }

  // 3. HTML5 Video tag
  const videoTagMatch = html.match(/<video[^>]+src=["']([^"']+)["']/i);
  if (videoTagMatch && videoTagMatch[1]) {
    return {
      type: 'html5',
      videoUrl: videoTagMatch[1]
    };
  }

  return null;
}

/**
 * Format ISO date string into readable Hindi date & time
 */
export function formatHindiDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return 'हाल ही में';
    return new Intl.DateTimeFormat('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return 'हाल ही में';
  }
}

/**
 * Format relative time in Hindi (e.g. "10 मिनट पहले", "2 घंटे पहले", "1 दिन पहले")
 */
export function formatRelativeTimeHindi(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return 'अभी-अभी';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} मिनट पहले`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)} घंटे पहले`;
    if (diffSecs < 172800) return 'कल';
    const days = Math.floor(diffSecs / 86400);
    if (days <= 7) return `${days} दिन पहले`;
    return formatHindiDate(isoDate);
  } catch {
    return '';
  }
}

/**
 * Safely parse a single Raw Blogger Entry into our NewsArticle format
 */
export function parseBloggerEntry(entry: RawBloggerEntry): NewsArticle {
  const title = (entry.title?.$t || 'अनाम समाचार').trim();
  const rawContent = entry.content?.$t || entry.summary?.$t || '';

  // Extract links
  const altLink = entry.link?.find((l) => l.rel === 'alternate')?.href || 'https://www.savera24news.in/';
  
  // Extract and upgrade images
  const allImages = extractImagesFromHtml(rawContent);
  let mainImage = upgradeImageUrl(entry.media$thumbnail?.url);
  if (!mainImage && allImages.length > 0) {
    mainImage = allImages[0];
  }

  // Extract categories
  const categories = (entry.category || [])
    .map((c) => c.term.trim())
    .map((term) => term.replace(/^#+/, '').trim())
    .filter(Boolean);

  // Detect Breaking News strictly:
  // Must match 'ब्रेकिंग' in categories, or title contains 'ब्रेकिंग' or 'BREAKING'
  const isBreaking =
    categories.some((c) => c.includes('ब्रेकिंग') || c.toLowerCase().includes('breaking')) ||
    title.includes('ब्रेकिंग') ||
    title.toUpperCase().includes('BREAKING') ||
    title.includes('बड़ी खबर');

  // Detect Video
  const videoData = extractVideoFromHtml(rawContent);

  // Author
  const author = entry.author?.[0]?.name?.$t || 'सवेरा 24 न्यूज़ डेस्क';

  // Published dates
  const publishedAt = entry.published?.$t || new Date().toISOString();
  const updatedAt = entry.updated?.$t || publishedAt;

  // Sanitize content HTML strictly with DOMPurify
  const contentHtml = DOMPurify.sanitize(rawContent, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target']
  });

  // Extract plain text summary from HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = contentHtml;
  const rawText = (tempDiv.textContent || tempDiv.innerText || '').replace(/\s+/g, ' ').trim();
  const summary = rawText.length > 170 ? rawText.slice(0, 170) + '...' : rawText;

  return {
    id: entry.id?.$t || altLink,
    title,
    summary: summary || title,
    contentHtml,
    imageUrl: mainImage,
    allImages,
    publishedAt,
    publishedFormatted: formatHindiDate(publishedAt),
    relativeTime: formatRelativeTimeHindi(publishedAt),
    updatedAt,
    author,
    categories,
    originalUrl: altLink,
    isBreaking,
    videoData
  };
}

/**
 * Fetch feed parameters
 */
export interface FetchFeedOptions {
  category?: string;
  startIndex?: number;
  maxResults?: number;
  q?: string;
  forceRefresh?: boolean;
}

/**
 * Core Feed Fetcher with dual-endpoint fallback & local caching
 */
export async function fetchNewsFeed(options: FetchFeedOptions = {}): Promise<{
  articles: NewsArticle[];
  isFromCache: boolean;
  totalResults: number;
}> {
  const { category, startIndex = 1, maxResults = DEFAULT_MAX_RESULTS, q } = options;

  // Build query string
  const params = new URLSearchParams();
  params.set('max-results', maxResults.toString());
  params.set('start-index', startIndex.toString());
  if (category && category !== 'all') {
    params.set('category', category);
  }
  if (q) {
    params.set('q', q);
  }

  // 1. Try server-side proxy `/api/feed`
  try {
    const proxyUrl = `/api/feed?${params.toString()}`;
    const resp = await fetch(proxyUrl, {
      headers: { Accept: 'application/json' }
    });

    if (resp.ok) {
      const feedData: RawBloggerFeed = await resp.json();
      const entries = feedData.feed?.entry || [];
      const articles = entries.map(parseBloggerEntry);
      const totalResults = parseInt(feedData.feed?.openSearch$totalResults?.$t || '0', 10) || articles.length;

      // Update local storage cache for primary feed
      if (startIndex === 1 && !category && !q && articles.length > 0) {
        saveToLocalCache(articles);
      }

      return {
        articles,
        isFromCache: false,
        totalResults
      };
    }
  } catch (proxyErr) {
    console.warn('Backend proxy fetch failed, attempting direct Blogger request:', proxyErr);
  }

  // 2. Fallback to direct Blogger URL
  try {
    let directUrl = 'https://www.savera24news.in/feeds/posts/default';
    if (category && category !== 'all') {
      directUrl += `/-/${encodeURIComponent(category)}`;
    }
    const directParams = new URLSearchParams({
      alt: 'json',
      'max-results': maxResults.toString(),
      'start-index': startIndex.toString()
    });
    if (q) directParams.append('q', q);

    const directResp = await fetch(`${directUrl}?${directParams.toString()}`);
    if (directResp.ok) {
      const feedData: RawBloggerFeed = await directResp.json();
      const entries = feedData.feed?.entry || [];
      const articles = entries.map(parseBloggerEntry);
      const totalResults = parseInt(feedData.feed?.openSearch$totalResults?.$t || '0', 10) || articles.length;

      if (startIndex === 1 && !category && !q && articles.length > 0) {
        saveToLocalCache(articles);
      }

      return {
        articles,
        isFromCache: false,
        totalResults
      };
    }
  } catch (directErr) {
    console.warn('Direct Blogger fetch failed, checking local storage cache:', directErr);
  }

  // 3. Fallback to offline localStorage cache
  const cachedArticles = loadFromLocalCache();
  if (cachedArticles && cachedArticles.length > 0) {
    let filtered = cachedArticles;
    if (category && category !== 'all') {
      filtered = filtered.filter((art) =>
        art.categories.some((cat) => cat.toLowerCase().includes(category.toLowerCase()))
      );
    }
    if (q) {
      const queryLower = q.toLowerCase();
      filtered = filtered.filter(
        (art) => art.title.toLowerCase().includes(queryLower) || art.summary.toLowerCase().includes(queryLower)
      );
    }
    return {
      articles: filtered,
      isFromCache: true,
      totalResults: filtered.length
    };
  }

  // 4. Honest error state: zero fake news
  throw new Error('समाचार लोड करने में असमर्थ। कृपया अपना इंटरनेट कनेक्शन जांचें।');
}

function saveToLocalCache(articles: NewsArticle[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(articles));
    localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Ignore storage quota errors
  }
}

function loadFromLocalCache(): NewsArticle[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
