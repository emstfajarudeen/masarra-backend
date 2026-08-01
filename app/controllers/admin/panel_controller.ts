import ContactMessage from '#models/contact_message'
import ContentPage from '#models/content_page'
import ContentPageTranslation from '#models/content_page_translation'
import Game from '#models/game'
import GameSession from '#models/game_session'
import GameTranslation from '#models/game_translation'
import MediaAsset from '#models/media_asset'
import Question from '#models/question'
import QuestionCategory from '#models/question_category'
import QuestionCategoryTranslation from '#models/question_category_translation'
import QuestionTranslation from '#models/question_translation'
import User from '#models/user'
import {
  adminPanelCategoryFormValidator,
  adminPanelContactStatusValidator,
  adminPanelContentPageFormValidator,
  adminPanelCategoryListFilterValidator,
  adminPanelContactMessageListFilterValidator,
  adminPanelContentPageListFilterValidator,
  adminPanelGameFormValidator,
  adminPanelGameListFilterValidator,
  adminPanelIdParamsValidator,
  adminPanelMediaLibraryFilterValidator,
  adminPanelQuestionListFilterValidator,
  adminPanelQuestionFormValidator,
} from '#validators/admin_panel_forms'
import { serializeMediaAsset } from '#transformers/media_asset_transformer'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

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
      User.query().count('* as total').first(),
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
    const enabled = filters.enabled ?? 'all'

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

    if (enabled !== 'all') {
      query.where('is_enabled', enabled === 'yes')
    }

    const [categories, total, published, enabledCount, paid] = await Promise.all([
      query.limit(80),
      QuestionCategory.query().count('* as total').first(),
      QuestionCategory.query().where('status', 'published').count('* as total').first(),
      QuestionCategory.query().where('is_enabled', true).count('* as total').first(),
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
        isEnabled: category.isEnabled,
        priceAmount: category.priceAmount,
        priceCurrency: category.priceCurrency,
        createdAt: category.createdAt?.toISO() ?? null,
      })),
      filters: {
        gameId: filters.gameId ?? '',
        status,
        enabled,
      },
      stats: {
        total: this.countValue(total),
        published: this.countValue(published),
        enabled: this.countValue(enabledCount),
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
        isEnabled: payload.isEnabled,
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
        isEnabled: payload.isEnabled,
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

  async questionCreate({ inertia }: HttpContext) {
    return inertia.render('admin/question_form', {
      mode: 'create',
      question: null,
      games: await this.gameOptions(),
      categories: await this.categoryOptions(),
      mediaAssets: await this.mediaAssetOptions(),
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
        metadata: {
          contentMode: payload.contentMode,
          effectLogic: payload.effectLogic,
          mediaAssetId: payload.mediaAssetId ?? null,
          mediaUrl: payload.mediaUrl ?? null,
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
        metadata: {
          contentMode: payload.contentMode,
          effectLogic: payload.effectLogic,
          mediaAssetId: payload.mediaAssetId ?? null,
          mediaUrl: payload.mediaUrl ?? null,
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

  private countValue(row: { $extras?: { total?: string | number } } | null) {
    return Number(row?.$extras?.total ?? 0)
  }

  private publishedAtFor(status: string, current: DateTime | null = null) {
    return status === 'published' ? (current ?? DateTime.utc()) : null
  }

  private previewText(value: string, limit = 180) {
    const normalized = value.replace(/\s+/g, ' ').trim()
    return normalized.length > limit ? `${normalized.slice(0, limit)}…` : normalized
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
      isEnabled: category.isEnabled,
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
      mediaAssetId:
        typeof question.metadata.mediaAssetId === 'string' ? question.metadata.mediaAssetId : null,
      mediaUrl: typeof question.metadata.mediaUrl === 'string' ? question.metadata.mediaUrl : '',
      prompt: translation?.prompt ?? '',
      correctAnswer: translation?.correctAnswer ?? '',
      explanation: translation?.explanation ?? '',
      basePoints: question.basePoints,
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
}
