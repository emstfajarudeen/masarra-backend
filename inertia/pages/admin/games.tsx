import {
  AdminButtonLink,
  AdminEmptyState,
  AdminLayout,
  AdminStatusBadge,
} from '~/components/admin/admin_layout'
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
    <AdminLayout
      title="الألعاب"
      subtitle="إدارة الألعاب وقواعد الإعداد الظاهرة للمستخدمين."
      actions={<AdminButtonLink href="/admin/games/create">+ Add game</AdminButtonLink>}
    >
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
        <div className="admin-panel-header">
          <div>
            <h2>فلاتر الألعاب</h2>
            <p>فلترة قواعد اللعبة حسب الحالة وتفعيل الأقسام الاختيارية.</p>
          </div>
        </div>

        <form className="admin-list-filters" method="get" action="/admin/games">
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
            <span>Optional categories</span>
            <select name="optionalCategories" defaultValue={filters.optionalCategories}>
              {optionalCategoryOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <button type="submit">Apply filters</button>
            <a href="/admin/games">Reset</a>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>قائمة الألعاب</h2>
            <p>كل بطاقة تعرض أهم قواعد الإعداد التي تؤثر على تجربة المستخدم.</p>
          </div>
        </div>

        {games.length === 0 ? (
          <AdminEmptyState
            title="لا توجد ألعاب مطابقة"
            body="غيّر الفلاتر أو أضف لعبة جديدة من زر الإضافة."
          />
        ) : (
          <div className="admin-config-card-grid">
            {games.map((game) => (
              <article className="admin-config-card" key={game.id}>
                <div className="admin-config-card-head">
                  <div>
                    <h3>{game.title}</h3>
                    <p dir="ltr">{game.slug}</p>
                  </div>
                  <AdminStatusBadge status={game.status} />
                </div>

                <div className="admin-config-metrics">
                  <span>
                    Teams
                    <strong>
                      {game.minTeamCount}-{game.maxTeamCount}
                    </strong>
                  </span>
                  <span>
                    Credit/round
                    <strong>{game.baseRoundCreditCost}</strong>
                  </span>
                  <span>
                    Rounds
                    <strong>{formatList(game.allowedRoundCounts)}</strong>
                  </span>
                  <span>
                    Timers
                    <strong>{formatList(game.allowedQuestionDurations)}s</strong>
                  </span>
                </div>

                <div className="admin-config-footer">
                  <span>
                    {game.optionalCategoriesEnabled
                      ? 'Optional packs enabled'
                      : 'No optional packs'}
                  </span>
                  <div className="admin-card-actions">
                    <a className="admin-row-link" href={`/admin/games/${game.id}`}>
                      View details
                    </a>
                    <a className="admin-row-link" href={`/admin/games/${game.id}/edit`}>
                      Edit game
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  )
}

export default AdminGames
