import {
  AdminButtonLink,
  AdminEmptyState,
  AdminLayout,
  AdminStatusBadge,
} from '~/components/admin/admin_layout'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import type React from 'react'

interface CategoryRow extends Record<string, JSONDataTypes> {
  id: string
  slug: string
  gameId: string
  title: string
  gameTitle: string
  status: string
  isEnabled: boolean
  priceAmount: string | null
  priceCurrency: string
  createdAt: string | null
}

interface GameOption extends Record<string, JSONDataTypes> {
  id: string
  title: string
}

interface CategoryFilters extends Record<string, JSONDataTypes> {
  gameId: string
  status: string
  enabled: string
}

interface CategoryStats extends Record<string, JSONDataTypes> {
  total: number
  published: number
  enabled: number
  paid: number
}

export interface AdminCategoriesProps extends Record<string, JSONDataTypes> {
  categories: CategoryRow[]
  filters: CategoryFilters
  stats: CategoryStats
  games: GameOption[]
}

const statusOptions = ['all', 'draft', 'published', 'archived'] as const
const enabledOptions = [
  ['all', 'All availability'],
  ['yes', 'Enabled'],
  ['no', 'Disabled'],
] as const

const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, filters, stats, games }) => {
  return (
    <AdminLayout
      title="الأقسام"
      subtitle="إدارة أقسام المناسبات الاختيارية وأسعارها."
      actions={<AdminButtonLink href="/admin/categories/create">+ Add category</AdminButtonLink>}
    >
      <section className="admin-config-hero">
        <article>
          <span>Total categories</span>
          <strong>{stats.total}</strong>
          <p>كل الأقسام</p>
        </article>
        <article>
          <span>Published</span>
          <strong>{stats.published}</strong>
          <p>قابلة للظهور</p>
        </article>
        <article>
          <span>Enabled</span>
          <strong>{stats.enabled}</strong>
          <p>مفعلة في الإعداد</p>
        </article>
        <article>
          <span>Paid packs</span>
          <strong>{stats.paid}</strong>
          <p>لها سعر</p>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>فلاتر الأقسام</h2>
            <p>فلترة الأقسام حسب اللعبة، الحالة، وإمكانية الاختيار من واجهة اللاعب.</p>
          </div>
        </div>

        <form className="admin-list-filters" method="get" action="/admin/categories">
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
            <span>Availability</span>
            <select name="enabled" defaultValue={filters.enabled}>
              {enabledOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <button type="submit">Apply filters</button>
            <a href="/admin/categories">Reset</a>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>الأقسام الاختيارية</h2>
            <p>هذه الأقسام تظهر في إعداد اللعبة عندما تكون مفعلة من لوحة الإدارة.</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <AdminEmptyState
            title="لا توجد أقسام مطابقة"
            body="غيّر الفلاتر أو أضف أول قسم اختياري مثل رمضان أو العيد."
          />
        ) : (
          <div className="admin-config-card-grid">
            {categories.map((category) => (
              <article className="admin-config-card" key={category.id}>
                <div className="admin-config-card-head">
                  <div>
                    <h3>{category.title}</h3>
                    <p>{category.gameTitle}</p>
                  </div>
                  <AdminStatusBadge status={category.status} />
                </div>

                <div className="admin-config-metrics">
                  <span>
                    Slug
                    <strong dir="ltr">{category.slug}</strong>
                  </span>
                  <span>
                    Price
                    <strong>
                      {category.priceAmount ?? '—'} {category.priceCurrency}
                    </strong>
                  </span>
                  <span>
                    Availability
                    <strong>{category.isEnabled ? 'Enabled' : 'Disabled'}</strong>
                  </span>
                  <span>
                    Billing
                    <strong>{category.priceAmount ? 'Paid pack' : 'Free'}</strong>
                  </span>
                </div>

                <div className="admin-config-footer">
                  <span>
                    {category.isEnabled ? 'Visible during game setup' : 'Hidden from game setup'}
                  </span>
                  <div className="admin-card-actions">
                    <a className="admin-row-link" href={`/admin/categories/${category.id}`}>
                      View details
                    </a>
                    <a className="admin-row-link" href={`/admin/categories/${category.id}/edit`}>
                      Edit category
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

export default AdminCategories
