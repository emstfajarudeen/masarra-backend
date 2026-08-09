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
import { EditIconLink, ViewIconLink } from '~/components/admin/table_actions'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select_field'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import React, { useState } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryRow extends Record<string, JSONDataTypes> {
  id: string
  slug: string
  gameId: string
  title: string
  gameTitle: string
  status: string
  priceAmount: string | null
  priceCurrency: string
  createdAt: string | null
}

interface GameOption extends Record<string, JSONDataTypes> {
  id: string
  title: string
}

interface CategoryFilters extends Record<string, JSONDataTypes> {
  gameId: string
  status: string
}

interface CategoryStats extends Record<string, JSONDataTypes> {
  total: number
  published: number
  paid: number
}

export interface AdminCategoriesProps extends Record<string, JSONDataTypes> {
  categories: CategoryRow[]
  filters: CategoryFilters
  stats: CategoryStats
  games: GameOption[]
}

const statusOptions = ['all', 'draft', 'published', 'archived'] as const

const statusLabels: Record<string, string> = {
  all: 'كل الحالات',
  draft: 'مسودة',
  published: 'منشور',
  archived: 'مؤرشف',
}

const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, filters, stats, games }) => {
  const [gameId, setGameId] = useState(filters.gameId || 'all')

  const hasActiveFilters =
    (filters.gameId && filters.gameId !== 'all') || (filters.status && filters.status !== 'all')

  const [isFilterExpanded, setIsFilterExpanded] = useState(!!hasActiveFilters)

  return (
    <AdminLayout title="الأقسام">
      <section className="admin-config-hero">
        <article>
          <span>إجمالي الأقسام</span>
          <strong>{stats.total}</strong>
          <p>كل الأقسام</p>
        </article>
        <article>
          <span>المنشورة</span>
          <strong>{stats.published}</strong>
          <p>قابلة للظهور</p>
        </article>
        <article>
          <span>الباقات المدفوعة</span>
          <strong>{stats.paid}</strong>
          <p>لها سعر</p>
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
              <h3 className="text-lg font-bold text-[var(--masarra-purple-deep)]">تصفية الأقسام</h3>
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
              action="/admin/categories"
              className="space-y-6 pt-6 animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    اللعبة
                  </label>
                  <input type="hidden" name="gameId" value={gameId === 'all' ? '' : gameId} />
                  <SelectField
                    value={gameId}
                    onValueChange={setGameId}
                    options={[
                      { value: 'all', label: 'كل الألعاب' },
                      ...games.map((game) => ({ value: game.id, label: game.title })),
                    ]}
                    className="w-full"
                  />
                </div>

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
                    href="/admin/categories"
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
            <h2>الأقسام الاختيارية</h2>
          </div>
          <AdminButtonLink href="/admin/categories/create">+ إضافة قسم</AdminButtonLink>
        </div>

        {categories.length === 0 ? (
          <AdminEmptyState
            title="لا توجد أقسام مطابقة"
            body="غيّر الفلاتر أو أضف أول قسم اختياري مثل رمضان أو العيد."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px" />
                <TableHead>القسم</TableHead>
                <TableHead>اللعبة</TableHead>
                <TableHead>المعرف الفريد (Slug)</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <EditIconLink href={`/admin/categories/${category.id}/edit`} />
                  </TableCell>
                  <TableCell>{category.title}</TableCell>
                  <TableCell>{category.gameTitle}</TableCell>
                  <TableCell dir="ltr">{category.slug}</TableCell>
                  <TableCell>
                    {category.priceAmount ?? '—'} {category.priceCurrency}
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge status={category.status} />
                  </TableCell>
                  <TableCell>
                    <div className="admin-row-actions">
                      <ViewIconLink href={`/admin/categories/${category.id}`} />
                    </div>
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

export default AdminCategories
