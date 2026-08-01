import { apiSuccess } from '#http/api_response'
import User from '#models/user'
import OtpService from '#services/otp_service'
import { maskPhoneNumber, normalizeKuwaitPhoneNumber } from '#services/phone_number_service'
import { serializeUser } from '#transformers/user_transformer'
import { changePasswordValidator, updateProfileValidator } from '#validators/account'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class AccountController {
  async me({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail() as User

    return response.ok(
      apiSuccess(
        { user: serializeUser(user) },
        {
          code: 'ACCOUNT_PROFILE',
          message: 'Account profile retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async updateProfile({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail() as User
    const payload = await request.validateUsing(updateProfileValidator)
    const phoneNumber = normalizeKuwaitPhoneNumber(payload.phoneNumber)

    await this.ensureEmailIsAvailable(payload.email, user.id)
    await this.ensurePhoneNumberIsAvailable(phoneNumber, user.id)

    const phoneChanged = phoneNumber !== user.phoneNumber

    await db.transaction(async (trx) => {
      user.useTransaction(trx)

      user.firstName = payload.firstName
      user.lastName = payload.lastName
      user.email = payload.email
      user.phoneNumber = phoneNumber
      user.preferredLocale = payload.preferredLocale ?? user.preferredLocale

      if (phoneChanged) {
        user.phoneVerifiedAt = null
      }

      await user.save()
    })

    const phoneVerification = phoneChanged
      ? await this.sendOtpForChangedPhone(user)
      : {
          required: user.phoneVerifiedAt === null,
          destination: maskPhoneNumber(user.phoneNumber),
        }

    return response.ok(
      apiSuccess(
        {
          user: serializeUser(user),
          phoneVerification,
        },
        {
          code: 'ACCOUNT_PROFILE_UPDATED',
          message: 'Account profile updated.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async changePassword({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail() as User
    const payload = await request.validateUsing(changePasswordValidator)

    if (!(await user.verifyPassword(payload.oldPassword))) {
      throw new Exception('Old password is incorrect.', {
        status: 422,
        code: 'INVALID_OLD_PASSWORD',
      })
    }

    user.password = payload.password
    await user.save()

    return response.ok(
      apiSuccess(
        {},
        {
          code: 'ACCOUNT_PASSWORD_CHANGED',
          message: 'Password changed.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  private async ensureEmailIsAvailable(email: string, currentUserId: string) {
    const existingUser = await User.query()
      .where('email', email)
      .whereNot('id', currentUserId)
      .first()

    if (existingUser) {
      throw new Exception('Email address is already registered.', {
        status: 422,
        code: 'EMAIL_ALREADY_EXISTS',
      })
    }
  }

  private async ensurePhoneNumberIsAvailable(phoneNumber: string, currentUserId: string) {
    const existingUser = await User.query()
      .where('phone_number', phoneNumber)
      .whereNot('id', currentUserId)
      .first()

    if (existingUser) {
      throw new Exception('Phone number is already registered.', {
        status: 422,
        code: 'PHONE_NUMBER_ALREADY_EXISTS',
      })
    }
  }

  private async sendOtpForChangedPhone(user: User) {
    const otp = await new OtpService().sendPhoneVerification(user)

    return {
      required: true,
      destination: maskPhoneNumber(user.phoneNumber),
      expiresAt: otp.expiresAt.toISO(),
    }
  }
}
