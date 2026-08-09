import FunRule from '#models/fun_rule'
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
    lastName: 'Rules',
    email: `admin-rules-${Date.now()}@example.com`,
    phoneNumber: '+96551110099',
    password: 'Password123!',
    role: 'admin',
    termsAcceptedAt: DateTime.utc(),
  })
}

async function createGame() {
  const game = await Game.create({
    slug: 'rules-game',
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
    title: 'لعبة القواعد',
    description: 'وصف',
    instructions: 'تعليمات',
    metadata: {},
  })

  return game
}

test.group('Admin Fun Rules & Question Snapshotting', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('can list and create dynamic fun rules', async ({ client, assert }) => {
    const admin = await createAdmin()

    const response = await client.post('/admin/fun-rules').loginAs(admin).form({
      code: 'super_steal',
      nameAr: 'سرقة سوبر',
      nameEn: 'Super Steal',
      descriptionAr: 'خصم 5 نقاط',
      effectType: 'steal',
      configJson: '{"pointsStolen": 5}',
      isActive: true,
      sortOrder: 1,
    })

    response.assertRedirectsTo('/admin/fun-rules')

    const createdRule = await FunRule.findByOrFail('code', 'super_steal')
    assert.equal(createdRule.nameAr, 'سرقة سوبر')
    assert.deepEqual(createdRule.config, { pointsStolen: 5 })
  })

  test('snapshots fun rule into question metadata at creation time and retains snapshot if master rule changes', async ({
    client,
    assert,
  }) => {
    const admin = await createAdmin()
    const game = await createGame()

    const rule = await FunRule.create({
      code: 'custom_bonus',
      nameAr: 'مكافأة خاصة',
      nameEn: 'Custom Bonus',
      descriptionAr: 'الوصف الأصلي للمكافأة',
      effectType: 'double',
      config: { bonus: 10 },
      isActive: true,
      sortOrder: 10,
    })

    const createRes = await client.post('/admin/questions').loginAs(admin).form({
      gameId: game.id,
      status: 'published',
      type: 'knowledge',
      contentMode: 'text',
      funRuleId: rule.id,
      prompt: 'سؤال لاختبار اللقطة المفاهيمية؟',
      correctAnswer: 'جواب',
      basePoints: 10,
    })

    createRes.assertRedirectsTo('/admin/questions')

    const question = await Question.query().where('game_id', game.id).firstOrFail()
    const funRuleSnapshot = question.metadata.funRule as Record<string, any>

    assert.exists(funRuleSnapshot)
    assert.equal(funRuleSnapshot.id, rule.id)
    assert.equal(funRuleSnapshot.nameAr, 'مكافأة خاصة')
    assert.equal(funRuleSnapshot.code, 'custom_bonus')

    // Now modify the master rule definition
    rule.nameAr = 'تم تغيير الاسم في القواعد العامة'
    rule.config = { bonus: 999 }
    await rule.save()

    // Verify the question retains its frozen snapshot!
    const reloadedQuestion = await Question.findOrFail(question.id)
    const reloadedSnapshot = reloadedQuestion.metadata.funRule as Record<string, any>

    assert.equal(reloadedSnapshot.nameAr, 'مكافأة خاصة')
    assert.deepEqual(reloadedSnapshot.config, { bonus: 10 })
  })
})
