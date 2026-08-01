import { apiFailure, apiSuccess } from '#http/api_response'
import { test } from '@japa/runner'

test.group('API response helpers', () => {
  test('creates a consistent success envelope', ({ assert }) => {
    const response = apiSuccess({ id: 1 }, { code: 'RESOURCE_FETCHED', message: 'Fetched.' })

    assert.deepEqual(response, {
      success: true,
      code: 'RESOURCE_FETCHED',
      message: 'Fetched.',
      data: { id: 1 },
    })
  })

  test('creates a consistent failure envelope', ({ assert }) => {
    const response = apiFailure({
      code: 'VALIDATION_ERROR',
      message: 'Invalid.',
      errors: [{ field: 'email' }],
    })

    assert.deepEqual(response, {
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid.',
      errors: [{ field: 'email' }],
    })
  })
})
