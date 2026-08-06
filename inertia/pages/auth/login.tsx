import { useForm, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Gamepad2, ListChecks, Wallet } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'

const highlights = [
  { icon: Gamepad2, label: 'إدارة الألعاب والجلسات في مكان واحد' },
  { icon: ListChecks, label: 'بنك الأسئلة والفئات بشكل منظم' },
  { icon: Wallet, label: 'متابعة التقارير ومحافظ المستخدمين' },
]

const LoginPage: React.FC = () => {
  const { errors } = usePage().props as { errors: Record<string, string | undefined> }
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm({
    login: '',
    password: '',
  })

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    form.post('/login')
  }

  return (
    <main className="auth-page" dir="rtl">
      <section className="auth-form-panel">
        <div className="auth-form-card">
          <img src="/logo.svg" alt="Masarra" className="auth-form-logo" />

          <div className="auth-form-heading">
            <h1>تسجيل الدخول</h1>
            <p>مرحباً بعودتك، سجّل الدخول للمتابعة إلى لوحة التحكم.</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="space-y-2">
              <Label>البريد الإلكتروني أو الهاتف</Label>
              <Input
                dir="ltr"
                value={form.data.login}
                data-invalid={Boolean(errors.login)}
                onChange={(event) => form.setData('login', event.target.value)}
                autoFocus
              />
              {errors.login ? (
                <p className="text-xs text-destructive font-medium">{errors.login}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <div className="relative">
                <Input
                  dir="ltr"
                  type={showPassword ? 'text' : 'password'}
                  value={form.data.password}
                  data-invalid={Boolean(errors.password)}
                  onChange={(event) => form.setData('password', event.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((current) => !current)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-destructive font-medium">{errors.password}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full auth-submit" disabled={form.processing}>
              {form.processing ? 'جاري تسجيل الدخول…' : 'تسجيل الدخول'}
            </Button>
          </form>
        </div>
      </section>

      <section className="auth-brand-panel">
        <span className="auth-brand-glow auth-brand-glow-1" />
        <span className="auth-brand-glow auth-brand-glow-2" />

        <div className="auth-brand-inner">
          <h2 className="auth-brand-title">لوحة تحكم مسرة</h2>
          <p className="auth-brand-subtitle">
            أدر الألعاب والأسئلة والمستخدمين والتقارير من منصة واحدة سريعة ومنظمة.
          </p>

          <ul className="auth-brand-points">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="auth-brand-point">
                <span className="auth-brand-point-icon">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
