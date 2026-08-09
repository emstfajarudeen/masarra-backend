import { AdminButtonLink, AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import { Button } from '@/components/ui/button'
import { useForm } from '@inertiajs/react'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface PlanDetail extends Record<string, JSONDataTypes> {
  id: string
  slug: string
  status: string
  title: string
  priceAmount: string
  priceCurrency: string
  roundsGranted: number
  maxTeams: number
  isFeatured: boolean
  badgeLabel: string
  ctaLabel: string
  note: string
  advantages: string
  publishedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface AdminSubscriptionShowProps extends Record<string, JSONDataTypes> {
  plan: PlanDetail
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

const AdminSubscriptionShow: React.FC<AdminSubscriptionShowProps> = ({ plan }) => {
  const statusForm = useForm({ status: plan.status })

  const updateStatus = (status: 'draft' | 'published' | 'archived') => {
    if (!window.confirm(`Change this plan status to ${status}?`)) return
    statusForm.setData('status', status)
    statusForm.patch(`/admin/subscriptions/${plan.id}/status`, { preserveScroll: true })
  }

  const isFree = Number(plan.priceAmount) === 0

  return (
    <AdminLayout
      title={plan.title}
      actions={
        <AdminButtonLink href={`/admin/subscriptions/${plan.id}/edit`}>Edit plan</AdminButtonLink>
      }
    >
      <section className="admin-detail-hero">
        <div>
          <span className="admin-kicker">Subscription plan</span>
          <h2>{plan.title}</h2>
          <div className="admin-detail-hero-meta">
            <AdminStatusBadge status={plan.status} />
            {plan.isFeatured ? <span>★ {plan.badgeLabel || 'مميزة'}</span> : null}
            <span dir="ltr">{plan.slug}</span>
          </div>
        </div>
        <div className="admin-detail-score">
          <strong>{isFree ? 'Free' : plan.priceAmount}</strong>
          <span>{isFree ? 'مجاني' : plan.priceCurrency}</span>
        </div>
      </section>

      <section className="admin-detail-stats">
        <article>
          <span>Rounds granted</span>
          <strong>{plan.roundsGranted}</strong>
          <p>تضاف إلى الرصيد</p>
        </article>
        <article>
          <span>Max teams</span>
          <strong>{plan.maxTeams}</strong>
          <p>حد الفرق</p>
        </article>
        <article>
          <span>Featured</span>
          <strong>{plan.isFeatured ? 'On' : 'Off'}</strong>
          <p>الأكثر شيوعاً</p>
        </article>
      </section>

      <section className="admin-detail-columns">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>تفاصيل الباقة</h2>
            </div>
          </div>
          <div className="admin-detail-facts">
            <span>
              CTA <strong>{plan.ctaLabel || '—'}</strong>
            </span>
            <span>
              Note <strong>{plan.note || '—'}</strong>
            </span>
            <span>
              Published <strong>{formatDate(plan.publishedAt)}</strong>
            </span>
            <span>
              Updated <strong>{formatDate(plan.updatedAt)}</strong>
            </span>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>إجراءات الإدارة</h2>
            </div>
          </div>
          <div className="admin-action-grid">
            <Button
              type="button"
              variant="outline"
              disabled={statusForm.processing}
              onClick={() => updateStatus('published')}
            >
              Publish
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={statusForm.processing}
              onClick={() => updateStatus('draft')}
            >
              Move to draft
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={statusForm.processing}
              onClick={() => updateStatus('archived')}
            >
              Archive
            </Button>
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>المزايا</h2>
          </div>
        </div>
        <div className="admin-detail-copy">
          {plan.advantages ? (
            <div
              className="admin-plan-advantages"
              dangerouslySetInnerHTML={{ __html: plan.advantages }}
            />
          ) : (
            <p>لم تتم إضافة مزايا بعد.</p>
          )}
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminSubscriptionShow
