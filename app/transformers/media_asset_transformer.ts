import type MediaAsset from '#models/media_asset'

export function serializeMediaAsset(asset: MediaAsset) {
  return {
    id: asset.id,
    disk: asset.disk,
    visibility: asset.visibility,
    originalName: asset.originalName,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    extension: asset.extension,
    sizeBytes: Number(asset.sizeBytes),
    url: asset.url ?? `/api/v1/media-assets/${asset.id}/file`,
    metadata: asset.metadata,
    createdAt: asset.createdAt.toISO(),
    updatedAt: asset.updatedAt?.toISO() ?? null,
  }
}
