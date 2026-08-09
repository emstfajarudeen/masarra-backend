import Game from '#models/game'
import GameTranslation from '#models/game_translation'
import Question from '#models/question'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

async function createAdmin() {
  return User.create({
    firstName: 'Admin',
    lastName: 'Timer',
    email: `admin-timer-${Date.now()}@example.com`,
    phoneNumber: '+96551110003',
    password: 'Password123!',
    role: 'admin',
    termsAcceptedAt: DateTime.utc(),
  })
}

async function createGame() {
  const game = await Game.create({
    slug: 'timer-game',
    status: 'published',
    minTeamCount: 2,
    maxTeamCount: 6,
    allowedRoundCounts: [5, 10],
    allowedQuestionDurations: [30, 40],
    baseRoundCreditCost: 1,
    optionalCategoriesEnabled: false,
    publishedAt: DateTime.utc(),
  })

  await GameTranslation.create({
    gameId: game.id,
    locale: 'ar',
    title: 'لعبة المؤقت',
    description: 'وصف',
    instructions: 'تعليمات',
    metadata: {},
  })

  return game
}

test.group('Admin question visibility timer', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('stores and updates a per-object visibility timer independent of status', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const game = await createGame()

    const store = await client
      .post('/admin/questions')
      .loginAs(admin)
      .header('Accept', 'text/html')
      .form({
        gameId: game.id,
        questionCategoryId: '',
        status: 'published',
        type: 'knowledge',
        contentMode: 'image',
        effectLogic: 'normal',
        mediaAssetId: '',
        mediaUrl: '',
        prompt: 'ما عاصمة الكويت؟',
        correctAnswer: 'مدينة الكويت',
        explanation: '',
        basePoints: 5,
        sortOrder: 0,
        visibilityTimerEnabled: true,
        visibilityTimerSeconds: 10,
      })
    store.assertStatus(200)

    const question = await Question.query().where('game_id', game.id).firstOrFail()
    assert.isTrue(Boolean(question.metadata.visibilityTimerEnabled))
    assert.equal(question.metadata.visibilityTimerSeconds, 10)

    const editPage = await client
      .get(`/admin/questions/${question.id}/edit`)
      .loginAs(admin)
      .header('Accept', 'text/html')
    editPage.assertStatus(200)

    const disable = await client
      .put(`/admin/questions/${question.id}`)
      .loginAs(admin)
      .header('Accept', 'text/html')
      .form({
        gameId: game.id,
        questionCategoryId: '',
        status: 'published',
        type: 'knowledge',
        contentMode: 'image',
        effectLogic: 'normal',
        mediaAssetId: '',
        mediaUrl: '',
        prompt: 'ما عاصمة الكويت؟',
        correctAnswer: 'مدينة الكويت',
        explanation: '',
        basePoints: 5,
        sortOrder: 0,
        visibilityTimerEnabled: false,
      })
    disable.assertStatus(200)

    await question.refresh()
    assert.isFalse(Boolean(question.metadata.visibilityTimerEnabled))
    assert.isNull(question.metadata.visibilityTimerSeconds)
  })
})
