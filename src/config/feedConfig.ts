/**
 * Savera 24 News (सवेरा 24 न्यूज़)
 * Centralized Configuration for Blogger RSS Feed & Branding
 */

export const FEED_CONFIG = {
  // Official Website URL
  WEBSITE_URL: 'https://www.savera24news.in',

  // Official Blogger RSS 2.0 Feed URL
  RSS_FEED_URL: 'https://www.savera24news.in/feeds/posts/default?alt=rss',

  // Official Blogger Feed Base Path (for category RSS feeds)
  CATEGORY_RSS_BASE_URL: 'https://www.savera24news.in/feeds/posts/default/-',

  // Branding Details
  BRAND_NAME_HI: 'सवेरा 24 न्यूज़',
  BRAND_NAME_EN: 'Savera 24 News',
  TAGLINE_HI: 'सच की राह सवेरा के साथ',

  // Cache settings
  CACHE_TTL_MS: 60 * 1000, // 60 seconds server in-memory cache
  DEFAULT_MAX_ITEMS: 30,

  // Local Storage Cache Key
  LOCAL_STORAGE_KEY: 'savera24_rss_feed_cache_v1'
} as const;
