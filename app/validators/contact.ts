import vine from '@vinejs/vine'

export const submitContactMessageValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(160),
    email: vine.string().trim().email().normalizeEmail(),
    message: vine.string().trim().minLength(10).maxLength(4000),
  })
)
