import vine from '@vinejs/vine'

export const adminFunRuleFormValidator = vine.compile(
  vine.object({
    params: vine
      .object({
        id: vine.string().uuid().optional(),
      })
      .optional(),
    code: vine.string().trim().minLength(2).maxLength(80),
    nameAr: vine.string().trim().minLength(2).maxLength(120),
    nameEn: vine.string().trim().maxLength(120).nullable().optional(),
    descriptionAr: vine.string().trim().maxLength(255).nullable().optional(),
    descriptionEn: vine.string().trim().maxLength(255).nullable().optional(),
    effectType: vine.enum(['normal', 'steal', 'transfer', 'freeze', 'double', 'custom']),
    configJson: vine.string().trim().optional(),
    isActive: vine.boolean().optional(),
    sortOrder: vine.number().withoutDecimals().min(0).optional(),
  })
)

export const adminFunRuleListFilterValidator = vine.compile(
  vine.object({
    search: vine.string().trim().maxLength(100).optional(),
    isActive: vine.enum(['all', 'active', 'inactive']).optional(),
  })
)
