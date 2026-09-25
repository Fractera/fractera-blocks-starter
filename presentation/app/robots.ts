import type { MetadataRoute } from 'next'
import { PUBLIC_BASE } from './[lang]/_components/meta'

// Главная элемента открыта поиску; служебные двери (API, MCP) — не страницы, поисковику там делать нечего.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: ['/en', '/ru'], disallow: ['/r/', '/mcp', '/health', '/showcase/'] },
    ...(PUBLIC_BASE ? { sitemap: `${PUBLIC_BASE}/sitemap.xml` } : {}),
  }
}
