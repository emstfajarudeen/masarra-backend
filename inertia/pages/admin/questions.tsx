import {
  AdminButtonLink,
  AdminEmptyState,
  AdminLayout,
  AdminStatusBadge,
} from '~/components/admin/admin_layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EditIconLink, PreviewIconLink } from '~/components/admin/table_actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select_field'
import React, { useState } from 'react'
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
  const [gameId, setGameId] = useState(filters.gameId || 'all')
  const [categoryId, setCategoryId] = useState(filters.categoryId || 'all')

  const filteredCategories =
    gameId && gameId !== 'all'
      ? categories.filter((category) => category.gameId === gameId)
      : categories

  return (
    <AdminLayout title="الأسئلة">
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
        <form className="admin-question-filters" method="get" action="/admin/questions">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-1">
              <Label>Game</Label>
              <input type="hidden" name="gameId" value={gameId === 'all' ? '' : gameId} />
              <SelectField
                value={gameId}
                onValueChange={(value) => {
                  setGameId(value)
                  setCategoryId('all')
                }}
                options={[
                  { value: 'all', label: 'All games' },
                  ...games.map((game) => ({ value: game.id, label: game.title })),
                ]}
              />
            </div>

            <div className="space-y-1">
              <Label>Category</Label>
              <input
                type="hidden"
                name="categoryId"
                value={categoryId === 'all' ? '' : categoryId}
              />
              <SelectField
                value={categoryId}
                onValueChange={setCategoryId}
                options={[
                  { value: 'all', label: 'All categories' },
                  ...filteredCategories.map((category) => ({
                    value: category.id,
                    label: category.title,
                  })),
                ]}
              />
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <SelectField
                name="status"
                defaultValue={filters.status}
                options={statusOptions.map((status) => ({ value: status, label: status }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Type</Label>
              <SelectField
                name="type"
                defaultValue={filters.type}
                options={typeOptions.map((type) => ({ value: type, label: type }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Content</Label>
              <SelectField
                name="contentMode"
                defaultValue={filters.contentMode}
                options={contentModeOptions.map((mode) => ({ value: mode, label: mode }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Effect</Label>
              <SelectField
                name="effectLogic"
                defaultValue={filters.effectLogic}
                options={effectOptions.map((effect) => ({ value: effect, label: effect }))}
              />
            </div>

            <Button type="submit">Apply filters</Button>
            <Button variant="ghost" asChild>
              <a href="/admin/questions">Reset</a>
            </Button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>نتائج الأسئلة</h2>
          </div>
          <AdminButtonLink href="/admin/questions/create">+ Add question</AdminButtonLink>
        </div>

        {questions.length === 0 ? (
          <AdminEmptyState
            title="لا توجد أسئلة مطابقة"
            body="غيّر الفلاتر أو أضف سؤالاً جديداً من زر الإضافة."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px" />
                <TableHead>Question</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Effect</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <EditIconLink href={`/admin/questions/${question.id}/edit`} />
                  </TableCell>
                  <TableCell>
                    {question.prompt.length > 60
                      ? question.prompt.slice(0, 60) + '…'
                      : question.prompt}
                  </TableCell>
                  <TableCell>{question.gameTitle}</TableCell>
                  <TableCell>{question.categoryTitle ?? 'General'}</TableCell>
                  <TableCell>{question.type}</TableCell>
                  <TableCell>{effectLabel(question.effectLogic)}</TableCell>
                  <TableCell>{question.basePoints}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={question.status} />
                  </TableCell>
                  <TableCell>
                    <div className="admin-row-actions">
                      <PreviewIconLink href={`/admin/questions/${question.id}`} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </AdminLayout>
  )
}

export default AdminQuestions
