import app from '@adonisjs/core/services/app'
import { Exception } from '@adonisjs/core/exceptions'
import type { MultipartFile } from '@adonisjs/bodyparser'
import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { access } from 'node:fs/promises'
import path from 'node:path'

export const allowedMediaExtensions = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'mp4',
  'webm',
  'mp3',
  'wav',
  'm4a',
] as const

const allowedMimePrefixes = ['image/', 'video/', 'audio/'] as const

export interface StoredMediaFile {
  disk: 'local'
  fileName: string
  originalName: string
  mimeType: string
  extension: string
  sizeBytes: number
  path: string
}

export class LocalMediaStorageService {
  static readonly maxSize = '50mb'
  static readonly uploadRoot = 'storage/uploads/media'

  async store(file: MultipartFile): Promise<StoredMediaFile> {
    this.assertValidFile(file)

    const extension = this.extensionFor(file)
    const fileName = `${randomUUID()}.${extension}`
    const now = new Date()
    const relativeDirectory = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(
      2,
      '0'
    )}`
    const absoluteDirectory = app.makePath(LocalMediaStorageService.uploadRoot, relativeDirectory)

    await file.move(absoluteDirectory, { name: fileName, overwrite: false })

    if (!file.filePath) {
      throw new Exception('Media file could not be stored.', {
        status: 500,
        code: 'MEDIA_STORAGE_FAILED',
      })
    }

    return {
      disk: 'local',
      fileName,
      originalName: file.clientName,
      mimeType: this.mimeTypeFor(file),
      extension,
      sizeBytes: Number(file.size),
      path: `${relativeDirectory}/${fileName}`,
    }
  }

  async createReadStream(relativePath: string) {
    const absolutePath = this.absolutePath(relativePath)
    await access(absolutePath)
    return createReadStream(absolutePath)
  }

  absolutePath(relativePath: string) {
    const normalizedPath = path.normalize(relativePath)

    if (normalizedPath.startsWith('..') || path.isAbsolute(normalizedPath)) {
      throw new Exception('Invalid media asset path.', {
        status: 400,
        code: 'INVALID_MEDIA_PATH',
      })
    }

    return app.makePath(LocalMediaStorageService.uploadRoot, normalizedPath)
  }

  isAllowedMimeType(mimeType: string) {
    return allowedMimePrefixes.some((prefix) => mimeType.startsWith(prefix))
  }

  private assertValidFile(file: MultipartFile) {
    if (!file.isValid) {
      throw new Exception(file.errors[0]?.message ?? 'Invalid media file.', {
        status: 422,
        code: 'INVALID_MEDIA_FILE',
      })
    }

    if (!this.isAllowedMimeType(this.mimeTypeFor(file))) {
      throw new Exception('Only image, video, and audio uploads are allowed.', {
        status: 422,
        code: 'UNSUPPORTED_MEDIA_TYPE',
      })
    }
  }

  private extensionFor(file: MultipartFile) {
    return (file.extname ?? path.extname(file.clientName).replace('.', '')).toLowerCase()
  }

  private mimeTypeFor(file: MultipartFile) {
    return `${file.type}/${file.subtype}`.toLowerCase()
  }
}
