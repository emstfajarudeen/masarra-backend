import { AdminButtonLink, AdminLayout, AdminStatusBadge } from '~/components/admin/admin_layout'
import { ConfirmDialog } from '~/components/admin/confirm_dialog'
import { Button } from '@/components/ui/button'
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

interface RoundRow extends Record<string, JSONDataTypes> {
  id: string
  sessionId: string
  sessionStatus: string
  roundNumber: number
  status: string
  scoringRule: string | null
  awardedPoints: number
  creditOutcome: string
  createdAt: string | null
}

export interface AdminQuestionShowProps extends Record<string, JSONDataTypes> {
  question: QuestionDetail
  stats: QuestionStats
  mediaAsset: MediaAssetRow | null
  latestRounds: RoundRow[]
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function effectLabel(effectLogic: string) {
  const labels: Record<string, string> = {
    normal: 'Normal points',
    steal: 'Steal -3 points',
    transfer: 'Transfer logic',
    freeze: 'Freeze logic',
    double: 'Double points',
  }

  return labels[effectLogic] ?? effectLogic
}

const AdminQuestionShow: React.FC<AdminQuestionShowProps> = ({
  question,
  stats,
  mediaAsset,
  latestRounds,
}) => {
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
    <AdminLayout
      title="معاينة السؤال"
      actions={
        <AdminButtonLink href={`/admin/questions/${question.id}/edit`}>
          Edit question
        </AdminButtonLink>
      }
    >
      <section className="admin-question-preview-hero">
        <div className="admin-question-preview-card">
          <div className="admin-question-preview-topline">
            <AdminStatusBadge status={question.status} />
            <span>{question.basePoints} pts</span>
          </div>
          <h2>{question.prompt}</h2>
          {question.mediaUrl ? <QuestionMedia question={question} /> : null}
          <div className="admin-question-preview-answer">
            <span>Correct answer</span>
            <strong>{question.correctAnswer ?? 'Not set'}</strong>
          </div>
          {question.explanation ? <p>{question.explanation}</p> : null}
        </div>

        <aside className="admin-question-preview-aside">
          <span className="admin-kicker">Question logic</span>
          <strong>{effectLabel(question.effectLogic)}</strong>
          <p>
            {question.type} · {question.contentMode} · used {stats.usageCount} times
          </p>
        </aside>
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

      <section className="admin-detail-columns">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>الوسائط</h2>
              <p>الملف المرتبط بالسؤال إن وجد.</p>
            </div>
          </div>
          <div className="admin-detail-copy">
            {mediaAsset ? (
              <>
                <strong>{mediaAsset.originalName}</strong>
                <p>
                  {mediaAsset.mimeType} · {mediaAsset.extension} · {mediaAsset.visibility}
                </p>
                <a
                  className="admin-row-link"
                  href={mediaAsset.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open media
                </a>
              </>
            ) : (
              <p>No media asset is linked to this question.</p>
            )}
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>إجراءات الإدارة</h2>
              <p>تغييرات حالة آمنة بدون حذف.</p>
            </div>
          </div>
          <div className="admin-action-grid">
            <Button
              type="button"
              variant="outline"
              disabled={statusForm.processing}
              onClick={() => setPendingStatus('published')}
            >
              Publish
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={statusForm.processing}
              onClick={() => setPendingStatus('draft')}
            >
              Move to draft
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={statusForm.processing}
              onClick={() => setPendingStatus('archived')}
            >
              Archive
            </Button>
          </div>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>النشر والتتبع</h2>
            <p>تواريخ المراجعة والنشر.</p>
          </div>
        </div>
        <div className="admin-detail-facts">
          <span>
            Created <strong>{formatDate(question.createdAt)}</strong>
          </span>
          <span>
            Updated <strong>{formatDate(question.updatedAt)}</strong>
          </span>
          <span>
            Published <strong>{formatDate(question.publishedAt)}</strong>
          </span>
          <span>
            Effect <strong>{question.effectLogic}</strong>
          </span>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>آخر استخدامات السؤال</h2>
            <p>الجولات التي تم فيها إسناد هذا السؤال.</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Session</th>
                <th>Status</th>
                <th>Score</th>
                <th>Credit</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {latestRounds.map((round) => (
                <tr key={round.id}>
                  <td>{round.roundNumber}</td>
                  <td>{round.sessionStatus}</td>
                  <td>
                    <AdminStatusBadge status={round.status} />
                  </td>
                  <td>
                    {round.awardedPoints} · {round.scoringRule ?? 'normal'}
                  </td>
                  <td>{round.creditOutcome}</td>
                  <td>{formatDate(round.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null)
        }}
        title="تغيير حالة السؤال"
        description={pendingStatus ? `هل تريد تغيير حالة السؤال إلى "${pendingStatus}"؟` : undefined}
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
    return <img className="admin-question-preview-media" src={question.mediaUrl} alt="" />
  }

  if (question.contentMode === 'video') {
    return <video className="admin-question-preview-media" src={question.mediaUrl} controls />
  }

  if (question.contentMode === 'audio') {
    return <audio className="admin-question-preview-audio" src={question.mediaUrl} controls />
  }

  return null
}

export default AdminQuestionShow
