import {
  AdminButtonLink,
  AdminEmptyState,
  AdminLayout,
  AdminStatusBadge,
} from '~/components/admin/admin_layout'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface ContentPageRow extends Record<string, JSONDataTypes> {
  id: string
  slug: string
  title: string
  excerpt: string | null
  bodyPreview: string
  status: string
  createdAt: string | null
  updatedAt: string | null
}

interface ContentPageFilters extends Record<string, JSONDataTypes> {
  status: string
}

interface ContentPageStats extends Record<string, JSONDataTypes> {
  total: number
  published: number
  draft: number
}

export interface AdminContentPagesProps extends Record<string, JSONDataTypes> {
  pages: ContentPageRow[]
  filters: ContentPageFilters
  stats: ContentPageStats
}

const statusOptions = ['all', 'draft', 'published'] as const

function pagePurpose(slug: string) {
  if (slug.includes('terms')) return 'Terms'
  if (slug.includes('privacy')) return 'Privacy'
  if (slug.includes('about')) return 'About'
  if (slug.includes('how')) return 'How it works'
  return 'Content'
}

const AdminContentPages: React.FC<AdminContentPagesProps> = ({ pages, filters, stats }) => {
  return (
    <AdminLayout
      title="الصفحات"
      subtitle="إدارة صفحات الشروط، الخصوصية، والمحتوى العام."
      actions={<AdminButtonLink href="/admin/content-pages/create">+ Add page</AdminButtonLink>}
    >
      <section className="admin-content-hero">
        <article>
          <span>Total pages</span>
          <strong>{stats.total}</strong>
          <p>كل الصفحات</p>
        </article>
        <article>
          <span>Published</span>
          <strong>{stats.published}</strong>
          <p>ظاهرة في الموقع</p>
        </article>
        <article>
          <span>Draft</span>
          <strong>{stats.draft}</strong>
          <p>قيد التحرير</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>فلاتر الصفحات</h2>
            <p>راجع المحتوى القانوني والعام حسب حالة النشر.</p>
          </div>
        </div>

        <form className="admin-list-filters" method="get" action="/admin/content-pages">
          <label>
            <span>Status</span>
            <select name="status" defaultValue={filters.status}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <div>
            <button type="submit">Apply filters</button>
            <a href="/admin/content-pages">Reset</a>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>صفحات المحتوى</h2>
            <p>صفحات عامة متعددة اللغة، عربية الآن وجاهزة للإنجليزية لاحقاً.</p>
          </div>
        </div>

        {pages.length === 0 ? (
          <AdminEmptyState
            title="لا توجد صفحات مطابقة"
            body="غيّر الفلاتر أو أضف صفحات الشروط والخصوصية من زر الإضافة."
          />
        ) : (
          <div className="admin-content-card-grid">
            {pages.map((page) => (
              <article className="admin-content-card" key={page.id}>
                <div className="admin-content-card-head">
                  <div>
                    <span>{pagePurpose(page.slug)}</span>
                    <h3>{page.title}</h3>
                    <p dir="ltr">{page.slug}</p>
                  </div>
                  <AdminStatusBadge status={page.status} />
                </div>

                {page.excerpt ? <strong>{page.excerpt}</strong> : null}
                <p>{page.bodyPreview || 'No Arabic content preview yet.'}</p>

                <div className="admin-config-footer">
                  <span>
                    Updated {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '—'}
                  </span>
                  <a className="admin-row-link" href={`/admin/content-pages/${page.id}/edit`}>
                    Edit page
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  )
}

export default AdminContentPages
