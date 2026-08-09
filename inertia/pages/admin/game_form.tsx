import { AdminField, AdminFormActions, AdminFormPanel } from '~/components/admin/admin_form'
import { AdminLayout } from '~/components/admin/admin_layout'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select_field'
import { QuillEditor } from '~/components/ui/quill_editor'
import { NumberChips } from '~/components/ui/number_chips'
import { router, usePage } from '@inertiajs/react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import type { RequestPayload } from '@inertiajs/core'
import React, { useState } from 'react'

interface GameFormData extends Record<string, JSONDataTypes> {
  id: string | null
  slug: string
  status: 'draft' | 'published' | 'archived'
  title: string
  description: string
  instructions: string
  minTeamCount: number
  maxTeamCount: number
  allowedRoundCounts: number[]
  allowedQuestionDurations: number[]
  baseRoundCreditCost: number
  optionalCategoriesEnabled: boolean
}

interface GameFormProps extends Record<string, JSONDataTypes> {
  mode: 'create' | 'edit'
  game: GameFormData | null
}

const defaultGame: GameFormData = {
  id: null,
  slug: '',
  status: 'draft',
  title: '',
  description: '',
  instructions: '',
  minTeamCount: 2,
  maxTeamCount: 6,
  allowedRoundCounts: [5, 10],
  allowedQuestionDurations: [30, 40],
  baseRoundCreditCost: 1,
  optionalCategoriesEnabled: false,
}

const AdminGameForm: React.FC<GameFormProps> = ({ mode, game }) => {
  const { errors } = usePage().props as { errors: Record<string, string | undefined> }
  const [data, setData] = useState<GameFormData>(game ?? defaultGame)
  const [processing, setProcessing] = useState(false)

  function update<K extends keyof GameFormData>(key: K, value: GameFormData[K]) {
    setData((current) => ({ ...current, [key]: value }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setProcessing(true)
    const options = { onFinish: () => setProcessing(false) }
    if (mode === 'edit' && data.id) {
      router.put(`/admin/games/${data.id}`, data as RequestPayload, options)
    } else {
      router.post('/admin/games', data as RequestPayload, options)
    }
  }

  return (
    <AdminLayout title={mode === 'edit' ? 'تعديل لعبة' : 'إضافة لعبة'}>
      <form className="admin-editor-form" onSubmit={submit}>
        <AdminFormPanel
          title="المحتوى العربي"
          body="الإنجليزية لاحقاً ستضاف بنفس البنية بدون تغيير معماري."
        >
          <AdminField
            label="اسم اللعبة"
            error={errors.title}
            help="الاسم العربي الظاهر في واجهة المستخدم."
          >
            <Input value={data.title} onChange={(event) => update('title', event.target.value)} />
          </AdminField>
          <AdminField
            label="Slug"
            error={errors.slug}
            help="Lowercase English identifier, e.g. masarra-classic."
          >
            <Input
              dir="ltr"
              value={data.slug}
              onChange={(event) => update('slug', event.target.value)}
            />
          </AdminField>
          <AdminField label="الوصف" wide error={errors.description}>
            <QuillEditor value={data.description} onChange={(val) => update('description', val)} />
          </AdminField>
          <AdminField label="تعليمات اللعبة" wide error={errors.instructions}>
            <QuillEditor
              value={data.instructions}
              onChange={(val) => update('instructions', val)}
            />
          </AdminField>
        </AdminFormPanel>

        <AdminFormPanel
          title="قواعد الإعداد"
          body="هذه القيم تتحكم في شاشة إنشاء اللعبة عند المستخدم."
        >
          <AdminField label="الحالة" error={errors.status}>
            <SelectField
              value={data.status}
              onValueChange={(v) => update('status', v as GameFormData['status'])}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </AdminField>
          <AdminField label="تكلفة الجولة الواحدة (بالرصيد)" error={errors.baseRoundCreditCost}>
            <Input
              type="number"
              min="1"
              value={data.baseRoundCreditCost}
              onChange={(event) => update('baseRoundCreditCost', Number(event.target.value))}
            />
          </AdminField>
          <AdminField label="الحد الأدنى لعدد الفرق" error={errors.minTeamCount}>
            <Input
              type="number"
              min="1"
              max="6"
              value={data.minTeamCount}
              onChange={(event) => update('minTeamCount', Number(event.target.value))}
            />
          </AdminField>
          <AdminField label="الحد الأقصى لعدد الفرق" error={errors.maxTeamCount}>
            <Input
              type="number"
              min="1"
              max="6"
              value={data.maxTeamCount}
              onChange={(event) => update('maxTeamCount', Number(event.target.value))}
            />
          </AdminField>
          <AdminField
            label="خيارات عدد الجولات المتاحة"
            error={errors.allowedRoundCounts}
            help="أعداد الجولات التي يمكن للمستخدم الاختيار منها. اكتب رقماً ثم اضغط (+) أو Enter للإضافة."
          >
            <NumberChips
              values={data.allowedRoundCounts}
              onChange={(vals) => update('allowedRoundCounts', vals)}
              placeholder="مثال: 5"
            />
          </AdminField>
          <AdminField
            label="خيارات مدة عرض السؤال (بالثواني)"
            error={errors.allowedQuestionDurations}
            help="المدد التي يمكن للمستخدم الاختيار منها (بالثواني). اكتب رقماً ثم اضغط (+) أو Enter للإضافة."
          >
            <NumberChips
              values={data.allowedQuestionDurations}
              onChange={(vals) => update('allowedQuestionDurations', vals)}
              placeholder="مثال: 30"
            />
          </AdminField>
          <Checkbox
            className="is-wide"
            checked={data.optionalCategoriesEnabled}
            onChange={(event) => update('optionalCategoriesEnabled', event.target.checked)}
            label="تفعيل الأقسام الاختيارية المدفوعة لهذه اللعبة"
          />
        </AdminFormPanel>

        <AdminFormActions
          cancelHref="/admin/games"
          processing={processing}
          submitLabel="Save game"
        />
      </form>
    </AdminLayout>
  )
}

export default AdminGameForm
