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
import { SelectField } from '@/components/ui/select_field'
import React, { useState } from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const roleLabels: Record<string, string> = {
  all: 'كل الحسابات',
  user: 'مستخدم',
}

const statusLabels: Record<string, string> = {
  all: 'كل الحالات',
  active: 'فعال',
  suspended: 'موقوف',
}

const AdminUsers: React.FC<AdminUsersProps> = ({ users, filters, stats }) => {
  const hasActiveFilters =
    (filters.role && filters.role !== 'all') || (filters.status && filters.status !== 'all')

  const [isFilterExpanded, setIsFilterExpanded] = useState(!!hasActiveFilters)

  return (
    <AdminLayout title="المستخدمون">
      <section className="admin-user-hero">
        <article>
          <span>إجمالي المستخدمين</span>
          <strong>{stats.total}</strong>
          <p>كل الحسابات</p>
        </article>
        <article>
          <span>فعال</span>
          <strong>{stats.active}</strong>
          <p>حسابات فعالة</p>
        </article>
        <article>
          <span>موقوف</span>
          <strong>{stats.suspended}</strong>
          <p>حسابات موقوفة</p>
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
              <h3 className="text-lg font-bold text-[var(--masarra-purple-deep)]">
                تصفية المستخدمين
              </h3>
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
              action="/admin/users"
              className="space-y-6 pt-6 animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    نوع الحساب
                  </label>
                  <SelectField
                    name="role"
                    defaultValue={filters.role}
                    options={roleOptions.map((role) => ({
                      value: role,
                      label: roleLabels[role],
                    }))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    الحالة
                  </label>
                  <SelectField
                    name="status"
                    defaultValue={filters.status}
                    options={statusOptions.map((status) => ({
                      value: status,
                      label: statusLabels[status],
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--masarra-border-soft)]">
                <Button variant="ghost" asChild>
                  <a
                    href="/admin/users"
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
                <TableHead>المستخدم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>نوع الحساب</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>الجلسات</TableHead>
                <TableHead>تاريخ الانضمام</TableHead>
                <TableHead>الإجراءات</TableHead>
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
