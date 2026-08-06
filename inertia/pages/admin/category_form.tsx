import { AdminField, AdminFormActions, AdminFormPanel } from '~/components/admin/admin_form'
import { AdminLayout } from '~/components/admin/admin_layout'
import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select_field'
import { Textarea } from '@/components/ui/textarea'
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
  priceAmount: string
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
    priceAmount: '2.000',
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
    const payload = { ...data, priceCurrency: 'KWD' }
    if (mode === 'edit' && data.id) {
      router.put(`/admin/categories/${data.id}`, payload as RequestPayload, options)
    } else {
      router.post('/admin/categories', payload as RequestPayload, options)
    }
  }

  return (
    <AdminLayout
      title={mode === 'edit' ? 'تعديل قسم' : 'إضافة قسم'}
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
            <SelectField
              value={data.gameId}
              disabled={games.length === 0}
              onValueChange={(v) => update('gameId', v)}
              options={games.map((game) => ({ value: game.id, label: game.title }))}
            />
          </AdminField>
          <AdminField label="الحالة" error={errors.status}>
            <SelectField
              value={data.status}
              onValueChange={(v) => update('status', v as CategoryFormData['status'])}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </AdminField>
          <AdminField label="عنوان القسم" error={errors.title}>
            <Input value={data.title} onChange={(event) => update('title', event.target.value)} />
          </AdminField>
          <AdminField label="Slug" error={errors.slug}>
            <Input
              dir="ltr"
              value={data.slug}
              onChange={(event) => update('slug', event.target.value)}
            />
          </AdminField>
          <AdminField label="الوصف" wide error={errors.description}>
            <Textarea
              value={data.description}
              onChange={(event) => update('description', event.target.value)}
            />
          </AdminField>
          <AdminField label="السعر" error={errors.priceAmount}>
            <div className="relative" dir="ltr">
              <Input
                value={data.priceAmount}
                onChange={(event) => update('priceAmount', event.target.value)}
                className="pr-14"
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-xs font-semibold text-muted-foreground border-r-0 border-s border-input rounded-e-md bg-muted select-none">
                KWD
              </span>
            </div>
          </AdminField>
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
