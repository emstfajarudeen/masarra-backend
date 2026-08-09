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
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import React, { useState } from 'react'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { router } from '@inertiajs/react'

export interface FunRuleRow extends Record<string, JSONDataTypes> {
  id: string
  code: string
  nameAr: string
  nameEn: string | null
  descriptionAr: string | null
  descriptionEn: string | null
  effectType: string
  config: Record<string, JSONDataTypes>
  isActive: boolean
  sortOrder: number
  createdAt: string | null
}

interface FunRuleFilters extends Record<string, JSONDataTypes> {
  search: string
  isActive: string
}

interface FunRuleStats extends Record<string, JSONDataTypes> {
  total: number
  active: number
  inactive: number
}

export interface AdminFunRulesProps extends Record<string, JSONDataTypes> {
  rules: FunRuleRow[]
  filters: FunRuleFilters
  stats: FunRuleStats
}

const statusOptions = ['all', 'active', 'inactive'] as const

const statusLabels: Record<string, string> = {
  all: 'كل الحالات',
  active: 'مفعّل',
  inactive: 'معطّل',
}

const effectTypeLabels: Record<string, string> = {
  normal: 'نقاط عادية',
  steal: 'خصم نقاط',
  transfer: 'تحويل نقاط',
  freeze: 'تجميد',
  double: 'مضاعفة',
  custom: 'مخصص',
}

const AdminFunRules: React.FC<AdminFunRulesProps> = ({ rules, filters, stats }) => {
  const hasActiveFilters =
    (filters.search && filters.search.length > 0) ||
    (filters.isActive && filters.isActive !== 'all')

  const [isFilterExpanded, setIsFilterExpanded] = useState(!!hasActiveFilters)

  const toggleStatus = (id: string) => {
    router.patch(`/admin/fun-rules/${id}/status`, {}, { preserveScroll: true })
  }

  return (
    <AdminLayout title="قواعد التأثير">
      <section className="admin-config-hero">
        <article>
          <span>إجمالي القواعد</span>
          <strong>{stats.total}</strong>
          <p>كل القواعد</p>
        </article>
        <article>
          <span>المفعّلة</span>
          <strong>{stats.active}</strong>
          <p>متاحة للاختيار</p>
        </article>
        <article>
          <span>المعطّلة</span>
          <strong>{stats.inactive}</strong>
          <p>غير متاحة</p>
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
              <h3 className="text-lg font-bold text-[var(--masarra-purple-deep)]">تصفية القواعد</h3>
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
              action="/admin/fun-rules"
              className="space-y-6 pt-6 animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    بحث بالاسم أو الكود
                  </label>
                  <input
                    type="text"
                    name="search"
                    defaultValue={filters.search}
                    placeholder="ابحث هنا..."
                    className="h-10 rounded-xl border border-[var(--masarra-border-soft)] px-3 text-sm focus:border-[var(--masarra-purple)] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    الحالة
                  </label>
                  <SelectField
                    name="isActive"
                    defaultValue={filters.isActive || 'all'}
                    options={statusOptions.map((value) => ({
                      value,
                      label: statusLabels[value],
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--masarra-border-soft)]">
                <Button variant="ghost" asChild>
                  <a
                    href="/admin/fun-rules"
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
            <h2>قائمة قواعد التأثير</h2>
          </div>
          <AdminButtonLink href="/admin/fun-rules/create">+ إضافة قاعدة</AdminButtonLink>
        </div>

        {rules.length === 0 ? (
          <AdminEmptyState
            title="لا توجد قواعد تأثير"
            body="قم بإضافة أول قاعدة تأثير ليتم استخدامها في الأسئلة."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px" />
                <TableHead>الاسم</TableHead>
                <TableHead>الكود</TableHead>
                <TableHead>نوع التأثير</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الترتيب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <EditIconLink href={`/admin/fun-rules/${rule.id}/edit`} />
                  </TableCell>
                  <TableCell className="font-bold">{rule.nameAr}</TableCell>
                  <TableCell dir="ltr">
                    <span className="font-mono text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {rule.code}
                    </span>
                  </TableCell>
                  <TableCell>{effectTypeLabels[rule.effectType] ?? rule.effectType}</TableCell>
                  <TableCell className="max-w-xs truncate text-[var(--masarra-muted)] text-sm">
                    {rule.descriptionAr || '—'}
                  </TableCell>
                  <TableCell>{rule.sortOrder}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={rule.isActive ? 'published' : 'draft'} />
                  </TableCell>
                  <TableCell>
                    <div className="admin-row-actions">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(rule.id)}
                      >
                        {rule.isActive ? 'تعطيل' : 'تفعيل'}
                      </Button>
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

export default AdminFunRules
