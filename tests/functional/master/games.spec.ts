import Game from '#models/game'
import GameTranslation from '#models/game_translation'
import QuestionCategory from '#models/question_category'
import QuestionCategoryTranslation from '#models/question_category_translation'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

async function createPublishedGame() {
  const game = await Game.create({
    slug: 'masarra-classic',
    status: 'published',
    minTeamCount: 2,
    maxTeamCount: 6,
    allowedRoundCounts: [5, 10, 15],
    allowedQuestionDurations: [30, 40, 60],
    baseRoundCreditCost: 1,
    optionalCategoriesEnabled: true,
    publishedAt: DateTime.utc(),
  })

  await GameTranslation.createMany([
    {
      gameId: game.id,
      locale: 'ar',
      title: 'مسرة كلاسيك',
      description: 'لعبة عائلية تفاعلية',
      instructions: 'اتبع تعليمات المضيف وابدأ اللعب.',
      metadata: {},
    },
    {
      gameId: game.id,
      locale: 'en',
      title: 'Masarra Classic',
      description: 'Interactive family game',
      instructions: 'Follow the host instructions and start playing.',
      metadata: {},
    },
  ])

  return game
}

test.group('Master game APIs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('lists published games with localized setup rules', async ({ client }) => {
    await createPublishedGame()

    await Game.create({
      slug: 'draft-game',
      status: 'draft',
      minTeamCount: 2,
      maxTeamCount: 6,
      allowedRoundCounts: [10],
      allowedQuestionDurations: [40],
    })

    const response = await client
      .get('/api/v1/master/games')
      .header('Accept-Language', 'en')
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'MASTER_GAMES',
      data: {
        games: [
          {
            slug: 'masarra-classic',
            title: 'Masarra Classic',
            setup: {
              minTeamCount: 2,
              maxTeamCount: 6,
              allowedRoundCounts: [5, 10, 15],
              allowedQuestionDurations: [30, 40, 60],
              baseRoundCreditCost: 1,
              optionalCategoriesEnabled: true,
            },
          },
        ],
      },
    })
  })

  test('returns game details with enabled optional categories only', async ({ client }) => {
    const game = await createPublishedGame()

    const ramadan = await QuestionCategory.create({
      gameId: game.id,
      slug: 'ramadan',
      status: 'published',
      isEnabled: true,
      priceAmount: '2.000',
      priceCurrency: 'KWD',
      publishedAt: DateTime.utc(),
    })

    const disabled = await QuestionCategory.create({
      gameId: game.id,
      slug: 'disabled-category',
      status: 'published',
      isEnabled: false,
      priceAmount: '2.000',
      priceCurrency: 'KWD',
      publishedAt: DateTime.utc(),
    })

    await QuestionCategoryTranslation.createMany([
      {
        questionCategoryId: ramadan.id,
        locale: 'ar',
        title: 'رمضان',
        description: 'اسئلة رمضانية',
        metadata: {},
      },
      {
        questionCategoryId: disabled.id,
        locale: 'ar',
        title: 'معطل',
        description: 'لا يجب ظهوره',
        metadata: {},
      },
    ])

    const response = await client
      .get('/api/v1/master/games/masarra-classic')
      .header('Accept-Language', 'ar')
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'MASTER_GAME',
      data: {
        game: {
          slug: 'masarra-classic',
          title: 'مسرة كلاسيك',
          categories: [
            {
              slug: 'ramadan',
              title: 'رمضان',
              price: {
                amount: '2.000',
                currency: 'KWD',
              },
            },
          ],
        },
      },
    })
  })

  test('falls back to Arabic when requested locale is unavailable', async ({ client }) => {
    const game = await Game.create({
      slug: 'arabic-only',
      status: 'published',
      minTeamCount: 2,
      maxTeamCount: 6,
      allowedRoundCounts: [10],
      allowedQuestionDurations: [40],
      publishedAt: DateTime.utc(),
    })

    await GameTranslation.create({
      gameId: game.id,
      locale: 'ar',
      title: 'عربي فقط',
      description: 'وصف عربي',
      instructions: 'تعليمات عربية',
      metadata: {},
    })

    const response = await client
      .get('/api/v1/master/games/arabic-only')
      .header('Accept-Language', 'en')
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      data: {
        game: {
          slug: 'arabic-only',
          title: 'عربي فقط',
          locale: 'ar',
        },
      },
    })
  })
})
