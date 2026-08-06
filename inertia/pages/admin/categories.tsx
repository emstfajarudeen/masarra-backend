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
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import React, { useState } from 'react'

interface CategoryRow extends Record<string, JSONDataTypes> {
  id: string
  slug: string
  gameId: string
  title: string
  gameTitle: string
  status: string
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
}

interface CategoryStats extends Record<string, JSONDataTypes> {
  total: number
  published: number
  paid: number
}

export interface AdminCategoriesProps extends Record<string, JSONDataTypes> {
  categories: CategoryRow[]
  filters: CategoryFilters
  stats: CategoryStats
  games: GameOption[]
}

const statusOptions = ['all', 'draft', 'published', 'archived'] as const

const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, filters, stats, games }) => {
  const [gameId, setGameId] = useState(filters.gameId || 'all')

  return (
    <AdminLayout title="الأقسام">
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
          <span>Paid packs</span>
          <strong>{stats.paid}</strong>
          <p>لها سعر</p>
        </article>
      </section>

      <section className="admin-panel">
        <form className="admin-list-filters" method="get" action="/admin/categories">
          <div className="space-y-1">
            <Label>Game</Label>
            <input type="hidden" name="gameId" value={gameId === 'all' ? '' : gameId} />
            <SelectField
              value={gameId}
              onValueChange={setGameId}
              options={[
                { value: 'all', label: 'All games' },
                ...games.map((game) => ({ value: game.id, label: game.title })),
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

          <div>
            <Button type="submit">Apply filters</Button>
            <Button variant="ghost" asChild>
              <a href="/admin/categories">Reset</a>
            </Button>
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>الأقسام الاختيارية</h2>
          </div>
          <AdminButtonLink href="/admin/categories/create">+ Add category</AdminButtonLink>
        </div>

        {categories.length === 0 ? (
          <AdminEmptyState
            title="لا توجد أقسام مطابقة"
            body="غيّر الفلاتر أو أضف أول قسم اختياري مثل رمضان أو العيد."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px" />
                <TableHead>Title</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <EditIconLink href={`/admin/categories/${category.id}/edit`} />
                  </TableCell>
                  <TableCell>{category.title}</TableCell>
                  <TableCell>{category.gameTitle}</TableCell>
                  <TableCell dir="ltr">{category.slug}</TableCell>
                  <TableCell>
                    {category.priceAmount ?? '—'} {category.priceCurrency}
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge status={category.status} />
                  </TableCell>
                  <TableCell>
                    <div className="admin-row-actions">
                      <ViewIconLink href={`/admin/categories/${category.id}`} />
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

export default AdminCategories
