import { AdminEmptyState, AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
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
    <AdminLayout title="الرسائل" subtitle="متابعة رسائل التواصل القادمة من الموقع العام.">
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
        <div className="admin-panel-header">
          <div>
            <h2>فلاتر الرسائل</h2>
            <p>فلترة صندوق التواصل حسب الحالة التشغيلية.</p>
          </div>
        </div>

        <form className="admin-list-filters" method="get" action="/admin/contact-messages">
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
            <a href="/admin/contact-messages">Reset</a>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>رسائل التواصل</h2>
            <p>قائمة مختصرة بأحدث الرسائل مع معاينة للرسالة قبل فتح التفاصيل.</p>
          </div>
        </div>

        {messages.length === 0 ? (
          <AdminEmptyState
            title="لا توجد رسائل مطابقة"
            body="غيّر الفلتر الحالي أو انتظر رسائل جديدة من نموذج التواصل."
          />
        ) : (
          <div className="admin-contact-card-grid">
            {messages.map((message) => (
              <article className="admin-contact-card" key={message.id}>
                <div className="admin-contact-card-head">
                  <div>
                    <h3>{message.fullName}</h3>
                    <p dir="ltr">{message.email}</p>
                  </div>
                  <AdminStatusBadge status={message.status} />
                </div>

                <p>{message.messagePreview}</p>

                <div className="admin-config-footer">
                  <span>
                    {message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '—'}
                  </span>
                  <a className="admin-row-link" href={`/admin/contact-messages/${message.id}`}>
                    View message
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

export default AdminContactMessages
