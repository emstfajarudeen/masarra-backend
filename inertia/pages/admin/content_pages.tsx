import {
  AdminButtonLink,
  AdminEmptyState,
  AdminLayout,
  AdminStatusBadge,
} from '~/components/admin/admin_layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EditIconLink } from '~/components/admin/table_actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select_field'
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
    <AdminLayout title="الصفحات">
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
        <form className="admin-list-filters" method="get" action="/admin/content-pages">
          <div className="space-y-1">
            <Label>Status</Label>
            <SelectField
              name="status"
              defaultValue={filters.status}
              options={statusOptions.map((status) => ({ value: status, label: status }))}
            />
          </div>
          <div>
            <Button type="submit">Apply filters</Button>
            <Button variant="ghost" asChild>
              <a href="/admin/content-pages">Reset</a>
            </Button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>صفحات المحتوى</h2>
          </div>
          <AdminButtonLink href="/admin/content-pages/create">+ Add page</AdminButtonLink>
        </div>

        {pages.length === 0 ? (
          <AdminEmptyState
            title="لا توجد صفحات مطابقة"
            body="غيّر الفلاتر أو أضف صفحات الشروط والخصوصية من زر الإضافة."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px" />
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <EditIconLink href={`/admin/content-pages/${page.id}/edit`} />
                  </TableCell>
                  <TableCell>{page.title}</TableCell>
                  <TableCell dir="ltr">{page.slug}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={page.status} />
                  </TableCell>
                  <TableCell>
                    {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </AdminLayout>
  )
}

export default AdminContentPages
