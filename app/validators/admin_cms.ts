import vine from '@vinejs/vine'

const slugRule = vine
  .string()
  .trim()
  .minLength(2)
  .maxLength(80)
  .regex(/^[a-z0-9-]+$/)

const localeRule = vine.enum(['ar', 'en'])

const translationMetadataRule = vine.record(vine.any()).optional()

const gameTranslationRule = vine.object({
  locale: localeRule,
  title: vine.string().trim().minLength(2).maxLength(160),
  description: vine.string().trim().maxLength(4000).nullable().optional(),
  instructions: vine.string().trim().maxLength(12000).nullable().optional(),
  metadata: translationMetadataRule,
})

const categoryTranslationRule = vine.object({
  locale: localeRule,
  title: vine.string().trim().minLength(2).maxLength(160),
  description: vine.string().trim().maxLength(4000).nullable().optional(),
  metadata: translationMetadataRule,
})

const questionTranslationRule = vine.object({
  locale: localeRule,
  prompt: vine.string().trim().minLength(2).maxLength(4000),
  correctAnswer: vine.string().trim().maxLength(2000).nullable().optional(),
  explanation: vine.string().trim().maxLength(4000).nullable().optional(),
  metadata: translationMetadataRule,
})

const contentPageTranslationRule = vine.object({
  locale: localeRule,
  title: vine.string().trim().minLength(2).maxLength(160),
  excerpt: vine.string().trim().maxLength(500).nullable().optional(),
  body: vine.string().trim().minLength(2).maxLength(50000),
  metadata: translationMetadataRule,
})

export const adminIdParamsValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)

export const adminGameIdParamsValidator = vine.compile(
  vine.object({
    params: vine.object({
      gameId: vine.string().uuid(),
    }),
  })
)

export const adminListValidator = vine.compile(
  vine.object({
    page: vine.number().withoutDecimals().positive().optional(),
    limit: vine.number().withoutDecimals().range([1, 100]).optional(),
    status: vine.string().trim().maxLength(40).optional(),
    search: vine.string().trim().maxLength(120).optional(),
  })
)

export const upsertAdminGameValidator = vine.compile(
  vine.object({
    params: vine
      .object({
        id: vine.string().uuid().optional(),
      })
      .optional(),
    slug: slugRule,
    status: vine.enum(['draft', 'published', 'archived']),
    minTeamCount: vine.number().withoutDecimals().range([1, 6]),
    maxTeamCount: vine.number().withoutDecimals().range([1, 6]),
    allowedRoundCounts: vine.array(vine.number().withoutDecimals().positive()).minLength(1),
    allowedQuestionDurations: vine.array(vine.number().withoutDecimals().positive()).minLength(1),
    baseRoundCreditCost: vine.number().withoutDecimals().positive(),
    optionalCategoriesEnabled: vine.boolean(),
    sortOrder: vine.number().withoutDecimals().min(0).optional(),
    translations: vine.array(gameTranslationRule).minLength(1).maxLength(2),
  })
)

export const upsertAdminQuestionCategoryValidator = vine.compile(
  vine.object({
    params: vine.object({
      gameId: vine.string().uuid().optional(),
      id: vine.string().uuid().optional(),
    }),
    slug: slugRule,
    status: vine.enum(['draft', 'published', 'archived']),
    isEnabled: vine.boolean(),
    priceAmount: vine
      .string()
      .trim()
      .regex(/^\d{1,7}(\.\d{1,3})?$/)
      .nullable()
      .optional(),
    priceCurrency: vine.string().trim().fixedLength(3).optional(),
    sortOrder: vine.number().withoutDecimals().min(0).optional(),
    translations: vine.array(categoryTranslationRule).minLength(1).maxLength(2),
  })
)

export const adminQuestionListValidator = vine.compile(
  vine.object({
    page: vine.number().withoutDecimals().positive().optional(),
    limit: vine.number().withoutDecimals().range([1, 100]).optional(),
    gameId: vine.string().uuid().optional(),
    categoryId: vine.string().uuid().nullable().optional(),
    status: vine.enum(['draft', 'published', 'archived']).optional(),
    search: vine.string().trim().maxLength(120).optional(),
  })
)

export const upsertAdminQuestionValidator = vine.compile(
  vine.object({
    params: vine
      .object({
        id: vine.string().uuid().optional(),
      })
      .optional(),
    gameId: vine.string().uuid(),
    questionCategoryId: vine.string().uuid().nullable().optional(),
    status: vine.enum(['draft', 'published', 'archived']),
    type: vine.enum(['knowledge', 'challenge']),
    basePoints: vine.number().withoutDecimals().range([1, 100]),
    sortOrder: vine.number().withoutDecimals().min(0).optional(),
    metadata: vine.record(vine.any()).optional(),
    translations: vine.array(questionTranslationRule).minLength(1).maxLength(2),
  })
)

export const upsertAdminContentPageValidator = vine.compile(
  vine.object({
    params: vine
      .object({
        id: vine.string().uuid().optional(),
      })
      .optional(),
    slug: slugRule,
    status: vine.enum(['draft', 'published']),
    sortOrder: vine.number().withoutDecimals().min(0).optional(),
    translations: vine.array(contentPageTranslationRule).minLength(1).maxLength(2),
  })
)

export const updateAdminContactMessageStatusValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    status: vine.enum(['new', 'reviewed', 'archived']),
  })
)
