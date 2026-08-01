import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    firstName: vine.string().trim().minLength(2).maxLength(80),
    lastName: vine.string().trim().minLength(2).maxLength(80),
    email: vine.string().trim().email().normalizeEmail(),
    phoneNumber: vine.string().trim().minLength(8).maxLength(20),
    preferredLocale: vine.enum(['ar', 'en']).optional(),
  })
)

export const changePasswordValidator = vine.compile(
  vine.object({
    oldPassword: vine.string().minLength(1).maxLength(128),
    password: vine.string().minLength(8).maxLength(128).confirmed(),
  })
)
