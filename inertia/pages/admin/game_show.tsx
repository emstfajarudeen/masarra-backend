import {
  AdminButtonLink,
  AdminEmptyState,
  AdminLayout,
  AdminStatusBadge,
} from '~/components/admin/admin_layout'
import { useForm } from '@inertiajs/react'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface GameDetail extends Record<string, JSONDataTypes> {
  id: string
  slug: string
  status: string
  title: string
  description: string | null
  instructions: string | null
  minTeamCount: number
  maxTeamCount: number
  allowedRoundCounts: number[]
  allowedQuestionDurations: number[]
  baseRoundCreditCost: number
  optionalCategoriesEnabled: boolean
  createdAt: string | null
  updatedAt: string | null
  publishedAt: string | null
}

interface GameStats extends Record<string, JSONDataTypes> {
  questions: number
  publishedQuestions: number
  sessions: number
  completedSessions: number
  categories: number
}

interface CategoryRow extends Record<string, JSONDataTypes> {
  id: string
  slug: string
  title: string
  status: string
  isEnabled: boolean
  priceAmount: string | null
  priceCurrency: string
}

interface SessionRow extends Record<string, JSONDataTypes> {
  id: string
  hostName: string
  status: string
  completedRoundCount: number
  selectedRoundCount: number | null
  reservedCreditCount: number
  refundedCreditCount: number
  createdAt: string | null
}

export interface AdminGameShowProps extends Record<string, JSONDataTypes> {
  game: GameDetail
  stats: GameStats
  categories: CategoryRow[]
  latestSessions: SessionRow[]
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

const formatList = (values: number[], suffix = '') => {
  if (values.length === 0) return '—'
  return values.map((value) => `${value}${suffix}`).join(', ')
}

const AdminGameShow: React.FC<AdminGameShowProps> = ({
  game,
  stats,
  categories,
  latestSessions,
}) => {
  const statusForm = useForm({ status: game.status })

  const updateStatus = (status: 'draft' | 'published' | 'archived') => {
    if (!window.confirm(`Change this game status to ${status}?`)) return
    statusForm.setData('status', status)
    statusForm.patch(`/admin/games/${game.id}/status`, { preserveScroll: true })
  }

  return (
    <AdminLayout
      title={game.title}
      subtitle="قراءة تفصيلية لقواعد اللعبة وربطها بالأقسام والجلسات."
      actions={<AdminButtonLink href={`/admin/games/${game.id}/edit`}>Edit game</AdminButtonLink>}
    >
      <section className="admin-detail-hero">
        <div>
          <span className="admin-kicker">Game overview</span>
          <h2>{game.title}</h2>
          <p>{game.description ?? 'No Arabic description has been added yet.'}</p>
          <div className="admin-detail-hero-meta">
            <AdminStatusBadge status={game.status} />
            <span dir="ltr">{game.slug}</span>
            <span>
              {game.optionalCategoriesEnabled ? 'Optional packs enabled' : 'No optional packs'}
            </span>
          </div>
        </div>
        <div className="admin-detail-score">
          <strong>
            {game.minTeamCount}-{game.maxTeamCount}
          </strong>
          <span>teams allowed</span>
        </div>
      </section>

      <section className="admin-detail-stats">
        <article>
          <span>Questions</span>
          <strong>{stats.questions}</strong>
          <p>{stats.publishedQuestions} published</p>
        </article>
        <article>
          <span>Categories</span>
          <strong>{stats.categories}</strong>
          <p>optional packs</p>
        </article>
        <article>
          <span>Sessions</span>
          <strong>{stats.sessions}</strong>
          <p>{stats.completedSessions} completed</p>
        </article>
        <article>
          <span>Credit / round</span>
          <strong>{game.baseRoundCreditCost}</strong>
          <p>charged per completed round</p>
        </article>
      </section>

      <section className="admin-detail-columns">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>قواعد الإعداد</h2>
              <p>القيم التي تظهر أثناء إنشاء جلسة اللعب.</p>
            </div>
          </div>
          <div className="admin-detail-facts">
            <span>
              Rounds <strong>{formatList(game.allowedRoundCounts)}</strong>
            </span>
            <span>
              Timers <strong>{formatList(game.allowedQuestionDurations, 's')}</strong>
            </span>
            <span>
              Published <strong>{formatDate(game.publishedAt)}</strong>
            </span>
            <span>
              Updated <strong>{formatDate(game.updatedAt)}</strong>
            </span>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>إجراءات الإدارة</h2>
              <p>تغييرات حالة آمنة بدون حذف.</p>
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
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>تعليمات اللعبة</h2>
            <p>النص الذي يظهر قبل بدء العد التنازلي.</p>
          </div>
        </div>
        <div className="admin-detail-copy">
          <p>{game.instructions ?? 'No Arabic instructions have been added yet.'}</p>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>الأقسام المرتبطة</h2>
            <p>الأقسام الاختيارية المرتبطة بهذه اللعبة.</p>
          </div>
        </div>
        {categories.length === 0 ? (
          <AdminEmptyState title="لا توجد أقسام" body="هذه اللعبة لا تحتوي أقسام اختيارية بعد." />
        ) : (
          <div className="admin-detail-card-grid">
            {categories.map((category) => (
              <article className="admin-detail-card" key={category.id}>
                <div>
                  <h3>{category.title}</h3>
                  <p dir="ltr">{category.slug}</p>
                </div>
                <AdminStatusBadge status={category.status} />
                <span>{category.isEnabled ? 'Enabled' : 'Disabled'}</span>
                <strong>
                  {category.priceAmount ?? '—'} {category.priceCurrency}
                </strong>
                <a className="admin-row-link" href={`/admin/categories/${category.id}`}>
                  View category
                </a>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>آخر الجلسات</h2>
            <p>آخر استخدامات هذه اللعبة.</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>المضيف</th>
                <th>الحالة</th>
                <th>الجولات</th>
                <th>الأرصدة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {latestSessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.hostName}</td>
                  <td>
                    <AdminStatusBadge status={session.status} />
                  </td>
                  <td>
                    {session.completedRoundCount}/{session.selectedRoundCount ?? '—'}
                  </td>
                  <td>
                    {session.reservedCreditCount} reserved · {session.refundedCreditCount} refunded
                  </td>
                  <td>{formatDate(session.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminGameShow
