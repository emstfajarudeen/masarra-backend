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

const AdminContactMessages: React.FC<AdminContactMessagesProps> = ({
  messages,
  filters,
  stats,
}) => {
  return (
    <AdminLayout title="الرسائل">
      <section className="admin-content-hero">
        <article>
          <span>Total messages</span>
          <strong>{stats.total}</strong>
          <p>كل الرسائل</p>
        </article>
        <article>
          <span>New</span>
          <strong>{stats.new}</strong>
          <p>تحتاج مراجعة</p>
        </article>
        <article>
          <span>Reviewed</span>
          <strong>{stats.reviewed}</strong>
          <p>تمت متابعتها</p>
        </article>
        <article>
          <span>Archived</span>
          <strong>{stats.archived}</strong>
          <p>مؤرشفة</p>
        </article>
      </section>

      <section className="admin-panel">
        <form className="admin-list-filters" method="get" action="/admin/contact-messages">
          <div className="space-y-1">
            <Label>Status</Label>
            <SelectField
              name="status"
              defaultValue={filters.status}
              options={statusOptions.map((status) => ({ value: status, label: status }))}
            />
          </div>
          <div>
            <Button type="submit">Apply filters</Button>
            <Button variant="ghost" asChild>
              <a href="/admin/contact-messages">Reset</a>
            </Button>
          </div>
        </form>
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
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
