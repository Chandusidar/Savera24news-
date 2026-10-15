/**
 * Savera 24 News - Blogger RSS Feed Service
 * Fetches, parses, sanitizes, and caches real news from https://www.savera24news.in/feeds/posts/default?alt=rss
 */

import DOMPurify from 'dompurify';
import { FEED_CONFIG } from '../config/feedConfig';
import { NewsArticle, VideoInfo } from '../types/news';

/**
 * Format RFC 822 or ISO date string into readable Hindi date
 */
export function formatHindiDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
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
 * Format relative time in Hindi (e.g. "20 मिनट पहले", "3 घंटे पहले", "कल")
 */
export function formatRelativeTimeHindi(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 60) return 'अभी-अभी';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} मिनट पहले`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)} घंटे पहले`;
    if (diffSecs < 172800) return 'कल';
    const days = Math.floor(diffSecs / 86400);
    if (days <= 7) return `${days} दिन पहले`;
    return formatHindiDate(dateStr);
  } catch {
    return '';
  }
}

/**
 * Upgrade thumbnail images from Blogger to full high-res
 */
export function upgradeImageUrl(url?: string): string {
  if (!url) return '';
  if (url.includes('blogger.googleusercontent.com') || url.includes('bp.blogspot.com')) {
    return url
      .replace(/\/s[0-9]+(-[a-z0-9\-]+)?\//g, '/s1600/')
      .replace(/\/w[0-9]+(-[a-z0-9\-]+)?\//g, '/w1200/')
      .replace(/=s[0-9]+(-[a-z0-9\-]+)?/g, '=s1600');
  }
  return url;
}

/**
 * Extract all image URLs from article HTML description
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
 * Detect embedded video in article HTML
 */
export function extractVideoFromHtml(html: string): VideoInfo | null {
  if (!html) return null;

  // 1. YouTube iframe embed
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

  // 2. YouTube direct watch link
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

  // 3. HTML5 Video
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
 * Client-Side XML Parser using DOMParser
 * Used if server-side endpoint is unreachable (e.g. offline or standalone Capacitor)
 */
export function parseRssXmlInBrowser(xmlText: string): NewsArticle[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('RSS XML Parsing Error');
  }

  const items = xmlDoc.querySelectorAll('item');
  const articles: NewsArticle[] = [];

  items.forEach((item, index) => {
    const title = item.querySelector('title')?.textContent?.trim() || 'अनाम समाचार';
    const link = item.querySelector('link')?.textContent?.trim() || FEED_CONFIG.WEBSITE_URL;
    const pubDate = item.querySelector('pubDate')?.textContent?.trim() || new Date().toISOString();
    const rawDesc = item.querySelector('description')?.textContent || '';
    const authorRaw = item.querySelector('author')?.textContent || 'सवेरा 24 न्यूज़';
    const authorMatch = authorRaw.match(/\((.*?)\)/);
    const author = authorMatch ? authorMatch[1].trim() : 'सवेरा 24 न्यूज़ डेस्क';

    // Categories
    const categoryEls = item.querySelectorAll('category');
    const categories: string[] = [];
    categoryEls.forEach((c) => {
      const term = c.textContent?.replace(/^#+/, '').trim();
      if (term && !categories.includes(term)) {
        categories.push(term);
      }
    });

    // Media Thumbnail
    const mediaThumbEl = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'thumbnail')[0];
    let imageUrl = upgradeImageUrl(mediaThumbEl?.getAttribute('url') || undefined);

    const allImages = extractImagesFromHtml(rawDesc);
    if (!imageUrl && allImages.length > 0) {
      imageUrl = allImages[0];
    }

    // Sanitize HTML
    const contentHtml = DOMPurify.sanitize(rawDesc, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target']
    });

    // Extract summary text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHtml;
    const plainText = (tempDiv.textContent || tempDiv.innerText || '').replace(/\s+/g, ' ').trim();
    const summary = plainText.length > 170 ? plainText.slice(0, 170) + '...' : plainText || title;

    // Detect breaking
    const isBreaking =
      categories.some((c) => c.includes('ब्रेकिंग') || c.toLowerCase().includes('breaking')) ||
      title.includes('ब्रेकिंग') ||
      title.toUpperCase().includes('BREAKING') ||
      title.includes('बड़ी खबर');

    const videoData = extractVideoFromHtml(rawDesc);
    const guid = item.querySelector('guid')?.textContent || link || `article_${index}`;

    articles.push({
      id: guid,
      title,
      summary,
      contentHtml,
      imageUrl,
      allImages,
      publishedAt: pubDate,
      publishedFormatted: formatHindiDate(pubDate),
      relativeTime: formatRelativeTimeHindi(pubDate),
      updatedAt: pubDate,
      author,
      categories,
      originalUrl: link,
      isBreaking,
      videoData
    });
  });

  return articles;
}

export interface FetchRssFeedOptions {
  category?: string;
  q?: string;
  limit?: number;
  forceRefresh?: boolean;
}

export interface FetchRssResult {
  articles: NewsArticle[];
  isFromCache: boolean;
  totalResults: number;
  feedUrl: string;
}

/**
 * Main RSS Feed Fetcher
 * Tries server-side cached endpoint first (/api/rss-feed), then direct XML / client DOMParser fallback.
 */
export async function fetchBloggerRssFeed(options: FetchRssFeedOptions = {}): Promise<FetchRssResult> {
  const { category, q, limit = FEED_CONFIG.DEFAULT_MAX_ITEMS } = options;

  const queryParams = new URLSearchParams();
  if (category && category !== 'all') {
    queryParams.set('category', category);
  }
  if (q) {
    queryParams.set('q', q);
  }
  queryParams.set('limit', limit.toString());

  // 1. First, attempt Server-Side API endpoint with in-memory caching
  try {
    const apiEndpoint = `/api/rss-feed?${queryParams.toString()}`;
    const resp = await fetch(apiEndpoint, {
      headers: { Accept: 'application/json' }
    });

    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data.articles)) {
        // Transform items to full NewsArticle with sanitized HTML and formatted dates
        const articles: NewsArticle[] = data.articles.map((item: Record<string, unknown>, index: number) => {
          const rawDesc = (item.descriptionHtml as string) || '';
          const contentHtml = DOMPurify.sanitize(rawDesc, {
            ADD_TAGS: ['iframe'],
            ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target']
          });

          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = contentHtml;
          const plainText = (tempDiv.textContent || tempDiv.innerText || '').replace(/\s+/g, ' ').trim();
          const summary = plainText.length > 170 ? plainText.slice(0, 170) + '...' : plainText || (item.title as string);

          const publishedAt = (item.pubDate as string) || (item.publishedAt as string) || new Date().toISOString();

          return {
            id: (item.id as string) || (item.link as string) || `art_${index}`,
            title: (item.title as string) || 'अनाम समाचार',
            summary,
            contentHtml,
            imageUrl: (item.imageUrl as string) || '',
            allImages: (item.allImages as string[]) || [],
            publishedAt,
            publishedFormatted: formatHindiDate(publishedAt),
            relativeTime: formatRelativeTimeHindi(publishedAt),
            updatedAt: publishedAt,
            author: (item.author as string) || 'सवेरा 24 न्यूज़ डेस्क',
            categories: (item.categories as string[]) || [],
            originalUrl: (item.originalUrl as string) || (item.link as string) || FEED_CONFIG.WEBSITE_URL,
            isBreaking: Boolean(item.isBreaking),
            videoData: extractVideoFromHtml(rawDesc)
          };
        });

        // Save default feed to localStorage
        if (!category && !q && articles.length > 0) {
          saveToLocalStorage(articles);
        }

        return {
          articles,
          isFromCache: false,
          totalResults: articles.length,
          feedUrl: data.feedUrl || FEED_CONFIG.RSS_FEED_URL
        };
      }
    }
  } catch (apiErr) {
    console.warn('Server RSS endpoint failed, falling back to direct XML parsing:', apiErr);
  }

  // 2. Fallback: Fetch raw XML from /api/rss-xml or direct RSS URL and parse in browser
  try {
    let xmlUrl = `/api/rss-xml`;
    if (category && category !== 'all') {
      xmlUrl += `?category=${encodeURIComponent(category)}`;
    }

    const xmlResp = await fetch(xmlUrl);
    if (xmlResp.ok) {
      const xmlString = await xmlResp.text();
      let articles = parseRssXmlInBrowser(xmlString);

      if (q) {
        const queryLower = q.toLowerCase();
        articles = articles.filter(
          (art) =>
            art.title.toLowerCase().includes(queryLower) ||
            art.summary.toLowerCase().includes(queryLower) ||
            art.categories.some((c) => c.toLowerCase().includes(queryLower))
        );
      }

      if (limit && articles.length > limit) {
        articles = articles.slice(0, limit);
      }

      if (!category && !q && articles.length > 0) {
        saveToLocalStorage(articles);
      }

      return {
        articles,
        isFromCache: false,
        totalResults: articles.length,
        feedUrl: FEED_CONFIG.RSS_FEED_URL
      };
    }
  } catch (xmlErr) {
    console.warn('Fallback XML fetch failed, checking offline localStorage cache:', xmlErr);
  }

  // 3. Fallback: LocalStorage cache for offline support
  const cached = loadFromLocalStorage();
  if (cached && cached.length > 0) {
    let filtered = cached;
    if (category && category !== 'all') {
      filtered = filtered.filter((art) =>
        art.categories.some((cat) => cat.toLowerCase().includes(category.toLowerCase()))
      );
    }
    if (q) {
      const queryLower = q.toLowerCase();
      filtered = filtered.filter(
        (art) =>
          art.title.toLowerCase().includes(queryLower) ||
          art.summary.toLowerCase().includes(queryLower)
      );
    }

    return {
      articles: filtered,
      isFromCache: true,
      totalResults: filtered.length,
      feedUrl: FEED_CONFIG.RSS_FEED_URL
    };
  }

  // 4. Honest error state: zero fake news
  throw new Error('समाचार लोड करने में असमर्थ। कृपया अपना इंटरनेट कनेक्शन जांचें।');
}

function saveToLocalStorage(articles: NewsArticle[]) {
  try {
    localStorage.setItem(FEED_CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(articles));
    localStorage.setItem(`${FEED_CONFIG.LOCAL_STORAGE_KEY}_time`, Date.now().toString());
  } catch {
    // Ignore quota errors
  }
}

function loadFromLocalStorage(): NewsArticle[] | null {
  try {
    const raw = localStorage.getItem(FEED_CONFIG.LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
