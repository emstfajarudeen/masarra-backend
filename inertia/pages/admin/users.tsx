import { AdminEmptyState, AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ViewIconLink } from '~/components/admin/table_actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select_field'
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
}

export interface AdminUsersProps extends Record<string, JSONDataTypes> {
  users: UserRow[]
  filters: UserFilters
  stats: UserStats
}

const roleOptions = ['all', 'user'] as const
const statusOptions = ['all', 'active', 'suspended'] as const

const AdminUsers: React.FC<AdminUsersProps> = ({ users, filters, stats }) => {
  return (
    <AdminLayout
      title="المستخدمون"
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
      </section>

      <section className="admin-panel">
        <form className="admin-list-filters" method="get" action="/admin/users">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-1">
              <Label>Role</Label>
              <SelectField
                name="role"
                defaultValue={filters.role}
                options={roleOptions.map((role) => ({ value: role, label: role }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <SelectField
                name="status"
                defaultValue={filters.status}
                options={statusOptions.map((status) => ({ value: status, label: status }))}
              />
            </div>

            <Button type="submit">Apply filters</Button>
            <Button variant="ghost" asChild>
              <a href="/admin/users">Reset</a>
            </Button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>قائمة المستخدمين</h2>
          </div>
        </div>

        {users.length === 0 ? (
          <AdminEmptyState
            title="لا توجد حسابات مطابقة"
            body="غيّر الفلاتر الحالية أو انتظر تسجيل مستخدمين جدد."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell dir="ltr">{user.email}</TableCell>
                  <TableCell dir="ltr">{user.phoneNumber}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.creditBalance}</TableCell>
                  <TableCell>{user.gameSessionCount}</TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="admin-row-actions">
                      <ViewIconLink href={`/admin/users/${user.id}`} />
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

export default AdminUsers
