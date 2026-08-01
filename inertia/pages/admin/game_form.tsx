import { AdminField, AdminFormActions, AdminFormPanel } from '~/components/admin/admin_form'
import { AdminLayout } from '~/components/admin/admin_layout'
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
    <AdminLayout
      title={mode === 'edit' ? 'تعديل لعبة' : 'إضافة لعبة'}
      subtitle="إعدادات اللعبة الأساسية التي تظهر للمستخدم عند بدء الجلسة."
    >
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
            <input value={data.title} onChange={(event) => update('title', event.target.value)} />
          </AdminField>
          <AdminField
            label="Slug"
            error={errors.slug}
            help="Lowercase English identifier, e.g. masarra-classic."
          >
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
          <AdminField label="تعليمات اللعبة" wide error={errors.instructions}>
            <textarea
              value={data.instructions}
              onChange={(event) => update('instructions', event.target.value)}
            />
          </AdminField>
        </AdminFormPanel>

        <AdminFormPanel
          title="قواعد الإعداد"
          body="هذه القيم تتحكم في شاشة إنشاء اللعبة عند المستخدم."
        >
          <AdminField label="الحالة" error={errors.status}>
            <select
              value={data.status}
              onChange={(event) => update('status', event.target.value as GameFormData['status'])}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </AdminField>
          <AdminField label="تكلفة الجولة" error={errors.baseRoundCreditCost}>
            <input
              type="number"
              min="1"
              value={data.baseRoundCreditCost}
              onChange={(event) => update('baseRoundCreditCost', Number(event.target.value))}
            />
          </AdminField>
          <AdminField label="أقل عدد فرق" error={errors.minTeamCount}>
            <input
              type="number"
              min="1"
              max="6"
              value={data.minTeamCount}
              onChange={(event) => update('minTeamCount', Number(event.target.value))}
            />
          </AdminField>
          <AdminField label="أعلى عدد فرق" error={errors.maxTeamCount}>
            <input
              type="number"
              min="1"
              max="6"
              value={data.maxTeamCount}
              onChange={(event) => update('maxTeamCount', Number(event.target.value))}
            />
          </AdminField>
          <AdminField
            label="الجولات المتاحة"
            error={errors.allowedRoundCounts}
            help="افصل القيم بفواصل: 5,10,15"
          >
            <input
              value={data.allowedRoundCounts.join(',')}
              onChange={(event) => update('allowedRoundCounts', toNumberList(event.target.value))}
            />
          </AdminField>
          <AdminField
            label="مدد السؤال"
            error={errors.allowedQuestionDurations}
            help="بالثواني، وافصل القيم بفواصل."
          >
            <input
              value={data.allowedQuestionDurations.join(',')}
              onChange={(event) =>
                update('allowedQuestionDurations', toNumberList(event.target.value))
              }
            />
          </AdminField>
          <label className="admin-toggle is-wide">
            <input
              type="checkbox"
              checked={data.optionalCategoriesEnabled}
              onChange={(event) => update('optionalCategoriesEnabled', event.target.checked)}
            />
            <span>تفعيل الأقسام الاختيارية المدفوعة لهذه اللعبة</span>
          </label>
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

function toNumberList(value: string) {
  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0)
}

export default AdminGameForm
