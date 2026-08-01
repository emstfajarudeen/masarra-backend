import { AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface DashboardMetrics extends Record<string, JSONDataTypes> {
  users: number
  activeSessions: number
  completedSessions: number
  games: number
  questions: number
  revenue: string
  newMessages: number
}

interface LatestSessionRow extends Record<string, JSONDataTypes> {
  id: string
  status: string
  hostName: string
  gameTitle: string
  completedRoundCount: number
  selectedRoundCount: number | null
  createdAt: string | null
}

export interface DashboardProps extends Record<string, JSONDataTypes> {
  metrics: DashboardMetrics
  latestSessions: LatestSessionRow[]
}

const metricCards = [
  ['users', 'المستخدمون', 'Users'],
  ['activeSessions', 'الجلسات النشطة', 'Live sessions'],
  ['completedSessions', 'الجلسات المكتملة', 'Completed'],
  ['games', 'الألعاب', 'Games'],
  ['questions', 'الأسئلة', 'Questions'],
  ['newMessages', 'رسائل جديدة', 'New messages'],
] as const

const AdminDashboard: React.FC<DashboardProps> = ({ metrics, latestSessions }) => {
  return (
    <AdminLayout
      title="لوحة التحكم"
      subtitle="نظرة تشغيلية سريعة على الألعاب، الجلسات، المدفوعات، والمحتوى."
    >
      <section className="admin-hero-panel">
        <div>
          <span className="admin-kicker">Revenue</span>
          <strong>{metrics.revenue} KWD</strong>
          <p>إجمالي المدفوعات المؤكدة للأقسام الاختيارية.</p>
        </div>
      </section>

      <section className="admin-metric-grid">
        {metricCards.map(([key, title, caption]) => (
          <article className="admin-metric-card" key={key}>
            <span>{caption}</span>
            <strong>{metrics[key]}</strong>
            <p>{title}</p>
          </article>
        ))}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>آخر الجلسات</h2>
            <p>أحدث جلسات اللعب المسجلة في النظام.</p>
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
                    {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminDashboard
