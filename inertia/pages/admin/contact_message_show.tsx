import { AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import { Button } from '@/components/ui/button'
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
  const statusForm = useForm({ status: message.status })

  const updateStatus = (status: ContactMessageDetail['status']) => {
    if (status === message.status) return
    statusForm.setData('status', status)
    statusForm.patch(`/admin/contact-messages/${message.id}/status`, { preserveScroll: true })
  }

  return (
    <AdminLayout title="تفاصيل الرسالة">
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

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>حالة الرسالة</h2>
            <p>استخدم الحالة لتنظيم المتابعة الداخلية.</p>
          </div>
        </div>
        <div className="admin-action-grid">
          <Button
            type="button"
            variant={message.status === 'new' ? 'default' : 'outline'}
            disabled={statusForm.processing}
            onClick={() => updateStatus('new')}
          >
            New
          </Button>
          <Button
            type="button"
            variant={message.status === 'reviewed' ? 'default' : 'outline'}
            disabled={statusForm.processing}
            onClick={() => updateStatus('reviewed')}
          >
            Reviewed
          </Button>
          <Button
            type="button"
            variant={message.status === 'archived' ? 'default' : 'outline'}
            disabled={statusForm.processing}
            onClick={() => updateStatus('archived')}
          >
            Archived
          </Button>
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminContactMessageShow
