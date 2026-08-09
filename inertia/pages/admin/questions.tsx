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
import { SelectField } from '@/components/ui/select_field'
import React, { useState } from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const statusLabels: Record<string, string> = {
  all: 'كل الحالات',
  draft: 'مسودة',
  published: 'منشور',
  archived: 'مؤرشف',
}

const typeLabels: Record<string, string> = {
  all: 'كل الأنواع',
  knowledge: 'سؤال معرفة',
  challenge: 'تحدي',
}

const contentModeLabels: Record<string, string> = {
  all: 'كل الوسائط',
  text: 'نص فقط',
  image: 'صورة',
  video: 'فيديو',
  audio: 'صوت',
}

const effectLabels: Record<string, string> = {
  all: 'كل التأثيرات',
  normal: 'عادي',
  steal: 'سرقة نقاط (-3)',
  transfer: 'نقل نقاط',
  freeze: 'تجميد',
  double: 'مضاعفة (x2)',
}

function effectLabel(effectLogic: string) {
  const labels: Record<string, string> = {
    normal: 'عادي',
    steal: 'سرقة نقاط (-3)',
    transfer: 'نقل نقاط',
    freeze: 'تجميد',
    double: 'مضاعفة (x2)',
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

  const hasActiveFilters =
    (filters.gameId && filters.gameId !== 'all') ||
    (filters.categoryId && filters.categoryId !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    (filters.type && filters.type !== 'all') ||
    (filters.contentMode && filters.contentMode !== 'all') ||
    (filters.effectLogic && filters.effectLogic !== 'all')

  const [isFilterExpanded, setIsFilterExpanded] = useState(!!hasActiveFilters)

  const filteredCategories =
    gameId && gameId !== 'all'
      ? categories.filter((category) => category.gameId === gameId)
      : categories

  return (
    <AdminLayout title="الأسئلة">
      <section className="admin-question-bank-hero">
        <article>
          <span>إجمالي الأسئلة</span>
          <strong>{stats.total}</strong>
          <p>إجمالي البنك</p>
        </article>
        <article>
          <span>المنشورة</span>
          <strong>{stats.published}</strong>
          <p>جاهزة للعب</p>
        </article>
        <article>
          <span>المسودات</span>
          <strong>{stats.draft}</strong>
          <p>تحتاج مراجعة</p>
        </article>
        <article>
          <span>الوسائط</span>
          <strong>{stats.withMedia}</strong>
          <p>صورة/فيديو/صوت</p>
        </article>
      </section>

      <section className="admin-panel bg-white border border-[var(--masarra-border-soft)]">
        <div className="p-6">
          <button
            type="button"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="w-full flex items-center justify-between cursor-pointer focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-[var(--masarra-purple)]" />
              <h3 className="text-lg font-bold text-[var(--masarra-purple-deep)]">تصفية الأسئلة</h3>
            </div>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-[var(--masarra-purple-deep)] transition-transform duration-200',
                isFilterExpanded && 'rotate-180'
              )}
            />
          </button>

          {isFilterExpanded && (
            <form
              method="get"
              action="/admin/questions"
              className="space-y-6 pt-6 animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    اللعبة
                  </label>
                  <input type="hidden" name="gameId" value={gameId === 'all' ? '' : gameId} />
                  <SelectField
                    value={gameId}
                    onValueChange={(value) => {
                      setGameId(value)
                      setCategoryId('all')
                    }}
                    options={[
                      { value: 'all', label: 'كل الألعاب' },
                      ...games.map((game) => ({ value: game.id, label: game.title })),
                    ]}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    القسم
                  </label>
                  <input
                    type="hidden"
                    name="categoryId"
                    value={categoryId === 'all' ? '' : categoryId}
                  />
                  <SelectField
                    value={categoryId}
                    onValueChange={setCategoryId}
                    options={[
                      { value: 'all', label: 'كل الأقسام' },
                      ...filteredCategories.map((category) => ({
                        value: category.id,
                        label: category.title,
                      })),
                    ]}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    الحالة
                  </label>
                  <SelectField
                    name="status"
                    defaultValue={filters.status}
                    options={statusOptions.map((status) => ({
                      value: status,
                      label: statusLabels[status],
                    }))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    نوع السؤال
                  </label>
                  <SelectField
                    name="type"
                    defaultValue={filters.type}
                    options={typeOptions.map((type) => ({
                      value: type,
                      label: typeLabels[type],
                    }))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    نوع الوسائط
                  </label>
                  <SelectField
                    name="contentMode"
                    defaultValue={filters.contentMode}
                    options={contentModeOptions.map((mode) => ({
                      value: mode,
                      label: contentModeLabels[mode],
                    }))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--masarra-muted)]">
                    الأثر
                  </label>
                  <SelectField
                    name="effectLogic"
                    defaultValue={filters.effectLogic}
                    options={effectOptions.map((effect) => ({
                      value: effect,
                      label: effectLabels[effect],
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--masarra-border-soft)]">
                <Button variant="ghost" asChild>
                  <a
                    href="/admin/questions"
                    className="hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    إعادة ضبط
                  </a>
                </Button>
                <Button
                  type="submit"
                  className="bg-[var(--masarra-purple)] hover:bg-[var(--masarra-purple-bright)] text-white shadow-sm px-6"
                >
                  تطبيق التصفية
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>نتائج الأسئلة</h2>
          </div>
          <AdminButtonLink href="/admin/questions/create">+ إضافة سؤال</AdminButtonLink>
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
                <TableHead>السؤال</TableHead>
                <TableHead>اللعبة</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الأثر</TableHead>
                <TableHead>النقاط</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
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
