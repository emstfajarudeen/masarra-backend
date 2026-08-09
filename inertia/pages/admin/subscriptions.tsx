import {
  AdminButtonLink,
  AdminEmptyState,
  AdminLayout,
  AdminStatusBadge,
} from '~/components/admin/admin_layout'
import { ConfirmDialog } from '~/components/admin/confirm_dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EditIconLink, RowActionMenu } from '~/components/admin/table_actions'
import { DropdownMenuItem } from '@/components/ui/dropdown_menu'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select_field'
import { router } from '@inertiajs/react'
import { Eye } from 'lucide-react'
import React, { useState } from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface PlanRow extends Record<string, JSONDataTypes> {
  id: string
  slug: string
  title: string
  status: string
  priceAmount: string
  priceCurrency: string
  roundsGranted: number
  maxTeams: number
  isFeatured: boolean
  badgeLabel: string
  ctaLabel: string
  note: string
  advantages: string
  createdAt: string | null
}

interface PlanFilters extends Record<string, JSONDataTypes> {
  status: string
}

interface PlanStats extends Record<string, JSONDataTypes> {
  total: number
  published: number
  featured: number
}

export interface AdminSubscriptionsProps extends Record<string, JSONDataTypes> {
  plans: PlanRow[]
  filters: PlanFilters
  stats: PlanStats
}

const statusOptions = ['all', 'draft', 'published', 'archived'] as const

function PlanCardPreview({ plan }: { plan: PlanRow }) {
  const isFree = (Number(plan.priceAmount) || 0) === 0

  return (
    <div className={`plan-card ${plan.isFeatured ? 'is-featured' : ''}`} dir="rtl">
      {plan.badgeLabel ? <span className="plan-card-badge">⭐ {plan.badgeLabel}</span> : null}
      <h3 className="plan-card-title">{plan.title}</h3>
      <div className="plan-card-price">
        {isFree ? 'مجاني' : plan.priceAmount}
        {!isFree ? <span className="plan-card-currency">{plan.priceCurrency}</span> : null}
      </div>
      <p className="plan-card-rounds">{plan.roundsGranted} جولة</p>
      {plan.advantages ? (
        <div
          className="plan-card-advantages"
          dangerouslySetInnerHTML={{ __html: plan.advantages }}
        />
      ) : (
        <p className="plan-card-advantages-empty">لا توجد مزايا مضافة.</p>
      )}
      {plan.note ? <p className="plan-card-note">{plan.note}</p> : null}
      <button type="button" className="plan-card-cta" disabled>
        {plan.ctaLabel || 'اشترك'}
      </button>
    </div>
  )
}

const AdminSubscriptions: React.FC<AdminSubscriptionsProps> = ({ plans, filters, stats }) => {
  const [pendingDelete, setPendingDelete] = useState<PlanRow | null>(null)
  const [previewPlan, setPreviewPlan] = useState<PlanRow | null>(null)

  const confirmDelete = () => {
    if (!pendingDelete) return
    router.delete(`/admin/subscriptions/${pendingDelete.id}`, { preserveScroll: true })
    setPendingDelete(null)
  }

  return (
    <AdminLayout title="الاشتراكات">
      <section className="admin-config-hero">
        <article>
          <span>Total plans</span>
          <strong>{stats.total}</strong>
          <p>كل الباقات</p>
        </article>
        <article>
          <span>Published</span>
          <strong>{stats.published}</strong>
          <p>ظاهرة للمستخدم</p>
        </article>
        <article>
          <span>Featured</span>
          <strong>{stats.featured}</strong>
          <p>الأكثر شيوعاً</p>
        </article>
      </section>

      <section className="admin-panel">
        <form className="admin-list-filters" method="get" action="/admin/subscriptions">
          <SelectField
            name="status"
            defaultValue={filters.status}
            options={statusOptions.map((status) => ({ value: status, label: status }))}
          />
          <div>
            <Button type="submit">Apply filters</Button>
            <Button variant="ghost" asChild>
              <a href="/admin/subscriptions">Reset</a>
            </Button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>باقات الاشتراك</h2>
          </div>
          <AdminButtonLink href="/admin/subscriptions/create">+ Add plan</AdminButtonLink>
        </div>

        {plans.length === 0 ? (
          <AdminEmptyState
            title="لا توجد باقات مطابقة"
            body="غيّر الفلتر أو أضف أول باقة اشتراك."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px" />
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Rounds</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <EditIconLink href={`/admin/subscriptions/${plan.id}/edit`} />
                  </TableCell>
                  <TableCell>{plan.title}</TableCell>
                  <TableCell>
                    {Number(plan.priceAmount) === 0
                      ? 'Free'
                      : `${plan.priceAmount} ${plan.priceCurrency}`}
                  </TableCell>
                  <TableCell>{plan.roundsGranted}</TableCell>
                  <TableCell>{plan.maxTeams}</TableCell>
                  <TableCell>{plan.isFeatured ? '★' : '—'}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={plan.status} />
                  </TableCell>
                  <TableCell>
                    <RowActionMenu onDelete={() => setPendingDelete(plan)}>
                      <DropdownMenuItem onSelect={() => setPreviewPlan(plan)}>
                        <Eye />
                        <span>View</span>
                      </DropdownMenuItem>
                    </RowActionMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {previewPlan ? (
        <div className="admin-media-modal-overlay" onClick={() => setPreviewPlan(null)}>
          <div
            className="admin-media-modal admin-subscription-preview-modal"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-media-modal-header">
              <h3>معاينة البطاقة</h3>
              <button
                type="button"
                className="admin-media-modal-close"
                onClick={() => setPreviewPlan(null)}
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>
            <div className="admin-subscription-preview-modal-body">
              <PlanCardPreview plan={previewPlan} />
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        title="حذف باقة الاشتراك"
        description={
          pendingDelete
            ? `هل تريد حذف "${pendingDelete.title}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : undefined
        }
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        destructive
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  )
}

export default AdminSubscriptions
