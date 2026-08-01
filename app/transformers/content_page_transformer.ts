import type ContentPage from '#models/content_page'
import type ContentPageTranslation from '#models/content_page_translation'

export interface ContentPageDto {
  slug: string
  title: string
  excerpt: string | null
  body: string
  locale: string
  metadata: Record<string, unknown>
  publishedAt: string | null
}

export function serializeContentPage(
  page: ContentPage,
  translation: ContentPageTranslation
): ContentPageDto {
  return {
    slug: page.slug,
    title: translation.title,
    excerpt: translation.excerpt,
    body: translation.body,
    locale: translation.locale,
    metadata: translation.metadata,
    publishedAt: page.publishedAt?.toISO() ?? null,
  }
}
