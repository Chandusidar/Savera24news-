import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Simple in-memory cache with 60-second TTL
interface CacheItem {
  timestamp: number;
  data: unknown;
}
const feedCache = new Map<string, CacheItem>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

app.use(express.json());

// Enable CORS for API routes
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * Proxy Blogger feed safely with server-side caching and error handling
 * Handles queries:
 * - max-results (e.g. 30)
 * - start-index (e.g. 1, 31 for pagination)
 * - category (e.g. "महासमुंद", "ब्रेकिंग न्यूज़")
 * - q (search query)
 */
app.get('/api/feed', async (req: Request, res: Response) => {
  try {
    const maxResults = Math.min(Math.max(parseInt(req.query['max-results'] as string) || 30, 1), 50);
    const startIndex = Math.max(parseInt(req.query['start-index'] as string) || 1, 1);
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    const cacheKey = `feed_${maxResults}_${startIndex}_${category}_${q}`;
    const cached = feedCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.json(cached.data);
    }

    let bloggerUrl = 'https://www.savera24news.in/feeds/posts/default';
    if (category) {
      bloggerUrl += `/-/${encodeURIComponent(category)}`;
    }
    const params = new URLSearchParams({
      alt: 'json',
      'max-results': maxResults.toString(),
      'start-index': startIndex.toString()
    });
    if (q) {
      params.append('q', q);
    }

    const fullUrl = `${bloggerUrl}?${params.toString()}`;

    const bloggerResp = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Savera24NewsApp/1.0; +https://www.savera24news.in)'
      }
    });

    if (!bloggerResp.ok) {
      return res.status(bloggerResp.status).json({
        error: `Blogger API returned status ${bloggerResp.status}`,
        feed: { entry: [] }
      });
    }

    const feedData = await bloggerResp.json();
    feedCache.set(cacheKey, {
      timestamp: Date.now(),
      data: feedData
    });

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json(feedData);
  } catch (error) {
    console.error('Error fetching Blogger feed:', error);
    return res.status(500).json({
      error: 'Failed to fetch Blogger feed',
      feed: { entry: [] }
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Savera 24 News Backend', time: new Date().toISOString() });
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
    console.log(`Savera 24 News Server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer();
