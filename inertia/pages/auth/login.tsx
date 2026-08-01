import { useForm, usePage } from '@inertiajs/react'
import type React from 'react'
import { useState } from 'react'

const LoginPage: React.FC = () => {
  const { errors } = usePage().props as { errors: Record<string, string | undefined> }
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const signInForm = useForm({
    login: '',
    password: '',
  })
  const signUpForm = useForm({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    passwordConfirmation: '',
    termsAccepted: true,
    preferredLocale: 'ar',
  })

  const submitSignIn = (event: React.FormEvent) => {
    event.preventDefault()
    signInForm.post('/login')
  }

  const submitSignUp = (event: React.FormEvent) => {
    event.preventDefault()
    signUpForm.post('/api/v1/auth/register')
  }

  return (
    <main className="admin-auth-shell" dir="rtl">
      <section className="admin-auth-card">
        <div className="admin-auth-brand">
          <span>مسرة</span>
          <small>Masarra Admin</small>
        </div>

        <div className="admin-auth-copy">
          <span className="admin-kicker">Admin access</span>
          <h1>تسجيل الدخول</h1>
          <p>
            ادخل بحساب إداري للوصول إلى لوحة التحكم، أو أنشئ حساب مستخدم جديد لاختبار التدفق العام.
          </p>
        </div>

        <div className="admin-auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === 'signin' ? 'is-active' : ''}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'is-active' : ''}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        {mode === 'signin' ? (
          <form className="admin-auth-form" onSubmit={submitSignIn}>
            <label>
              <span>Email or phone</span>
              <input
                dir="ltr"
                value={signInForm.data.login}
                data-invalid={Boolean(errors.login)}
                onChange={(event) => signInForm.setData('login', event.target.value)}
              />
              {errors.login ? <small>{errors.login}</small> : null}
            </label>

            <label>
              <span>Password</span>
              <input
                dir="ltr"
                type="password"
                value={signInForm.data.password}
                data-invalid={Boolean(errors.password)}
                onChange={(event) => signInForm.setData('password', event.target.value)}
              />
              {errors.password ? <small>{errors.password}</small> : null}
            </label>

            <button type="submit" disabled={signInForm.processing}>
              {signInForm.processing ? 'Signing in…' : 'Login to dashboard'}
            </button>
          </form>
        ) : (
          <form className="admin-auth-form" onSubmit={submitSignUp}>
            <div className="admin-auth-two-col">
              <label>
                <span>First name</span>
                <input
                  value={signUpForm.data.firstName}
                  data-invalid={Boolean(errors.firstName)}
                  onChange={(event) => signUpForm.setData('firstName', event.target.value)}
                />
                {errors.firstName ? <small>{errors.firstName}</small> : null}
              </label>

              <label>
                <span>Last name</span>
                <input
                  value={signUpForm.data.lastName}
                  data-invalid={Boolean(errors.lastName)}
                  onChange={(event) => signUpForm.setData('lastName', event.target.value)}
                />
                {errors.lastName ? <small>{errors.lastName}</small> : null}
              </label>
            </div>

            <label>
              <span>Email</span>
              <input
                dir="ltr"
                type="email"
                value={signUpForm.data.email}
                data-invalid={Boolean(errors.email)}
                onChange={(event) => signUpForm.setData('email', event.target.value)}
              />
              {errors.email ? <small>{errors.email}</small> : null}
            </label>

            <label>
              <span>Phone number</span>
              <input
                dir="ltr"
                value={signUpForm.data.phoneNumber}
                data-invalid={Boolean(errors.phoneNumber)}
                placeholder="+9655XXXXXXX"
                onChange={(event) => signUpForm.setData('phoneNumber', event.target.value)}
              />
              {errors.phoneNumber ? <small>{errors.phoneNumber}</small> : null}
            </label>

            <div className="admin-auth-two-col">
              <label>
                <span>Password</span>
                <input
                  dir="ltr"
                  type="password"
                  value={signUpForm.data.password}
                  data-invalid={Boolean(errors.password)}
                  onChange={(event) => signUpForm.setData('password', event.target.value)}
                />
                {errors.password ? <small>{errors.password}</small> : null}
              </label>

              <label>
                <span>Confirm password</span>
                <input
                  dir="ltr"
                  type="password"
                  value={signUpForm.data.passwordConfirmation}
                  data-invalid={Boolean(errors.passwordConfirmation)}
                  onChange={(event) =>
                    signUpForm.setData('passwordConfirmation', event.target.value)
                  }
                />
                {errors.passwordConfirmation ? <small>{errors.passwordConfirmation}</small> : null}
              </label>
            </div>

            <button type="submit" disabled={signUpForm.processing}>
              {signUpForm.processing ? 'Creating account…' : 'Create account'}
            </button>

            <p className="admin-auth-note">
              Signup creates a normal user account. Admin dashboard access still requires an admin
              role.
            </p>
          </form>
        )}
      </section>
    </main>
  )
}

export default LoginPage
