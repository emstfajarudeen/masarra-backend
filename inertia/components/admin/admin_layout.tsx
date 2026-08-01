import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import type { ReactNode } from 'react'

const navItems = [
  { href: '/admin', label: 'لوحة التحكم', eyebrow: 'Dashboard' },
  { href: '/admin/reports', label: 'التقارير', eyebrow: 'Reports' },
  { href: '/admin/finance', label: 'المالية', eyebrow: 'Finance' },
  { href: '/admin/users', label: 'المستخدمون', eyebrow: 'Users' },
  { href: '/admin/games', label: 'الألعاب', eyebrow: 'Games' },
  { href: '/admin/categories', label: 'الأقسام', eyebrow: 'Packs' },
  { href: '/admin/questions', label: 'الأسئلة', eyebrow: 'Questions' },
  { href: '/admin/media-assets', label: 'الوسائط', eyebrow: 'Media' },
  { href: '/admin/content-pages', label: 'الصفحات', eyebrow: 'Pages' },
  { href: '/admin/contact-messages', label: 'الرسائل', eyebrow: 'Messages' },
  { href: '/admin/settings', label: 'الإعدادات', eyebrow: 'Settings' },
]

interface AdminLayoutProps {
  title: string
  subtitle: string
  actions?: ReactNode
  children: ReactNode
}

export function AdminButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="admin-button-link">
      {children}
    </Link>
  )
}

export function AdminLayout({ title, subtitle, actions, children }: AdminLayoutProps) {
  const { url } = usePage()

  return (
    <div className="admin-shell" dir="rtl">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">مسرة</span>
          <span className="admin-brand-caption">Masarra Admin</span>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map((item) => {
            const isActive = item.href === '/admin' ? url === '/admin' : url.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'is-active' : ''}`}
              >
                <span>{item.label}</span>
                <small>{item.eyebrow}</small>
              </Link>
            )
          })}
        </nav>
      </aside>

      <section className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <p className="admin-kicker">إدارة منصة مسرة</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {actions ? <div className="admin-actions">{actions}</div> : null}
        </header>

        {children}
      </section>
    </div>
  )
}

export function AdminStatusBadge({ status }: { status: string }) {
  return <span className={`admin-status admin-status-${status}`}>{status}</span>
}

export function AdminEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="admin-empty">
      <div className="admin-empty-orb" />
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}
