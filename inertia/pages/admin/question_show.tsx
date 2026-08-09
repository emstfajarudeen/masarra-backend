import { AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import { ConfirmDialog } from '~/components/admin/confirm_dialog'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select_field'
import { Pencil } from 'lucide-react'
import { useForm } from '@inertiajs/react'
import type React from 'react'
import { useState } from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface QuestionDetail extends Record<string, JSONDataTypes> {
  id: string
  prompt: string
  correctAnswer: string | null
  explanation: string | null
  gameTitle: string
  categoryTitle: string | null
  status: string
  type: string
  contentMode: string
  effectLogic: string
  mediaUrl: string | null
  basePoints: number
  sortOrder: number
  visibilityTimerEnabled: boolean
  visibilityTimerSeconds: number | null
  createdAt: string | null
  updatedAt: string | null
  publishedAt: string | null
}

interface QuestionStats extends Record<string, JSONDataTypes> {
  usageCount: number
}

interface MediaAssetRow extends Record<string, JSONDataTypes> {
  id: string
  visibility: string
  originalName: string
  mimeType: string
  extension: string
  sizeBytes: number
  url: string
  createdAt: string | null
}

export interface AdminQuestionShowProps extends Record<string, JSONDataTypes> {
  question: QuestionDetail
  stats: QuestionStats
  mediaAsset: MediaAssetRow | null
}

function effectLabel(effectLogic: string, funRule?: Record<string, any> | null) {
  if (funRule?.nameAr) return funRule.nameAr
  const labels: Record<string, string> = {
    normal: 'نقاط عادية',
    steal: 'خصم نقاط (-3)',
    transfer: 'نقل النقاط',
    freeze: 'تجميد النقاط',
    double: 'نقاط مضاعفة',
  }

  return labels[effectLogic] ?? effectLogic
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    knowledge: 'سؤال معرفي',
    challenge: 'تحدي',
  }
  return labels[type] ?? type
}

function contentModeLabel(contentMode: string) {
  const labels: Record<string, string> = {
    text: 'نص',
    image: 'صورة',
    video: 'فيديو',
    audio: 'صوت',
  }
  return labels[contentMode] ?? contentMode
}

const AdminQuestionShow: React.FC<AdminQuestionShowProps> = ({ question, stats, mediaAsset }) => {
  const statusForm = useForm({ status: question.status })
  const [pendingStatus, setPendingStatus] = useState<'draft' | 'published' | 'archived' | null>(
    null
  )

  const confirmStatusChange = () => {
    if (!pendingStatus) return
    statusForm.setData('status', pendingStatus)
    statusForm.patch(`/admin/questions/${question.id}/status`, { preserveScroll: true })
    setPendingStatus(null)
  }

  return (
    <AdminLayout title="معاينة السؤال">
      <section className="admin-detail-hero">
        <div className="flex flex-col justify-between">
          <div>
            <span className="admin-kicker">Question preview</span>
            <h2>{question.prompt}</h2>
            <div className="admin-detail-hero-meta">
              <AdminStatusBadge status={question.status} />
              <span>{typeLabel(question.type)}</span>
              <span>{contentModeLabel(question.contentMode)}</span>
              <span>
                {effectLabel(question.effectLogic, question.funRule as Record<string, any> | null)}
              </span>
            </div>
          </div>
          <div className="admin-detail-hero-actions mt-6">
            <Button type="button" className="admin-hero-edit-btn" asChild>
              <a href={`/admin/questions/${question.id}/edit`}>
                <Pencil className="h-4 w-4" />
                تعديل السؤال
              </a>
            </Button>
            <SelectField
              value={question.status}
              onValueChange={(value) =>
                setPendingStatus(value as 'draft' | 'published' | 'archived')
              }
              options={[
                { value: 'draft', label: 'مسودة (Draft)' },
                { value: 'published', label: 'منشور (Published)' },
                { value: 'archived', label: 'مؤرشف (Archived)' },
              ]}
              className="admin-hero-status-select-trigger"
            />
          </div>
        </div>
        <div className="admin-detail-score">
          <strong>{question.basePoints}</strong>
          <span>points</span>
        </div>
      </section>

      <section className="admin-detail-stats">
        <article>
          <span>Game</span>
          <strong>{question.gameTitle}</strong>
          <p>source game</p>
        </article>
        <article>
          <span>Category</span>
          <strong>{question.categoryTitle ?? 'General'}</strong>
          <p>question pack</p>
        </article>
        <article>
          <span>Usage</span>
          <strong>{stats.usageCount}</strong>
          <p>assigned rounds</p>
        </article>
        <article>
          <span>Sort order</span>
          <strong>{question.sortOrder}</strong>
          <p>bank ordering</p>
        </article>
      </section>

      <section className="admin-detail-single-col">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>الإجابة والوسائط</h2>
            </div>
          </div>
          <div className="admin-question-answer-block">
            <div className="admin-question-answer">
              <span>Correct answer</span>
              <strong>{question.correctAnswer ?? 'Not set'}</strong>
            </div>
            <div className="admin-question-answer">
              <span>Effect logic</span>
              <strong>
                {effectLabel(question.effectLogic, question.funRule as Record<string, any> | null)}
              </strong>
            </div>
            {question.visibilityTimerEnabled ? (
              <div className="admin-question-answer">
                <span>Object visibility timer</span>
                <strong>{question.visibilityTimerSeconds}s</strong>
              </div>
            ) : null}
          </div>

          {question.mediaUrl ? (
            <QuestionMedia question={question} />
          ) : (
            <p className="admin-question-no-media">لا توجد وسائط مرتبطة بهذا السؤال.</p>
          )}
          {mediaAsset ? (
            <div className="admin-question-media-meta">
              <strong>{mediaAsset.originalName}</strong>
              <span>
                {mediaAsset.mimeType} · {mediaAsset.extension} · {mediaAsset.visibility}
              </span>
              <a className="admin-row-link" href={mediaAsset.url} target="_blank" rel="noreferrer">
                Open media
              </a>
            </div>
          ) : null}
        </article>
      </section>

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null)
        }}
        title="تغيير حالة السؤال"
        description={
          pendingStatus ? `هل تريد تغيير حالة السؤال إلى "${pendingStatus}"؟` : undefined
        }
        confirmLabel="تأكيد"
        cancelLabel="إلغاء"
        destructive={pendingStatus === 'archived'}
        onConfirm={confirmStatusChange}
      />
    </AdminLayout>
  )
}

function QuestionMedia({ question }: { question: QuestionDetail }) {
  if (!question.mediaUrl) return null
  if (question.contentMode === 'image') {
    return <img className="admin-question-media" src={question.mediaUrl} alt="" />
  }

  if (question.contentMode === 'video') {
    return <video className="admin-question-media" src={question.mediaUrl} controls />
  }

  if (question.contentMode === 'audio') {
    return <audio className="admin-question-media-audio" src={question.mediaUrl} controls />
  }

  return null
}

export default AdminQuestionShow
