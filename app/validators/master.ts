import vine from '@vinejs/vine'

export const showMasterGameValidator = vine.compile(
  vine.object({
    params: vine.object({
      slug: vine
        .string()
        .trim()
        .minLength(2)
        .maxLength(80)
        .regex(/^[a-z0-9-]+$/),
    }),
  })
)
