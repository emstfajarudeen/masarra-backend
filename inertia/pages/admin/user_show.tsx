import { AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import { ConfirmDialog } from '~/components/admin/confirm_dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown_menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useForm } from '@inertiajs/react'
import type React from 'react'
import { useState } from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import {
  Mail,
  Phone,
  ShieldCheck,
  ShieldOff,
  Coins,
  Gamepad2,
  CreditCard,
  CalendarDays,
  ArrowUpCircle,
  ArrowDownCircle,
  ClockArrowUp,
  MoreHorizontal,
} from 'lucide-react'

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
  return value ? new Date(value).toLocaleDateString('ar-SA') : '—'
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString('ar-SA') : '—'
}

const roleLabels: Record<string, string> = {
  admin: 'مدير',
  user: 'مستخدم',
}

const sessionStatusLabels: Record<string, string> = {
  active: 'جارية',
  completed: 'مكتملة',
  cancelled: 'ملغاة',
  pending: 'معلقة',
}

const paymentStatusLabels: Record<string, string> = {
  paid: 'مدفوعة',
  pending: 'معلقة',
  failed: 'فاشلة',
  refunded: 'مستردة',
}

const creditTypeLabels: Record<string, string> = {
  purchase: 'شراء',
  refund: 'استرداد',
  bonus: 'مكافأة',
  deduction: 'خصم',
  reservation: 'حجز',
}

function EmptyRow({ cols, label }: { cols: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={cols} className="py-10 text-center text-[var(--masarra-muted)]">
        {label}
      </TableCell>
    </TableRow>
  )
}

const AdminUserShow: React.FC<AdminUserShowProps> = ({
  user,
  gameSessions,
  payments,
  creditTransactions,
  timeline,
}) => {
  const statusForm = useForm({ status: user.status })
  const [pendingStatus, setPendingStatus] = useState<'active' | 'suspended' | null>(null)

  const confirmStatusChange = () => {
    if (!pendingStatus) return
    statusForm.setData('status', pendingStatus)
    statusForm.patch(`/admin/users/${user.id}/status`, { preserveScroll: true })
    setPendingStatus(null)
  }

  const totalSpent = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number.parseFloat(p.amount as string), 0)

  return (
    <AdminLayout title={user.fullName}>
      {/* ── Hero Header ── */}
      <section className="admin-user-detail-hero">
        {/* Top bar: label + more button */}
        <div className="admin-user-hero-topbar">
          <span>ملف المستخدم</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" className="admin-user-hero-btn-activate">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem
                disabled={statusForm.processing || user.status === 'active'}
                onSelect={() => setPendingStatus('active')}
                className="flex items-center gap-2 text-green-600 focus:text-green-600"
              >
                <ShieldCheck className="h-4 w-4" />
                تفعيل الحساب
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={statusForm.processing || user.status === 'suspended'}
                onSelect={() => setPendingStatus('suspended')}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <ShieldOff className="h-4 w-4" />
                إيقاف الحساب
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bottom row: name + contacts | status meta */}
        <div className="admin-user-hero-main">
          <div>
            <h2>{user.fullName}</h2>
            <div className="admin-user-detail-hero-contacts">
              <p dir="ltr">
                <Mail className="inline-block ml-1 h-3.5 w-3.5 opacity-70" />
                {user.email}
              </p>
              <p dir="ltr">
                <Phone className="inline-block ml-1 h-3.5 w-3.5 opacity-70" />
                {user.phoneNumber}
              </p>
            </div>
          </div>
          <div className="admin-user-hero-meta">
            <AdminStatusBadge status={user.status} />
            <strong>{roleLabels[user.role] ?? user.role}</strong>
            <small>
              <CalendarDays className="inline-block ml-1 h-3 w-3 opacity-70" />
              {formatDate(user.createdAt)}
            </small>
          </div>
        </div>
      </section>

      {/* ── Key Stats ── */}
      <section className="admin-user-detail-grid">
        <article>
          <span>
            <Coins className="h-4 w-4" /> رصيد الجولات
          </span>
          <strong>{user.creditBalance}</strong>
          <p>كريدت متاح</p>
        </article>
        <article>
          <span>
            <Gamepad2 className="h-4 w-4" /> الجلسات
          </span>
          <strong>{gameSessions.length}</strong>
          <p>جلسة لعب</p>
        </article>
        <article>
          <span>
            <CreditCard className="h-4 w-4" /> المدفوعات
          </span>
          <strong>{payments.length}</strong>
          <p>عملية دفع</p>
        </article>
        <article>
          <span>
            <Coins className="h-4 w-4" /> إجمالي الإنفاق
          </span>
          <strong>{totalSpent.toFixed(2)}</strong>
          <p>دينار كويتي</p>
        </article>
      </section>

      {/* ── Activity Tabs ── */}
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>نشاط المستخدم</h2>
            <p>الجلسات والمدفوعات وحركات الكريدت وسجل النشاط.</p>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="sessions">
            <TabsList>
              <TabsTrigger value="sessions">
                <Gamepad2 className="h-4 w-4" />
                الجلسات
                <span className="admin-user-tab-count">{gameSessions.length}</span>
              </TabsTrigger>
              <TabsTrigger value="payments">
                <CreditCard className="h-4 w-4" />
                المدفوعات
                <span className="admin-user-tab-count">{payments.length}</span>
              </TabsTrigger>
              <TabsTrigger value="credits">
                <Coins className="h-4 w-4" />
                الكريدت
                <span className="admin-user-tab-count">{creditTransactions.length}</span>
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <ClockArrowUp className="h-4 w-4" />
                سجل النشاط
                <span className="admin-user-tab-count">{timeline.length}</span>
              </TabsTrigger>
            </TabsList>

            {/* Sessions Tab */}
            <TabsContent value="sessions">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اللعبة</TableHead>
                    <TableHead>الجولات المكتملة</TableHead>
                    <TableHead>حالة الكريدت</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gameSessions.length === 0 ? (
                    <EmptyRow cols={5} label="لا توجد جلسات بعد." />
                  ) : (
                    gameSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-semibold">{session.gameTitle}</TableCell>
                        <TableCell>
                          {session.completedRoundCount}/{session.selectedRoundCount ?? '—'}
                        </TableCell>
                        <TableCell>{session.creditReservationStatus}</TableCell>
                        <TableCell>
                          <AdminStatusBadge
                            status={sessionStatusLabels[session.status] ?? session.status}
                          />
                        </TableCell>
                        <TableCell>{formatDate(session.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <EmptyRow cols={5} label="لا توجد مدفوعات بعد." />
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-bold text-[var(--masarra-purple-deep)]">
                          {payment.amount} {payment.currency}
                        </TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{payment.payableType}</TableCell>
                        <TableCell>
                          <AdminStatusBadge
                            status={paymentStatusLabels[payment.status] ?? payment.status}
                          />
                        </TableCell>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Credits Tab */}
            <TabsContent value="credits">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>البيان</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditTransactions.length === 0 ? (
                    <EmptyRow cols={4} label="لا توجد حركات بعد." />
                  ) : (
                    creditTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <span
                            className={`flex items-center gap-1.5 font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-500'}`}
                          >
                            {transaction.amount > 0 ? (
                              <ArrowUpCircle className="h-4 w-4 shrink-0" />
                            ) : (
                              <ArrowDownCircle className="h-4 w-4 shrink-0" />
                            )}
                            {transaction.amount > 0 ? '+' : ''}
                            {transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell>
                          {creditTypeLabels[transaction.type] ?? transaction.type}
                        </TableCell>
                        <TableCell className="text-[var(--masarra-muted)]">
                          {transaction.description ?? 'حركة كريدت'}
                        </TableCell>
                        <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>النوع</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>التفاصيل</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeline.length === 0 ? (
                    <EmptyRow cols={5} label="لا يوجد نشاط مسجّل بعد." />
                  ) : (
                    timeline.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-purple)]">
                            {item.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">{item.title}</TableCell>
                        <TableCell className="text-[var(--masarra-muted)]">
                          {item.description}
                        </TableCell>
                        <TableCell>
                          <AdminStatusBadge status={item.status} />
                        </TableCell>
                        <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null)
        }}
        title="تغيير حالة الحساب"
        description={
          pendingStatus === 'suspended' ? 'هل تريد إيقاف هذا الحساب؟' : 'هل تريد تفعيل هذا الحساب؟'
        }
        confirmLabel="تأكيد"
        cancelLabel="إلغاء"
        destructive={pendingStatus === 'suspended'}
        onConfirm={confirmStatusChange}
      />
    </AdminLayout>
  )
}

export default AdminUserShow
