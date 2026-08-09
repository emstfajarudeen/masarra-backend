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
import React, { useState } from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GameRow extends Record<string, JSONDataTypes> {
  id: string
  slug: string
  title: string
  status: string
  minTeamCount: number
  maxTeamCount: number
  allowedRoundCounts: number[]
  allowedQuestionDurations: number[]
  baseRoundCreditCost: number
  optionalCategoriesEnabled: boolean
  createdAt: string | null
}

interface GameFilters extends Record<string, JSONDataTypes> {
  status: string
  optionalCategories: string
}

interface GameStats extends Record<string, JSONDataTypes> {
  total: number
  published: number
  draft: number
  withOptionalCategories: number
}

export interface AdminGamesProps extends Record<string, JSONDataTypes> {
  games: GameRow[]
  filters: GameFilters
  stats: GameStats
}

const statusOptions = ['all', 'draft', 'published', 'archived'] as const
const optionalCategoryOptions = ['all', 'enabled', 'disabled'] as const

const statusLabels: Record<string, string> = {
  all: 'كل الحالات',
  draft: 'مسودة',
  published: 'منشور',
  archived: 'مؤرشف',
}

const optionalCategoryLabels: Record<string, string> = {
  all: 'كل الألعاب',
  enabled: 'تدعم باقات أقسام',
  disabled: 'لا تدعم باقات أقسام',
}

function formatList(values: number[]) {
  return values.length > 0 ? values.join(', ') : '—'
}

const AdminGames: React.FC<AdminGamesProps> = ({ games, filters, stats }) => {
  const hasActiveFilters =
    (filters.status && filters.status !== 'all') ||
    (filters.optionalCategories && filters.optionalCategories !== 'all')

  const [isFilterExpanded, setIsFilterExpanded] = useState(!!hasActiveFilters)

  return (
    <AdminLayout title="الألعاب">
      <section className="admin-config-hero">
        <article>
          <span>إجمالي الألعاب</span>
          <strong>{stats.total}</strong>
          <p>كل الألعاب</p>
        </article>
        <article>
          <span>المنشورة</span>
          <strong>{stats.published}</strong>
          <p>ظاهرة للمستخدم</p>
        </article>
        <article>
          <span>المسودات</span>
          <strong>{stats.draft}</strong>
          <p>قيد الإعداد</p>
        </article>
        <article>
          <span>الباقات الاختيارية</span>
          <strong>{stats.withOptionalCategories}</strong>
          <p>تدعم أقسام مدفوعة</p>
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
              <h3 className="text-lg font-bold text-[var(--masarra-purple-deep)]">تصفية الألعاب</h3>
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
              action="/admin/games"
              className="space-y-6 pt-6 animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    المجموعات الاختيارية
                  </label>
                  <SelectField
                    name="optionalCategories"
                    defaultValue={filters.optionalCategories}
                    options={optionalCategoryOptions.map((value) => ({
                      value,
                      label: optionalCategoryLabels[value],
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--masarra-border-soft)]">
                <Button variant="ghost" asChild>
                  <a
                    href="/admin/games"
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
            <h2>قائمة الألعاب</h2>
          </div>
          <AdminButtonLink href="/admin/games/create">+ إضافة لعبة</AdminButtonLink>
        </div>

        {games.length === 0 ? (
          <AdminEmptyState
            title="لا توجد ألعاب مطابقة"
            body="غيّر الفلاتر أو أضف لعبة جديدة من زر الإضافة."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px" />
                <TableHead>العنوان</TableHead>
                <TableHead>المعرف الفريد (Slug)</TableHead>
                <TableHead>الفرق</TableHead>
                <TableHead>الرصيد للجولة</TableHead>
                <TableHead>الجولات</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    <EditIconLink href={`/admin/games/${game.id}/edit`} />
                  </TableCell>
                  <TableCell>{game.title}</TableCell>
                  <TableCell dir="ltr">{game.slug}</TableCell>
                  <TableCell>
                    {game.minTeamCount}-{game.maxTeamCount}
                  </TableCell>
                  <TableCell>{game.baseRoundCreditCost}</TableCell>
                  <TableCell>{formatList(game.allowedRoundCounts)}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={game.status} />
                  </TableCell>
                  <TableCell>
                    <div className="admin-row-actions">
                      <ViewIconLink href={`/admin/games/${game.id}`} />
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

export default AdminGames
