import { test } from '@japa/runner'

test.group('API error handling', () => {
  test('returns the standard envelope for an unknown API route', async ({ client }) => {
    const response = await client.get('/api/v1/unknown').header('Accept', 'application/json')

    response.assertStatus(404)
    response.assertBodyContains({
      success: false,
      code: 'NOT_FOUND',
    })
  })
})
