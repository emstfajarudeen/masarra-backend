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
import { SelectField } from '@/components/ui/select_field'
import React, { useState } from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const statusLabels: Record<string, string> = {
  all: 'كل الحالات',
  draft: 'مسودة',
  published: 'منشور',
}

const AdminContentPages: React.FC<AdminContentPagesProps> = ({ pages, filters, stats }) => {
  const hasActiveFilters = filters.status && filters.status !== 'all'

  const [isFilterExpanded, setIsFilterExpanded] = useState(!!hasActiveFilters)

  return (
    <AdminLayout title="الصفحات">
      <section className="admin-content-hero">
        <article>
          <span>إجمالي الصفحات</span>
          <strong>{stats.total}</strong>
          <p>كل الصفحات</p>
        </article>
        <article>
          <span>المنشورة</span>
          <strong>{stats.published}</strong>
          <p>ظاهرة في الموقع</p>
        </article>
        <article>
          <span>المسودات</span>
          <strong>{stats.draft}</strong>
          <p>قيد التحرير</p>
        </article>
      </section>

      <section className="admin-panel bg-white border border-[var(--masarra-border-soft)]">
        <div className="p-6">
          <button
            type="button"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="w-full flex items-center justify-between cursor-pointer focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-[var(--masarra-purple)]" />
              <h3 className="text-lg font-bold text-[var(--masarra-purple-deep)]">تصفية الصفحات</h3>
            </div>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-[var(--masarra-purple-deep)] transition-transform duration-200',
                isFilterExpanded && 'rotate-180'
              )}
            />
          </button>

          {isFilterExpanded && (
            <form
              method="get"
              action="/admin/content-pages"
              className="space-y-6 pt-6 animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-1 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    الحالة
                  </label>
                  <SelectField
                    name="status"
                    defaultValue={filters.status}
                    options={statusOptions.map((status) => ({
                      value: status,
                      label: statusLabels[status],
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--masarra-border-soft)]">
                <Button variant="ghost" asChild>
                  <a
                    href="/admin/content-pages"
                    className="hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    إعادة ضبط
                  </a>
                </Button>
                <Button
                  type="submit"
                  className="bg-[var(--masarra-purple)] hover:bg-[var(--masarra-purple-bright)] text-white shadow-sm px-6"
                >
                  تطبيق التصفية
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>صفحات المحتوى</h2>
          </div>
          <AdminButtonLink href="/admin/content-pages/create">+ إضافة صفحة</AdminButtonLink>
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
                <TableHead>العنوان</TableHead>
                <TableHead>المعرف الفريد (Slug)</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ التعديل</TableHead>
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
