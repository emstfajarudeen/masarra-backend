import vine from '@vinejs/vine'

const slugRule = vine
  .string()
  .trim()
  .minLength(2)
  .maxLength(80)
  .regex(/^[a-z0-9-]+$/)

const nullableText = vine.string().trim().nullable().optional()

export const adminPanelIdParamsValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)

export const adminPanelPasswordChangeValidator = vine.compile(
  vine.object({
    oldPassword: vine.string().minLength(1).maxLength(128),
    password: vine.string().minLength(8).maxLength(128).confirmed(),
  })
)

export const adminPanelGameFormValidator = vine.compile(
  vine.object({
    params: vine
      .object({
        id: vine.string().uuid().optional(),
      })
      .optional(),
    slug: slugRule,
    status: vine.enum(['draft', 'published', 'archived']),
    title: vine.string().trim().minLength(2).maxLength(160),
    description: nullableText,
    instructions: nullableText,
    minTeamCount: vine.number().withoutDecimals().range([1, 6]),
    maxTeamCount: vine.number().withoutDecimals().range([1, 6]),
    allowedRoundCounts: vine.array(vine.number().withoutDecimals().positive()).minLength(1),
    allowedQuestionDurations: vine.array(vine.number().withoutDecimals().positive()).minLength(1),
    baseRoundCreditCost: vine.number().withoutDecimals().positive(),
    optionalCategoriesEnabled: vine.boolean(),
  })
)

export const adminPanelCategoryFormValidator = vine.compile(
  vine.object({
    params: vine
      .object({
        id: vine.string().uuid().optional(),
      })
      .optional(),
    gameId: vine.string().uuid(),
    slug: slugRule,
    status: vine.enum(['draft', 'published', 'archived']),
    title: vine.string().trim().minLength(2).maxLength(160),
    description: nullableText,
    priceAmount: vine
      .string()
      .trim()
      .regex(/^\d{1,7}(\.\d{1,3})?$/)
      .nullable()
      .optional(),
    priceCurrency: vine.string().trim().fixedLength(3),
  })
)

export const adminPanelQuestionFormValidator = vine.compile(
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
    contentMode: vine.enum(['text', 'image', 'video', 'audio']),
    effectLogic: vine.enum(['normal', 'steal', 'transfer', 'freeze', 'double']),
    mediaAssetId: vine.string().uuid().nullable().optional(),
    mediaUrl: vine.string().trim().maxLength(1000).nullable().optional(),
    prompt: vine.string().trim().minLength(2).maxLength(4000),
    correctAnswer: vine.string().trim().maxLength(2000).nullable().optional(),
    explanation: vine.string().trim().maxLength(4000).nullable().optional(),
    basePoints: vine.number().withoutDecimals().range([1, 100]),
  })
)

export const adminPanelContentPageFormValidator = vine.compile(
  vine.object({
    params: vine
      .object({
        id: vine.string().uuid().optional(),
      })
      .optional(),
    slug: slugRule,
    status: vine.enum(['draft', 'published']),
    title: vine.string().trim().minLength(2).maxLength(160),
    excerpt: vine.string().trim().maxLength(500).nullable().optional(),
    body: vine.string().trim().minLength(2).maxLength(50000),
  })
)

export const adminPanelContactStatusValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    status: vine.enum(['new', 'reviewed', 'archived']),
  })
)

export const adminPanelPublishStatusValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    status: vine.enum(['draft', 'published', 'archived']),
  })
)

export const adminPanelContentPublishStatusValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    status: vine.enum(['draft', 'published']),
  })
)

export const adminPanelUserStatusValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    status: vine.enum(['active', 'suspended']),
  })
)

export const adminPanelMediaLibraryFilterValidator = vine.compile(
  vine.object({
    type: vine.enum(['all', 'image', 'video', 'audio']).optional(),
    visibility: vine.enum(['all', 'public', 'private']).optional(),
  })
)

export const adminPanelGameListFilterValidator = vine.compile(
  vine.object({
    status: vine.enum(['all', 'draft', 'published', 'archived']).optional(),
    optionalCategories: vine.enum(['all', 'enabled', 'disabled']).optional(),
  })
)

export const adminPanelCategoryListFilterValidator = vine.compile(
  vine.object({
    gameId: vine.string().uuid().optional(),
    status: vine.enum(['all', 'draft', 'published', 'archived']).optional(),
    enabled: vine.enum(['all', 'yes', 'no']).optional(),
  })
)
export const adminPanelContentPageListFilterValidator = vine.compile(
  vine.object({
    status: vine.enum(['all', 'draft', 'published']).optional(),
  })
)

export const adminPanelContactMessageListFilterValidator = vine.compile(
  vine.object({
    status: vine.enum(['all', 'new', 'reviewed', 'archived']).optional(),
  })
)

export const adminPanelUserListFilterValidator = vine.compile(
  vine.object({
    role: vine.enum(['all', 'user']).optional(),
    status: vine.enum(['all', 'active', 'suspended']).optional(),
  })
)

export const adminPanelQuestionListFilterValidator = vine.compile(
  vine.object({
    gameId: vine.string().uuid().optional(),
    categoryId: vine.string().uuid().optional(),
    status: vine.enum(['all', 'draft', 'published', 'archived']).optional(),
    type: vine.enum(['all', 'knowledge', 'challenge']).optional(),
    contentMode: vine.enum(['all', 'text', 'image', 'video', 'audio']).optional(),
    effectLogic: vine.enum(['all', 'normal', 'steal', 'transfer', 'freeze', 'double']).optional(),
  })
)
