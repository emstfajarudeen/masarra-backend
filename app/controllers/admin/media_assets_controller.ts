import { apiSuccess } from '#http/api_response'
import MediaAsset from '#models/media_asset'
import { LocalMediaStorageService, allowedMediaExtensions } from '#services/media_storage_service'
import { serializeMediaAsset } from '#transformers/media_asset_transformer'
import {
  adminMediaAssetListValidator,
  adminMediaAssetUploadValidator,
  mediaAssetIdParamsValidator,
} from '#validators/media_assets'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminMediaAssetsController {
  private storage = new LocalMediaStorageService()

  async index({ request, response }: HttpContext) {
    const payload = await request.validateUsing(adminMediaAssetListValidator)
    const page = payload.page ?? 1
    const limit = payload.limit ?? 20

    const query = MediaAsset.query().whereNull('deleted_at').orderBy('created_at', 'desc')

    if (payload.visibility) {
      query.where('visibility', payload.visibility)
    }

    if (payload.mimeType) {
      query.where('mime_type', payload.mimeType)
    }

    const paginator = await query.paginate(page, limit)

    return response.ok(
      apiSuccess(
        {
          mediaAssets: paginator.all().map(serializeMediaAsset),
          pagination: paginator.getMeta(),
        },
        {
          code: 'ADMIN_MEDIA_ASSETS',
          message: 'Admin media assets retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async store({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(adminMediaAssetUploadValidator)
    const file = request.file('file', {
      size: LocalMediaStorageService.maxSize,
      extnames: [...allowedMediaExtensions],
    })

    if (!file) {
      throw new Exception('Media file is required.', {
        status: 422,
        code: 'MEDIA_FILE_REQUIRED',
      })
    }

    const storedFile = await this.storage.store(file)
    const asset = await MediaAsset.create({
      uploaderUserId: auth.user?.id ?? null,
      disk: storedFile.disk,
      visibility: payload.visibility ?? 'public',
      originalName: storedFile.originalName,
      fileName: storedFile.fileName,
      mimeType: storedFile.mimeType,
      extension: storedFile.extension,
      sizeBytes: storedFile.sizeBytes,
      path: storedFile.path,
      url: null,
      metadata: {},
    })

    asset.url = `/api/v1/media-assets/${asset.id}/file`
    await asset.save()

    return response.created(
      apiSuccess(
        { mediaAsset: serializeMediaAsset(asset) },
        {
          code: 'ADMIN_MEDIA_ASSET_CREATED',
          message: 'Media asset uploaded.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async show({ request, response }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(mediaAssetIdParamsValidator)

    const asset = await MediaAsset.query().where('id', id).whereNull('deleted_at').first()

    if (!asset) {
      throw new Exception('Media asset not found.', {
        status: 404,
        code: 'MEDIA_ASSET_NOT_FOUND',
      })
    }

    return response.ok(
      apiSuccess(
        { mediaAsset: serializeMediaAsset(asset) },
        {
          code: 'ADMIN_MEDIA_ASSET',
          message: 'Admin media asset retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }
}
