import {
  AdminField,
  AdminFormActions,
  AdminFormPanel,
  AdminSegmentedChoice,
} from '~/components/admin/admin_form'
import { AdminLayout } from '~/components/admin/admin_layout'
import { Checkbox } from '@/components/ui/checkbox'
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
  effectPoints: number | null
  mediaAssetId: string | null
  mediaUrl: string
  prompt: string
  correctAnswer: string
  explanation: string
  basePoints: number
  sortOrder: number
  visibilityTimerEnabled: boolean
  visibilityTimerSeconds: number | null
}

export interface FunRuleOption extends Record<string, JSONDataTypes> {
  id: string
  code: string
  nameAr: string
  nameEn: string | null
  descriptionAr: string | null
  descriptionEn: string | null
  effectType: string
  config: Record<string, JSONDataTypes>
}

interface QuestionFormProps extends Record<string, JSONDataTypes> {
  mode: 'create' | 'edit'
  question: (QuestionFormData & { funRuleId?: string | null }) | null
  games: GameOption[]
  categories: CategoryOption[]
  mediaAssets: MediaAssetOption[]
  funRules?: FunRuleOption[]
}

const contentModes = [
  { value: 'text', label: 'Text', caption: 'سؤال نصي' },
  { value: 'image', label: 'Image', caption: 'صورة' },
  { value: 'video', label: 'Video', caption: 'فيديو' },
  { value: 'audio', label: 'Audio', caption: 'صوت' },
] as const

const defaultEffectLogics = [
  { value: 'normal', label: 'Normal', caption: 'نقاط عادية' },
  { value: 'steal', label: 'Steal', caption: 'خصم 3 نقاط' },
  { value: 'transfer', label: 'Transfer', caption: 'تحويل' },
  { value: 'freeze', label: 'Freeze', caption: 'تجميد' },
  { value: 'double', label: 'Double', caption: 'مضاعفة' },
] as const

function MediaPreviewChip({
  url,
  contentMode,
  onClear,
}: {
  url: string
  contentMode: string
  onClear: () => void
}) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const icon = contentMode === 'image' ? '🖼️' : contentMode === 'video' ? '▶️' : '🎧'
  const label = url.split('/').pop() ?? url

  return (
    <>
      <div className="admin-media-chip">
        <span className="admin-media-chip-icon">{icon}</span>
        <span className="admin-media-chip-name" title={url}>
          {label}
        </span>
        <button
          type="button"
          className="admin-media-chip-preview"
          onClick={() => setPreviewOpen(true)}
          aria-label="معاينة"
        >
          معاينة
        </button>
        <button
          type="button"
          className="admin-media-chip-remove"
          onClick={onClear}
          aria-label="إزالة"
        >
          ✕
        </button>
      </div>

      {previewOpen ? (
        <div className="admin-media-modal-overlay" onClick={() => setPreviewOpen(false)}>
          <div
            className="admin-media-modal admin-media-preview-modal"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-media-modal-header">
              <h3>{label}</h3>
              <button
                type="button"
                className="admin-media-modal-close"
                onClick={() => setPreviewOpen(false)}
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>
            <div className="admin-media-preview-body">
              {contentMode === 'image' && (
                <img src={url} alt="preview" className="admin-media-preview-full" />
              )}
              {contentMode === 'video' && (
                <video src={url} controls className="admin-media-preview-full" />
              )}
              {contentMode === 'audio' && (
                <audio src={url} controls className="admin-media-preview-audio-full" />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function GalleryPicker({
  assets,
  selectedId,
  contentMode,
  onSelect,
}: {
  assets: MediaAssetOption[]
  selectedId: string | null
  contentMode: string
  onSelect: (asset: MediaAssetOption) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const visible = query.trim()
    ? assets.filter((a) => a.originalName.toLowerCase().includes(query.toLowerCase()))
    : assets

  function pick(asset: MediaAssetOption) {
    onSelect(asset)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className="admin-media-library-btn"
        onClick={() => {
          setQuery('')
          setOpen(true)
        }}
      >
        اختر من المكتبة
        <span className="admin-media-library-count">{assets.length}</span>
      </button>

      {open ? (
        <div className="admin-media-modal-overlay" onClick={() => setOpen(false)}>
          <div className="admin-media-modal" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="admin-media-modal-header">
              <h3>مكتبة الوسائط — {contentMode}</h3>
              <button
                type="button"
                className="admin-media-modal-close"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            <div className="admin-media-modal-search">
              <input
                type="search"
                className="admin-media-gallery-search"
                placeholder="ابحث باسم الملف…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="admin-media-modal-grid">
              {visible.length === 0 ? (
                <span className="admin-media-gallery-empty">لا توجد نتائج مطابقة.</span>
              ) : (
                visible.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className="admin-media-asset"
                    data-selected={selectedId === asset.id}
                    onClick={() => pick(asset)}
                  >
                    <strong title={asset.originalName}>{asset.originalName}</strong>
                    <small dir="ltr">{asset.mimeType}</small>
                  </button>
                ))
              )}
            </div>

            <div className="admin-media-modal-footer">
              <button
                type="button"
                className="admin-media-modal-cancel"
                onClick={() => setOpen(false)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

const AdminQuestionForm: React.FC<QuestionFormProps> = ({
  mode,
  question,
  games,
  categories,
  mediaAssets: initialMediaAssets,
  funRules = [],
}) => {
  const { csrfToken, errors } = usePage().props as {
    csrfToken?: string
    errors: Record<string, string | undefined>
  }
  const initialData: QuestionFormData & { funRuleId?: string | null } = question ?? {
    id: null,
    gameId: games[0]?.id ?? '',
    questionCategoryId: null,
    status: 'draft',
    type: 'knowledge',
    contentMode: 'text',
    effectLogic: 'normal',
    effectPoints: null,
    funRuleId: null,
    mediaAssetId: null,
    mediaUrl: '',
    prompt: '',
    correctAnswer: '',
    explanation: '',
    basePoints: 5,
    sortOrder: 0,
    visibilityTimerEnabled: false,
    visibilityTimerSeconds: null,
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
    <AdminLayout title={mode === 'edit' ? 'تعديل سؤال' : 'إضافة سؤال'}>
      <form className="admin-editor-form" onSubmit={submit}>
        <AdminFormPanel
          title="محتوى السؤال"
          body="المحتوى العربي الحالي. يمكن إضافة الإنجليزية لاحقاً بنفس نموذج الترجمات."
        >
          <div className="is-wide">
            <AdminSegmentedChoice
              label="Question content"
              value={data.contentMode}
              options={[...contentModes]}
              onChange={(value) => update('contentMode', value)}
            />
          </div>
          <AdminField
            label="مؤقت ظهور العنصر"
            wide
            error={errors.visibilityTimerSeconds}
            help="يتحكم في مدة ظهور هذا العنصر (نص، صورة، إلخ) فقط. لا يغيّر وقت السؤال الإجمالي المحدد في إعدادات اللعبة."
          >
            <div className="admin-visibility-timer-card" data-active={data.visibilityTimerEnabled}>
              <div className="admin-visibility-timer-toggle">
                <Checkbox
                  checked={data.visibilityTimerEnabled}
                  onChange={(event) => {
                    const enabled = event.target.checked
                    update('visibilityTimerEnabled', enabled)
                    if (enabled && !data.visibilityTimerSeconds) {
                      update('visibilityTimerSeconds', 10)
                    }
                  }}
                  label="تفعيل مؤقت ظهور العنصر"
                />
              </div>
              {data.visibilityTimerEnabled ? (
                <div className="admin-visibility-timer-input-group">
                  <Input
                    type="number"
                    min="1"
                    max="300"
                    value={data.visibilityTimerSeconds ?? ''}
                    onChange={(event) =>
                      update(
                        'visibilityTimerSeconds',
                        event.target.value === '' ? null : Number(event.target.value)
                      )
                    }
                  />
                  <span>ثانية</span>
                </div>
              ) : null}
            </div>
          </AdminField>
          {data.contentMode !== 'text' ? (
            <AdminField
              label="ملف الوسائط"
              wide
              error={errors.mediaAssetId ?? errors.mediaUrl ?? uploadError ?? undefined}
            >
              <div className="admin-media-manager">
                {data.mediaUrl ? (
                  <div className="admin-media-current">
                    <MediaPreviewChip
                      url={data.mediaUrl}
                      contentMode={data.contentMode}
                      onClear={() => {
                        update('mediaAssetId', null)
                        update('mediaUrl', '')
                      }}
                    />
                  </div>
                ) : (
                  <label className="admin-media-dropzone" data-disabled={uploading || processing}>
                    <input
                      type="file"
                      accept={`${data.contentMode}/*`}
                      disabled={uploading || processing}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) void uploadMedia(file)
                      }}
                    />
                    <span className="admin-media-dropzone-icon">
                      {data.contentMode === 'image'
                        ? '🖼️'
                        : data.contentMode === 'video'
                          ? '▶️'
                          : '🎧'}
                    </span>
                    <span className="admin-media-dropzone-text">
                      <strong>{uploading ? 'جاري الرفع…' : 'اختر ملف للرفع'}</strong>
                      <small>الصيغ المدعومة: صور، فيديو، وصوت — الحد الحالي 50MB.</small>
                    </span>
                  </label>
                )}

                {compatibleMediaAssets.length > 0 ? (
                  <GalleryPicker
                    assets={compatibleMediaAssets}
                    selectedId={data.mediaAssetId}
                    contentMode={data.contentMode}
                    onSelect={selectMediaAsset}
                  />
                ) : null}
              </div>
            </AdminField>
          ) : null}

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
          <AdminField
            label="ترتيب الظهور"
            error={errors.sortOrder}
            help="الأرقام الأصغر تظهر أولاً في قائمة الأسئلة."
          >
            <Input
              type="number"
              min="0"
              value={data.sortOrder}
              onChange={(event) =>
                update('sortOrder', event.target.value === '' ? 0 : Number(event.target.value))
              }
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
          title="منطق التأثير (Fun Rules)"
          body="اختر قاعدة التأثير الخاصة بهذا السؤال ليتم تجميدها وأخذ لقطة (Snapshot) منها فور الحفظ."
        >
          <div className="is-wide">
            <AdminSegmentedChoice
              label="Effect logic"
              value={data.effectLogic}
              options={
                funRules.length > 0
                  ? funRules.map((rule) => ({
                      value: rule.code,
                      label: rule.nameEn || rule.code.toUpperCase(),
                      caption: rule.nameAr,
                    }))
                  : [...defaultEffectLogics]
              }
              onChange={(value) => {
                const matchedRule = funRules.find((r) => r.code === value || r.id === value)
                setData((current) => ({
                  ...current,
                  effectLogic: (matchedRule
                    ? matchedRule.code
                    : value) as QuestionFormData['effectLogic'],
                  funRuleId: matchedRule ? matchedRule.id : null,
                }))
              }}
            />
          </div>
          {(data.effectLogic === 'steal' || data.effectLogic === 'transfer') && (
            <AdminField
              wide
              label={
                data.effectLogic === 'steal'
                  ? 'عدد النقاط المخصومة من الفرق الأخرى'
                  : 'عدد النقاط المحوّلة للفرق الأخرى'
              }
              error={errors.effectPoints}
              help={
                data.effectLogic === 'steal'
                  ? 'عند الإجابة الصحيحة، يتم خصم هذا العدد من نقاط كل فريق آخر.'
                  : 'عند الإجابة الصحيحة، يتم توزيع هذا العدد من النقاط على الفرق الأخرى.'
              }
            >
              <div className="w-48">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={data.effectPoints ?? ''}
                  onChange={(e) =>
                    update('effectPoints', e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="مثال: 3"
                />
              </div>
            </AdminField>
          )}
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
