import { AdminField, AdminFormActions, AdminFormPanel } from '~/components/admin/admin_form'
import { AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import { useForm } from '@inertiajs/react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import type React from 'react'

interface ContactMessageDetail extends Record<string, JSONDataTypes> {
  id: string
  fullName: string
  email: string
  message: string
  status: 'new' | 'reviewed' | 'archived'
  ipAddress: string | null
  userAgent: string | null
  createdAt: string | null
}

interface ContactMessageShowProps extends Record<string, JSONDataTypes> {
  message: ContactMessageDetail
}

const AdminContactMessageShow: React.FC<ContactMessageShowProps> = ({ message }) => {
  const form = useForm({ status: message.status })

  function submit(event: React.FormEvent) {
    event.preventDefault()
    form.patch(`/admin/contact-messages/${message.id}/status`)
  }

  return (
    <AdminLayout title="تفاصيل الرسالة" subtitle="مراجعة رسالة تواصل وتحديث حالتها.">
      <section className="admin-message-detail">
        <div className="admin-message-card">
          <div>
            <span>From</span>
            <h2>{message.fullName}</h2>
            <a href={`mailto:${message.email}`}>{message.email}</a>
          </div>
          <AdminStatusBadge status={message.status} />
        </div>
        <div className="admin-message-body">{message.message}</div>
      </section>

      <form className="admin-editor-form" onSubmit={submit}>
        <AdminFormPanel title="حالة الرسالة" body="استخدم الحالة لتنظيم المتابعة الداخلية.">
          <AdminField label="الحالة">
            <select
              value={form.data.status}
              onChange={(event) =>
                form.setData('status', event.target.value as ContactMessageDetail['status'])
              }
            >
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="archived">Archived</option>
            </select>
          </AdminField>
          <AdminField label="IP">
            <input dir="ltr" value={message.ipAddress ?? '—'} readOnly />
          </AdminField>
          <AdminField label="User agent" wide>
            <input dir="ltr" value={message.userAgent ?? '—'} readOnly />
          </AdminField>
        </AdminFormPanel>
        <AdminFormActions
          cancelHref="/admin/contact-messages"
          processing={form.processing}
          submitLabel="Update status"
        />
      </form>
    </AdminLayout>
  )
}

export default AdminContactMessageShow
