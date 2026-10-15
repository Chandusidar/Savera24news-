import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// RSS Feed Base Configuration
const RSS_FEED_BASE_URL = 'https://www.savera24news.in/feeds/posts/default?alt=rss';
const CATEGORY_RSS_BASE = 'https://www.savera24news.in/feeds/posts/default/-';

// XML Parser instance
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true,
  parseTagValue: false
});

// Simple in-memory cache with 60-second TTL
interface CacheItem {
  timestamp: number;
  data: unknown;
}
const rssCache = new Map<string, CacheItem>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

app.use(express.json());

// Enable CORS for API routes
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * Clean & upgrade Blogger thumbnail URLs to high-resolution
 */
function upgradeBloggerImageUrl(url?: string): string {
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
 * Extract image URLs from HTML description
 */
function extractImagesFromHtml(html: string): string[] {
  if (!html) return [];
  const images: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const src = match[1];
    if (src && !src.includes('clear.cache.gif') && !src.includes('pixel') && !images.includes(src)) {
      images.push(upgradeBloggerImageUrl(src));
    }
  }
  return images;
}

/**
 * Extract clean author name from Blogger author format: "noreply@blogger.com (Author Name)"
 */
function parseAuthorName(rawAuthor?: string): string {
  if (!rawAuthor) return 'सवेरा 24 न्यूज़ डेस्क';
  const match = rawAuthor.match(/\((.*?)\)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return rawAuthor.replace('noreply@blogger.com', '').trim() || 'सवेरा 24 न्यूज़ डेस्क';
}

/**
 * Parse XML category list (single object, array of objects, or strings)
 */
function parseCategories(catData: unknown): string[] {
  if (!catData) return [];
  const list = Array.isArray(catData) ? catData : [catData];
  const categories: string[] = [];

  for (const item of list) {
    if (typeof item === 'string') {
      const clean = item.replace(/^#+/, '').trim();
      if (clean && !categories.includes(clean)) categories.push(clean);
    } else if (item && typeof item === 'object') {
      const textVal = (item as Record<string, unknown>)['#text'] || (item as Record<string, unknown>)['term'];
      if (typeof textVal === 'string') {
        const clean = textVal.replace(/^#+/, '').trim();
        if (clean && !categories.includes(clean)) categories.push(clean);
      }
    }
  }
  return categories;
}

/**
 * Parse Blogger RSS XML string into standardized JSON news article objects
 */
function parseBloggerRssXml(xmlString: string) {
  const parsed = xmlParser.parse(xmlString);
  const channel = parsed?.rss?.channel || parsed?.channel;
  if (!channel) {
    throw new Error('Invalid RSS structure: missing channel');
  }

  const rawItems = channel.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];

  const articles = rawItems.map((item: Record<string, unknown>, index: number) => {
    const title = typeof item.title === 'string' ? item.title.trim() : 'अनाम समाचार';
    const link = typeof item.link === 'string' ? item.link.trim() : 'https://www.savera24news.in/';
    const pubDate = typeof item.pubDate === 'string' ? item.pubDate.trim() : new Date().toISOString();
    const rawDesc = typeof item.description === 'string' ? item.description : '';

    // Thumbnail from media:thumbnail attribute @_url
    const mediaThumbObj = item['media:thumbnail'] as Record<string, unknown> | undefined;
    let mainImage = upgradeBloggerImageUrl(
      typeof mediaThumbObj?.['@_url'] === 'string' ? mediaThumbObj['@_url'] : undefined
    );

    // Extract all images from description
    const allImages = extractImagesFromHtml(rawDesc);
    if (!mainImage && allImages.length > 0) {
      mainImage = allImages[0];
    }

    // Categories
    const categories = parseCategories(item.category);

    // Author
    const author = parseAuthorName(typeof item.author === 'string' ? item.author : undefined);

    // GUID / ID
    const guidObj = item.guid as Record<string, unknown> | string | undefined;
    const guid = typeof guidObj === 'string' ? guidObj : (typeof guidObj === 'object' && typeof guidObj?.['#text'] === 'string' ? guidObj['#text'] : link || `article_${index}`);

    // Detect breaking news
    const isBreaking =
      categories.some((c) => c.includes('ब्रेकिंग') || c.toLowerCase().includes('breaking')) ||
      title.includes('ब्रेकिंग') ||
      title.toUpperCase().includes('BREAKING') ||
      title.includes('बड़ी खबर');

    return {
      id: guid,
      title,
      link,
      originalUrl: link,
      pubDate,
      publishedAt: pubDate,
      author,
      categories,
      descriptionHtml: rawDesc,
      imageUrl: mainImage,
      allImages,
      isBreaking
    };
  });

  return {
    channel: {
      title: channel.title || 'सवेरा 24 न्यूज़',
      link: channel.link || 'https://www.savera24news.in/',
      description: channel.description || 'सच की राह सवेरा के साथ'
    },
    total: articles.length,
    articles
  };
}

/**
 * 1. Primary Endpoint: GET /api/rss-feed
 * Reads the official Blogger RSS feed XML, parses it safely with caching, and returns JSON.
 * Supports query parameters:
 * - category: Category filter (e.g. "महासमुंद", "पिथौरा")
 * - q: Search query (case-insensitive title/desc filter)
 * - limit: Maximum items to return
 */
app.get('/api/rss-feed', async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 30, 1), 50);

    const cacheKey = `rss_${category}_${q}_${limit}`;
    const cached = rssCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.json(cached.data);
    }

    // Determine Blogger RSS URL (either category feed or default feed)
    let feedUrl = RSS_FEED_BASE_URL;
    if (category && category !== 'all') {
      feedUrl = `${CATEGORY_RSS_BASE}/${encodeURIComponent(category)}?alt=rss`;
    }

    const resp = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Savera24NewsRSSReader/1.0; +https://www.savera24news.in)'
      }
    });

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: `Blogger RSS Feed returned status ${resp.status}`,
        articles: []
      });
    }

    const xmlText = await resp.text();
    const parsedData = parseBloggerRssXml(xmlText);

    // Apply search filter if query provided
    let finalArticles = parsedData.articles;
    if (q) {
      finalArticles = finalArticles.filter(
        (art: { title: string; categories: string[]; descriptionHtml: string }) =>
          art.title.toLowerCase().includes(q) ||
          art.categories.some((c: string) => c.toLowerCase().includes(q)) ||
          art.descriptionHtml.toLowerCase().includes(q)
      );
    }

    if (limit && finalArticles.length > limit) {
      finalArticles = finalArticles.slice(0, limit);
    }

    const responsePayload = {
      ...parsedData,
      total: finalArticles.length,
      articles: finalArticles,
      feedUrl,
      source: 'Blogger RSS 2.0'
    };

    rssCache.set(cacheKey, {
      timestamp: Date.now(),
      data: responsePayload
    });

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json(responsePayload);
  } catch (error) {
    console.error('Error in /api/rss-feed:', error);
    return res.status(500).json({
      error: 'Failed to fetch and parse Blogger RSS feed',
      details: error instanceof Error ? error.message : String(error),
      articles: []
    });
  }
});

/**
 * 2. Raw XML Proxy: GET /api/rss-xml
 * Serves the raw Blogger RSS XML with CORS headers and 60-second caching
 * Useful for Android apps or external RSS feed consumers.
 */
app.get('/api/rss-xml', async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    let feedUrl = RSS_FEED_BASE_URL;
    if (category && category !== 'all') {
      feedUrl = `${CATEGORY_RSS_BASE}/${encodeURIComponent(category)}?alt=rss`;
    }

    const cacheKey = `raw_xml_${feedUrl}`;
    const cached = rssCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.send(cached.data);
    }

    const resp = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Savera24NewsRSSReader/1.0; +https://www.savera24news.in)'
      }
    });

    if (!resp.ok) {
      return res.status(resp.status).send(`<!-- Error fetching RSS feed: ${resp.status} -->`);
    }

    const xmlText = await resp.text();
    rssCache.set(cacheKey, {
      timestamp: Date.now(),
      data: xmlText
    });

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.send(xmlText);
  } catch (err) {
    console.error('Error fetching raw RSS XML:', err);
    return res.status(500).send('<!-- Error fetching RSS XML -->');
  }
});

/**
 * Backward compatibility: GET /api/feed
 * Redirects or proxies to /api/rss-feed
 */
app.get('/api/feed', async (req: Request, res: Response) => {
  try {
    // Forward query parameters
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const limit = req.query['max-results'] || req.query.limit || 30;

    const queryParams = new URLSearchParams();
    if (category) queryParams.set('category', category);
    if (q) queryParams.set('q', q);
    queryParams.set('limit', limit.toString());

    // Call internal logic
    const internalUrl = `http://localhost:${PORT}/api/rss-feed?${queryParams.toString()}`;
    const internalResp = await fetch(internalUrl);
    const data = await internalResp.json();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Feed proxy error', articles: [] });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Savera 24 News RSS Feed Engine',
    rssFeedUrl: RSS_FEED_BASE_URL,
    time: new Date().toISOString()
  });
});

async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT)
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Savera 24 News RSS Server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer();
