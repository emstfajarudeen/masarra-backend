import { apiSuccess } from '#http/api_response'
import User from '#models/user'
import OtpService from '#services/otp_service'
import { maskPhoneNumber, normalizeKuwaitPhoneNumber } from '#services/phone_number_service'
import { serializeUser } from '#transformers/user_transformer'
import { loginValidator, registerValidator, verifyOtpValidator } from '#validators/auth'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as authErrors } from '@adonisjs/auth'
import { DateTime } from 'luxon'

export default class AuthController {
  async register({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const phoneNumber = normalizeKuwaitPhoneNumber(payload.phoneNumber)
    const existingPhoneUser = await User.findBy('phoneNumber', phoneNumber)

    if (existingPhoneUser) {
      throw new Exception('Phone number is already registered.', {
        status: 422,
        code: 'PHONE_NUMBER_ALREADY_EXISTS',
      })
    }

    const user = await User.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber,
      password: payload.password,
      status: 'active',
      preferredLocale: payload.preferredLocale ?? 'ar',
      termsAcceptedAt: DateTime.utc(),
    })

    await auth.use('web').login(user)

    const otp = await new OtpService().sendPhoneVerification(user)

    return response.created(
      apiSuccess(
        {
          user: serializeUser(user),
          phoneVerification: {
            required: true,
            destination: maskPhoneNumber(user.phoneNumber),
            expiresAt: otp.expiresAt.toISO(),
          },
        },
        {
          code: 'AUTH_REGISTERED',
          message: 'Registration completed. Phone verification is required.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async login({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const login = this.normalizeLogin(payload.login)

    try {
      const user = await User.verifyCredentials(login, payload.password)

      if (user.status !== 'active' || user.deletedAt !== null) {
        throw new Exception('This account is not active.', {
          status: 403,
          code: 'ACCOUNT_NOT_ACTIVE',
        })
      }

      await auth.use('web').login(user)

      return response.ok(
        apiSuccess(
          { user: serializeUser(user) },
          {
            code: 'AUTH_LOGGED_IN',
            message: 'Login completed.',
            meta: { requestId: request.id() },
          }
        )
      )
    } catch (error) {
      if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
        throw new Exception('Invalid login credentials.', {
          status: 401,
          code: 'INVALID_CREDENTIALS',
        })
      }

      throw error
    }
  }

  async me({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail() as User

    return response.ok(
      apiSuccess(
        { user: serializeUser(user) },
        {
          code: 'AUTH_USER',
          message: 'Authenticated user retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async logout({ request, response, auth }: HttpContext) {
    await auth.use('web').logout()

    return response.ok(
      apiSuccess(
        {},
        {
          code: 'AUTH_LOGGED_OUT',
          message: 'Logout completed.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async sendPhoneOtp({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail() as User

    if (user.phoneVerifiedAt) {
      return response.ok(
        apiSuccess(
          {
            phoneVerification: {
              required: false,
              destination: maskPhoneNumber(user.phoneNumber),
            },
          },
          {
            code: 'PHONE_ALREADY_VERIFIED',
            message: 'Phone number is already verified.',
            meta: { requestId: request.id() },
          }
        )
      )
    }

    const otp = await new OtpService().sendPhoneVerification(user)

    return response.ok(
      apiSuccess(
        {
          phoneVerification: {
            required: true,
            destination: maskPhoneNumber(user.phoneNumber),
            expiresAt: otp.expiresAt.toISO(),
          },
        },
        {
          code: 'OTP_SENT',
          message: 'Verification code sent.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async verifyPhoneOtp({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(verifyOtpValidator)
    const user = auth.getUserOrFail() as User

    const verifiedUser = await new OtpService().verifyPhone(user, payload.code)

    return response.ok(
      apiSuccess(
        { user: serializeUser(verifiedUser) },
        {
          code: 'PHONE_VERIFIED',
          message: 'Phone number verified.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  private normalizeLogin(login: string) {
    if (login.includes('@')) {
      return login.toLowerCase()
    }

    return normalizeKuwaitPhoneNumber(login)
  }
}
