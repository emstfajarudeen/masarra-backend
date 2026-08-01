import { AdminField, AdminFormActions, AdminFormPanel } from '~/components/admin/admin_form'
import { AdminLayout } from '~/components/admin/admin_layout'
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

  return (
    <AdminLayout
      title={mode === 'edit' ? 'تعديل صفحة' : 'إضافة صفحة'}
      subtitle="صفحات عامة مثل الشروط والخصوصية والتعريف."
    >
      <form className="admin-editor-form" onSubmit={submit}>
        <AdminFormPanel
          title="المحتوى"
          body="العربية حالياً، والإنجليزية يمكن إضافتها لاحقاً كتوسعة ترجمات."
        >
          <AdminField label="العنوان" error={errors.title}>
            <input value={data.title} onChange={(event) => update('title', event.target.value)} />
          </AdminField>
          <AdminField label="Slug" error={errors.slug}>
            <input
              dir="ltr"
              value={data.slug}
              onChange={(event) => update('slug', event.target.value)}
            />
          </AdminField>
          <AdminField label="الحالة" error={errors.status}>
            <select
              value={data.status}
              onChange={(event) =>
                update('status', event.target.value as ContentPageFormData['status'])
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </AdminField>
          <AdminField label="الملخص" wide error={errors.excerpt}>
            <textarea
              value={data.excerpt}
              onChange={(event) => update('excerpt', event.target.value)}
            />
          </AdminField>
          <AdminField label="النص" wide error={errors.body}>
            <textarea
              className="admin-textarea-tall"
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
    </AdminLayout>
  )
}

export default AdminContentPageForm
