import vine from '@vinejs/vine'

export const mediaAssetIdParamsValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)

export const adminMediaAssetListValidator = vine.compile(
  vine.object({
    page: vine.number().withoutDecimals().positive().optional(),
    limit: vine.number().withoutDecimals().range([1, 100]).optional(),
    visibility: vine.enum(['public', 'private']).optional(),
    mimeType: vine.string().trim().maxLength(120).optional(),
  })
)

export const adminMediaAssetUploadValidator = vine.compile(
  vine.object({
    visibility: vine.enum(['public', 'private']).optional(),
  })
)
