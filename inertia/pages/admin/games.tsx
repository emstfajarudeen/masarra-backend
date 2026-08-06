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
import { EditIconLink, ViewIconLink } from '~/components/admin/table_actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select_field'
import type React from 'react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'

interface GameRow extends Record<string, JSONDataTypes> {
  id: string
  slug: string
  title: string
  status: string
  minTeamCount: number
  maxTeamCount: number
  allowedRoundCounts: number[]
  allowedQuestionDurations: number[]
  baseRoundCreditCost: number
  optionalCategoriesEnabled: boolean
  createdAt: string | null
}

interface GameFilters extends Record<string, JSONDataTypes> {
  status: string
  optionalCategories: string
}

interface GameStats extends Record<string, JSONDataTypes> {
  total: number
  published: number
  draft: number
  withOptionalCategories: number
}

export interface AdminGamesProps extends Record<string, JSONDataTypes> {
  games: GameRow[]
  filters: GameFilters
  stats: GameStats
}

const statusOptions = ['all', 'draft', 'published', 'archived'] as const
const optionalCategoryOptions = [
  ['all', 'All games'],
  ['enabled', 'Optional packs on'],
  ['disabled', 'Optional packs off'],
] as const

function formatList(values: number[]) {
  return values.length > 0 ? values.join(', ') : '—'
}

const AdminGames: React.FC<AdminGamesProps> = ({ games, filters, stats }) => {
  return (
    <AdminLayout title="الألعاب">
      <section className="admin-config-hero">
        <article>
          <span>Total games</span>
          <strong>{stats.total}</strong>
          <p>كل الألعاب</p>
        </article>
        <article>
          <span>Published</span>
          <strong>{stats.published}</strong>
          <p>ظاهرة للمستخدم</p>
        </article>
        <article>
          <span>Draft</span>
          <strong>{stats.draft}</strong>
          <p>قيد الإعداد</p>
        </article>
        <article>
          <span>Optional packs</span>
          <strong>{stats.withOptionalCategories}</strong>
          <p>تدعم أقسام مدفوعة</p>
        </article>
      </section>

      <section className="admin-panel">
        <form className="admin-list-filters" method="get" action="/admin/games">
          <div className="space-y-1">
            <Label>Status</Label>
            <SelectField
              name="status"
              defaultValue={filters.status}
              options={statusOptions.map((status) => ({ value: status, label: status }))}
            />
          </div>

          <div className="space-y-1">
            <Label>Optional categories</Label>
            <SelectField
              name="optionalCategories"
              defaultValue={filters.optionalCategories}
              options={optionalCategoryOptions.map(([value, label]) => ({ value, label }))}
            />
          </div>

          <div>
            <Button type="submit">Apply filters</Button>
            <Button variant="ghost" asChild>
              <a href="/admin/games">Reset</a>
            </Button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>قائمة الألعاب</h2>
          </div>
          <AdminButtonLink href="/admin/games/create">+ Add game</AdminButtonLink>
        </div>

        {games.length === 0 ? (
          <AdminEmptyState
            title="لا توجد ألعاب مطابقة"
            body="غيّر الفلاتر أو أضف لعبة جديدة من زر الإضافة."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px" />
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Credit/Round</TableHead>
                <TableHead>Rounds</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    <EditIconLink href={`/admin/games/${game.id}/edit`} />
                  </TableCell>
                  <TableCell>{game.title}</TableCell>
                  <TableCell dir="ltr">{game.slug}</TableCell>
                  <TableCell>
                    {game.minTeamCount}-{game.maxTeamCount}
                  </TableCell>
                  <TableCell>{game.baseRoundCreditCost}</TableCell>
                  <TableCell>{formatList(game.allowedRoundCounts)}</TableCell>
                  <TableCell>
                    <AdminStatusBadge status={game.status} />
                  </TableCell>
                  <TableCell>
                    <div className="admin-row-actions">
                      <ViewIconLink href={`/admin/games/${game.id}`} />
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

export default AdminGames
