import {
  AdminField,
  AdminFormActions,
  AdminFormPanel,
  AdminFormNotice,
  AdminMediaPlaceholder,
  AdminSegmentedChoice,
} from '~/components/admin/admin_form'
import { AdminLayout } from '~/components/admin/admin_layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectField } from '@/components/ui/select_field'
import { Textarea } from '@/components/ui/textarea'
import { router, usePage } from '@inertiajs/react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import type { RequestPayload } from '@inertiajs/core'
import React, { useState } from 'react'

interface GameOption extends Record<string, JSONDataTypes> {
  id: string
  title: string
}

interface CategoryOption extends Record<string, JSONDataTypes> {
  id: string
  gameId: string
  title: string
}

interface MediaAssetOption extends Record<string, JSONDataTypes> {
  id: string
  originalName: string
  mimeType: string
  sizeBytes: number
  url: string
  createdAt: string | null
}

interface QuestionFormData extends Record<string, JSONDataTypes> {
  id: string | null
  gameId: string
  questionCategoryId: string | null
  status: 'draft' | 'published' | 'archived'
  type: 'knowledge' | 'challenge'
  contentMode: 'text' | 'image' | 'video' | 'audio'
  effectLogic: 'normal' | 'steal' | 'transfer' | 'freeze' | 'double'
  mediaAssetId: string | null
  mediaUrl: string
  prompt: string
  correctAnswer: string
  explanation: string
  basePoints: number
}

interface QuestionFormProps extends Record<string, JSONDataTypes> {
  mode: 'create' | 'edit'
  question: QuestionFormData | null
  games: GameOption[]
  categories: CategoryOption[]
  mediaAssets: MediaAssetOption[]
}

const contentModes = [
  { value: 'text', label: 'Text', caption: 'سؤال نصي' },
  { value: 'image', label: 'Image', caption: 'صورة' },
  { value: 'video', label: 'Video', caption: 'فيديو' },
  { value: 'audio', label: 'Audio', caption: 'صوت' },
] as const

const effectLogics = [
  { value: 'normal', label: 'Normal', caption: 'نقاط عادية' },
  { value: 'steal', label: 'Steal', caption: 'خصم 3 نقاط' },
  { value: 'transfer', label: 'Transfer', caption: 'تحويل' },
  { value: 'freeze', label: 'Freeze', caption: 'تجميد' },
  { value: 'double', label: 'Double', caption: 'مضاعفة' },
] as const

const AdminQuestionForm: React.FC<QuestionFormProps> = ({
  mode,
  question,
  games,
  categories,
  mediaAssets: initialMediaAssets,
}) => {
  const { csrfToken, errors } = usePage().props as {
    csrfToken?: string
    errors: Record<string, string | undefined>
  }
  const initialData: QuestionFormData = question ?? {
    id: null,
    gameId: games[0]?.id ?? '',
    questionCategoryId: null,
    status: 'draft',
    type: 'knowledge',
    contentMode: 'text',
    effectLogic: 'normal',
    mediaAssetId: null,
    mediaUrl: '',
    prompt: '',
    correctAnswer: '',
    explanation: '',
    basePoints: 5,
  }
  const [data, setData] = useState(initialData)
  const [processing, setProcessing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [mediaAssets, setMediaAssets] = useState(initialMediaAssets)

  function update<K extends keyof QuestionFormData>(key: K, value: QuestionFormData[K]) {
    setData((current) => ({ ...current, [key]: value }))
  }

  const filteredCategories = categories.filter((category) => category.gameId === data.gameId)
  const selectedGameHasCategories = filteredCategories.length > 0
  const compatibleMediaAssets = mediaAssets.filter((asset) =>
    asset.mimeType.startsWith(`${data.contentMode}/`)
  )

  function selectMediaAsset(asset: MediaAssetOption) {
    update('mediaAssetId', asset.id)
    update('mediaUrl', asset.url)
    setUploadError(null)
  }

  async function uploadMedia(file: File) {
    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('visibility', 'public')
    if (csrfToken) {
      formData.append('_csrf', csrfToken)
    }

    try {
      const response = await fetch('/admin/media-assets', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      })
      const payload = (await response.json()) as {
        success?: boolean
        message?: string
        data?: { mediaAsset?: MediaAssetOption }
      }

      if (!response.ok || !payload.success || !payload.data?.mediaAsset) {
        throw new Error(payload?.message ?? 'Media upload failed.')
      }

      const uploadedAsset = payload.data.mediaAsset
      setMediaAssets((current) => [
        uploadedAsset,
        ...current.filter((asset) => asset.id !== uploadedAsset.id),
      ])
      selectMediaAsset(uploadedAsset)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Media upload failed.')
    } finally {
      setUploading(false)
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setProcessing(true)
    const options = { onFinish: () => setProcessing(false) }
    if (mode === 'edit' && data.id) {
      router.put(`/admin/questions/${data.id}`, data as RequestPayload, options)
    } else {
      router.post('/admin/questions', data as RequestPayload, options)
    }
  }

  return (
    <AdminLayout
      title={mode === 'edit' ? 'تعديل سؤال' : 'إضافة سؤال'}
    >
      <form className="admin-editor-form" onSubmit={submit}>
        <AdminFormPanel
          title="نوع السؤال"
          body="اختر طريقة عرض السؤال. هذه ليست نسخة من المرجع، لكنها نفس منطق التقسيم."
        >
          <AdminFormNotice
            title="Media storage"
            body="الملفات تحفظ حالياً في التخزين المحلي. الربط يتم عبر media asset ID حتى يمكن تبديل التخزين إلى S3 لاحقاً بدون تغيير نموذج السؤال."
          />
          <div className="is-wide">
            <AdminSegmentedChoice
              label="Question content"
              value={data.contentMode}
              options={[...contentModes]}
              onChange={(value) => update('contentMode', value)}
            />
          </div>
          {data.contentMode !== 'text' ? (
            <AdminField
              label="ملف الوسائط"
              wide
              error={errors.mediaAssetId ?? errors.mediaUrl ?? uploadError ?? undefined}
              help="الصيغ المدعومة: صور، فيديو، وصوت. الحد الحالي 50MB."
            >
              <Input
                type="file"
                accept={`${data.contentMode}/*`}
                disabled={uploading || processing}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void uploadMedia(file)
                }}
              />
              <Input
                dir="ltr"
                placeholder="Stored media URL"
                className="mt-2"
                value={data.mediaUrl}
                onChange={(event) => update('mediaUrl', event.target.value)}
              />
              {data.mediaAssetId ? (
                <p className="text-xs text-muted-foreground mt-1" dir="ltr">
                  Media asset: {data.mediaAssetId}
                </p>
              ) : uploading ? (
                <p className="text-xs text-muted-foreground mt-1">Uploading media…</p>
              ) : null}
              <AdminMediaPlaceholder mode={data.contentMode} mediaUrl={data.mediaUrl} />
              {compatibleMediaAssets.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Choose existing {data.contentMode}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {compatibleMediaAssets.map((asset) => (
                      <Button
                        key={asset.id}
                        type="button"
                        variant={data.mediaAssetId === asset.id ? 'default' : 'outline'}
                        size="sm"
                        className="flex flex-col h-auto py-2 px-3"
                        onClick={() => selectMediaAsset(asset)}
                      >
                        <strong className="text-xs">{asset.originalName}</strong>
                        <small className="text-[10px] opacity-70" dir="ltr">
                          {asset.mimeType}
                        </small>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  No reusable {data.contentMode} assets yet.
                </p>
              )}
            </AdminField>
          ) : null}
        </AdminFormPanel>

        <AdminFormPanel
          title="محتوى السؤال"
          body="المحتوى العربي الحالي. يمكن إضافة الإنجليزية لاحقاً بنفس نموذج الترجمات."
        >
          <AdminField
            label="اللعبة"
            error={errors.gameId}
            help={games.length === 0 ? 'يجب إنشاء لعبة قبل إضافة سؤال.' : undefined}
          >
            <SelectField
              value={data.gameId}
              disabled={games.length === 0}
              onValueChange={(value) => {
                setData((current) => ({
                  ...current,
                  gameId: value,
                  questionCategoryId: null,
                }))
              }}
              options={games.map((game) => ({ value: game.id, label: game.title }))}
            />
          </AdminField>
          <AdminField
            label="القسم الاختياري"
            error={errors.questionCategoryId}
            help={
              selectedGameHasCategories
                ? 'اختياري. اتركه فارغاً للأسئلة العامة.'
                : 'لا توجد أقسام مرتبطة بهذه اللعبة حتى الآن.'
            }
          >
            <SelectField
              value={data.questionCategoryId ?? 'none'}
              disabled={!selectedGameHasCategories}
              onValueChange={(value) =>
                update('questionCategoryId', value === 'none' ? null : value)
              }
              options={[
                { value: 'none', label: 'بدون قسم' },
                ...filteredCategories.map((category) => ({
                  value: category.id,
                  label: category.title,
                })),
              ]}
            />
          </AdminField>
          <AdminField label="السؤال" wide error={errors.prompt}>
            <Textarea
              value={data.prompt}
              onChange={(event) => update('prompt', event.target.value)}
            />
          </AdminField>
          <AdminField label="الإجابة الصحيحة" error={errors.correctAnswer}>
            <Input
              value={data.correctAnswer}
              onChange={(event) => update('correctAnswer', event.target.value)}
            />
          </AdminField>
          <AdminField label="النقاط" error={errors.basePoints}>
            <Input
              type="number"
              min="1"
              max="100"
              value={data.basePoints}
              onChange={(event) => update('basePoints', Number(event.target.value))}
            />
          </AdminField>
          <AdminField label="شرح الإجابة" wide error={errors.explanation}>
            <Textarea
              value={data.explanation}
              onChange={(event) => update('explanation', event.target.value)}
            />
          </AdminField>
        </AdminFormPanel>

        <AdminFormPanel
          title="منطق التأثير"
          body="القواعد غير المستقرة مثل transfer/freeze تحفظ حالياً كـ metadata حتى تثبت نهائياً."
        >
          <div className="is-wide">
            <AdminSegmentedChoice
              label="Effect logic"
              value={data.effectLogic}
              options={[...effectLogics]}
              onChange={(value) => update('effectLogic', value)}
            />
          </div>
          <AdminField label="نوع السجل" error={errors.type}>
            <SelectField
              value={data.type}
              onValueChange={(value) => update('type', value as QuestionFormData['type'])}
              options={[
                { value: 'knowledge', label: 'Knowledge' },
                { value: 'challenge', label: 'Challenge' },
              ]}
            />
          </AdminField>
          <AdminField label="الحالة" error={errors.status}>
            <SelectField
              value={data.status}
              onValueChange={(value) => update('status', value as QuestionFormData['status'])}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </AdminField>
        </AdminFormPanel>

        <AdminFormActions
          cancelHref="/admin/questions"
          processing={processing}
          submitLabel="Save question"
        />
      </form>
    </AdminLayout>
  )
}

export default AdminQuestionForm
