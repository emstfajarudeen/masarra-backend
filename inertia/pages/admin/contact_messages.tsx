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

interface ContactMessageRow extends Record<string, JSONDataTypes> {
  id: string
  fullName: string
  email: string
  messagePreview: string
  status: string
  createdAt: string | null
}

interface ContactMessageFilters extends Record<string, JSONDataTypes> {
  status: string
}

interface ContactMessageStats extends Record<string, JSONDataTypes> {
  total: number
  new: number
  reviewed: number
  archived: number
}

export interface AdminContactMessagesProps extends Record<string, JSONDataTypes> {
  messages: ContactMessageRow[]
  filters: ContactMessageFilters
  stats: ContactMessageStats
}

const statusOptions = ['all', 'new', 'reviewed', 'archived'] as const

const statusLabels: Record<string, string> = {
  all: 'كل الحالات',
  new: 'جديدة',
  reviewed: 'تمت مراجعتها',
  archived: 'مؤرشفة',
}

const AdminContactMessages: React.FC<AdminContactMessagesProps> = ({
  messages,
  filters,
  stats,
}) => {
  const hasActiveFilters = filters.status && filters.status !== 'all'

  const [isFilterExpanded, setIsFilterExpanded] = useState(!!hasActiveFilters)

  return (
    <AdminLayout title="الرسائل">
      <section className="admin-content-hero">
        <article>
          <span>إجمالي الرسائل</span>
          <strong>{stats.total}</strong>
          <p>كل الرسائل</p>
        </article>
        <article>
          <span>جديدة</span>
          <strong>{stats.new}</strong>
          <p>تحتاج مراجعة</p>
        </article>
        <article>
          <span>تمت مراجعتها</span>
          <strong>{stats.reviewed}</strong>
          <p>تمت متابعتها</p>
        </article>
        <article>
          <span>مؤرشفة</span>
          <strong>{stats.archived}</strong>
          <p>مؤرشفة</p>
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
              <h3 className="text-lg font-bold text-[var(--masarra-purple-deep)]">تصفية الرسائل</h3>
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
              action="/admin/contact-messages"
              className="space-y-6 pt-6 animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-1 gap-5">
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
                    href="/admin/contact-messages"
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
            <h2>رسائل التواصل</h2>
          </div>
        </div>

        {messages.length === 0 ? (
          <AdminEmptyState
            title="لا توجد رسائل مطابقة"
            body="غيّر الفلتر الحالي أو انتظر رسائل جديدة من نموذج التواصل."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>محتوى الرسالة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>{message.fullName}</TableCell>
                  <TableCell dir="ltr">{message.email}</TableCell>
                  <TableCell>{message.messagePreview}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={message.status} />
                  </TableCell>
                  <TableCell>
                    {message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="admin-row-actions">
                      <ViewIconLink href={`/admin/contact-messages/${message.id}`} />
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

export default AdminContactMessages
