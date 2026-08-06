import { AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import { Button } from '@/components/ui/button'
import { DateField } from '@/components/ui/date_field'
import { Label } from '@/components/ui/label'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface FinanceFilters extends Record<string, JSONDataTypes> {
  from: string
  to: string
}

interface CountRow extends Record<string, JSONDataTypes> {
  key: string
  count: number
}

interface RevenueRow extends Record<string, JSONDataTypes> {
  currency: string
  amount: string
}

interface CreditTotalRow extends Record<string, JSONDataTypes> {
  type: string
  amount: number
}

interface FinanceSummary extends Record<string, JSONDataTypes> {
  paymentStatuses: CountRow[]
  creditTypes: CountRow[]
  revenue: RevenueRow[]
  creditTotals: CreditTotalRow[]
}

interface PaymentRow extends Record<string, JSONDataTypes> {
  id: string
  userName: string
  userId: string
  status: string
  method: string
  payableType: string
  amount: string
  currency: string
  provider: string | null
  providerReference: string | null
  paidAt: string | null
  expiresAt: string | null
  createdAt: string | null
}

interface CreditRow extends Record<string, JSONDataTypes> {
  id: string
  userName: string
  userId: string
  type: string
  amount: number
  currency: string
  description: string | null
  gameSessionId: string | null
  createdAt: string | null
}

export interface AdminFinanceProps extends Record<string, JSONDataTypes> {
  filters: FinanceFilters
  summary: FinanceSummary
  payments: PaymentRow[]
  creditTransactions: CreditRow[]
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

const revenueText = (rows: RevenueRow[]) =>
  rows.length === 0 ? '0.000 KWD' : rows.map((row) => `${row.amount} ${row.currency}`).join(' / ')

const AdminFinance: React.FC<AdminFinanceProps> = ({
  filters,
  summary,
  payments,
  creditTransactions,
}) => {
  return (
    <AdminLayout
      title="المالية والأرصدة"
    >
      <form className="admin-report-filters" method="get">
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="from">From</Label>
            <DateField id="from" name="from" defaultValue={filters.from} placeholder="Pick a date" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="to">To</Label>
            <DateField id="to" name="to" defaultValue={filters.to} placeholder="Pick a date" />
          </div>
          <Button type="submit">Apply range</Button>
          <Button variant="ghost" asChild>
            <a href="/admin/finance">Reset</a>
          </Button>
        </div>
      </form>

      <section className="admin-report-hero">
        <div>
          <span className="admin-kicker">Confirmed revenue</span>
          <strong>{revenueText(summary.revenue)}</strong>
          <p>Only paid payments are counted in revenue.</p>
        </div>
        <div className="admin-report-hero-stack">
          {summary.creditTotals.map((row) => (
            <span key={row.type}>
              {row.type}: {row.amount}
            </span>
          ))}
        </div>
      </section>

      <section className="admin-report-grid admin-finance-breakdowns">
        <Breakdown title="Payment status" rows={summary.paymentStatuses} />
        <Breakdown title="Credit types" rows={summary.creditTypes} />
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>المدفوعات</h2>
            <p>آخر محاولات الدفع وحالتها.</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Provider</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <a href={`/admin/users/${payment.userId}`}>{payment.userName}</a>
                  </td>
                  <td>
                    <AdminStatusBadge status={payment.status} />
                  </td>
                  <td>
                    {payment.amount} {payment.currency}
                  </td>
                  <td>
                    {payment.method} · {payment.payableType}
                  </td>
                  <td>{payment.providerReference ?? payment.provider ?? '—'}</td>
                  <td>{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>حركة الأرصدة</h2>
            <p>آخر معاملات أرصدة الجولات.</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Session</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {creditTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <a href={`/admin/users/${transaction.userId}`}>{transaction.userName}</a>
                  </td>
                  <td>
                    <AdminStatusBadge status={transaction.type} />
                  </td>
                  <td>
                    {transaction.amount} {transaction.currency}
                  </td>
                  <td>{transaction.description ?? '—'}</td>
                  <td dir="ltr">{transaction.gameSessionId ?? '—'}</td>
                  <td>{formatDate(transaction.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  )
}

function Breakdown({ title, rows }: { title: string; rows: CountRow[] }) {
  const total = Math.max(
    rows.reduce((sum, row) => sum + row.count, 0),
    1
  )

  return (
    <article className="admin-report-breakdown">
      <div>
        <span>{title}</span>
        <strong>Operational split</strong>
      </div>
      {rows.map((row) => (
        <div className="admin-report-bar-row" key={row.key}>
          <div>
            <small>{row.key}</small>
            <b>{row.count}</b>
          </div>
          <span>
            <i style={{ width: `${Math.max((row.count / total) * 100, 6)}%` }} />
          </span>
        </div>
      ))}
    </article>
  )
}

export default AdminFinance
