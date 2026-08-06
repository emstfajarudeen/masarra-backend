import { AdminLayout } from '~/components/admin/admin_layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm, usePage } from '@inertiajs/react'
import { Eye, EyeOff } from 'lucide-react'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import React, { useState } from 'react'

interface ProfileData extends Record<string, JSONDataTypes> {
  fullName: string
  email: string
  phoneNumber: string
}

interface AdminProfileProps extends Record<string, JSONDataTypes> {
  profile: ProfileData
}

const AdminProfile: React.FC<AdminProfileProps> = ({ profile }) => {
  const { errors } = usePage().props as { errors: Record<string, string | undefined> }
  const [showPasswords, setShowPasswords] = useState(false)
  const form = useForm({
    oldPassword: '',
    password: '',
    password_confirmation: '',
  })

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    form.patch('/admin/profile/password', {
      preserveScroll: true,
      onSuccess: () => form.reset(),
    })
  }

  return (
    <AdminLayout title="الملف الشخصي">
      <div className="admin-profile-grid">
        <section className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>معلومات الحساب</h2>
              <p>بيانات الحساب الإداري للعرض فقط.</p>
            </div>
          </div>
          <div className="admin-profile-account">
            <div className="admin-profile-hero">
              <span className="admin-profile-hero-avatar">
                {profile.fullName
                  .split(' ')
                  .map((part) => part.charAt(0))
                  .slice(0, 2)
                  .join('')}
              </span>
              <div>
                <strong>{profile.fullName}</strong>
                <p dir="ltr">{profile.email}</p>
              </div>
            </div>
            <dl className="admin-profile-facts">
              <div>
                <dt>Username</dt>
                <dd>{profile.fullName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd dir="ltr">{profile.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd dir="ltr">{profile.phoneNumber}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>تغيير كلمة المرور</h2>
              <p>حدّث كلمة المرور الخاصة بحسابك الإداري.</p>
            </div>
          </div>
          <form className="admin-profile-form" onSubmit={submit}>
            <div className="space-y-2">
              <Label>Current password</Label>
              <Input
                dir="ltr"
                type={showPasswords ? 'text' : 'password'}
                value={form.data.oldPassword}
                onChange={(event) => form.setData('oldPassword', event.target.value)}
              />
              {errors.oldPassword ? (
                <p className="text-xs text-destructive font-medium">{errors.oldPassword}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>New password</Label>
              <div className="relative">
                <Input
                  dir="ltr"
                  type={showPasswords ? 'text' : 'password'}
                  value={form.data.password}
                  onChange={(event) => form.setData('password', event.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPasswords((current) => !current)}
                  tabIndex={-1}
                  aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-destructive font-medium">{errors.password}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Confirm new password</Label>
              <Input
                dir="ltr"
                type={showPasswords ? 'text' : 'password'}
                value={form.data.password_confirmation}
                onChange={(event) => form.setData('password_confirmation', event.target.value)}
              />
            </div>

            <div>
              <Button type="submit" disabled={form.processing}>
                {form.processing ? 'Updating…' : 'Update password'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminProfile
