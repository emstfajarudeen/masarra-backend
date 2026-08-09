import ContactMessage from '#models/contact_message'
import ContentPage from '#models/content_page'
import ContentPageTranslation from '#models/content_page_translation'
import CreditTransaction from '#models/credit_transaction'
import Game from '#models/game'
import GameSessionRound from '#models/game_session_round'
import GameSession from '#models/game_session'
import GameTranslation from '#models/game_translation'
import MediaAsset from '#models/media_asset'
import Payment from '#models/payment'
import Question from '#models/question'
import QuestionCategory from '#models/question_category'
import QuestionCategoryTranslation from '#models/question_category_translation'
import QuestionTranslation from '#models/question_translation'
import SubscriptionPlan from '#models/subscription_plan'
import SubscriptionPlanTranslation from '#models/subscription_plan_translation'
import User from '#models/user'
import {
  adminPanelCategoryFormValidator,
  adminPanelContactStatusValidator,
  adminPanelContentPageFormValidator,
  adminPanelContentPublishStatusValidator,
  adminPanelCategoryListFilterValidator,
  adminPanelContactMessageListFilterValidator,
  adminPanelSubscriptionFormValidator,
  adminPanelSubscriptionListFilterValidator,
  adminPanelContentPageListFilterValidator,
  adminPanelGameFormValidator,
  adminPanelGameListFilterValidator,
  adminPanelIdParamsValidator,
  adminPanelPasswordChangeValidator,
  adminPanelMediaLibraryFilterValidator,
  adminPanelPublishStatusValidator,
  adminPanelQuestionListFilterValidator,
  adminPanelQuestionFormValidator,
  adminPanelUserListFilterValidator,
  adminPanelUserStatusValidator,
} from '#validators/admin_panel_forms'
import { adminReportRangeValidator } from '#validators/admin_reports'
import FunRule from '#models/fun_rule'
import {
  adminFunRuleFormValidator,
  adminFunRuleListFilterValidator,
} from '#validators/admin_fun_rules'
import { serializeMediaAsset } from '#transformers/media_asset_transformer'
import type { JSONDataTypes } from '@adonisjs/core/types/transformers'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

interface AdminPanelDateRange {
  from: DateTime | null
  to: DateTime | null
}

export default class AdminPanelController {
  async dashboard({ inertia }: HttpContext) {
    const [
      users,
      activeSessions,
      completedSessions,
      games,
      questions,
      revenue,
      newMessages,
      latestSessions,
    ] = await Promise.all([
      User.query().where('role', 'user').count('* as total').first(),
      GameSession.query().where('status', 'active').count('* as total').first(),
      GameSession.query().where('status', 'completed').count('* as total').first(),
      Game.query().count('* as total').first(),
      Question.query().count('* as total').first(),
      this.paymentRevenue(),
      ContactMessage.query().where('status', 'new').count('* as total').first(),
      GameSession.query()
        .preload('host')
        .preload('game', (query) => {
          query.preload('translations', (translationQuery) => {
            translationQuery.where('locale', 'ar')
          })
        })
        .orderBy('created_at', 'desc')
        .limit(6),
    ])

    return inertia.render('admin/dashboard', {
      metrics: {
        users: this.countValue(users),
        activeSessions: this.countValue(activeSessions),
        completedSessions: this.countValue(completedSessions),
        games: this.countValue(games),
        questions: this.countValue(questions),
        revenue,
        newMessages: this.countValue(newMessages),
      },
      latestSessions: latestSessions.map((session) => ({
        id: session.id,
        status: session.status,
        hostName: session.host.fullName,
        gameTitle: session.game.translations[0]?.title ?? session.game.slug,
        completedRoundCount: session.completedRoundCount,
        selectedRoundCount: session.selectedRoundCount,
        createdAt: session.createdAt?.toISO() ?? null,
      })),
    })
  }

  async games({ request, inertia }: HttpContext) {
    const filters = await request.validateUsing(adminPanelGameListFilterValidator)
    const status = filters.status ?? 'all'
    const optionalCategories = filters.optionalCategories ?? 'all'

    const query = Game.query()
      .preload('translations', (translationQuery) => translationQuery.where('locale', 'ar'))
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')

    if (status !== 'all') {
      query.where('status', status)
    }

    if (optionalCategories !== 'all') {
      query.where('optional_categories_enabled', optionalCategories === 'enabled')
    }

    const [games, total, published, draft, withOptionalCategories] = await Promise.all([
      query.limit(80),
      Game.query().count('* as total').first(),
      Game.query().where('status', 'published').count('* as total').first(),
      Game.query().where('status', 'draft').count('* as total').first(),
      Game.query().where('optional_categories_enabled', true).count('* as total').first(),
    ])

    return inertia.render('admin/games', {
      games: games.map((game) => ({
        id: game.id,
        slug: game.slug,
        title: game.translations[0]?.title ?? game.slug,
        status: game.status,
        minTeamCount: game.minTeamCount,
        maxTeamCount: game.maxTeamCount,
        allowedRoundCounts: game.allowedRoundCounts,
        allowedQuestionDurations: game.allowedQuestionDurations,
        baseRoundCreditCost: game.baseRoundCreditCost,
        optionalCategoriesEnabled: game.optionalCategoriesEnabled,
        createdAt: game.createdAt?.toISO() ?? null,
      })),
      filters: { status, optionalCategories },
      stats: {
        total: this.countValue(total),
        published: this.countValue(published),
        draft: this.countValue(draft),
        withOptionalCategories: this.countValue(withOptionalCategories),
      },
    })
  }

  async users({ request, inertia }: HttpContext) {
    const filters = await request.validateUsing(adminPanelUserListFilterValidator)
    const role = filters.role ?? 'all'
    const status = filters.status ?? 'all'

    const query = User.query()
      .whereNull('deleted_at')
      .where('role', 'user')
      .orderBy('created_at', 'desc')

    if (role !== 'all') {
      query.where('role', role)
    }

    if (status !== 'all') {
      query.where('status', status)
    }

    const [users, total, active, suspended, creditRows, sessionRows, paymentRows] =
      await Promise.all([
        query.limit(80),
        User.query().whereNull('deleted_at').where('role', 'user').count('* as total').first(),
        User.query()
          .whereNull('deleted_at')
          .where('role', 'user')
          .where('status', 'active')
          .count('* as total')
          .first(),
        User.query()
          .whereNull('deleted_at')
          .where('role', 'user')
          .where('status', 'suspended')
          .count('* as total')
          .first(),
        db
          .from('credit_transactions')
          .select('user_id')
          .sum('amount as balance')
          .groupBy('user_id'),
        db.from('game_sessions').select('host_user_id').count('* as total').groupBy('host_user_id'),
        db
          .from('payments')
          .select('user_id')
          .count('* as total')
          .where('status', 'paid')
          .groupBy('user_id'),
      ])

    const creditByUser = this.indexNumberRows(creditRows, 'user_id', 'balance')
    const sessionsByUser = this.indexNumberRows(sessionRows, 'host_user_id', 'total')
    const purchasesByUser = this.indexNumberRows(paymentRows, 'user_id', 'total')

    return inertia.render('admin/users', {
      users: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        initials: user.initials,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        preferredLocale: user.preferredLocale,
        emailVerified: Boolean(user.emailVerifiedAt),
        phoneVerified: Boolean(user.phoneVerifiedAt),
        creditBalance: creditByUser.get(user.id) ?? 0,
        gameSessionCount: sessionsByUser.get(user.id) ?? 0,
        purchaseCount: purchasesByUser.get(user.id) ?? 0,
        createdAt: user.createdAt?.toISO() ?? null,
      })),
      filters: { role, status },
      stats: {
        total: this.countValue(total),
        active: this.countValue(active),
        suspended: this.countValue(suspended),
      },
    })
  }

  async userShow({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)

    const user = await User.query().where('id', id).whereNull('deleted_at').firstOrFail()

    const [creditBalanceRow, gameSessions, payments, creditTransactions] = await Promise.all([
      db.from('credit_transactions').where('user_id', user.id).sum('amount as balance').first(),
      GameSession.query()
        .where('host_user_id', user.id)
        .preload('game', (gameQuery) => {
          gameQuery.preload('translations', (translationQuery) =>
            translationQuery.where('locale', 'ar')
          )
        })
        .orderBy('created_at', 'desc')
        .limit(10),
      Payment.query().where('user_id', user.id).orderBy('created_at', 'desc').limit(10),
      CreditTransaction.query().where('user_id', user.id).orderBy('created_at', 'desc').limit(12),
    ])

    return inertia.render('admin/user_show', {
      user: {
        id: user.id,
        fullName: user.fullName,
        initials: user.initials,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        preferredLocale: user.preferredLocale,
        emailVerifiedAt: user.emailVerifiedAt?.toISO() ?? null,
        phoneVerifiedAt: user.phoneVerifiedAt?.toISO() ?? null,
        termsAcceptedAt: user.termsAcceptedAt?.toISO() ?? null,
        creditBalance: Number(creditBalanceRow?.balance ?? 0),
        createdAt: user.createdAt?.toISO() ?? null,
      },
      gameSessions: gameSessions.map((session) => ({
        id: session.id,
        status: session.status,
        gameTitle: session.game.translations[0]?.title ?? session.game.slug,
        selectedRoundCount: session.selectedRoundCount,
        completedRoundCount: session.completedRoundCount,
        reservedCreditCount: session.reservedCreditCount,
        refundedCreditCount: session.refundedCreditCount,
        creditReservationStatus: session.creditReservationStatus,
        createdAt: session.createdAt?.toISO() ?? null,
      })),
      payments: payments.map((payment) => ({
        id: payment.id,
        status: payment.status,
        method: payment.method,
        payableType: payment.payableType,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        providerReference: payment.providerReference,
        paidAt: payment.paidAt?.toISO() ?? null,
        createdAt: payment.createdAt?.toISO() ?? null,
      })),
      creditTransactions: creditTransactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        createdAt: transaction.createdAt?.toISO() ?? null,
      })),
      timeline: this.userTimeline(gameSessions, payments, creditTransactions),
    })
  }

  async reports({ request, inertia }: HttpContext) {
    const range = await this.validatedReportRange(request)

    const [
      totalUsers,
      activeUsers,
      registeredUsers,
      totalSessions,
      completedSessions,
      activeSessions,
      reservedCredits,
      refundedCredits,
      paidPayments,
      paymentRevenue,
      newMessages,
      sessionStatuses,
      paymentStatuses,
      paymentMethods,
      userStatuses,
      creditTypes,
      mostPlayedGames,
      latestSessions,
      latestPayments,
    ] = await Promise.all([
      User.query().whereNull('deleted_at').where('role', 'user').count('* as total').first(),
      User.query()
        .whereNull('deleted_at')
        .where('role', 'user')
        .where('status', 'active')
        .count('* as total')
        .first(),
      this.applyReportRange(User.query().whereNull('deleted_at').where('role', 'user'), range)
        .count('* as total')
        .first(),
      this.applyReportRange(GameSession.query(), range).count('* as total').first(),
      this.applyReportRange(GameSession.query().where('status', 'completed'), range)
        .count('* as total')
        .first(),
      GameSession.query().where('status', 'active').count('* as total').first(),
      this.sessionCreditSum('reserved_credit_count', range),
      this.sessionCreditSum('refunded_credit_count', range),
      this.applyReportRange(Payment.query().where('status', 'paid'), range)
        .count('* as total')
        .first(),
      this.paymentRevenueByCurrency(range),
      ContactMessage.query().where('status', 'new').count('* as total').first(),
      this.groupReportCount('game_sessions', 'status', range),
      this.groupReportCount('payments', 'status', range),
      this.groupReportCount('payments', 'method', range),
      this.groupReportCount('users', 'status', range, { role: 'user' }),
      this.groupReportCount('credit_transactions', 'type', range),
      this.mostPlayedGames(range),
      GameSession.query()
        .preload('host')
        .preload('game', (gameQuery) =>
          gameQuery.preload('translations', (translationQuery) =>
            translationQuery.where('locale', 'ar')
          )
        )
        .orderBy('created_at', 'desc')
        .limit(8),
      Payment.query().preload('user').orderBy('created_at', 'desc').limit(8),
    ])

    return inertia.render('admin/reports', {
      filters: {
        from: range.from?.toISODate() ?? '',
        to: range.to?.toISODate() ?? '',
      },
      metrics: {
        totalUsers: this.countValue(totalUsers),
        activeUsers: this.countValue(activeUsers),
        registeredUsers: this.countValue(registeredUsers),
        totalSessions: this.countValue(totalSessions),
        completedSessions: this.countValue(completedSessions),
        activeSessions: this.countValue(activeSessions),
        reservedCredits,
        refundedCredits,
        paidPayments: this.countValue(paidPayments),
        paymentRevenue,
        newMessages: this.countValue(newMessages),
      },
      sessionStatuses,
      paymentStatuses,
      paymentMethods,
      userStatuses,
      creditTypes,
      mostPlayedGames,
      latestSessions: latestSessions.map((session) => ({
        id: session.id,
        status: session.status,
        hostName: session.host.fullName,
        gameTitle: session.game.translations[0]?.title ?? session.game.slug,
        completedRoundCount: session.completedRoundCount,
        selectedRoundCount: session.selectedRoundCount,
        reservedCreditCount: session.reservedCreditCount,
        refundedCreditCount: session.refundedCreditCount,
        createdAt: session.createdAt?.toISO() ?? null,
      })),
      latestPayments: latestPayments.map((payment) => ({
        id: payment.id,
        status: payment.status,
        method: payment.method,
        payableType: payment.payableType,
        amount: payment.amount,
        currency: payment.currency,
        userName: payment.user.fullName,
        paidAt: payment.paidAt?.toISO() ?? null,
        createdAt: payment.createdAt?.toISO() ?? null,
      })),
    })
  }

  async finance({ request, inertia }: HttpContext) {
    const range = await this.validatedReportRange(request)

    const [payments, creditTransactions, paymentStatuses, creditTypes, revenue, creditTotals] =
      await Promise.all([
        Payment.query().preload('user').orderBy('created_at', 'desc').limit(80),
        CreditTransaction.query().preload('user').orderBy('created_at', 'desc').limit(80),
        this.groupReportCount('payments', 'status', range),
        this.groupReportCount('credit_transactions', 'type', range),
        this.paymentRevenueByCurrency(range),
        this.creditTotalsByType(range),
      ])

    return inertia.render('admin/finance', {
      filters: {
        from: range.from?.toISODate() ?? '',
        to: range.to?.toISODate() ?? '',
      },
      summary: {
        paymentStatuses,
        creditTypes,
        revenue,
        creditTotals,
      },
      payments: payments.map((payment) => ({
        id: payment.id,
        userName: payment.user.fullName,
        userId: payment.userId,
        status: payment.status,
        method: payment.method,
        payableType: payment.payableType,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        providerReference: payment.providerReference,
        paidAt: payment.paidAt?.toISO() ?? null,
        expiresAt: payment.expiresAt?.toISO() ?? null,
        createdAt: payment.createdAt?.toISO() ?? null,
      })),
      creditTransactions: creditTransactions.map((transaction) => ({
        id: transaction.id,
        userName: transaction.user.fullName,
        userId: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        description: transaction.description,
        gameSessionId: transaction.gameSessionId,
        createdAt: transaction.createdAt?.toISO() ?? null,
      })),
    })
  }

  async profile({ inertia, auth }: HttpContext) {
    const user = auth.getUserOrFail() as User

    return inertia.render('admin/profile', {
      profile: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    })
  }

  async profileUpdatePassword({ request, response, session, auth }: HttpContext) {
    const user = auth.getUserOrFail() as User
    const payload = await request.validateUsing(adminPanelPasswordChangeValidator)

    if (!(await user.verifyPassword(payload.oldPassword))) {
      session.flash('error', 'Current password is incorrect.')
      return response.redirect('/admin/profile')
    }

    user.password = payload.password
    await user.save()

    session.flash('success', 'Password updated successfully.')
    return response.redirect('/admin/profile')
  }

  async gameShow({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)

    const game = await Game.query()
      .where('id', id)
      .preload('translations')
      .preload('categories', (categoryQuery) => {
        categoryQuery.preload('translations', (translationQuery) =>
          translationQuery.where('locale', 'ar')
        )
      })
      .firstOrFail()

    const [questionsCount, publishedQuestions, sessionsCount, completedSessions, latestSessions] =
      await Promise.all([
        Question.query().where('game_id', game.id).count('* as total').first(),
        Question.query()
          .where('game_id', game.id)
          .where('status', 'published')
          .count('* as total')
          .first(),
        GameSession.query().where('game_id', game.id).count('* as total').first(),
        GameSession.query()
          .where('game_id', game.id)
          .where('status', 'completed')
          .count('* as total')
          .first(),
        GameSession.query()
          .where('game_id', game.id)
          .preload('host')
          .orderBy('created_at', 'desc')
          .limit(8),
      ])

    return inertia.render('admin/game_show', {
      game: {
        ...this.serializeGameForm(game),
        createdAt: game.createdAt?.toISO() ?? null,
        updatedAt: game.updatedAt?.toISO() ?? null,
        publishedAt: game.publishedAt?.toISO() ?? null,
      },
      stats: {
        questions: this.countValue(questionsCount),
        publishedQuestions: this.countValue(publishedQuestions),
        sessions: this.countValue(sessionsCount),
        completedSessions: this.countValue(completedSessions),
        categories: game.categories.length,
      },
      categories: game.categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        title: category.translations[0]?.title ?? category.slug,
        status: category.status,
        priceAmount: category.priceAmount,
        priceCurrency: category.priceCurrency,
      })),
      latestSessions: latestSessions.map((session) => ({
        id: session.id,
        hostName: session.host.fullName,
        status: session.status,
        completedRoundCount: session.completedRoundCount,
        selectedRoundCount: session.selectedRoundCount,
        reservedCreditCount: session.reservedCreditCount,
        refundedCreditCount: session.refundedCreditCount,
        createdAt: session.createdAt?.toISO() ?? null,
      })),
    })
  }

  async categoryShow({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)

    const category = await QuestionCategory.query()
      .where('id', id)
      .preload('translations')
      .preload('game', (gameQuery) => {
        gameQuery.preload('translations', (translationQuery) =>
          translationQuery.where('locale', 'ar')
        )
      })
      .firstOrFail()

    const [questions, questionCount, publishedQuestions, sessionCount, paidPayments] =
      await Promise.all([
        Question.query()
          .where('question_category_id', category.id)
          .preload('translations', (translationQuery) => translationQuery.where('locale', 'ar'))
          .orderBy('created_at', 'desc')
          .limit(10),
        Question.query().where('question_category_id', category.id).count('* as total').first(),
        Question.query()
          .where('question_category_id', category.id)
          .where('status', 'published')
          .count('* as total')
          .first(),
        GameSession.query()
          .where('optional_question_category_id', category.id)
          .count('* as total')
          .first(),
        db
          .from('payments')
          .join('game_sessions', 'game_sessions.id', 'payments.game_session_id')
          .where('game_sessions.optional_question_category_id', category.id)
          .where('payments.status', 'paid')
          .count('* as total')
          .first(),
      ])

    return inertia.render('admin/category_show', {
      category: {
        ...this.serializeCategoryForm(category),
        gameTitle: category.game.translations[0]?.title ?? category.game.slug,
        createdAt: category.createdAt?.toISO() ?? null,
        updatedAt: category.updatedAt?.toISO() ?? null,
        publishedAt: category.publishedAt?.toISO() ?? null,
      },
      stats: {
        questions: this.countValue(questionCount),
        publishedQuestions: this.countValue(publishedQuestions),
        selectedSessions: this.countValue(sessionCount),
        paidPayments: Number(paidPayments?.total ?? 0),
      },
      questions: questions.map((question) => ({
        id: question.id,
        prompt: question.translations[0]?.prompt ?? '—',
        status: question.status,
        type: question.type,
        contentMode: String(question.metadata.contentMode ?? 'text'),
        effectLogic: String(question.metadata.effectLogic ?? 'normal'),
        basePoints: question.basePoints,
        createdAt: question.createdAt?.toISO() ?? null,
      })),
    })
  }

  async questionShow({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)

    const question = await Question.query()
      .where('id', id)
      .preload('translations')
      .preload('game', (gameQuery) => {
        gameQuery.preload('translations', (translationQuery) =>
          translationQuery.where('locale', 'ar')
        )
      })
      .preload('category', (categoryQuery) => {
        categoryQuery.preload('translations', (translationQuery) =>
          translationQuery.where('locale', 'ar')
        )
      })
      .firstOrFail()

    const mediaAssetId =
      typeof question.metadata.mediaAssetId === 'string' ? question.metadata.mediaAssetId : null

    const [usageCount, latestRounds, mediaAsset] = await Promise.all([
      GameSessionRound.query().where('question_id', question.id).count('* as total').first(),
      GameSessionRound.query()
        .where('question_id', question.id)
        .preload('session')
        .orderBy('created_at', 'desc')
        .limit(8),
      mediaAssetId
        ? MediaAsset.query().where('id', mediaAssetId).whereNull('deleted_at').first()
        : null,
    ])

    const translation = question.translations.find((item) => item.locale === 'ar')

    return inertia.render('admin/question_show', {
      question: {
        id: question.id,
        prompt: translation?.prompt ?? '—',
        correctAnswer: translation?.correctAnswer ?? null,
        explanation: translation?.explanation ?? null,
        gameTitle: question.game.translations[0]?.title ?? question.game.slug,
        categoryTitle: question.category
          ? (question.category.translations[0]?.title ?? question.category.slug)
          : null,
        status: question.status,
        type: question.type,
        contentMode: String(question.metadata.contentMode ?? 'text'),
        effectLogic: String(question.metadata.effectLogic ?? 'normal'),
        mediaUrl:
          typeof question.metadata.mediaUrl === 'string' ? question.metadata.mediaUrl : null,
        basePoints: question.basePoints,
        sortOrder: question.sortOrder,
        visibilityTimerEnabled: Boolean(question.metadata.visibilityTimerEnabled),
        visibilityTimerSeconds:
          typeof question.metadata.visibilityTimerSeconds === 'number'
            ? question.metadata.visibilityTimerSeconds
            : null,
        createdAt: question.createdAt?.toISO() ?? null,
        updatedAt: question.updatedAt?.toISO() ?? null,
        publishedAt: question.publishedAt?.toISO() ?? null,
      },
      stats: {
        usageCount: this.countValue(usageCount),
      },
      mediaAsset: mediaAsset ? this.serializePanelMediaAsset(mediaAsset) : null,
      latestRounds: latestRounds.map((round) => ({
        id: round.id,
        sessionId: round.gameSessionId,
        sessionStatus: round.session.status,
        roundNumber: round.roundNumber,
        status: round.status,
        scoringRule: round.scoringRule,
        awardedPoints: round.awardedPoints,
        creditOutcome: round.creditOutcome,
        createdAt: round.createdAt?.toISO() ?? null,
      })),
    })
  }

  async gameUpdateStatus({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelPublishStatusValidator)
    const game = await Game.findOrFail(payload.params.id)

    game.status = payload.status
    game.publishedAt = this.publishedAtFor(payload.status, game.publishedAt)
    await game.save()

    session.flash('success', 'Game status updated.')
    return response.redirect(`/admin/games/${game.id}`)
  }

  async categoryUpdateStatus({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelPublishStatusValidator)
    const category = await QuestionCategory.findOrFail(payload.params.id)

    category.status = payload.status
    category.publishedAt = this.publishedAtFor(payload.status, category.publishedAt)
    await category.save()

    session.flash('success', 'Category status updated.')
    return response.redirect(`/admin/categories/${category.id}`)
  }

  async questionUpdateStatus({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelPublishStatusValidator)
    const question = await Question.findOrFail(payload.params.id)

    question.status = payload.status
    question.publishedAt = this.publishedAtFor(payload.status, question.publishedAt)
    await question.save()

    session.flash('success', 'Question status updated.')
    return response.redirect(`/admin/questions/${question.id}`)
  }

  async contentPageUpdateStatus({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelContentPublishStatusValidator)
    const page = await ContentPage.findOrFail(payload.params.id)

    page.status = payload.status
    page.publishedAt = this.publishedAtFor(payload.status, page.publishedAt)
    await page.save()

    session.flash('success', 'Content page status updated.')
    return response.redirect(`/admin/content-pages/${page.id}/edit`)
  }

  async userUpdateStatus({ request, response, session, auth }: HttpContext) {
    const payload = await request.validateUsing(adminPanelUserStatusValidator)
    const user = await User.query()
      .where('id', payload.params.id)
      .whereNull('deleted_at')
      .firstOrFail()

    if (auth.user?.id === user.id && payload.status === 'suspended') {
      throw new Exception('You cannot suspend your own admin account.', { status: 422 })
    }

    user.status = payload.status
    await user.save()

    session.flash('success', 'User status updated.')
    return response.redirect(`/admin/users/${user.id}`)
  }

  async gameCreate({ inertia }: HttpContext) {
    return inertia.render('admin/game_form', {
      mode: 'create',
      game: null,
    })
  }

  async gameEdit({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)
    const game = await this.findGame(id)

    return inertia.render('admin/game_form', {
      mode: 'edit',
      game: this.serializeGameForm(game),
    })
  }

  async gameStore({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelGameFormValidator)
    this.assertTeamBounds(payload.minTeamCount, payload.maxTeamCount)

    await db.transaction(async (trx) => {
      await this.assertGameSlug(payload.slug, undefined, trx)
      const game = new Game()
      game.useTransaction(trx)
      game.fill({
        slug: payload.slug,
        status: payload.status,
        minTeamCount: payload.minTeamCount,
        maxTeamCount: payload.maxTeamCount,
        allowedRoundCounts: payload.allowedRoundCounts,
        allowedQuestionDurations: payload.allowedQuestionDurations,
        baseRoundCreditCost: payload.baseRoundCreditCost,
        optionalCategoriesEnabled: payload.optionalCategoriesEnabled,
        publishedAt: this.publishedAtFor(payload.status),
      })
      await game.save()
      await this.syncGameArabicTranslation(game.id, payload, trx)
    })

    session.flash('success', 'Game created.')
    return response.redirect('/admin/games')
  }

  async gameUpdate({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelGameFormValidator)
    const id = payload.params?.id
    if (!id) throw new Exception('Game id is required.', { status: 400 })

    this.assertTeamBounds(payload.minTeamCount, payload.maxTeamCount)

    await db.transaction(async (trx) => {
      await this.assertGameSlug(payload.slug, id, trx)
      const game = await Game.query({ client: trx }).where('id', id).firstOrFail()
      game.useTransaction(trx)
      game.merge({
        slug: payload.slug,
        status: payload.status,
        minTeamCount: payload.minTeamCount,
        maxTeamCount: payload.maxTeamCount,
        allowedRoundCounts: payload.allowedRoundCounts,
        allowedQuestionDurations: payload.allowedQuestionDurations,
        baseRoundCreditCost: payload.baseRoundCreditCost,
        optionalCategoriesEnabled: payload.optionalCategoriesEnabled,
        publishedAt: this.publishedAtFor(payload.status, game.publishedAt),
      })
      await game.save()
      await this.syncGameArabicTranslation(game.id, payload, trx)
    })

    session.flash('success', 'Game updated.')
    return response.redirect('/admin/games')
  }

  async categories({ request, inertia }: HttpContext) {
    const filters = await request.validateUsing(adminPanelCategoryListFilterValidator)
    const status = filters.status ?? 'all'

    const query = QuestionCategory.query()
      .preload('game', (gameQuery) => {
        gameQuery.preload('translations', (translationQuery) =>
          translationQuery.where('locale', 'ar')
        )
      })
      .preload('translations', (translationQuery) => translationQuery.where('locale', 'ar'))
      .orderBy('created_at', 'desc')

    if (filters.gameId) {
      query.where('game_id', filters.gameId)
    }

    if (status !== 'all') {
      query.where('status', status)
    }

    const [categories, total, published, paid] = await Promise.all([
      query.limit(80),
      QuestionCategory.query().count('* as total').first(),
      QuestionCategory.query().where('status', 'published').count('* as total').first(),
      QuestionCategory.query().whereNotNull('price_amount').count('* as total').first(),
    ])

    return inertia.render('admin/categories', {
      categories: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        gameId: category.gameId,
        title: category.translations[0]?.title ?? category.slug,
        gameTitle: category.game.translations[0]?.title ?? category.game.slug,
        status: category.status,
        priceAmount: category.priceAmount,
        priceCurrency: category.priceCurrency,
        createdAt: category.createdAt?.toISO() ?? null,
      })),
      filters: {
        gameId: filters.gameId ?? '',
        status,
      },
      stats: {
        total: this.countValue(total),
        published: this.countValue(published),
        paid: this.countValue(paid),
      },
      games: await this.gameOptions(),
    })
  }

  async categoryCreate({ inertia }: HttpContext) {
    return inertia.render('admin/category_form', {
      mode: 'create',
      category: null,
      games: await this.gameOptions(),
    })
  }

  async categoryEdit({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)
    const category = await this.findCategory(id)

    return inertia.render('admin/category_form', {
      mode: 'edit',
      category: this.serializeCategoryForm(category),
      games: await this.gameOptions(),
    })
  }

  async categoryStore({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelCategoryFormValidator)

    await db.transaction(async (trx) => {
      await this.assertGameExists(payload.gameId, trx)
      await this.assertCategorySlug(payload.gameId, payload.slug, undefined, trx)
      const category = new QuestionCategory()
      category.useTransaction(trx)
      category.fill({
        gameId: payload.gameId,
        slug: payload.slug,
        status: payload.status,
        priceAmount: payload.priceAmount ?? null,
        priceCurrency: payload.priceCurrency,
        publishedAt: this.publishedAtFor(payload.status),
      })
      await category.save()
      await this.syncCategoryArabicTranslation(category.id, payload, trx)
    })

    session.flash('success', 'Category created.')
    return response.redirect('/admin/categories')
  }

  async categoryUpdate({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelCategoryFormValidator)
    const id = payload.params?.id
    if (!id) throw new Exception('Category id is required.', { status: 400 })

    await db.transaction(async (trx) => {
      await this.assertGameExists(payload.gameId, trx)
      await this.assertCategorySlug(payload.gameId, payload.slug, id, trx)
      const category = await QuestionCategory.query({ client: trx }).where('id', id).firstOrFail()
      category.useTransaction(trx)
      category.merge({
        gameId: payload.gameId,
        slug: payload.slug,
        status: payload.status,
        priceAmount: payload.priceAmount ?? null,
        priceCurrency: payload.priceCurrency,
        publishedAt: this.publishedAtFor(payload.status, category.publishedAt),
      })
      await category.save()
      await this.syncCategoryArabicTranslation(category.id, payload, trx)
    })

    session.flash('success', 'Category updated.')
    return response.redirect('/admin/categories')
  }

  async subscriptions({ request, inertia }: HttpContext) {
    const filters = await request.validateUsing(adminPanelSubscriptionListFilterValidator)
    const status = filters.status ?? 'all'

    const query = SubscriptionPlan.query()
      .preload('translations', (translationQuery) => translationQuery.where('locale', 'ar'))
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')

    if (status !== 'all') {
      query.where('status', status)
    }

    const [plans, total, published, featured] = await Promise.all([
      query.limit(80),
      SubscriptionPlan.query().count('* as total').first(),
      SubscriptionPlan.query().where('status', 'published').count('* as total').first(),
      SubscriptionPlan.query().where('is_featured', true).count('* as total').first(),
    ])

    return inertia.render('admin/subscriptions', {
      plans: plans.map((plan) => ({
        id: plan.id,
        slug: plan.slug,
        title: plan.translations[0]?.title ?? plan.slug,
        status: plan.status,
        priceAmount: plan.priceAmount,
        priceCurrency: plan.priceCurrency,
        roundsGranted: plan.roundsGranted,
        maxTeams: plan.maxTeams,
        isFeatured: plan.isFeatured,
        badgeLabel: plan.badgeLabel ?? '',
        ctaLabel: plan.ctaLabel ?? '',
        note: plan.note ?? '',
        advantages: plan.advantages ?? '',
        createdAt: plan.createdAt?.toISO() ?? null,
      })),
      filters: { status },
      stats: {
        total: this.countValue(total),
        published: this.countValue(published),
        featured: this.countValue(featured),
      },
    })
  }

  async subscriptionShow({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)
    const plan = await this.findSubscription(id)

    return inertia.render('admin/subscription_show', {
      plan: {
        ...this.serializeSubscriptionForm(plan),
        publishedAt: plan.publishedAt?.toISO() ?? null,
        createdAt: plan.createdAt?.toISO() ?? null,
        updatedAt: plan.updatedAt?.toISO() ?? null,
      },
    })
  }

  async subscriptionCreate({ inertia }: HttpContext) {
    return inertia.render('admin/subscription_form', {
      mode: 'create',
      plan: null,
    })
  }

  async subscriptionEdit({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)
    const plan = await this.findSubscription(id)

    return inertia.render('admin/subscription_form', {
      mode: 'edit',
      plan: this.serializeSubscriptionForm(plan),
    })
  }

  async subscriptionStore({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelSubscriptionFormValidator)

    await db.transaction(async (trx) => {
      await this.assertSubscriptionSlug(payload.slug, undefined, trx)
      const plan = new SubscriptionPlan()
      plan.useTransaction(trx)
      plan.fill({
        slug: payload.slug,
        status: payload.status,
        priceAmount: payload.priceAmount,
        priceCurrency: 'KWD',
        roundsGranted: payload.roundsGranted,
        maxTeams: payload.maxTeams,
        isFeatured: payload.isFeatured,
        badgeLabel: payload.badgeLabel ?? null,
        ctaLabel: payload.ctaLabel ?? null,
        note: payload.note ?? null,
        advantages: payload.advantages ?? null,
        sortOrder: payload.sortOrder ?? 0,
        publishedAt: this.publishedAtFor(payload.status),
      })
      await plan.save()
      await this.syncSubscriptionArabicTranslation(plan.id, payload, trx)
    })

    session.flash('success', 'Subscription plan created.')
    return response.redirect('/admin/subscriptions')
  }

  async subscriptionUpdate({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelSubscriptionFormValidator)
    const id = payload.params?.id
    if (!id) throw new Exception('Subscription plan id is required.', { status: 400 })

    await db.transaction(async (trx) => {
      await this.assertSubscriptionSlug(payload.slug, id, trx)
      const plan = await SubscriptionPlan.query({ client: trx }).where('id', id).firstOrFail()
      plan.useTransaction(trx)
      plan.merge({
        slug: payload.slug,
        status: payload.status,
        priceAmount: payload.priceAmount,
        priceCurrency: 'KWD',
        roundsGranted: payload.roundsGranted,
        maxTeams: payload.maxTeams,
        isFeatured: payload.isFeatured,
        badgeLabel: payload.badgeLabel ?? null,
        ctaLabel: payload.ctaLabel ?? null,
        note: payload.note ?? null,
        advantages: payload.advantages ?? null,
        sortOrder: payload.sortOrder ?? 0,
        publishedAt: this.publishedAtFor(payload.status, plan.publishedAt),
      })
      await plan.save()
      await this.syncSubscriptionArabicTranslation(plan.id, payload, trx)
    })

    session.flash('success', 'Subscription plan updated.')
    return response.redirect('/admin/subscriptions')
  }

  async subscriptionUpdateStatus({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelPublishStatusValidator)
    const plan = await SubscriptionPlan.findOrFail(payload.params.id)

    plan.status = payload.status
    plan.publishedAt = this.publishedAtFor(payload.status, plan.publishedAt)
    await plan.save()

    session.flash('success', 'Subscription plan status updated.')
    return response.redirect(`/admin/subscriptions/${plan.id}`)
  }

  async subscriptionDestroy({ request, response, session }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)
    const plan = await SubscriptionPlan.findOrFail(id)
    await plan.delete()

    session.flash('success', 'Subscription plan deleted.')
    return response.redirect('/admin/subscriptions')
  }

  async questions({ request, inertia }: HttpContext) {
    const filters = await request.validateUsing(adminPanelQuestionListFilterValidator)
    const status = filters.status ?? 'all'
    const type = filters.type ?? 'all'
    const contentMode = filters.contentMode ?? 'all'
    const effectLogic = filters.effectLogic ?? 'all'

    const query = Question.query()
      .preload('game', (gameQuery) => {
        gameQuery.preload('translations', (translationQuery) =>
          translationQuery.where('locale', 'ar')
        )
      })
      .preload('category', (categoryQuery) => {
        categoryQuery.preload('translations', (translationQuery) =>
          translationQuery.where('locale', 'ar')
        )
      })
      .preload('translations', (translationQuery) => translationQuery.where('locale', 'ar'))
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')

    if (filters.gameId) {
      query.where('game_id', filters.gameId)
    }

    if (filters.categoryId) {
      query.where('question_category_id', filters.categoryId)
    }

    if (status !== 'all') {
      query.where('status', status)
    }

    if (type !== 'all') {
      query.where('type', type)
    }

    if (contentMode !== 'all') {
      query.whereRaw("metadata ->> 'contentMode' = ?", [contentMode])
    }

    if (effectLogic !== 'all') {
      query.whereRaw("metadata ->> 'effectLogic' = ?", [effectLogic])
    }

    const [questions, total, published, draft, withMedia] = await Promise.all([
      query.limit(80),
      Question.query().count('* as total').first(),
      Question.query().where('status', 'published').count('* as total').first(),
      Question.query().where('status', 'draft').count('* as total').first(),
      Question.query()
        .whereRaw("COALESCE(metadata ->> 'contentMode', 'text') != 'text'")
        .count('* as total')
        .first(),
    ])

    return inertia.render('admin/questions', {
      questions: questions.map((question) => ({
        id: question.id,
        prompt: question.translations[0]?.prompt ?? '—',
        correctAnswer: question.translations[0]?.correctAnswer ?? null,
        explanation: question.translations[0]?.explanation ?? null,
        gameTitle: question.game.translations[0]?.title ?? question.game.slug,
        categoryTitle: question.category
          ? (question.category.translations[0]?.title ?? question.category.slug)
          : null,
        status: question.status,
        type: question.type,
        contentMode: String(question.metadata.contentMode ?? 'text'),
        effectLogic: String(question.metadata.effectLogic ?? 'normal'),
        mediaAssetId:
          typeof question.metadata.mediaAssetId === 'string'
            ? question.metadata.mediaAssetId
            : null,
        mediaUrl:
          typeof question.metadata.mediaUrl === 'string' ? question.metadata.mediaUrl : null,
        basePoints: question.basePoints,
        createdAt: question.createdAt?.toISO() ?? null,
      })),
      filters: {
        gameId: filters.gameId ?? '',
        categoryId: filters.categoryId ?? '',
        status,
        type,
        contentMode,
        effectLogic,
      },
      stats: {
        total: this.countValue(total),
        published: this.countValue(published),
        draft: this.countValue(draft),
        withMedia: this.countValue(withMedia),
      },
      games: await this.gameOptions(),
      categories: await this.categoryOptions(),
    })
  }

  async funRules({ request, inertia }: HttpContext) {
    const filters = await request.validateUsing(adminFunRuleListFilterValidator)
    const search = filters.search ?? ''
    const isActive = filters.isActive ?? 'all'

    const query = FunRule.query().orderBy('sort_order', 'asc').orderBy('created_at', 'desc')

    if (search) {
      query.where((q) => {
        q.where('name_ar', 'ILIKE', `%${search}%`)
          .orWhere('name_en', 'ILIKE', `%${search}%`)
          .orWhere('code', 'ILIKE', `%${search}%`)
      })
    }

    if (isActive !== 'all') {
      query.where('is_active', isActive === 'active')
    }

    const rules = await query

    const [totalCount, activeCount] = await Promise.all([
      FunRule.query().count('* as total').first(),
      FunRule.query().where('is_active', true).count('* as total').first(),
    ])

    const total = this.countValue(totalCount)
    const active = this.countValue(activeCount)

    return inertia.render('admin/fun_rules', {
      rules: rules.map((rule) => ({
        id: rule.id,
        code: rule.code,
        nameAr: rule.nameAr,
        nameEn: rule.nameEn,
        descriptionAr: rule.descriptionAr,
        descriptionEn: rule.descriptionEn,
        effectType: rule.effectType,
        config: rule.config as Record<string, JSONDataTypes>,
        isActive: rule.isActive,
        sortOrder: rule.sortOrder,
        createdAt: rule.createdAt?.toISO() ?? null,
      })),
      filters: { search, isActive },
      stats: { total, active, inactive: total - active },
    })
  }

  async funRuleCreate({ inertia }: HttpContext) {
    return inertia.render('admin/fun_rule_form', {
      mode: 'create',
      rule: null,
    })
  }

  async funRuleStore({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminFunRuleFormValidator)

    const existingCode = await FunRule.query().where('code', payload.code).first()
    if (existingCode) {
      throw new Exception('A fun rule with this code already exists.', { status: 422 })
    }

    let config = {}
    if (payload.configJson) {
      try {
        config = JSON.parse(payload.configJson)
      } catch {
        throw new Exception('Invalid JSON string for config.', { status: 422 })
      }
    }

    const rule = new FunRule()
    rule.fill({
      code: payload.code,
      nameAr: payload.nameAr,
      nameEn: payload.nameEn ?? null,
      descriptionAr: payload.descriptionAr ?? null,
      descriptionEn: payload.descriptionEn ?? null,
      effectType: payload.effectType,
      config,
      isActive: payload.isActive ?? true,
      sortOrder: payload.sortOrder ?? 0,
    })
    await rule.save()

    session.flash('success', 'Fun Rule created.')
    return response.redirect('/admin/fun-rules')
  }

  async funRuleEdit({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)
    const rule = await FunRule.findOrFail(id)

    return inertia.render('admin/fun_rule_form', {
      mode: 'edit',
      rule: {
        id: rule.id,
        code: rule.code,
        nameAr: rule.nameAr,
        nameEn: rule.nameEn,
        descriptionAr: rule.descriptionAr,
        descriptionEn: rule.descriptionEn,
        effectType: rule.effectType,
        configJson: JSON.stringify(rule.config, null, 2),
        isActive: rule.isActive,
        sortOrder: rule.sortOrder,
      },
    })
  }

  async funRuleUpdate({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminFunRuleFormValidator)
    const id = payload.params?.id
    if (!id) throw new Exception('Rule id is required.', { status: 400 })

    const rule = await FunRule.findOrFail(id)

    const existingCode = await FunRule.query()
      .where('code', payload.code)
      .whereNot('id', id)
      .first()
    if (existingCode) {
      throw new Exception('Another fun rule with this code already exists.', { status: 422 })
    }

    let config = rule.config
    if (payload.configJson !== undefined) {
      try {
        config = payload.configJson ? JSON.parse(payload.configJson) : {}
      } catch {
        throw new Exception('Invalid JSON string for config.', { status: 422 })
      }
    }

    rule.merge({
      code: payload.code,
      nameAr: payload.nameAr,
      nameEn: payload.nameEn ?? null,
      descriptionAr: payload.descriptionAr ?? null,
      descriptionEn: payload.descriptionEn ?? null,
      effectType: payload.effectType,
      config,
      isActive: payload.isActive ?? rule.isActive,
      sortOrder: payload.sortOrder ?? rule.sortOrder,
    })
    await rule.save()

    session.flash('success', 'Fun Rule updated.')
    return response.redirect('/admin/fun-rules')
  }

  async funRuleUpdateStatus({ request, response, session }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)
    const rule = await FunRule.findOrFail(id)
    rule.isActive = !rule.isActive
    await rule.save()

    session.flash('success', 'Fun Rule status updated.')
    return response.redirect('/admin/fun-rules')
  }

  async questionCreate({ inertia }: HttpContext) {
    return inertia.render('admin/question_form', {
      mode: 'create',
      question: null,
      games: await this.gameOptions(),
      categories: await this.categoryOptions(),
      mediaAssets: await this.mediaAssetOptions(),
      funRules: await this.funRuleOptions(),
    })
  }

  async questionEdit({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)
    const question = await this.findQuestion(id)

    return inertia.render('admin/question_form', {
      mode: 'edit',
      question: this.serializeQuestionForm(question),
      games: await this.gameOptions(),
      categories: await this.categoryOptions(),
      mediaAssets: await this.mediaAssetOptions(),
      funRules: await this.funRuleOptions(),
    })
  }

  async mediaAssets({ request, inertia }: HttpContext) {
    const filters = await request.validateUsing(adminPanelMediaLibraryFilterValidator)
    const type = filters.type ?? 'all'
    const visibility = filters.visibility ?? 'all'

    const query = MediaAsset.query().whereNull('deleted_at').orderBy('created_at', 'desc')

    if (type !== 'all') {
      query.where('mime_type', 'LIKE', `${type}/%`)
    }

    if (visibility !== 'all') {
      query.where('visibility', visibility)
    }

    const [assets, total, images, videos, audios] = await Promise.all([
      query.limit(80),
      MediaAsset.query().whereNull('deleted_at').count('* as total').first(),
      MediaAsset.query()
        .whereNull('deleted_at')
        .where('mime_type', 'LIKE', 'image/%')
        .count('* as total')
        .first(),
      MediaAsset.query()
        .whereNull('deleted_at')
        .where('mime_type', 'LIKE', 'video/%')
        .count('* as total')
        .first(),
      MediaAsset.query()
        .whereNull('deleted_at')
        .where('mime_type', 'LIKE', 'audio/%')
        .count('* as total')
        .first(),
    ])

    return inertia.render('admin/media_assets', {
      mediaAssets: assets.map((asset) => this.serializePanelMediaAsset(asset)),
      filters: { type, visibility },
      stats: {
        total: this.countValue(total),
        images: this.countValue(images),
        videos: this.countValue(videos),
        audios: this.countValue(audios),
      },
    })
  }

  async questionStore({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelQuestionFormValidator)
    const { funRuleId, resolvedEffectLogic, funRuleSnapshot } = await this.resolveFunRuleSnapshot(
      payload.funRuleId,
      payload.effectLogic
    )

    await db.transaction(async (trx) => {
      await this.assertGameExists(payload.gameId, trx)
      await this.assertCategoryBelongsToGame(
        payload.questionCategoryId ?? null,
        payload.gameId,
        trx
      )
      await this.assertMediaAssetExists(payload.mediaAssetId ?? null, trx)
      const question = new Question()
      question.useTransaction(trx)
      question.fill({
        gameId: payload.gameId,
        questionCategoryId: payload.questionCategoryId ?? null,
        status: payload.status,
        type: payload.type,
        basePoints: payload.basePoints,
        sortOrder: payload.sortOrder ?? 0,
        metadata: {
          contentMode: payload.contentMode,
          effectLogic: resolvedEffectLogic,
          effectPoints: payload.effectPoints ?? null,
          funRuleId,
          funRule: funRuleSnapshot,
          mediaAssetId: payload.mediaAssetId ?? null,
          mediaUrl: payload.mediaUrl ?? null,
          visibilityTimerEnabled: payload.visibilityTimerEnabled ?? false,
          visibilityTimerSeconds: payload.visibilityTimerEnabled
            ? (payload.visibilityTimerSeconds ?? null)
            : null,
        },
        publishedAt: this.publishedAtFor(payload.status),
      })
      await question.save()
      await this.syncQuestionArabicTranslation(question.id, payload, trx)
    })

    session.flash('success', 'Question created.')
    return response.redirect('/admin/questions')
  }

  async questionUpdate({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelQuestionFormValidator)
    const id = payload.params?.id
    if (!id) throw new Exception('Question id is required.', { status: 400 })

    const { funRuleId, resolvedEffectLogic, funRuleSnapshot } = await this.resolveFunRuleSnapshot(
      payload.funRuleId,
      payload.effectLogic
    )

    await db.transaction(async (trx) => {
      await this.assertGameExists(payload.gameId, trx)
      await this.assertCategoryBelongsToGame(
        payload.questionCategoryId ?? null,
        payload.gameId,
        trx
      )
      await this.assertMediaAssetExists(payload.mediaAssetId ?? null, trx)
      const question = await Question.query({ client: trx }).where('id', id).firstOrFail()
      question.useTransaction(trx)
      question.merge({
        gameId: payload.gameId,
        questionCategoryId: payload.questionCategoryId ?? null,
        status: payload.status,
        type: payload.type,
        basePoints: payload.basePoints,
        sortOrder: payload.sortOrder ?? 0,
        metadata: {
          contentMode: payload.contentMode,
          effectLogic: resolvedEffectLogic,
          effectPoints: payload.effectPoints ?? null,
          funRuleId,
          funRule: funRuleSnapshot ?? (question.metadata.funRule as Record<string, unknown> | null),
          mediaAssetId: payload.mediaAssetId ?? null,
          mediaUrl: payload.mediaUrl ?? null,
          visibilityTimerEnabled: payload.visibilityTimerEnabled ?? false,
          visibilityTimerSeconds: payload.visibilityTimerEnabled
            ? (payload.visibilityTimerSeconds ?? null)
            : null,
        },
        publishedAt: this.publishedAtFor(payload.status, question.publishedAt),
      })
      await question.save()
      await this.syncQuestionArabicTranslation(question.id, payload, trx)
    })

    session.flash('success', 'Question updated.')
    return response.redirect('/admin/questions')
  }

  async contentPages({ request, inertia }: HttpContext) {
    const filters = await request.validateUsing(adminPanelContentPageListFilterValidator)
    const status = filters.status ?? 'all'

    const query = ContentPage.query()
      .preload('translations', (translationQuery) => translationQuery.where('locale', 'ar'))
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')

    if (status !== 'all') {
      query.where('status', status)
    }

    const [pages, total, published, draft] = await Promise.all([
      query.limit(80),
      ContentPage.query().count('* as total').first(),
      ContentPage.query().where('status', 'published').count('* as total').first(),
      ContentPage.query().where('status', 'draft').count('* as total').first(),
    ])

    return inertia.render('admin/content_pages', {
      pages: pages.map((page) => ({
        id: page.id,
        slug: page.slug,
        title: page.translations[0]?.title ?? page.slug,
        excerpt: page.translations[0]?.excerpt ?? null,
        bodyPreview: this.previewText(page.translations[0]?.body ?? ''),
        status: page.status,
        createdAt: page.createdAt?.toISO() ?? null,
        updatedAt: page.updatedAt?.toISO() ?? null,
      })),
      filters: { status },
      stats: {
        total: this.countValue(total),
        published: this.countValue(published),
        draft: this.countValue(draft),
      },
    })
  }

  async contentPageCreate({ inertia }: HttpContext) {
    return inertia.render('admin/content_page_form', {
      mode: 'create',
      page: null,
    })
  }

  async contentPageEdit({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)
    const page = await this.findContentPage(id)

    return inertia.render('admin/content_page_form', {
      mode: 'edit',
      page: this.serializeContentPageForm(page),
    })
  }

  async contentPageStore({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelContentPageFormValidator)

    await db.transaction(async (trx) => {
      await this.assertContentPageSlug(payload.slug, undefined, trx)
      const page = new ContentPage()
      page.useTransaction(trx)
      page.fill({
        slug: payload.slug,
        status: payload.status,
        publishedAt: this.publishedAtFor(payload.status),
      })
      await page.save()
      await this.syncContentPageArabicTranslation(page.id, payload, trx)
    })

    session.flash('success', 'Content page created.')
    return response.redirect('/admin/content-pages')
  }

  async contentPageUpdate({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelContentPageFormValidator)
    const id = payload.params?.id
    if (!id) throw new Exception('Content page id is required.', { status: 400 })

    await db.transaction(async (trx) => {
      await this.assertContentPageSlug(payload.slug, id, trx)
      const page = await ContentPage.query({ client: trx }).where('id', id).firstOrFail()
      page.useTransaction(trx)
      page.merge({
        slug: payload.slug,
        status: payload.status,
        publishedAt: this.publishedAtFor(payload.status, page.publishedAt),
      })
      await page.save()
      await this.syncContentPageArabicTranslation(page.id, payload, trx)
    })

    session.flash('success', 'Content page updated.')
    return response.redirect('/admin/content-pages')
  }

  async contactMessages({ request, inertia }: HttpContext) {
    const filters = await request.validateUsing(adminPanelContactMessageListFilterValidator)
    const status = filters.status ?? 'all'

    const query = ContactMessage.query().orderBy('created_at', 'desc')

    if (status !== 'all') {
      query.where('status', status)
    }

    const [messages, total, newMessages, reviewed, archived] = await Promise.all([
      query.limit(80),
      ContactMessage.query().count('* as total').first(),
      ContactMessage.query().where('status', 'new').count('* as total').first(),
      ContactMessage.query().where('status', 'reviewed').count('* as total').first(),
      ContactMessage.query().where('status', 'archived').count('* as total').first(),
    ])

    return inertia.render('admin/contact_messages', {
      messages: messages.map((message) => ({
        id: message.id,
        fullName: message.fullName,
        email: message.email,
        messagePreview: this.previewText(message.message),
        status: message.status,
        createdAt: message.createdAt?.toISO() ?? null,
      })),
      filters: { status },
      stats: {
        total: this.countValue(total),
        new: this.countValue(newMessages),
        reviewed: this.countValue(reviewed),
        archived: this.countValue(archived),
      },
    })
  }

  async contactMessageShow({ request, inertia }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminPanelIdParamsValidator)
    const message = await ContactMessage.findOrFail(id)

    return inertia.render('admin/contact_message_show', {
      message: {
        id: message.id,
        fullName: message.fullName,
        email: message.email,
        message: message.message,
        status: message.status,
        ipAddress: message.ipAddress,
        userAgent: message.userAgent,
        createdAt: message.createdAt?.toISO() ?? null,
      },
    })
  }

  async contactMessageUpdateStatus({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(adminPanelContactStatusValidator)
    const message = await ContactMessage.findOrFail(payload.params.id)
    message.status = payload.status
    await message.save()

    session.flash('success', 'Contact message updated.')
    return response.redirect(`/admin/contact-messages/${message.id}`)
  }

  private async paymentRevenue() {
    const [row] = await db.from('payments').sum('amount as amount').where('status', 'paid')
    return Number(row?.amount ?? 0).toFixed(3)
  }

  private async validatedReportRange(
    request: HttpContext['request']
  ): Promise<AdminPanelDateRange> {
    const payload = await request.validateUsing(adminReportRangeValidator)

    const from = payload.from
      ? DateTime.fromISO(payload.from, { zone: 'utc' }).startOf('day')
      : null
    const to = payload.to ? DateTime.fromISO(payload.to, { zone: 'utc' }).endOf('day') : null

    if ((from && !from.isValid) || (to && !to.isValid)) {
      throw new Exception('Invalid report date range.', { status: 422 })
    }

    if (from && to && from > to) {
      throw new Exception('Report start date must be before end date.', { status: 422 })
    }

    return { from, to }
  }

  private applyReportRange<T extends { where(column: string, operator: string, value: string): T }>(
    query: T,
    range: AdminPanelDateRange
  ) {
    if (range.from) {
      query.where('created_at', '>=', range.from.toSQL()!)
    }

    if (range.to) {
      query.where('created_at', '<=', range.to.toSQL()!)
    }

    return query
  }

  private async groupReportCount(
    table: string,
    column: string,
    range: AdminPanelDateRange,
    where?: Record<string, string>
  ) {
    const query = db.from(table).select(column).count('* as total').groupBy(column)
    if (where) {
      for (const [key, value] of Object.entries(where)) {
        query.where(key, value)
      }
    }
    this.applyReportRange(query, range)
    const rows = await query

    return rows.map((row) => ({
      key: String(row[column]),
      count: Number(row.total),
    }))
  }

  private async paymentRevenueByCurrency(range: AdminPanelDateRange) {
    const query = db
      .from('payments')
      .select('currency')
      .sum('amount as amount')
      .where('status', 'paid')
      .groupBy('currency')

    this.applyReportRange(query, range)
    const rows = await query

    return rows.map((row) => ({
      currency: String(row.currency),
      amount: Number(row.amount ?? 0).toFixed(3),
    }))
  }

  private async sessionCreditSum(
    column: 'reserved_credit_count' | 'refunded_credit_count',
    range: AdminPanelDateRange
  ) {
    const query = db.from('game_sessions').sum(`${column} as total`)
    this.applyReportRange(query, range)
    const [row] = await query

    return Number(row?.total ?? 0)
  }

  private async mostPlayedGames(range: AdminPanelDateRange) {
    const query = db
      .from('game_sessions')
      .join('games', 'games.id', 'game_sessions.game_id')
      .leftJoin('game_translations', (join) => {
        join.on('game_translations.game_id', 'games.id').andOnVal('game_translations.locale', 'ar')
      })
      .select('games.id')
      .select('games.slug')
      .select('game_translations.title')
      .count('game_sessions.id as session_count')
      .sum('game_sessions.completed_round_count as completed_round_count')
      .groupBy('games.id', 'games.slug', 'game_translations.title')
      .orderBy('session_count', 'desc')
      .limit(6)

    this.applyReportRange(query, range)
    const rows = await query

    return rows.map((row) => ({
      id: String(row.id),
      title: String(row.title ?? row.slug),
      sessionCount: Number(row.session_count ?? 0),
      completedRoundCount: Number(row.completed_round_count ?? 0),
    }))
  }

  private async creditTotalsByType(range: AdminPanelDateRange) {
    const query = db
      .from('credit_transactions')
      .select('type')
      .sum('amount as amount')
      .groupBy('type')

    this.applyReportRange(query, range)
    const rows = await query

    return rows.map((row) => ({
      type: String(row.type),
      amount: Number(row.amount ?? 0),
    }))
  }

  private countValue(row: { $extras?: { total?: string | number } } | null) {
    return Number(row?.$extras?.total ?? 0)
  }

  private indexNumberRows(rows: Record<string, unknown>[], keyColumn: string, valueColumn: string) {
    const output = new Map<string, number>()

    for (const row of rows) {
      const key = row[keyColumn]
      if (typeof key !== 'string') continue
      output.set(key, Number(row[valueColumn] ?? 0))
    }

    return output
  }

  private publishedAtFor(status: string, current: DateTime | null = null) {
    return status === 'published' ? (current ?? DateTime.utc()) : null
  }

  private previewText(value: string, limit = 180) {
    const normalized = value.replace(/\s+/g, ' ').trim()
    return normalized.length > limit ? `${normalized.slice(0, limit)}…` : normalized
  }

  private userTimeline(
    sessions: GameSession[],
    payments: Payment[],
    creditTransactions: CreditTransaction[]
  ) {
    return [
      ...sessions.map((session) => ({
        id: `session-${session.id}`,
        type: 'game_session',
        title: session.game.translations[0]?.title ?? session.game.slug,
        status: session.status,
        description: `${session.completedRoundCount}/${session.selectedRoundCount ?? '—'} rounds`,
        createdAt: session.createdAt?.toISO() ?? null,
      })),
      ...payments.map((payment) => ({
        id: `payment-${payment.id}`,
        type: 'payment',
        title: `${payment.amount} ${payment.currency}`,
        status: payment.status,
        description: `${payment.method} ${payment.payableType}`,
        createdAt: payment.createdAt?.toISO() ?? null,
      })),
      ...creditTransactions.map((transaction) => ({
        id: `credit-${transaction.id}`,
        type: 'credit_transaction',
        title: `${transaction.amount} ${transaction.currency}`,
        status: transaction.type,
        description: transaction.description ?? 'Credit transaction',
        createdAt: transaction.createdAt?.toISO() ?? null,
      })),
    ]
      .sort((left, right) =>
        String(right.createdAt ?? '').localeCompare(String(left.createdAt ?? ''))
      )
      .slice(0, 16)
  }

  private assertTeamBounds(minTeamCount: number, maxTeamCount: number) {
    if (minTeamCount > maxTeamCount) {
      throw new Exception('Minimum team count cannot exceed maximum team count.', { status: 422 })
    }
  }

  private async findGame(id: string) {
    return Game.query().where('id', id).preload('translations').firstOrFail()
  }

  private async findCategory(id: string) {
    return QuestionCategory.query().where('id', id).preload('translations').firstOrFail()
  }

  private async findQuestion(id: string) {
    return Question.query().where('id', id).preload('translations').firstOrFail()
  }

  private async findContentPage(id: string) {
    return ContentPage.query().where('id', id).preload('translations').firstOrFail()
  }

  private async findSubscription(id: string) {
    return SubscriptionPlan.query().where('id', id).preload('translations').firstOrFail()
  }

  private serializeGameForm(game: Game) {
    const translation = game.translations.find((item) => item.locale === 'ar')
    return {
      id: game.id,
      slug: game.slug,
      status: game.status,
      title: translation?.title ?? '',
      description: translation?.description ?? '',
      instructions: translation?.instructions ?? '',
      minTeamCount: game.minTeamCount,
      maxTeamCount: game.maxTeamCount,
      allowedRoundCounts: game.allowedRoundCounts,
      allowedQuestionDurations: game.allowedQuestionDurations,
      baseRoundCreditCost: game.baseRoundCreditCost,
      optionalCategoriesEnabled: game.optionalCategoriesEnabled,
    }
  }

  private serializeCategoryForm(category: QuestionCategory) {
    const translation = category.translations.find((item) => item.locale === 'ar')
    return {
      id: category.id,
      gameId: category.gameId,
      slug: category.slug,
      status: category.status,
      title: translation?.title ?? '',
      description: translation?.description ?? '',
      priceAmount: category.priceAmount,
      priceCurrency: category.priceCurrency,
    }
  }

  private serializeQuestionForm(question: Question) {
    const translation = question.translations.find((item) => item.locale === 'ar')
    return {
      id: question.id,
      gameId: question.gameId,
      questionCategoryId: question.questionCategoryId,
      status: question.status,
      type: question.type,
      contentMode: String(question.metadata.contentMode ?? 'text'),
      effectLogic: String(question.metadata.effectLogic ?? 'normal'),
      effectPoints:
        typeof question.metadata.effectPoints === 'number'
          ? question.metadata.effectPoints
          : null,
      funRuleId:
        typeof question.metadata.funRuleId === 'string' ? question.metadata.funRuleId : null,
      funRule: (question.metadata.funRule as Record<string, JSONDataTypes> | null) ?? null,
      mediaAssetId:
        typeof question.metadata.mediaAssetId === 'string' ? question.metadata.mediaAssetId : null,
      mediaUrl: typeof question.metadata.mediaUrl === 'string' ? question.metadata.mediaUrl : '',
      prompt: translation?.prompt ?? '',
      correctAnswer: translation?.correctAnswer ?? '',
      explanation: translation?.explanation ?? '',
      basePoints: question.basePoints,
      sortOrder: question.sortOrder,
      visibilityTimerEnabled: Boolean(question.metadata.visibilityTimerEnabled),
      visibilityTimerSeconds:
        typeof question.metadata.visibilityTimerSeconds === 'number'
          ? question.metadata.visibilityTimerSeconds
          : null,
    }
  }

  private serializeContentPageForm(page: ContentPage) {
    const translation = page.translations.find((item) => item.locale === 'ar')
    return {
      id: page.id,
      slug: page.slug,
      status: page.status,
      title: translation?.title ?? '',
      excerpt: translation?.excerpt ?? '',
      body: translation?.body ?? '',
    }
  }

  private serializeSubscriptionForm(plan: SubscriptionPlan) {
    const translation = plan.translations.find((item) => item.locale === 'ar')
    return {
      id: plan.id,
      slug: plan.slug,
      status: plan.status,
      title: translation?.title ?? '',
      priceAmount: plan.priceAmount,
      priceCurrency: plan.priceCurrency,
      roundsGranted: plan.roundsGranted,
      maxTeams: plan.maxTeams,
      isFeatured: plan.isFeatured,
      badgeLabel: plan.badgeLabel ?? '',
      ctaLabel: plan.ctaLabel ?? '',
      note: plan.note ?? '',
      advantages: plan.advantages ?? null,
    }
  }

  private async gameOptions() {
    const games = await Game.query()
      .preload('translations', (query) => query.where('locale', 'ar'))
      .orderBy('sort_order', 'asc')

    return games.map((game) => ({
      id: game.id,
      title: game.translations[0]?.title ?? game.slug,
    }))
  }

  private async categoryOptions() {
    const categories = await QuestionCategory.query()
      .preload('translations', (query) => query.where('locale', 'ar'))
      .orderBy('sort_order', 'asc')

    return categories.map((category) => ({
      id: category.id,
      gameId: category.gameId,
      title: category.translations[0]?.title ?? category.slug,
    }))
  }

  private async mediaAssetOptions() {
    const assets = await MediaAsset.query()
      .whereNull('deleted_at')
      .where('visibility', 'public')
      .orderBy('created_at', 'desc')
      .limit(24)

    return assets.map((asset) => this.serializePanelMediaAsset(asset))
  }

  private serializePanelMediaAsset(asset: MediaAsset) {
    const serialized = serializeMediaAsset(asset)

    return {
      id: serialized.id,
      visibility: serialized.visibility,
      originalName: serialized.originalName,
      mimeType: serialized.mimeType,
      extension: serialized.extension,
      sizeBytes: serialized.sizeBytes,
      url: serialized.url,
      createdAt: serialized.createdAt,
    }
  }

  private async syncGameArabicTranslation(
    gameId: string,
    payload: { title: string; description?: string | null; instructions?: string | null },
    trx: TransactionClientContract
  ) {
    const translation =
      (await GameTranslation.query({ client: trx })
        .where('game_id', gameId)
        .where('locale', 'ar')
        .first()) ?? new GameTranslation()
    translation.useTransaction(trx)
    translation.merge({
      gameId,
      locale: 'ar',
      title: payload.title,
      description: payload.description ?? null,
      instructions: payload.instructions ?? null,
      metadata: {},
    })
    await translation.save()
  }

  private async syncCategoryArabicTranslation(
    questionCategoryId: string,
    payload: { title: string; description?: string | null },
    trx: TransactionClientContract
  ) {
    const translation =
      (await QuestionCategoryTranslation.query({ client: trx })
        .where('question_category_id', questionCategoryId)
        .where('locale', 'ar')
        .first()) ?? new QuestionCategoryTranslation()
    translation.useTransaction(trx)
    translation.merge({
      questionCategoryId,
      locale: 'ar',
      title: payload.title,
      description: payload.description ?? null,
      metadata: {},
    })
    await translation.save()
  }

  private async syncQuestionArabicTranslation(
    questionId: string,
    payload: { prompt: string; correctAnswer?: string | null; explanation?: string | null },
    trx: TransactionClientContract
  ) {
    const translation =
      (await QuestionTranslation.query({ client: trx })
        .where('question_id', questionId)
        .where('locale', 'ar')
        .first()) ?? new QuestionTranslation()
    translation.useTransaction(trx)
    translation.merge({
      questionId,
      locale: 'ar',
      prompt: payload.prompt,
      correctAnswer: payload.correctAnswer ?? null,
      explanation: payload.explanation ?? null,
      metadata: {},
    })
    await translation.save()
  }

  private async syncContentPageArabicTranslation(
    contentPageId: string,
    payload: { title: string; excerpt?: string | null; body: string },
    trx: TransactionClientContract
  ) {
    const translation =
      (await ContentPageTranslation.query({ client: trx })
        .where('content_page_id', contentPageId)
        .where('locale', 'ar')
        .first()) ?? new ContentPageTranslation()
    translation.useTransaction(trx)
    translation.merge({
      contentPageId,
      locale: 'ar',
      title: payload.title,
      excerpt: payload.excerpt ?? null,
      body: payload.body,
      metadata: {},
    })
    await translation.save()
  }

  private async assertGameExists(gameId: string, trx: TransactionClientContract) {
    const game = await Game.query({ client: trx }).where('id', gameId).first()
    if (!game) throw new Exception('Game was not found.', { status: 404 })
  }

  private async assertCategoryBelongsToGame(
    categoryId: string | null,
    gameId: string,
    trx: TransactionClientContract
  ) {
    if (!categoryId) return
    const category = await QuestionCategory.query({ client: trx })
      .where('id', categoryId)
      .where('game_id', gameId)
      .first()
    if (!category)
      throw new Exception('Category does not belong to the selected game.', { status: 422 })
  }

  private async assertMediaAssetExists(
    mediaAssetId: string | null,
    trx: TransactionClientContract
  ) {
    if (!mediaAssetId) return
    const mediaAsset = await MediaAsset.query({ client: trx })
      .where('id', mediaAssetId)
      .whereNull('deleted_at')
      .first()
    if (!mediaAsset) throw new Exception('Media asset was not found.', { status: 422 })
  }

  private async assertGameSlug(
    slug: string,
    ignoreId: string | undefined,
    trx: TransactionClientContract
  ) {
    const query = Game.query({ client: trx }).where('slug', slug)
    if (ignoreId) query.whereNot('id', ignoreId)
    if (await query.first()) throw new Exception('Game slug is already used.', { status: 409 })
  }

  private async assertCategorySlug(
    gameId: string,
    slug: string,
    ignoreId: string | undefined,
    trx: TransactionClientContract
  ) {
    const query = QuestionCategory.query({ client: trx })
      .where('game_id', gameId)
      .where('slug', slug)
    if (ignoreId) query.whereNot('id', ignoreId)
    if (await query.first()) throw new Exception('Category slug is already used.', { status: 409 })
  }

  private async assertContentPageSlug(
    slug: string,
    ignoreId: string | undefined,
    trx: TransactionClientContract
  ) {
    const query = ContentPage.query({ client: trx }).where('slug', slug)
    if (ignoreId) query.whereNot('id', ignoreId)
    if (await query.first())
      throw new Exception('Content page slug is already used.', { status: 409 })
  }

  private async assertSubscriptionSlug(
    slug: string,
    ignoreId: string | undefined,
    trx: TransactionClientContract
  ) {
    const query = SubscriptionPlan.query({ client: trx }).where('slug', slug)
    if (ignoreId) query.whereNot('id', ignoreId)
    if (await query.first())
      throw new Exception('Subscription plan slug is already used.', { status: 409 })
  }

  private async syncSubscriptionArabicTranslation(
    subscriptionPlanId: string,
    payload: { title: string; description?: string | null },
    trx: TransactionClientContract
  ) {
    const translation =
      (await SubscriptionPlanTranslation.query({ client: trx })
        .where('subscription_plan_id', subscriptionPlanId)
        .where('locale', 'ar')
        .first()) ?? new SubscriptionPlanTranslation()
    translation.useTransaction(trx)
    translation.merge({
      subscriptionPlanId,
      locale: 'ar',
      title: payload.title,
      description: payload.description ?? null,
      metadata: {},
    })
    await translation.save()
  }

  private async funRuleOptions() {
    const rules = await FunRule.query()
      .where('is_active', true)
      .orderBy('sort_order', 'asc')
      .orderBy('code', 'asc')
    return rules.map((rule) => ({
      id: rule.id,
      code: rule.code,
      nameAr: rule.nameAr,
      nameEn: rule.nameEn,
      descriptionAr: rule.descriptionAr,
      descriptionEn: rule.descriptionEn,
      effectType: rule.effectType,
      config: rule.config as Record<string, JSONDataTypes>,
    }))
  }

  private async resolveFunRuleSnapshot(
    funRuleIdOrCode?: string | null,
    fallbackEffectLogic?: string | null
  ) {
    let resolvedEffectLogic = fallbackEffectLogic || 'normal'
    let funRuleSnapshot: Record<string, unknown> | null = null
    let funRuleId: string | null = null

    const query = FunRule.query()
    if (funRuleIdOrCode) {
      query.where('id', funRuleIdOrCode).orWhere('code', funRuleIdOrCode)
    } else if (fallbackEffectLogic) {
      query.where('code', fallbackEffectLogic)
    }

    const funRule = await query.first()

    if (funRule) {
      funRuleId = funRule.id
      resolvedEffectLogic = funRule.effectType
      funRuleSnapshot = {
        id: funRule.id,
        code: funRule.code,
        nameAr: funRule.nameAr,
        nameEn: funRule.nameEn,
        descriptionAr: funRule.descriptionAr,
        descriptionEn: funRule.descriptionEn,
        effectType: funRule.effectType,
        config: funRule.config,
        snapshottedAt: new Date().toISOString(),
      }
    }

    return { funRuleId, resolvedEffectLogic, funRuleSnapshot }
  }
}
