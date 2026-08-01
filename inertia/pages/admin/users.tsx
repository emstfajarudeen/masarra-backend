import { AdminEmptyState, AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface UserRow extends Record<string, JSONDataTypes> {
  id: string
  fullName: string
  initials: string
  email: string
  phoneNumber: string
  role: string
  status: string
  preferredLocale: string
  emailVerified: boolean
  phoneVerified: boolean
  creditBalance: number
  gameSessionCount: number
  purchaseCount: number
  createdAt: string | null
}

interface UserFilters extends Record<string, JSONDataTypes> {
  role: string
  status: string
}

interface UserStats extends Record<string, JSONDataTypes> {
  total: number
  active: number
  suspended: number
  admins: number
}

export interface AdminUsersProps extends Record<string, JSONDataTypes> {
  users: UserRow[]
  filters: UserFilters
  stats: UserStats
}

const roleOptions = ['all', 'user', 'admin'] as const
const statusOptions = ['all', 'active', 'suspended'] as const

const AdminUsers: React.FC<AdminUsersProps> = ({ users, filters, stats }) => {
  return (
    <AdminLayout
      title="المستخدمون"
      subtitle="مراجعة حسابات المستخدمين، الأرصدة، الجلسات، وسجل الشراء بشكل إداري."
    >
      <section className="admin-user-hero">
        <article>
          <span>Total users</span>
          <strong>{stats.total}</strong>
          <p>كل الحسابات</p>
        </article>
        <article>
          <span>Active</span>
          <strong>{stats.active}</strong>
          <p>حسابات فعالة</p>
        </article>
        <article>
          <span>Suspended</span>
          <strong>{stats.suspended}</strong>
          <p>حسابات موقوفة</p>
        </article>
        <article>
          <span>Admins</span>
          <strong>{stats.admins}</strong>
          <p>صلاحيات الإدارة</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>فلاتر المستخدمين</h2>
            <p>فلترة الحسابات حسب الدور وحالة الحساب. هذه المرحلة للعرض فقط.</p>
          </div>
        </div>

        <form className="admin-list-filters" method="get" action="/admin/users">
          <label>
            <span>Role</span>
            <select name="role" defaultValue={filters.role}>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Status</span>
            <select name="status" defaultValue={filters.status}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <div>
            <button type="submit">Apply filters</button>
            <a href="/admin/users">Reset</a>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>قائمة المستخدمين</h2>
            <p>ملخص سريع لكل مستخدم: الحساب، الرصيد، الجلسات، والمشتريات المؤكدة.</p>
          </div>
        </div>

        {users.length === 0 ? (
          <AdminEmptyState
            title="لا توجد حسابات مطابقة"
            body="غيّر الفلاتر الحالية أو انتظر تسجيل مستخدمين جدد."
          />
        ) : (
          <div className="admin-user-card-grid">
            {users.map((user) => (
              <article className="admin-user-card" key={user.id}>
                <div className="admin-user-card-head">
                  <div className="admin-user-avatar">{user.initials}</div>
                  <div>
                    <h3>{user.fullName}</h3>
                    <p dir="ltr">{user.email}</p>
                    <p dir="ltr">{user.phoneNumber}</p>
                  </div>
                  <AdminStatusBadge status={user.status} />
                </div>

                <div className="admin-user-flags">
                  <span>{user.role}</span>
                  <span>{user.preferredLocale.toUpperCase()}</span>
                  <span>{user.phoneVerified ? 'Phone verified' : 'Phone not verified'}</span>
                  <span>{user.emailVerified ? 'Email verified' : 'Email not verified'}</span>
                </div>

                <div className="admin-config-metrics">
                  <span>
                    Credit balance
                    <strong>{user.creditBalance}</strong>
                  </span>
                  <span>
                    Game sessions
                    <strong>{user.gameSessionCount}</strong>
                  </span>
                  <span>
                    Paid purchases
                    <strong>{user.purchaseCount}</strong>
                  </span>
                  <span>
                    Joined
                    <strong>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </strong>
                  </span>
                </div>

                <div className="admin-config-footer">
                  <span>Read-only profile</span>
                  <a className="admin-row-link" href={`/admin/users/${user.id}`}>
                    View profile
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  )
}

export default AdminUsers
