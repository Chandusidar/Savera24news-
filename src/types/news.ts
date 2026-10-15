/**
 * Types for Savera 24 News (सवेरा 24 न्यूज़)
 */

export interface BloggerLink {
  rel: string;
  type?: string;
  href: string;
  title?: string;
}

export interface BloggerAuthor {
  name: { $t: string };
  uri?: { $t: string };
  gd$image?: { src: string };
}

export interface BloggerCategory {
  term: string;
  scheme?: string;
}

export interface BloggerMediaThumbnail {
  url: string;
  height: string;
  width: string;
}

export interface RawBloggerEntry {
  id: { $t: string };
  published: { $t: string };
  updated: { $t: string };
  title: { $t: string };
  content?: { $t: string; type?: string };
  summary?: { $t: string; type?: string };
  link: BloggerLink[];
  author?: BloggerAuthor[];
  category?: BloggerCategory[];
  media$thumbnail?: BloggerMediaThumbnail;
}

export interface RawBloggerFeed {
  feed: {
    title: { $t: string };
    updated: { $t: string };
    category?: BloggerCategory[];
    entry?: RawBloggerEntry[];
    openSearch$totalResults?: { $t: string };
    openSearch$startIndex?: { $t: string };
    openSearch$itemsPerPage?: { $t: string };
  };
}

export interface VideoInfo {
  type: 'youtube' | 'html5';
  videoId?: string;
  videoUrl: string;
  embedUrl?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  contentHtml: string;
  imageUrl: string;
  allImages: string[];
  publishedAt: string;
  publishedFormatted: string;
  relativeTime: string;
  updatedAt: string;
  author: string;
  categories: string[];
  originalUrl: string;
  isBreaking: boolean;
  videoData: VideoInfo | null;
  wordCount: number;
  readingTime: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  hindiName: string;
  bloggerTag: string; // The term in Blogger feed
  iconName?: string;
  description?: string;
}

export const APP_CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'Home', hindiName: 'सभी खबरें', bloggerTag: '' },
  { id: 'breaking', name: 'Breaking News', hindiName: 'ब्रेकिंग न्यूज़', bloggerTag: 'ब्रेकिंग न्यूज़' },
  { id: 'chhattisgarh', name: 'Chhattisgarh', hindiName: 'छत्तीसगढ़', bloggerTag: 'छत्तीसगढ़' },
  { id: 'mahasamund', name: 'Mahasamund', hindiName: 'महासमुंद', bloggerTag: 'महासमुंद' },
  { id: 'pithora', name: 'Pithora', hindiName: 'पिथौरा', bloggerTag: 'पिथौरा' },
  { id: 'basna', name: 'Basna', hindiName: 'बसना', bloggerTag: 'बसना' },
  { id: 'saraipali', name: 'Saraipali', hindiName: 'सरायपाली', bloggerTag: 'सरायपाली' },
  { id: 'bagbahara', name: 'Bagbahara', hindiName: 'बागबाहरा', bloggerTag: 'बागबाहरा' },
  { id: 'politics', name: 'Politics', hindiName: 'राजनीति', bloggerTag: 'राजनीती' },
  { id: 'education', name: 'Education', hindiName: 'शिक्षा', bloggerTag: 'शिक्षा' },
  { id: 'crime', name: 'Crime', hindiName: 'अपराध', bloggerTag: 'अपराध' },
  { id: 'sports', name: 'Sports', hindiName: 'खेल', bloggerTag: 'खेल' },
  { id: 'raipur', name: 'Raipur', hindiName: 'रायपुर', bloggerTag: 'रायपुर' },
  { id: 'entertainment', name: 'Entertainment', hindiName: 'मनोरंजन', bloggerTag: 'मनोरंजन' }
];

export type NavigationTab = 'home' | 'breaking' | 'photos' | 'videos' | 'categories';
