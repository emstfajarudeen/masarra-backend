import { AdminButtonLink, AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import { useForm } from '@inertiajs/react'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface CategoryDetail extends Record<string, JSONDataTypes> {
  id: string
  gameId: string
  slug: string
  status: string
  title: string
  description: string | null
  isEnabled: boolean
  priceAmount: string | null
  priceCurrency: string
  gameTitle: string
  createdAt: string | null
  updatedAt: string | null
  publishedAt: string | null
}

interface CategoryStats extends Record<string, JSONDataTypes> {
  questions: number
  publishedQuestions: number
  selectedSessions: number
  paidPayments: number
}

interface QuestionRow extends Record<string, JSONDataTypes> {
  id: string
  prompt: string
  status: string
  type: string
  contentMode: string
  effectLogic: string
  basePoints: number
  createdAt: string | null
}

export interface AdminCategoryShowProps extends Record<string, JSONDataTypes> {
  category: CategoryDetail
  stats: CategoryStats
  questions: QuestionRow[]
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

const AdminCategoryShow: React.FC<AdminCategoryShowProps> = ({ category, stats, questions }) => {
  const statusForm = useForm({ status: category.status })
  const availabilityForm = useForm({ isEnabled: category.isEnabled })

  const updateStatus = (status: 'draft' | 'published' | 'archived') => {
    if (!window.confirm(`Change this category status to ${status}?`)) return
    statusForm.setData('status', status)
    statusForm.patch(`/admin/categories/${category.id}/status`, { preserveScroll: true })
  }

  const updateAvailability = (isEnabled: boolean) => {
    if (
      !window.confirm(
        isEnabled ? 'Enable this category in setup?' : 'Hide this category from setup?'
      )
    )
      return
    availabilityForm.setData('isEnabled', isEnabled)
    availabilityForm.patch(`/admin/categories/${category.id}/availability`, {
      preserveScroll: true,
    })
  }

  return (
    <AdminLayout
      title={category.title}
      subtitle="تفاصيل قسم اختياري يظهر أثناء إعداد اللعبة عند تفعيله."
      actions={
        <AdminButtonLink href={`/admin/categories/${category.id}/edit`}>
          Edit category
        </AdminButtonLink>
      }
    >
      <section className="admin-detail-hero">
        <div>
          <span className="admin-kicker">Optional pack</span>
          <h2>{category.title}</h2>
          <p>{category.description ?? 'No Arabic description has been added yet.'}</p>
          <div className="admin-detail-hero-meta">
            <AdminStatusBadge status={category.status} />
            <span>{category.gameTitle}</span>
            <span>{category.isEnabled ? 'Enabled in setup' : 'Hidden from setup'}</span>
          </div>
        </div>
        <div className="admin-detail-score">
          <strong>{category.priceAmount ?? '—'}</strong>
          <span>{category.priceCurrency}</span>
        </div>
      </section>

      <section className="admin-detail-stats">
        <article>
          <span>Questions</span>
          <strong>{stats.questions}</strong>
          <p>{stats.publishedQuestions} published</p>
        </article>
        <article>
          <span>Selected sessions</span>
          <strong>{stats.selectedSessions}</strong>
          <p>sessions using this pack</p>
        </article>
        <article>
          <span>Paid payments</span>
          <strong>{stats.paidPayments}</strong>
          <p>confirmed payments</p>
        </article>
        <article>
          <span>Availability</span>
          <strong>{category.isEnabled ? 'On' : 'Off'}</strong>
          <p>setup visibility</p>
        </article>
      </section>

      <section className="admin-detail-columns">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>بيانات القسم</h2>
              <p>قراءة سريعة لربط القسم وسعره.</p>
            </div>
          </div>
          <div className="admin-detail-facts">
            <span>
              Game <strong>{category.gameTitle}</strong>
            </span>
            <span>
              Slug <strong dir="ltr">{category.slug}</strong>
            </span>
            <span>
              Published <strong>{formatDate(category.publishedAt)}</strong>
            </span>
            <span>
              Updated <strong>{formatDate(category.updatedAt)}</strong>
            </span>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>إجراءات الإدارة</h2>
              <p>تغييرات آمنة على حالة القسم وظهوره.</p>
            </div>
          </div>
          <div className="admin-action-grid">
            <button
              type="button"
              disabled={statusForm.processing}
              onClick={() => updateStatus('published')}
            >
              Publish
            </button>
            <button
              type="button"
              disabled={statusForm.processing}
              onClick={() => updateStatus('draft')}
            >
              Move to draft
            </button>
            <button
              type="button"
              disabled={statusForm.processing}
              onClick={() => updateStatus('archived')}
            >
              Archive
            </button>
            <button
              type="button"
              disabled={availabilityForm.processing}
              onClick={() => updateAvailability(!category.isEnabled)}
            >
              {category.isEnabled ? 'Disable in setup' : 'Enable in setup'}
            </button>
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>أسئلة القسم</h2>
            <p>أحدث الأسئلة المرتبطة بهذا القسم.</p>
          </div>
        </div>
        <div className="admin-detail-card-grid">
          {questions.map((question) => (
            <article className="admin-detail-card" key={question.id}>
              <div>
                <h3>{question.prompt}</h3>
                <p>
                  {question.contentMode} · {question.effectLogic}
                </p>
              </div>
              <AdminStatusBadge status={question.status} />
              <span>{question.type}</span>
              <strong>{question.basePoints} pts</strong>
              <a className="admin-row-link" href={`/admin/questions/${question.id}`}>
                Preview
              </a>
            </article>
          ))}
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminCategoryShow
