import vine from '@vinejs/vine'

export const showContentPageValidator = vine.compile(
  vine.object({
    params: vine.object({
      slug: vine.enum(['terms', 'privacy-policy', 'about', 'how-it-works', 'pricing']),
    }),
  })
)
