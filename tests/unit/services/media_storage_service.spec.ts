import { LocalMediaStorageService } from '#services/media_storage_service'
import { test } from '@japa/runner'

test.group('Local media storage service', () => {
  test('allows only image, video, and audio mime groups', ({ assert }) => {
    const storage = new LocalMediaStorageService()

    assert.isTrue(storage.isAllowedMimeType('image/png'))
    assert.isTrue(storage.isAllowedMimeType('video/mp4'))
    assert.isTrue(storage.isAllowedMimeType('audio/mpeg'))
    assert.isFalse(storage.isAllowedMimeType('application/pdf'))
    assert.isFalse(storage.isAllowedMimeType('text/html'))
  })
})
