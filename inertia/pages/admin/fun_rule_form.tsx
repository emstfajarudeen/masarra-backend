import { AdminField, AdminFormActions, AdminFormPanel } from '~/components/admin/admin_form'
import { AdminLayout } from '~/components/admin/admin_layout'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select_field'
import { Textarea } from '@/components/ui/textarea'
import { router, usePage } from '@inertiajs/react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import type { RequestPayload } from '@inertiajs/core'
import React, { useState } from 'react'

interface FunRuleFormData extends Record<string, JSONDataTypes> {
  id: string | null
  code: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  effectType: 'normal' | 'steal' | 'transfer' | 'freeze' | 'double' | 'custom'
  configJson: string
  isActive: boolean
  sortOrder: number
}

interface FunRuleFormProps extends Record<string, JSONDataTypes> {
  mode: 'create' | 'edit'
  rule: FunRuleFormData | null
}

const effectTypes = [
  { value: 'normal', label: 'نقاط عادية' },
  { value: 'steal', label: 'خصم نقاط' },
  { value: 'transfer', label: 'تحويل نقاط' },
  { value: 'freeze', label: 'تجميد' },
  { value: 'double', label: 'مضاعفة' },
  { value: 'custom', label: 'مخصص' },
] as const

const defaultRule: FunRuleFormData = {
  id: null,
  code: '',
  nameAr: '',
  nameEn: '',
  descriptionAr: '',
  descriptionEn: '',
  effectType: 'normal',
  configJson: '{}',
  isActive: true,
  sortOrder: 0,
}

const AdminFunRuleForm: React.FC<FunRuleFormProps> = ({ mode, rule }) => {
  const { errors } = usePage().props as { errors: Record<string, string | undefined> }
  const [data, setData] = useState<FunRuleFormData>(rule ?? defaultRule)
  const [processing, setProcessing] = useState(false)

  function update<K extends keyof FunRuleFormData>(key: K, value: FunRuleFormData[K]) {
    setData((current) => ({ ...current, [key]: value }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setProcessing(true)
    const options = { onFinish: () => setProcessing(false) }
    if (mode === 'edit' && data.id) {
      router.put(`/admin/fun-rules/${data.id}`, data as RequestPayload, options)
    } else {
      router.post('/admin/fun-rules', data as RequestPayload, options)
    }
  }

  return (
    <AdminLayout title={mode === 'edit' ? 'تعديل قاعدة التأثير' : 'إضافة قاعدة تأثير'}>
      <form className="admin-editor-form" onSubmit={submit}>
        <AdminFormPanel
          title="تفاصيل القاعدة"
          body="الاسم والوصف ونوع التأثير المطبّق على النتيجة."
        >
          <AdminField label="اسم القاعدة" error={errors.nameAr}>
            <Input
              value={data.nameAr}
              onChange={(e) => update('nameAr', e.target.value)}
              placeholder="مثال: خصم 3 نقاط"
            />
          </AdminField>

          <AdminField
            label="الكود المميز (Code)"
            error={errors.code}
            help="حروف إنجليزية صغيرة وشرطات سفلية فقط، مثال: steal_points"
          >
            <Input
              dir="ltr"
              value={data.code}
              onChange={(e) => update('code', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              placeholder="e.g. steal_points"
            />
          </AdminField>

          <AdminField label="نوع التأثير" error={errors.effectType}>
            <SelectField
              value={data.effectType}
              onValueChange={(v) => update('effectType', v as FunRuleFormData['effectType'])}
              options={[...effectTypes]}
            />
          </AdminField>

          <AdminField label="ترتيب العرض" error={errors.sortOrder}>
            <Input
              type="number"
              value={data.sortOrder}
              onChange={(e) => update('sortOrder', Number(e.target.value))}
            />
          </AdminField>

          <AdminField label="الوصف" error={errors.descriptionAr} wide>
            <Textarea
              rows={3}
              value={data.descriptionAr}
              onChange={(e) => update('descriptionAr', e.target.value)}
              placeholder="وصف مختصر للتأثير عند احتساب النتيجة..."
            />
          </AdminField>

          <AdminField
            label="إعدادات إضافية (Config JSON)"
            error={errors.configJson}
            help='قيم JSON اختيارية تُمرَّر لمحرك الاحتساب، مثال: {"pointsStolen": 3}'
            wide
          >
            <Textarea
              rows={3}
              dir="ltr"
              value={data.configJson}
              onChange={(e) => update('configJson', e.target.value)}
              className="font-mono text-xs"
              placeholder='{}'
            />
          </AdminField>

          <Checkbox
            className="is-wide"
            checked={data.isActive}
            onChange={(e) => update('isActive', e.target.checked)}
            label="قاعدة مفعّلة (تظهر للاختيار في نموذج السؤال)"
          />
        </AdminFormPanel>

        <AdminFormActions
          cancelHref="/admin/fun-rules"
          processing={processing}
          submitLabel={mode === 'edit' ? 'تحديث القاعدة' : 'حفظ القاعدة'}
        />
      </form>
    </AdminLayout>
  )
}

export default AdminFunRuleForm
