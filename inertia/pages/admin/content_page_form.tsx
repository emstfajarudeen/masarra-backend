import { AdminField, AdminFormActions, AdminFormPanel } from '~/components/admin/admin_form'
import { AdminLayout } from '~/components/admin/admin_layout'
import { ConfirmDialog } from '~/components/admin/confirm_dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select_field'
import { Textarea } from '@/components/ui/textarea'
import { router, usePage } from '@inertiajs/react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import type { RequestPayload } from '@inertiajs/core'
import React, { useState } from 'react'

interface ContentPageFormData extends Record<string, JSONDataTypes> {
  id: string | null
  slug: string
  status: 'draft' | 'published'
  title: string
  excerpt: string
  body: string
}

interface ContentPageFormProps extends Record<string, JSONDataTypes> {
  mode: 'create' | 'edit'
  page: ContentPageFormData | null
}

const AdminContentPageForm: React.FC<ContentPageFormProps> = ({ mode, page }) => {
  const { errors } = usePage().props as { errors: Record<string, string | undefined> }
  const initialData: ContentPageFormData = page ?? {
    id: null,
    slug: '',
    status: 'draft',
    title: '',
    excerpt: '',
    body: '',
  }
  const [data, setData] = useState(initialData)
  const [processing, setProcessing] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<ContentPageFormData['status'] | null>(null)

  function update<K extends keyof ContentPageFormData>(key: K, value: ContentPageFormData[K]) {
    setData((current) => ({ ...current, [key]: value }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setProcessing(true)
    const options = { onFinish: () => setProcessing(false) }
    if (mode === 'edit' && data.id) {
      router.put(`/admin/content-pages/${data.id}`, data as RequestPayload, options)
    } else {
      router.post('/admin/content-pages', data as RequestPayload, options)
    }
  }

  function confirmStatusChange() {
    if (!data.id || !pendingStatus) return
    const status = pendingStatus
    setPendingStatus(null)
    setProcessing(true)
    router.patch(
      `/admin/content-pages/${data.id}/status`,
      { status },
      { preserveScroll: true, onFinish: () => setProcessing(false) }
    )
  }

  return (
    <AdminLayout title={mode === 'edit' ? 'تعديل صفحة' : 'إضافة صفحة'}>
      <form className="admin-editor-form" onSubmit={submit}>
        {mode === 'edit' && data.id ? (
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>إجراءات النشر</h2>
                <p>تغيير حالة الصفحة العامة بدون حذف.</p>
              </div>
            </div>
            <div className="flex gap-3 p-4">
              <Button
                type="button"
                variant="default"
                disabled={processing}
                onClick={() => setPendingStatus('published')}
              >
                Publish
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={processing}
                onClick={() => setPendingStatus('draft')}
              >
                Move to draft
              </Button>
            </div>
          </section>
        ) : null}

        <AdminFormPanel
          title="المحتوى"
          body="العربية حالياً، والإنجليزية يمكن إضافتها لاحقاً كتوسعة ترجمات."
        >
          <AdminField label="العنوان" error={errors.title}>
            <Input value={data.title} onChange={(event) => update('title', event.target.value)} />
          </AdminField>
          <AdminField label="Slug" error={errors.slug}>
            <Input
              dir="ltr"
              value={data.slug}
              onChange={(event) => update('slug', event.target.value)}
            />
          </AdminField>
          <AdminField label="الحالة" error={errors.status}>
            <SelectField
              value={data.status}
              onValueChange={(v) => update('status', v as ContentPageFormData['status'])}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
              ]}
            />
          </AdminField>
          <AdminField label="الملخص" wide error={errors.excerpt}>
            <Textarea
              value={data.excerpt}
              onChange={(event) => update('excerpt', event.target.value)}
            />
          </AdminField>
          <AdminField label="النص" wide error={errors.body}>
            <Textarea
              className="min-h-[200px]"
              value={data.body}
              onChange={(event) => update('body', event.target.value)}
            />
          </AdminField>
        </AdminFormPanel>
        <AdminFormActions
          cancelHref="/admin/content-pages"
          processing={processing}
          submitLabel="Save page"
        />
      </form>

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null)
        }}
        title="تغيير حالة الصفحة"
        description={
          pendingStatus ? `هل تريد تغيير حالة هذه الصفحة إلى "${pendingStatus}"؟` : undefined
        }
        confirmLabel="تأكيد"
        cancelLabel="إلغاء"
        onConfirm={confirmStatusChange}
      />
    </AdminLayout>
  )
}

export default AdminContentPageForm
