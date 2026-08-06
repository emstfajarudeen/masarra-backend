/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { authThrottle } from '#start/limiter'

const AuthController = () => import('#controllers/auth_controller')
const AccountController = () => import('#controllers/account_controller')
const AccountHistoryController = () => import('#controllers/account_history_controller')
const ContentPagesController = () => import('#controllers/content_pages_controller')
const ContactMessagesController = () => import('#controllers/contact_messages_controller')
const MasterGamesController = () => import('#controllers/master_games_controller')
const GameSessionsController = () => import('#controllers/game_sessions_controller')
const GameSessionPaymentsController = () => import('#controllers/game_session_payments_controller')
const GameplayController = () => import('#controllers/gameplay_controller')
const PaymentsController = () => import('#controllers/payments_controller')
const RoundQuestionsController = () => import('#controllers/round_questions_controller')
const WalletController = () => import('#controllers/wallet_controller')
const MediaAssetsController = () => import('#controllers/media_assets_controller')
const AdminGamesController = () => import('#controllers/admin/games_controller')
const AdminQuestionCategoriesController = () =>
  import('#controllers/admin/question_categories_controller')
const AdminQuestionsController = () => import('#controllers/admin/questions_controller')
const AdminContentPagesController = () => import('#controllers/admin/content_pages_controller')
const AdminContactMessagesController = () =>
  import('#controllers/admin/contact_messages_controller')
const AdminReportsController = () => import('#controllers/admin/reports_controller')
const AdminMediaAssetsController = () => import('#controllers/admin/media_assets_controller')
const AdminPanelController = () => import('#controllers/admin/panel_controller')

router
  .get('/', async ({ auth, response }) => {
    await auth.check()

    if (auth.user?.role === 'admin') {
      return response.redirect('/admin')
    }

    return response.redirect('/login')
  })
  .as('home')

router.get('/login', [AuthController, 'webLoginPage']).use(middleware.guest())
router.post('/login', [AuthController, 'webLogin']).use([middleware.guest(), authThrottle])
router.post('/logout', [AuthController, 'webLogout']).use(middleware.auth())

router
  .group(() => {
    router.get('/', [AdminPanelController, 'dashboard'])
    router.get('/reports', [AdminPanelController, 'reports'])
    router.get('/finance', [AdminPanelController, 'finance'])
    router.get('/profile', [AdminPanelController, 'profile'])
    router.patch('/profile/password', [AdminPanelController, 'profileUpdatePassword'])
    router.get('/users', [AdminPanelController, 'users'])
    router.get('/users/:id', [AdminPanelController, 'userShow'])
    router.get('/games', [AdminPanelController, 'games'])
    router.get('/games/create', [AdminPanelController, 'gameCreate'])
    router.post('/games', [AdminPanelController, 'gameStore'])
    router.get('/games/:id/edit', [AdminPanelController, 'gameEdit'])
    router.put('/games/:id', [AdminPanelController, 'gameUpdate'])
    router.patch('/games/:id/status', [AdminPanelController, 'gameUpdateStatus'])
    router.get('/games/:id', [AdminPanelController, 'gameShow'])
    router.get('/categories', [AdminPanelController, 'categories'])
    router.get('/categories/create', [AdminPanelController, 'categoryCreate'])
    router.post('/categories', [AdminPanelController, 'categoryStore'])
    router.get('/categories/:id/edit', [AdminPanelController, 'categoryEdit'])
    router.put('/categories/:id', [AdminPanelController, 'categoryUpdate'])
    router.patch('/categories/:id/status', [AdminPanelController, 'categoryUpdateStatus'])
    router.get('/categories/:id', [AdminPanelController, 'categoryShow'])
    router.get('/questions', [AdminPanelController, 'questions'])
    router.get('/questions/create', [AdminPanelController, 'questionCreate'])
    router.post('/questions', [AdminPanelController, 'questionStore'])
    router.get('/questions/:id/edit', [AdminPanelController, 'questionEdit'])
    router.put('/questions/:id', [AdminPanelController, 'questionUpdate'])
    router.patch('/questions/:id/status', [AdminPanelController, 'questionUpdateStatus'])
    router.get('/questions/:id', [AdminPanelController, 'questionShow'])
    router.get('/media-assets', [AdminPanelController, 'mediaAssets'])
    router
      .post('/media-assets', [AdminMediaAssetsController, 'store'])
      .as('admin_panel_media_assets.store')
    router.get('/content-pages', [AdminPanelController, 'contentPages'])
    router.get('/content-pages/create', [AdminPanelController, 'contentPageCreate'])
    router.post('/content-pages', [AdminPanelController, 'contentPageStore'])
    router.get('/content-pages/:id/edit', [AdminPanelController, 'contentPageEdit'])
    router.put('/content-pages/:id', [AdminPanelController, 'contentPageUpdate'])
    router.patch('/content-pages/:id/status', [AdminPanelController, 'contentPageUpdateStatus'])
    router.get('/contact-messages', [AdminPanelController, 'contactMessages'])
    router.get('/contact-messages/:id', [AdminPanelController, 'contactMessageShow'])
    router.patch('/users/:id/status', [AdminPanelController, 'userUpdateStatus'])
    router.patch('/contact-messages/:id/status', [
      AdminPanelController,
      'contactMessageUpdateStatus',
    ])
  })
  .prefix('/admin')
  .use([middleware.auth(), middleware.admin()])

router
  .group(() => {
    router.post('/register', [AuthController, 'register']).use(authThrottle)
    router.post('/login', [AuthController, 'login']).use(authThrottle)

    router
      .group(() => {
        router.get('/me', [AuthController, 'me'])
        router.post('/logout', [AuthController, 'logout'])
        router.post('/otp/phone/send', [AuthController, 'sendPhoneOtp']).use(authThrottle)
        router.post('/otp/phone/verify', [AuthController, 'verifyPhoneOtp']).use(authThrottle)
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1/auth')

router
  .group(() => {
    router.get('/me', [AccountController, 'me'])
    router.patch('/profile', [AccountController, 'updateProfile'])
    router.patch('/password', [AccountController, 'changePassword']).use(authThrottle)
    router.get('/game-history', [AccountHistoryController, 'gameHistory'])
    router.get('/game-history/:id', [AccountHistoryController, 'gameHistoryShow'])
    router.get('/purchased-history', [AccountHistoryController, 'purchasedHistory'])
    router.get('/credit-transactions', [AccountHistoryController, 'creditTransactions'])
  })
  .prefix('/api/v1/account')
  .use(middleware.auth())

router.get('/api/v1/pages/:slug', [ContentPagesController, 'show'])
router.post('/api/v1/contact', [ContactMessagesController, 'store']).use(authThrottle)
router.get('/api/v1/media-assets/:id/file', [MediaAssetsController, 'show'])

router
  .group(() => {
    router.get('/games', [MasterGamesController, 'index'])
    router.get('/games/:slug', [MasterGamesController, 'show'])
  })
  .prefix('/api/v1/master')

router
  .group(() => {
    router.post('/', [GameSessionsController, 'store'])
    router.get('/:id/setup', [GameSessionsController, 'show'])
    router.patch('/:id/teams', [GameSessionsController, 'updateTeams'])
    router.patch('/:id/settings', [GameSessionsController, 'updateSettings'])
    router.post('/:id/optional-category', [GameSessionsController, 'selectOptionalCategory'])
    router.post('/:id/lock', [GameSessionsController, 'lock'])
    router.post('/:id/reserve-credits', [GameSessionPaymentsController, 'reserveCredits'])
    router.post('/:id/category-payment-intent', [
      GameSessionPaymentsController,
      'createCategoryPaymentIntent',
    ])
    router.post('/:id/start', [GameplayController, 'start'])
    router.post('/:id/rounds/next', [GameplayController, 'startNextRound'])
    router.post('/:id/rounds/:roundId/complete', [GameplayController, 'completeRound'])
    router.post('/:id/rounds/:roundId/abandon', [GameplayController, 'abandonRound'])
    router.post('/:id/rounds/:roundId/question', [RoundQuestionsController, 'assignQuestion'])
    router.post('/:id/rounds/:roundId/score', [RoundQuestionsController, 'score'])
    router.get('/:id/scoreboard', [RoundQuestionsController, 'scoreboard'])
    router.post('/:id/stop', [GameplayController, 'stop'])
  })
  .prefix('/api/v1/game-sessions')
  .use(middleware.auth())

router.get('/api/v1/wallet', [WalletController, 'show']).use(middleware.auth())
router.post('/api/v1/payments/:id/confirm', [PaymentsController, 'confirm']).use(middleware.auth())

router
  .group(() => {
    router.get('/games', [AdminGamesController, 'index'])
    router.post('/games', [AdminGamesController, 'store'])
    router.get('/games/:id', [AdminGamesController, 'show'])
    router.put('/games/:id', [AdminGamesController, 'update'])

    router.get('/games/:gameId/categories', [AdminQuestionCategoriesController, 'index'])
    router.post('/games/:gameId/categories', [AdminQuestionCategoriesController, 'store'])
    router.get('/categories/:id', [AdminQuestionCategoriesController, 'show'])
    router.put('/categories/:id', [AdminQuestionCategoriesController, 'update'])

    router.get('/questions', [AdminQuestionsController, 'index'])
    router.post('/questions', [AdminQuestionsController, 'store'])
    router.get('/questions/:id', [AdminQuestionsController, 'show'])
    router.put('/questions/:id', [AdminQuestionsController, 'update'])

    router.get('/media-assets', [AdminMediaAssetsController, 'index'])
    router
      .post('/media-assets', [AdminMediaAssetsController, 'store'])
      .as('admin_api_media_assets.store')
    router.get('/media-assets/:id', [AdminMediaAssetsController, 'show'])

    router.get('/content-pages', [AdminContentPagesController, 'index'])
    router.post('/content-pages', [AdminContentPagesController, 'store'])
    router.get('/content-pages/:id', [AdminContentPagesController, 'show'])
    router.put('/content-pages/:id', [AdminContentPagesController, 'update'])

    router.get('/contact-messages', [AdminContactMessagesController, 'index'])
    router.get('/contact-messages/:id', [AdminContactMessagesController, 'show'])
    router.patch('/contact-messages/:id/status', [AdminContactMessagesController, 'updateStatus'])

    router.get('/dashboard/summary', [AdminReportsController, 'summary'])
    router.get('/reports/payments', [AdminReportsController, 'payments'])
    router.get('/reports/game-sessions', [AdminReportsController, 'gameSessions'])
    router.get('/reports/users', [AdminReportsController, 'users'])
    router.get('/reports/contact-messages', [AdminReportsController, 'contactMessages'])
  })
  .prefix('/api/v1/admin')
  .use([middleware.auth(), middleware.admin()])
