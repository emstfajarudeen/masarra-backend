import MediaAsset from '#models/media_asset'
import { LocalMediaStorageService } from '#services/media_storage_service'
import { mediaAssetIdParamsValidator } from '#validators/media_assets'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class MediaAssetsController {
  private storage = new LocalMediaStorageService()

  async show({ request, response }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(mediaAssetIdParamsValidator)

    const asset = await MediaAsset.query()
      .where('id', id)
      .where('visibility', 'public')
      .whereNull('deleted_at')
      .first()

    if (!asset) {
      throw new Exception('Media asset not found.', {
        status: 404,
        code: 'MEDIA_ASSET_NOT_FOUND',
      })
    }

    if (asset.disk !== 'local') {
      throw new Exception('Media disk is not available locally.', {
        status: 503,
        code: 'MEDIA_DISK_UNAVAILABLE',
      })
    }

    response.header('Content-Type', asset.mimeType)
    response.header('Cache-Control', 'public, max-age=31536000, immutable')
    return response.stream(await this.storage.createReadStream(asset.path))
  }
}
