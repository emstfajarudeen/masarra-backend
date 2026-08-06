import { router, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Inbox, LogOut, User as UserIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown_menu'

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
]

interface AuthUser {
  id: string
  email: string
  fullName: string
  initials: string
}

interface AdminLayoutProps {
  title: string
  subtitle?: string
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

function ProfileMenu() {
  const { props } = usePage<{ authUser?: AuthUser }>()
  const user = props.authUser

  const logout = () => {
    router.post('/logout')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="admin-profile-trigger" aria-label="Account menu">
        <span className="admin-profile-avatar">{user?.initials ?? 'AD'}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user?.fullName ?? 'Admin'}</span>
            <span className="text-xs font-normal text-muted-foreground" dir="ltr">
              {user?.email ?? ''}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.visit('/admin/profile')}>
          <UserIcon />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={logout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AdminLayout({ title, actions, children }: AdminLayoutProps) {
  const { url } = usePage()

  return (
    <div className="admin-shell" dir="rtl">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/logo.svg" alt="Masarra" className="admin-brand-logo" />
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
          <div className="admin-topbar-info">
            <h1>{title}</h1>
          </div>
          <div className="admin-topbar-end">
            {actions ? <div className="admin-actions">{actions}</div> : null}
            <ProfileMenu />
          </div>
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
      <div className="admin-empty-icon">
        <Inbox strokeWidth={1.5} />
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}
