import MediaAsset from '#models/media_asset'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

async function createUser(role: 'user' | 'admin' = 'admin') {
  return User.create({
    firstName: role === 'admin' ? 'Admin' : 'Regular',
    lastName: 'User',
    email: `${role}-media-${Date.now()}@example.com`,
    phoneNumber: role === 'admin' ? '+96552220001' : '+96552220002',
    password: 'Password123!',
    role,
    termsAcceptedAt: DateTime.utc(),
  })
}

test.group('Admin media assets', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('uploads a local media asset for admin users', async ({ client }) => {
    const admin = await createUser('admin')

    const response = await client
      .post('/api/v1/admin/media-assets')
      .loginAs(admin)
      .field('visibility', 'public')
      .file('file', Buffer.from('fake image payload'), {
        filename: 'question.png',
        contentType: 'image/png',
      })
      .header('Accept', 'application/json')

    response.assertStatus(201)
    response.assertBodyContains({
      success: true,
      code: 'ADMIN_MEDIA_ASSET_CREATED',
      data: {
        mediaAsset: {
          disk: 'local',
          visibility: 'public',
          originalName: 'question.png',
          mimeType: 'image/png',
        },
      },
    })

    const asset = await MediaAsset.findOrFail(response.body().data.mediaAsset.id)
    response.assertBodyContains({
      data: {
        mediaAsset: {
          url: `/api/v1/media-assets/${asset.id}/file`,
        },
      },
    })
  })

  test('rejects non-admin users from media uploads', async ({ client }) => {
    const user = await createUser('user')

    const response = await client
      .post('/api/v1/admin/media-assets')
      .loginAs(user)
      .field('visibility', 'public')
      .file('file', Buffer.from('fake image payload'), {
        filename: 'question.png',
        contentType: 'image/png',
      })
      .header('Accept', 'application/json')

    response.assertStatus(403)
  })
})
