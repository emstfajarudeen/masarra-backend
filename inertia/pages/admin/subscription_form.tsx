import { AdminField, AdminFormActions, AdminFormPanel } from '~/components/admin/admin_form'
import { AdminLayout } from '~/components/admin/admin_layout'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { QuillEditor } from '@/components/ui/quill_editor'
import { SelectField } from '@/components/ui/select_field'
import { router, usePage } from '@inertiajs/react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import type { RequestPayload } from '@inertiajs/core'
import React, { useState } from 'react'

interface PlanFormData extends Record<string, JSONDataTypes> {
  id: string | null
  slug: string
  status: 'draft' | 'published' | 'archived'
  title: string
  priceAmount: string
  roundsGranted: number
  maxTeams: number
  isFeatured: boolean
  badgeLabel: string
  ctaLabel: string
  note: string
  advantages: string
}

interface PlanFormProps extends Record<string, JSONDataTypes> {
  mode: 'create' | 'edit'
  plan: PlanFormData | null
}

const AdminSubscriptionForm: React.FC<PlanFormProps> = ({ mode, plan }) => {
  const { errors } = usePage().props as { errors: Record<string, string | undefined> }
  const initialData: PlanFormData = plan ?? {
    id: null,
    slug: '',
    status: 'draft',
    title: '',
    priceAmount: '0.000',
    roundsGranted: 10,
    maxTeams: 6,
    isFeatured: false,
    badgeLabel: '',
    ctaLabel: '',
    note: '',
    advantages: '',
  }
  const [data, setData] = useState<PlanFormData>(initialData)
  const [processing, setProcessing] = useState(false)

  function update<K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) {
    setData((current) => ({ ...current, [key]: value }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setProcessing(true)
    const options = { onFinish: () => setProcessing(false) }
    if (mode === 'edit' && data.id) {
      router.put(`/admin/subscriptions/${data.id}`, data as RequestPayload, options)
    } else {
      router.post('/admin/subscriptions', data as RequestPayload, options)
    }
  }

  const isFree = (Number(data.priceAmount) || 0) === 0

  return (
    <AdminLayout title={mode === 'edit' ? 'تعديل باقة' : 'إضافة باقة'}>
      <div className="admin-subscription-editor">
        <form className="admin-editor-form" onSubmit={submit}>
          <AdminFormPanel
            title="بيانات الباقة"
            body="العنوان والوصف العربي. الإنجليزية تضاف لاحقاً بنفس نموذج الترجمات."
          >
            <AdminField label="اسم الباقة" error={errors.title}>
              <Input value={data.title} onChange={(event) => update('title', event.target.value)} />
            </AdminField>
            <AdminField label="Slug" error={errors.slug} help="مُعرّف إنجليزي، مثل: family-plan.">
              <Input
                dir="ltr"
                value={data.slug}
                onChange={(event) => update('slug', event.target.value)}
              />
            </AdminField>
          </AdminFormPanel>

          <AdminFormPanel
            title="السعر والمزايا"
            body="القيم التي تحدد ما يحصل عليه المستخدم عند شراء الباقة."
          >
            <AdminField label="الحالة" error={errors.status}>
              <SelectField
                value={data.status}
                onValueChange={(v) => update('status', v as PlanFormData['status'])}
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'published', label: 'Published' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </AdminField>
            <AdminField label="السعر (0 = مجاني)" error={errors.priceAmount}>
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
            <AdminField
              label="عدد الجولات الممنوحة"
              error={errors.roundsGranted}
              help="يُضاف هذا العدد إلى رصيد المستخدم عند الشراء."
            >
              <Input
                type="number"
                min="0"
                value={data.roundsGranted}
                onChange={(event) =>
                  update(
                    'roundsGranted',
                    event.target.value === '' ? 0 : Number(event.target.value)
                  )
                }
              />
            </AdminField>
            <AdminField label="الحد الأقصى لعدد الفرق" error={errors.maxTeams}>
              <Input
                type="number"
                min="1"
                max="12"
                value={data.maxTeams}
                onChange={(event) =>
                  update('maxTeams', event.target.value === '' ? 1 : Number(event.target.value))
                }
              />
            </AdminField>
            <AdminField label="المزايا" wide error={errors.advantages}>
              <QuillEditor
                value={data.advantages}
                onChange={(value) => update('advantages', value)}
                placeholder="اكتب مزايا الباقة، مثل: كل أنواع الأسئلة، تأثيرات عشوائية، حتى 6 فرق."
              />
            </AdminField>
          </AdminFormPanel>

          <AdminFormPanel title="العرض والتسويق" body="خيارات تظهر في بطاقة الباقة بصفحة الأسعار.">
            <AdminField label="شارة (اختياري)" error={errors.badgeLabel} help="مثل: الأكثر شيوعاً.">
              <Input
                value={data.badgeLabel}
                onChange={(event) => update('badgeLabel', event.target.value)}
              />
            </AdminField>
            <AdminField label="نص الزر (اختياري)" error={errors.ctaLabel} help="مثل: اشترك الآن.">
              <Input
                value={data.ctaLabel}
                onChange={(event) => update('ctaLabel', event.target.value)}
              />
            </AdminField>
            <AdminField label="ملاحظة صغيرة (اختياري)" wide error={errors.note}>
              <Input value={data.note} onChange={(event) => update('note', event.target.value)} />
            </AdminField>
            <Checkbox
              className="is-wide"
              checked={data.isFeatured}
              onChange={(event) => update('isFeatured', event.target.checked)}
              label="تمييز هذه الباقة كالأكثر شيوعاً"
            />
          </AdminFormPanel>

          <AdminFormActions
            cancelHref="/admin/subscriptions"
            processing={processing}
            submitLabel="Save plan"
          />
        </form>

        <aside className="admin-subscription-preview">
          <span className="admin-subscription-preview-label">معاينة البطاقة</span>
          <div className={`plan-card ${data.isFeatured ? 'is-featured' : ''}`} dir="rtl">
            {data.badgeLabel ? <span className="plan-card-badge">⭐ {data.badgeLabel}</span> : null}
            <h3 className="plan-card-title">{data.title || 'اسم الباقة'}</h3>
            <div className="plan-card-price">
              {isFree ? 'مجاني' : data.priceAmount}
              {!isFree ? <span className="plan-card-currency">KWD</span> : null}
            </div>
            <p className="plan-card-rounds">{data.roundsGranted} جولة</p>
            {data.advantages ? (
              <div
                className="plan-card-advantages"
                dangerouslySetInnerHTML={{ __html: data.advantages }}
              />
            ) : (
              <p className="plan-card-advantages-empty">المزايا تظهر هنا…</p>
            )}
            {data.note ? <p className="plan-card-note">{data.note}</p> : null}
            <button type="button" className="plan-card-cta" disabled>
              {data.ctaLabel || 'اشترك'}
            </button>
          </div>
        </aside>
      </div>
    </AdminLayout>
  )
}

export default AdminSubscriptionForm
