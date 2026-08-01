import type User from '#models/user'
import UserVerificationCode from '#models/user_verification_code'
import env from '#start/env'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'
import { randomInt } from 'node:crypto'
import { DateTime } from 'luxon'

interface SendPhoneVerificationResult {
  expiresAt: DateTime
}

export default class OtpService {
  private readonly expiresInMinutes = 5
  private readonly maxAttempts = 5

  async sendPhoneVerification(user: User): Promise<SendPhoneVerificationResult> {
    const code = this.generateCode()
    const expiresAt = DateTime.utc().plus({ minutes: this.expiresInMinutes })

    await db.transaction(async (trx) => {
      user.useTransaction(trx)

      await UserVerificationCode.query({ client: trx })
        .where('user_id', user.id)
        .where('purpose', 'phone_verification')
        .whereNull('consumed_at')
        .update({ consumed_at: DateTime.utc().toSQL() })

      await UserVerificationCode.create(
        {
          userId: user.id,
          purpose: 'phone_verification',
          channel: 'sms',
          destination: user.phoneNumber,
          codeHash: await hash.make(code),
          expiresAt,
        },
        { client: trx }
      )
    })

    await this.deliverSms(user.phoneNumber, code)

    return { expiresAt }
  }

  async verifyPhone(user: User, code: string) {
    const verification = await UserVerificationCode.query()
      .where('user_id', user.id)
      .where('purpose', 'phone_verification')
      .where('channel', 'sms')
      .whereNull('consumed_at')
      .orderBy('created_at', 'desc')
      .first()

    if (!verification || verification.isExpired) {
      throw new Exception('Verification code is invalid or expired.', {
        status: 422,
        code: 'INVALID_OTP_CODE',
      })
    }

    if (verification.attempts >= this.maxAttempts) {
      throw new Exception('Too many invalid verification attempts.', {
        status: 429,
        code: 'OTP_ATTEMPTS_EXCEEDED',
      })
    }

    const isValid = await hash.verify(verification.codeHash, code)

    if (!isValid) {
      verification.attempts += 1
      await verification.save()

      throw new Exception('Verification code is invalid or expired.', {
        status: 422,
        code: 'INVALID_OTP_CODE',
      })
    }

    await db.transaction(async (trx) => {
      verification.useTransaction(trx)
      user.useTransaction(trx)

      verification.consumedAt = DateTime.utc()
      await verification.save()

      user.phoneVerifiedAt = DateTime.utc()
      await user.save()
    })

    return user
  }

  private generateCode() {
    const staticCode = env.get('OTP_STATIC_CODE')

    if (staticCode && !env.get('NODE_ENV').includes('production')) {
      return staticCode
    }

    return randomInt(100000, 999999).toString()
  }

  private async deliverSms(destination: string, code: string) {
    if (env.get('NODE_ENV') === 'production') {
      throw new Exception('SMS provider is not configured.', {
        status: 503,
        code: 'SMS_PROVIDER_NOT_CONFIGURED',
      })
    }

    console.info('Development OTP generated', {
      destination,
      code,
    })
  }
}
