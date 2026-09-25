import type { MetadataRoute } from 'next'
import { PUBLIC_BASE } from './[lang]/_components/meta'
import { LANGS } from './[lang]/_data/body'

// Карта сайта — только с настоящим адресом: адрес петли машины поисковику не нужен.
export default function sitemap(): MetadataRoute.Sitemap {
  if (!PUBLIC_BASE) return []
  return LANGS.map((lang) => ({
    url: `${PUBLIC_BASE}/${lang}`,
    alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, `${PUBLIC_BASE}/${l}`])) },
  }))
}
