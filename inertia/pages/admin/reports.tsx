import { AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface ReportFilters extends Record<string, JSONDataTypes> {
  from: string
  to: string
}

interface RevenueRow extends Record<string, JSONDataTypes> {
  currency: string
  amount: string
}

interface ReportsMetrics extends Record<string, JSONDataTypes> {
  totalUsers: number
  activeUsers: number
  registeredUsers: number
  totalSessions: number
  completedSessions: number
  activeSessions: number
  reservedCredits: number
  refundedCredits: number
  paidPayments: number
  paymentRevenue: RevenueRow[]
  newMessages: number
}

interface CountRow extends Record<string, JSONDataTypes> {
  key: string
  count: number
}

interface MostPlayedGameRow extends Record<string, JSONDataTypes> {
  id: string
  title: string
  sessionCount: number
  completedRoundCount: number
}

interface LatestSessionRow extends Record<string, JSONDataTypes> {
  id: string
  status: string
  hostName: string
  gameTitle: string
  completedRoundCount: number
  selectedRoundCount: number | null
  reservedCreditCount: number
  refundedCreditCount: number
  createdAt: string | null
}

interface LatestPaymentRow extends Record<string, JSONDataTypes> {
  id: string
  status: string
  method: string
  payableType: string
  amount: string
  currency: string
  userName: string
  paidAt: string | null
  createdAt: string | null
}

export interface ReportsProps extends Record<string, JSONDataTypes> {
  filters: ReportFilters
  metrics: ReportsMetrics
  sessionStatuses: CountRow[]
  paymentStatuses: CountRow[]
  paymentMethods: CountRow[]
  userStatuses: CountRow[]
  creditTypes: CountRow[]
  mostPlayedGames: MostPlayedGameRow[]
  latestSessions: LatestSessionRow[]
  latestPayments: LatestPaymentRow[]
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

const revenueText = (rows: RevenueRow[]) => {
  if (rows.length === 0) return '0.000 KWD'
  return rows.map((row) => `${row.amount} ${row.currency}`).join(' / ')
}

const totalCount = (rows: CountRow[]) => rows.reduce((sum, row) => sum + row.count, 0)

const metricCards = [
  ['registeredUsers', 'New users', 'مستخدمون ضمن الفترة'],
  ['totalSessions', 'Sessions', 'جلسات ضمن الفترة'],
  ['completedSessions', 'Completed', 'جلسات مكتملة'],
  ['paidPayments', 'Paid payments', 'مدفوعات مؤكدة'],
  ['reservedCredits', 'Reserved credits', 'أرصدة محجوزة'],
  ['refundedCredits', 'Refunded credits', 'أرصدة مسترجعة'],
] as const

const AdminReports: React.FC<ReportsProps> = ({
  filters,
  metrics,
  sessionStatuses,
  paymentStatuses,
  paymentMethods,
  userStatuses,
  creditTypes,
  mostPlayedGames,
  latestSessions,
  latestPayments,
}) => {
  return (
    <AdminLayout
      title="التقارير التشغيلية"
      subtitle="قراءة موحدة لأداء الجلسات، المدفوعات، المستخدمين، وحركة الأرصدة."
    >
      <form className="admin-report-filters" method="get">
        <div>
          <label htmlFor="from">From</label>
          <input id="from" name="from" type="date" defaultValue={filters.from} />
        </div>
        <div>
          <label htmlFor="to">To</label>
          <input id="to" name="to" type="date" defaultValue={filters.to} />
        </div>
        <button type="submit">Apply range</button>
        <a href="/admin/reports">Reset</a>
      </form>

      <section className="admin-report-hero">
        <div>
          <span className="admin-kicker">Revenue</span>
          <strong>{revenueText(metrics.paymentRevenue)}</strong>
          <p>إجمالي الإيرادات المؤكدة ضمن النطاق المحدد.</p>
        </div>
        <div className="admin-report-hero-stack">
          <span>{metrics.activeSessions} live sessions</span>
          <span>{metrics.activeUsers} active users</span>
          <span>{metrics.newMessages} new messages</span>
        </div>
      </section>

      <section className="admin-metric-grid admin-report-metrics">
        {metricCards.map(([key, title, caption]) => (
          <article className="admin-metric-card" key={key}>
            <span>{title}</span>
            <strong>{metrics[key]}</strong>
            <p>{caption}</p>
          </article>
        ))}
      </section>

      <section className="admin-report-grid">
        <ReportBreakdown title="Session status" caption="حالة جلسات اللعب" rows={sessionStatuses} />
        <ReportBreakdown title="Payment status" caption="حالة المدفوعات" rows={paymentStatuses} />
        <ReportBreakdown title="Payment methods" caption="طرق الدفع" rows={paymentMethods} />
        <ReportBreakdown title="User status" caption="حالة المستخدمين" rows={userStatuses} />
        <ReportBreakdown title="Credit movement" caption="أنواع حركة الأرصدة" rows={creditTypes} />
      </section>

      <section className="admin-report-columns">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>الألعاب الأكثر لعباً</h2>
              <p>مرتبة حسب عدد الجلسات.</p>
            </div>
          </div>
          <div className="admin-report-game-list">
            {mostPlayedGames.map((game, index) => (
              <div className="admin-report-game-row" key={game.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{game.title}</strong>
                  <small>{game.completedRoundCount} completed rounds</small>
                </div>
                <b>{game.sessionCount}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>آخر المدفوعات</h2>
              <p>أحدث عمليات الدفع المسجلة.</p>
            </div>
          </div>
          <div className="admin-report-mini-list">
            {latestPayments.map((payment) => (
              <div key={payment.id}>
                <span>
                  {payment.amount} {payment.currency}
                </span>
                <strong>{payment.userName}</strong>
                <small>
                  {payment.method} · {payment.payableType} · {formatDate(payment.createdAt)}
                </small>
                <AdminStatusBadge status={payment.status} />
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>آخر الجلسات</h2>
            <p>قراءة سريعة للجلسات الأحدث وحركة الأرصدة فيها.</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>اللعبة</th>
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
                  <td>{session.gameTitle}</td>
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

function ReportBreakdown({
  title,
  caption,
  rows,
}: {
  title: string
  caption: string
  rows: CountRow[]
}) {
  const total = Math.max(totalCount(rows), 1)

  return (
    <article className="admin-report-breakdown">
      <div>
        <span>{title}</span>
        <strong>{caption}</strong>
      </div>
      {rows.length === 0 ? (
        <p className="admin-report-empty">No records in this range.</p>
      ) : (
        rows.map((row) => (
          <div className="admin-report-bar-row" key={row.key}>
            <div>
              <small>{row.key}</small>
              <b>{row.count}</b>
            </div>
            <span>
              <i style={{ width: `${Math.max((row.count / total) * 100, 6)}%` }} />
            </span>
          </div>
        ))
      )}
    </article>
  )
}

export default AdminReports
