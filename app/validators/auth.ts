import vine from '@vinejs/vine'

const phoneRule = vine.string().trim().minLength(8).maxLength(20)

export const registerValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(2).maxLength(80),
    lastName: vine.string().trim().minLength(2).maxLength(80),
    email: vine.string().trim().email().normalizeEmail().unique({
      table: 'users',
      column: 'email',
    }),
    phoneNumber: phoneRule,
    password: vine.string().minLength(8).maxLength(128).confirmed(),
    termsAccepted: vine.accepted(),
    preferredLocale: vine.enum(['ar', 'en']).optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    login: vine.string().trim().minLength(3).maxLength(254),
    password: vine.string().minLength(1).maxLength(128),
  })
)

export const verifyOtpValidator = vine.compile(
  vine.object({
    code: vine
      .string()
      .trim()
      .fixedLength(6)
      .regex(/^\d{6}$/),
  })
)
