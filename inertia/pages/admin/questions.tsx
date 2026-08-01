import {
  AdminButtonLink,
  AdminEmptyState,
  AdminLayout,
  AdminStatusBadge,
} from '~/components/admin/admin_layout'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface QuestionRow extends Record<string, JSONDataTypes> {
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
  mediaAssetId: string | null
  mediaUrl: string | null
  basePoints: number
  createdAt: string | null
}

interface QuestionFilterOption extends Record<string, JSONDataTypes> {
  id: string
  title: string
  gameId?: string
}

interface QuestionFilters extends Record<string, JSONDataTypes> {
  gameId: string
  categoryId: string
  status: string
  type: string
  contentMode: string
  effectLogic: string
}

interface QuestionStats extends Record<string, JSONDataTypes> {
  total: number
  published: number
  draft: number
  withMedia: number
}

export interface AdminQuestionsProps extends Record<string, JSONDataTypes> {
  questions: QuestionRow[]
  filters: QuestionFilters
  stats: QuestionStats
  games: QuestionFilterOption[]
  categories: QuestionFilterOption[]
}

const statusOptions = ['all', 'draft', 'published', 'archived'] as const
const typeOptions = ['all', 'knowledge', 'challenge'] as const
const contentModeOptions = ['all', 'text', 'image', 'video', 'audio'] as const
const effectOptions = ['all', 'normal', 'steal', 'transfer', 'freeze', 'double'] as const

function mediaIcon(contentMode: string) {
  if (contentMode === 'image') return '🖼️'
  if (contentMode === 'video') return '▶️'
  if (contentMode === 'audio') return '🎧'
  return 'T'
}

function effectLabel(effectLogic: string) {
  const labels: Record<string, string> = {
    normal: 'Normal',
    steal: 'Steal -3',
    transfer: 'Transfer',
    freeze: 'Freeze',
    double: 'Double x2',
  }

  return labels[effectLogic] ?? effectLogic
}

const AdminQuestions: React.FC<AdminQuestionsProps> = ({
  questions,
  filters,
  stats,
  games,
  categories,
}) => {
  const filteredCategories = filters.gameId
    ? categories.filter((category) => category.gameId === filters.gameId)
    : categories

  return (
    <AdminLayout
      title="الأسئلة"
      subtitle="بنك الأسئلة مع فلاتر تشغيلية ومراجعة سريعة للوسائط ومنطق النقاط."
      actions={<AdminButtonLink href="/admin/questions/create">+ Add question</AdminButtonLink>}
    >
      <section className="admin-question-bank-hero">
        <article>
          <span>Total questions</span>
          <strong>{stats.total}</strong>
          <p>إجمالي البنك</p>
        </article>
        <article>
          <span>Published</span>
          <strong>{stats.published}</strong>
          <p>جاهزة للعب</p>
        </article>
        <article>
          <span>Draft</span>
          <strong>{stats.draft}</strong>
          <p>تحتاج مراجعة</p>
        </article>
        <article>
          <span>Media</span>
          <strong>{stats.withMedia}</strong>
          <p>صورة/فيديو/صوت</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>فلاتر بنك الأسئلة</h2>
            <p>فلترة مباشرة من السيرفر حسب اللعبة، القسم، الحالة، النوع، والميكانيك.</p>
          </div>
        </div>

        <form className="admin-question-filters" method="get" action="/admin/questions">
          <label>
            <span>Game</span>
            <select name="gameId" defaultValue={filters.gameId}>
              <option value="">All games</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Category</span>
            <select name="categoryId" defaultValue={filters.categoryId}>
              <option value="">All categories</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Status</span>
            <select name="status" defaultValue={filters.status}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Type</span>
            <select name="type" defaultValue={filters.type}>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Content</span>
            <select name="contentMode" defaultValue={filters.contentMode}>
              {contentModeOptions.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Effect</span>
            <select name="effectLogic" defaultValue={filters.effectLogic}>
              {effectOptions.map((effect) => (
                <option key={effect} value={effect}>
                  {effect}
                </option>
              ))}
            </select>
          </label>

          <div>
            <button type="submit">Apply filters</button>
            <a href="/admin/questions">Reset</a>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>نتائج الأسئلة</h2>
            <p>كل بطاقة تعرض ملخص السؤال، مصدر الوسائط، ومنطق التأثير قبل فتح التحرير.</p>
          </div>
        </div>

        {questions.length === 0 ? (
          <AdminEmptyState
            title="لا توجد أسئلة مطابقة"
            body="غيّر الفلاتر أو أضف سؤالاً جديداً من زر الإضافة."
          />
        ) : (
          <div className="admin-question-card-grid">
            {questions.map((question) => (
              <article className="admin-question-card" key={question.id}>
                <div className="admin-question-card-head">
                  <div className="admin-question-media-mark">
                    <span>{mediaIcon(question.contentMode)}</span>
                    <small>{question.contentMode}</small>
                  </div>
                  <div>
                    <AdminStatusBadge status={question.status} />
                    <strong>{question.basePoints} pts</strong>
                  </div>
                </div>

                <h3>{question.prompt}</h3>

                {question.correctAnswer ? (
                  <p className="admin-question-answer">Answer: {question.correctAnswer}</p>
                ) : null}

                {question.explanation ? (
                  <p className="admin-question-explanation">{question.explanation}</p>
                ) : null}

                <div className="admin-question-meta-grid">
                  <span>{question.gameTitle}</span>
                  <span>{question.categoryTitle ?? 'General'}</span>
                  <span>{question.type}</span>
                  <span>{effectLabel(question.effectLogic)}</span>
                </div>

                <div className="admin-question-media-row" dir="ltr">
                  {question.mediaUrl ? (
                    <a href={question.mediaUrl} target="_blank" rel="noreferrer">
                      Open media
                    </a>
                  ) : (
                    <span>No media file</span>
                  )}
                  {question.mediaAssetId ? <small>{question.mediaAssetId}</small> : null}
                </div>

                <div className="admin-card-actions">
                  <a className="admin-row-link" href={`/admin/questions/${question.id}`}>
                    Preview
                  </a>
                  <a className="admin-row-link" href={`/admin/questions/${question.id}/edit`}>
                    Edit question
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  )
}

export default AdminQuestions
