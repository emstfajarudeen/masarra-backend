import { AdminField, AdminFormActions, AdminFormPanel } from '~/components/admin/admin_form'
import { AdminLayout } from '~/components/admin/admin_layout'
import { router, usePage } from '@inertiajs/react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import type { RequestPayload } from '@inertiajs/core'
import React, { useState } from 'react'

interface Option extends Record<string, JSONDataTypes> {
  id: string
  title: string
}

interface CategoryFormData extends Record<string, JSONDataTypes> {
  id: string | null
  gameId: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  title: string
  description: string
  isEnabled: boolean
  priceAmount: string
  priceCurrency: string
}

interface CategoryFormProps extends Record<string, JSONDataTypes> {
  mode: 'create' | 'edit'
  category: CategoryFormData | null
  games: Option[]
}

const AdminCategoryForm: React.FC<CategoryFormProps> = ({ mode, category, games }) => {
  const { errors } = usePage().props as { errors: Record<string, string | undefined> }
  const initialData: CategoryFormData = category ?? {
    id: null,
    gameId: games[0]?.id ?? '',
    slug: '',
    status: 'draft',
    title: '',
    description: '',
    isEnabled: true,
    priceAmount: '2.000',
    priceCurrency: 'KWD',
  }
  const [data, setData] = useState(initialData)
  const [processing, setProcessing] = useState(false)

  function update<K extends keyof CategoryFormData>(key: K, value: CategoryFormData[K]) {
    setData((current) => ({ ...current, [key]: value }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setProcessing(true)
    const options = { onFinish: () => setProcessing(false) }
    if (mode === 'edit' && data.id) {
      router.put(`/admin/categories/${data.id}`, data as RequestPayload, options)
    } else {
      router.post('/admin/categories', data as RequestPayload, options)
    }
  }

  return (
    <AdminLayout
      title={mode === 'edit' ? 'تعديل قسم' : 'إضافة قسم'}
      subtitle="الأقسام الاختيارية المدفوعة مثل المناسبات والمواسم."
    >
      <form className="admin-editor-form" onSubmit={submit}>
        <AdminFormPanel
          title="بيانات القسم"
          body="اربط القسم بلعبة واحدة وحدد سعر الشراء الاختياري."
        >
          <AdminField
            label="اللعبة"
            error={errors.gameId}
            help={games.length === 0 ? 'يجب إنشاء لعبة قبل إضافة قسم.' : undefined}
          >
            <select
              value={data.gameId}
              disabled={games.length === 0}
              onChange={(event) => update('gameId', event.target.value)}
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="الحالة" error={errors.status}>
            <select
              value={data.status}
              onChange={(event) =>
                update('status', event.target.value as CategoryFormData['status'])
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </AdminField>
          <AdminField label="عنوان القسم" error={errors.title}>
            <input value={data.title} onChange={(event) => update('title', event.target.value)} />
          </AdminField>
          <AdminField label="Slug" error={errors.slug}>
            <input
              dir="ltr"
              value={data.slug}
              onChange={(event) => update('slug', event.target.value)}
            />
          </AdminField>
          <AdminField label="الوصف" wide error={errors.description}>
            <textarea
              value={data.description}
              onChange={(event) => update('description', event.target.value)}
            />
          </AdminField>
          <AdminField label="السعر" error={errors.priceAmount}>
            <input
              dir="ltr"
              value={data.priceAmount}
              onChange={(event) => update('priceAmount', event.target.value)}
            />
          </AdminField>
          <AdminField label="العملة" error={errors.priceCurrency}>
            <input
              dir="ltr"
              value={data.priceCurrency}
              onChange={(event) => update('priceCurrency', event.target.value.toUpperCase())}
            />
          </AdminField>
          <label className="admin-toggle is-wide">
            <input
              type="checkbox"
              checked={data.isEnabled}
              onChange={(event) => update('isEnabled', event.target.checked)}
            />
            <span>القسم متاح للاختيار من المستخدم</span>
          </label>
        </AdminFormPanel>
        <AdminFormActions
          cancelHref="/admin/categories"
          processing={processing}
          submitLabel="Save category"
        />
      </form>
    </AdminLayout>
  )
}

export default AdminCategoryForm
