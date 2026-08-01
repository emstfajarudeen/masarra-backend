import { AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import { useForm } from '@inertiajs/react'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface UserDetail extends Record<string, JSONDataTypes> {
  id: string
  fullName: string
  initials: string
  email: string
  phoneNumber: string
  role: string
  status: string
  preferredLocale: string
  emailVerifiedAt: string | null
  phoneVerifiedAt: string | null
  termsAcceptedAt: string | null
  creditBalance: number
  createdAt: string | null
}

interface UserSessionRow extends Record<string, JSONDataTypes> {
  id: string
  status: string
  gameTitle: string
  selectedRoundCount: number | null
  completedRoundCount: number
  reservedCreditCount: number
  refundedCreditCount: number
  creditReservationStatus: string
  createdAt: string | null
}

interface UserPaymentRow extends Record<string, JSONDataTypes> {
  id: string
  status: string
  method: string
  payableType: string
  amount: string
  currency: string
  provider: string | null
  providerReference: string | null
  paidAt: string | null
  createdAt: string | null
}

interface UserCreditRow extends Record<string, JSONDataTypes> {
  id: string
  type: string
  amount: number
  currency: string
  description: string | null
  createdAt: string | null
}

interface TimelineRow extends Record<string, JSONDataTypes> {
  id: string
  type: string
  title: string
  status: string
  description: string
  createdAt: string | null
}

export interface AdminUserShowProps extends Record<string, JSONDataTypes> {
  user: UserDetail
  gameSessions: UserSessionRow[]
  payments: UserPaymentRow[]
  creditTransactions: UserCreditRow[]
  timeline: TimelineRow[]
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : '—'
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : '—'
}

const AdminUserShow: React.FC<AdminUserShowProps> = ({
  user,
  gameSessions,
  payments,
  creditTransactions,
  timeline,
}) => {
  const statusForm = useForm({ status: user.status })

  const updateStatus = (status: 'active' | 'suspended') => {
    if (
      !window.confirm(
        status === 'suspended' ? 'Suspend this user account?' : 'Activate this user account?'
      )
    ) {
      return
    }

    statusForm.setData('status', status)
    statusForm.patch(`/admin/users/${user.id}/status`, { preserveScroll: true })
  }

  return (
    <AdminLayout
      title={user.fullName}
      subtitle="ملف إداري تفصيلي للمستخدم: الحساب، الرصيد، الجلسات، المدفوعات، والحركة الأخيرة."
    >
      <section className="admin-user-detail-hero">
        <div className="admin-user-detail-avatar">{user.initials}</div>
        <div>
          <span>Admin user profile</span>
          <h2>{user.fullName}</h2>
          <p dir="ltr">{user.email}</p>
          <p dir="ltr">{user.phoneNumber}</p>
        </div>
        <div className="admin-user-detail-status">
          <AdminStatusBadge status={user.status} />
          <strong>{user.role}</strong>
        </div>
      </section>

      <section className="admin-user-detail-grid">
        <article>
          <span>Credit balance</span>
          <strong>{user.creditBalance}</strong>
          <p>round credits</p>
        </article>
        <article>
          <span>Game sessions</span>
          <strong>{gameSessions.length}</strong>
          <p>recent records</p>
        </article>
        <article>
          <span>Payments</span>
          <strong>{payments.length}</strong>
          <p>latest intents</p>
        </article>
        <article>
          <span>Locale</span>
          <strong>{user.preferredLocale.toUpperCase()}</strong>
          <p>preferred language</p>
        </article>
      </section>

      <section className="admin-user-detail-columns">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Account verification</h2>
              <p>Read-only account state for support review.</p>
            </div>
          </div>
          <div className="admin-user-detail-facts">
            <span>
              Email verified
              <strong>{formatDateTime(user.emailVerifiedAt)}</strong>
            </span>
            <span>
              Phone verified
              <strong>{formatDateTime(user.phoneVerifiedAt)}</strong>
            </span>
            <span>
              Terms accepted
              <strong>{formatDateTime(user.termsAcceptedAt)}</strong>
            </span>
            <span>
              Joined
              <strong>{formatDateTime(user.createdAt)}</strong>
            </span>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Moderation status</h2>
              <p>Safe status controls for support moderation.</p>
            </div>
          </div>
          <div className="admin-user-moderation-note admin-action-grid">
            <AdminStatusBadge status={user.status} />
            <button
              type="button"
              disabled={statusForm.processing}
              onClick={() => updateStatus('active')}
            >
              Activate
            </button>
            <button
              type="button"
              disabled={statusForm.processing}
              onClick={() => updateStatus('suspended')}
            >
              Suspend
            </button>
            <p>Self-suspension is blocked by the backend.</p>
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Timeline</h2>
            <p>Recent account activity across games, payments and credit movements.</p>
          </div>
        </div>
        <div className="admin-user-timeline">
          {timeline.map((item) => (
            <article key={item.id}>
              <span>{item.type}</span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <small>
                {item.status} · {formatDateTime(item.createdAt)}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-user-detail-columns">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Recent sessions</h2>
              <p>Latest hosted game sessions.</p>
            </div>
          </div>
          <div className="admin-user-mini-list">
            {gameSessions.map((session) => (
              <div key={session.id}>
                <strong>{session.gameTitle}</strong>
                <p>
                  {session.completedRoundCount}/{session.selectedRoundCount ?? '—'} rounds ·{' '}
                  {session.creditReservationStatus}
                </p>
                <small>
                  {session.status} · {formatDate(session.createdAt)}
                </small>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Payments</h2>
              <p>Latest payment records for optional packs.</p>
            </div>
          </div>
          <div className="admin-user-mini-list">
            {payments.map((payment) => (
              <div key={payment.id}>
                <strong>
                  {payment.amount} {payment.currency}
                </strong>
                <p>
                  {payment.method} · {payment.payableType}
                </p>
                <small>
                  {payment.status} · {formatDate(payment.createdAt)}
                </small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Credit transactions</h2>
            <p>Latest round-credit movements.</p>
          </div>
        </div>
        <div className="admin-user-credit-list">
          {creditTransactions.map((transaction) => (
            <div key={transaction.id}>
              <strong>
                {transaction.amount > 0 ? '+' : ''}
                {transaction.amount}
              </strong>
              <span>{transaction.type}</span>
              <p>{transaction.description ?? 'Credit transaction'}</p>
              <small>
                {transaction.currency} · {formatDateTime(transaction.createdAt)}
              </small>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminUserShow
