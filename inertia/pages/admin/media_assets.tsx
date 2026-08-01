import { AdminButtonLink, AdminEmptyState, AdminLayout } from '~/components/admin/admin_layout'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface MediaAssetRow extends Record<string, JSONDataTypes> {
  id: string
  visibility: 'public' | 'private'
  originalName: string
  mimeType: string
  extension: string
  sizeBytes: number
  url: string
  createdAt: string | null
}

interface MediaLibraryFilters extends Record<string, JSONDataTypes> {
  type: 'all' | 'image' | 'video' | 'audio'
  visibility: 'all' | 'public' | 'private'
}

interface MediaLibraryStats extends Record<string, JSONDataTypes> {
  total: number
  images: number
  videos: number
  audios: number
}

export interface AdminMediaAssetsProps extends Record<string, JSONDataTypes> {
  mediaAssets: MediaAssetRow[]
  filters: MediaLibraryFilters
  stats: MediaLibraryStats
}

const typeFilters = [
  ['all', 'All', 'كل الملفات'],
  ['image', 'Images', 'صور'],
  ['video', 'Videos', 'فيديو'],
  ['audio', 'Audio', 'صوت'],
] as const

const visibilityFilters = [
  ['all', 'All visibility'],
  ['public', 'Public'],
  ['private', 'Private'],
] as const

function filterHref(
  type: MediaLibraryFilters['type'],
  visibility: MediaLibraryFilters['visibility']
) {
  const params = new URLSearchParams()
  if (type !== 'all') params.set('type', type)
  if (visibility !== 'all') params.set('visibility', visibility)
  const query = params.toString()
  return query ? `/admin/media-assets?${query}` : '/admin/media-assets'
}

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`
}

function mediaKind(mimeType: string) {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'file'
}

function MediaPreview({ asset }: { asset: MediaAssetRow }) {
  const kind = mediaKind(asset.mimeType)

  if (kind === 'image') {
    return <img src={asset.url} alt={asset.originalName} loading="lazy" />
  }

  if (kind === 'video') {
    return <video src={asset.url} controls preload="metadata" />
  }

  if (kind === 'audio') {
    return (
      <div className="admin-media-card-audio">
        <span>🎧</span>
        <audio src={asset.url} controls preload="metadata" />
      </div>
    )
  }

  return <span className="admin-media-card-file">{asset.extension.toUpperCase()}</span>
}

const AdminMediaAssets: React.FC<AdminMediaAssetsProps> = ({ mediaAssets, filters, stats }) => {
  return (
    <AdminLayout
      title="مكتبة الوسائط"
      subtitle="إدارة ملفات الأسئلة المخزنة محلياً حالياً، مع إبقاء المرجع قابلاً للنقل إلى S3 لاحقاً."
      actions={
        <AdminButtonLink href="/admin/questions/create">+ Add media question</AdminButtonLink>
      }
    >
      <section className="admin-media-library-hero">
        <article>
          <span>Total</span>
          <strong>{stats.total}</strong>
          <p>كل الوسائط</p>
        </article>
        <article>
          <span>Images</span>
          <strong>{stats.images}</strong>
          <p>صور</p>
        </article>
        <article>
          <span>Videos</span>
          <strong>{stats.videos}</strong>
          <p>فيديو</p>
        </article>
        <article>
          <span>Audio</span>
          <strong>{stats.audios}</strong>
          <p>صوت</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>الملفات</h2>
            <p>استخدم الفلاتر لمراجعة الملفات حسب النوع أو صلاحية الظهور.</p>
          </div>
          <div className="admin-media-filters" dir="ltr">
            {typeFilters.map(([type, label, caption]) => (
              <a
                key={type}
                className={filters.type === type ? 'is-active' : ''}
                href={filterHref(type, filters.visibility)}
              >
                <strong>{label}</strong>
                <small>{caption}</small>
              </a>
            ))}
          </div>
        </div>

        <div className="admin-media-visibility-filter" dir="ltr">
          {visibilityFilters.map(([visibility, label]) => (
            <a
              key={visibility}
              className={filters.visibility === visibility ? 'is-active' : ''}
              href={filterHref(filters.type, visibility)}
            >
              {label}
            </a>
          ))}
        </div>

        {mediaAssets.length === 0 ? (
          <AdminEmptyState
            title="لا توجد وسائط"
            body="ارفع ملفاً من نموذج السؤال. بعد الرفع سيظهر هنا للاستخدام مرة أخرى."
          />
        ) : (
          <div className="admin-media-grid">
            {mediaAssets.map((asset) => (
              <article className="admin-media-card" key={asset.id}>
                <div className="admin-media-card-preview">
                  <MediaPreview asset={asset} />
                </div>
                <div className="admin-media-card-body">
                  <strong title={asset.originalName}>{asset.originalName}</strong>
                  <p dir="ltr">{asset.mimeType}</p>
                  <div>
                    <span>{formatFileSize(asset.sizeBytes)}</span>
                    <span>{asset.visibility}</span>
                    <a href={asset.url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  )
}

export default AdminMediaAssets
