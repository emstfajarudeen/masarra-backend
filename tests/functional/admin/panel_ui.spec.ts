import ContactMessage from '#models/contact_message'
import ContentPage from '#models/content_page'
import ContentPageTranslation from '#models/content_page_translation'
import CreditTransaction from '#models/credit_transaction'
import Game from '#models/game'
import GameSession from '#models/game_session'
import GameTranslation from '#models/game_translation'
import MediaAsset from '#models/media_asset'
import Payment from '#models/payment'
import Question from '#models/question'
import QuestionCategory from '#models/question_category'
import QuestionCategoryTranslation from '#models/question_category_translation'
import QuestionTranslation from '#models/question_translation'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

async function createUser(role: 'user' | 'admin' = 'admin') {
  return User.create({
    firstName: role === 'admin' ? 'Admin' : 'Regular',
    lastName: 'User',
    email: `${role}-panel-${Date.now()}@example.com`,
    phoneNumber: role === 'admin' ? '+96551119991' : '+96551119992',
    password: 'Password123!',
    role,
    termsAcceptedAt: DateTime.utc(),
  })
}

async function createGame() {
  const game = await Game.create({
    slug: 'panel-game',
    status: 'published',
    minTeamCount: 2,
    maxTeamCount: 6,
    allowedRoundCounts: [5, 10],
    allowedQuestionDurations: [30, 40],
    baseRoundCreditCost: 1,
    optionalCategoriesEnabled: true,
    publishedAt: DateTime.utc(),
  })

  await GameTranslation.create({
    gameId: game.id,
    locale: 'ar',
    title: 'لعبة اللوحة',
    description: 'وصف',
    instructions: 'تعليمات',
    metadata: {},
  })

  return game
}

async function createMediaAsset(admin: User) {
  return MediaAsset.create({
    uploaderUserId: admin.id,
    disk: 'local',
    visibility: 'public',
    originalName: 'sample-question.png',
    fileName: 'sample-question.png',
    mimeType: 'image/png',
    extension: 'png',
    sizeBytes: 1024,
    path: '2026/08/sample-question.png',
    url: '/api/v1/media-assets/sample/file',
    metadata: {},
  })
}

async function createPanelQuestion(game: Game, mediaAsset: MediaAsset) {
  const category = await QuestionCategory.create({
    gameId: game.id,
    slug: 'panel-category',
    status: 'published',
    priceAmount: '2.000',
    priceCurrency: 'KWD',
    publishedAt: DateTime.utc(),
  })

  await QuestionCategoryTranslation.create({
    questionCategoryId: category.id,
    locale: 'ar',
    title: 'قسم اللوحة',
    description: 'قسم',
    metadata: {},
  })

  const question = await Question.create({
    gameId: game.id,
    questionCategoryId: category.id,
    status: 'published',
    type: 'knowledge',
    basePoints: 5,
    sortOrder: 1,
    metadata: {
      contentMode: 'image',
      effectLogic: 'steal',
      mediaAssetId: mediaAsset.id,
      mediaUrl: mediaAsset.url,
    },
    publishedAt: DateTime.utc(),
  })

  await QuestionTranslation.create({
    questionId: question.id,
    locale: 'ar',
    prompt: 'سؤال تجريبي',
    correctAnswer: 'إجابة',
    explanation: 'شرح',
    metadata: {},
  })

  return question
}

async function createContentPage() {
  const page = await ContentPage.create({
    slug: 'privacy-policy',
    status: 'published',
    sortOrder: 1,
    publishedAt: DateTime.utc(),
  })

  await ContentPageTranslation.create({
    contentPageId: page.id,
    locale: 'ar',
    title: 'سياسة الخصوصية',
    excerpt: 'ملخص الخصوصية',
    body: 'نص سياسة الخصوصية التجريبي لواجهة الإدارة.',
    metadata: {},
  })

  return page
}

async function createContactMessage() {
  return ContactMessage.create({
    fullName: 'Test Sender',
    email: 'sender@example.com',
    message: 'رسالة تواصل تجريبية لمراجعة واجهة الإدارة.',
    status: 'new',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
  })
}

async function createUserSummaryRecords(user: User, game: Game) {
  const gameSession = await GameSession.create({
    hostUserId: user.id,
    gameId: game.id,
    status: 'completed',
    selectedRoundCount: 5,
    selectedQuestionDuration: 40,
    creditReservationStatus: 'reserved',
    reservedCreditCount: 5,
    completedRoundCount: 5,
    refundedCreditCount: 0,
    endedAt: DateTime.utc(),
  })

  await CreditTransaction.create({
    userId: user.id,
    gameSessionId: gameSession.id,
    type: 'grant',
    amount: 20,
    currency: 'round_credit',
    idempotencyKey: `panel-credit-${user.id}`,
    description: 'Panel test balance',
    metadata: {},
  })

  await Payment.create({
    userId: user.id,
    gameSessionId: gameSession.id,
    payableType: 'optional_category',
    method: 'direct',
    status: 'paid',
    amount: '2.000',
    currency: 'KWD',
    provider: 'test',
    providerReference: `panel-payment-${user.id}`,
    idempotencyKey: `panel-payment-${user.id}`,
    metadata: {},
    paidAt: DateTime.utc(),
  })
}

test.group('Admin panel UI', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('protects admin panel pages from non-admin users', async ({ client }) => {
    const user = await createUser('user')

    const response = await client.get('/admin').loginAs(user).header('Accept', 'text/html')

    response.assertStatus(403)
  })

  test('renders admin dashboard and form pages for admin users', async ({ client }) => {
    const admin = await createUser('admin')
    const regularUser = await createUser('user')
    const game = await createGame()
    const mediaAsset = await createMediaAsset(admin)
    const question = await createPanelQuestion(game, mediaAsset)
    const category = await QuestionCategory.findByOrFail('slug', 'panel-category')
    const contentPage = await createContentPage()
    await createContactMessage()
    await createUserSummaryRecords(regularUser, game)

    const dashboard = await client.get('/admin').loginAs(admin).header('Accept', 'text/html')
    dashboard.assertStatus(200)

    const reports = await client
      .get('/admin/reports?from=2026-01-01&to=2026-12-31')
      .loginAs(admin)
      .header('Accept', 'text/html')
    reports.assertStatus(200)

    const finance = await client
      .get('/admin/finance?from=2026-01-01&to=2026-12-31')
      .loginAs(admin)
      .header('Accept', 'text/html')
    finance.assertStatus(200)

    const settings = await client
      .get('/admin/settings')
      .loginAs(admin)
      .header('Accept', 'text/html')
    settings.assertStatus(200)

    const usersList = await client
      .get('/admin/users?role=user&status=active')
      .loginAs(admin)
      .header('Accept', 'text/html')
    usersList.assertStatus(200)

    const userDetail = await client
      .get(`/admin/users/${regularUser.id}`)
      .loginAs(admin)
      .header('Accept', 'text/html')
    userDetail.assertStatus(200)

    const gamesList = await client
      .get('/admin/games?status=published&optionalCategories=enabled')
      .loginAs(admin)
      .header('Accept', 'text/html')
    gamesList.assertStatus(200)

    const createGameResponse = await client
      .get('/admin/games/create')
      .loginAs(admin)
      .header('Accept', 'text/html')
    createGameResponse.assertStatus(200)

    const editGame = await client
      .get(`/admin/games/${game.id}/edit`)
      .loginAs(admin)
      .header('Accept', 'text/html')
    editGame.assertStatus(200)

    const gameDetail = await client
      .get(`/admin/games/${game.id}`)
      .loginAs(admin)
      .header('Accept', 'text/html')
    gameDetail.assertStatus(200)

    const gameStatus = await client
      .patch(`/admin/games/${game.id}/status`)
      .form({ status: 'archived' })
      .loginAs(admin)
      .header('Accept', 'text/html')
    gameStatus.assertStatus(200)

    const createCategory = await client
      .get('/admin/categories/create')
      .loginAs(admin)
      .header('Accept', 'text/html')
    createCategory.assertStatus(200)

    const categoryList = await client
      .get(`/admin/categories?gameId=${game.id}&status=published&enabled=yes`)
      .loginAs(admin)
      .header('Accept', 'text/html')
    categoryList.assertStatus(200)

    const categoryDetail = await client
      .get(`/admin/categories/${category.id}`)
      .loginAs(admin)
      .header('Accept', 'text/html')
    categoryDetail.assertStatus(200)

    const categoryStatus = await client
      .patch(`/admin/categories/${category.id}/status`)
      .form({ status: 'draft' })
      .loginAs(admin)
      .header('Accept', 'text/html')
    categoryStatus.assertStatus(200)

    const categoryAvailability = await client
      .patch(`/admin/categories/${category.id}/status`)
      .form({ status: 'archived' })
      .loginAs(admin)
      .header('Accept', 'text/html')
    categoryAvailability.assertStatus(200)

    const createQuestionPage = await client
      .get('/admin/questions/create')
      .loginAs(admin)
      .header('Accept', 'text/html')
    createQuestionPage.assertStatus(200)

    const questionBank = await client
      .get(`/admin/questions?gameId=${game.id}&status=published&contentMode=image`)
      .loginAs(admin)
      .header('Accept', 'text/html')
    questionBank.assertStatus(200)

    const questionDetail = await client
      .get(`/admin/questions/${question.id}`)
      .loginAs(admin)
      .header('Accept', 'text/html')
    questionDetail.assertStatus(200)

    const questionStatus = await client
      .patch(`/admin/questions/${question.id}/status`)
      .form({ status: 'draft' })
      .loginAs(admin)
      .header('Accept', 'text/html')
    questionStatus.assertStatus(200)

    const mediaLibrary = await client
      .get('/admin/media-assets')
      .loginAs(admin)
      .header('Accept', 'text/html')
    mediaLibrary.assertStatus(200)

    const contentPages = await client
      .get('/admin/content-pages?status=published')
      .loginAs(admin)
      .header('Accept', 'text/html')
    contentPages.assertStatus(200)

    const contentPageStatus = await client
      .patch(`/admin/content-pages/${contentPage.id}/status`)
      .form({ status: 'draft' })
      .loginAs(admin)
      .header('Accept', 'text/html')
    contentPageStatus.assertStatus(200)

    const contactMessages = await client
      .get('/admin/contact-messages?status=new')
      .loginAs(admin)
      .header('Accept', 'text/html')
    contactMessages.assertStatus(200)

    const userStatus = await client
      .patch(`/admin/users/${regularUser.id}/status`)
      .form({ status: 'suspended' })
      .loginAs(admin)
      .header('Accept', 'text/html')
    userStatus.assertStatus(200)
  })
})
