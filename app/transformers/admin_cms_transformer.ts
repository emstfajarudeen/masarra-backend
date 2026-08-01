import type ContactMessage from '#models/contact_message'
import type ContentPage from '#models/content_page'
import type Game from '#models/game'
import type Question from '#models/question'
import type QuestionCategory from '#models/question_category'

function serializeDate(value: { toISO(): string | null } | null | undefined) {
  return value?.toISO() ?? null
}

function serializeTranslations<
  T extends { serialize(): Record<string, unknown>; metadata: Record<string, unknown> },
>(translations: T[]) {
  return translations.map((translation) => ({
    ...translation.serialize(),
    metadata: translation.metadata,
  }))
}

export function serializeAdminGame(game: Game) {
  return {
    id: game.id,
    slug: game.slug,
    status: game.status,
    minTeamCount: game.minTeamCount,
    maxTeamCount: game.maxTeamCount,
    allowedRoundCounts: game.allowedRoundCounts,
    allowedQuestionDurations: game.allowedQuestionDurations,
    baseRoundCreditCost: game.baseRoundCreditCost,
    optionalCategoriesEnabled: game.optionalCategoriesEnabled,
    sortOrder: game.sortOrder,
    publishedAt: serializeDate(game.publishedAt),
    createdAt: serializeDate(game.createdAt),
    updatedAt: serializeDate(game.updatedAt),
    translations: game.$preloaded.translations ? serializeTranslations(game.translations) : [],
  }
}

export function serializeAdminQuestionCategory(category: QuestionCategory) {
  return {
    id: category.id,
    gameId: category.gameId,
    slug: category.slug,
    status: category.status,
    isEnabled: category.isEnabled,
    priceAmount: category.priceAmount,
    priceCurrency: category.priceCurrency,
    sortOrder: category.sortOrder,
    publishedAt: serializeDate(category.publishedAt),
    createdAt: serializeDate(category.createdAt),
    updatedAt: serializeDate(category.updatedAt),
    translations: category.$preloaded.translations
      ? serializeTranslations(category.translations)
      : [],
  }
}

export function serializeAdminQuestion(question: Question) {
  return {
    id: question.id,
    gameId: question.gameId,
    questionCategoryId: question.questionCategoryId,
    status: question.status,
    type: question.type,
    basePoints: question.basePoints,
    sortOrder: question.sortOrder,
    metadata: question.metadata,
    publishedAt: serializeDate(question.publishedAt),
    createdAt: serializeDate(question.createdAt),
    updatedAt: serializeDate(question.updatedAt),
    translations: question.$preloaded.translations
      ? question.translations.map((translation) => ({
          id: translation.id,
          questionId: translation.questionId,
          locale: translation.locale,
          prompt: translation.prompt,
          correctAnswer: translation.correctAnswer,
          explanation: translation.explanation,
          metadata: translation.metadata,
          createdAt: serializeDate(translation.createdAt),
          updatedAt: serializeDate(translation.updatedAt),
        }))
      : [],
  }
}

export function serializeAdminContentPage(page: ContentPage) {
  return {
    id: page.id,
    slug: page.slug,
    status: page.status,
    sortOrder: page.sortOrder,
    publishedAt: serializeDate(page.publishedAt),
    createdAt: serializeDate(page.createdAt),
    updatedAt: serializeDate(page.updatedAt),
    translations: page.$preloaded.translations ? serializeTranslations(page.translations) : [],
  }
}

export function serializeAdminContactMessage(message: ContactMessage) {
  return {
    id: message.id,
    fullName: message.fullName,
    email: message.email,
    message: message.message,
    status: message.status,
    ipAddress: message.ipAddress,
    userAgent: message.userAgent,
    createdAt: serializeDate(message.createdAt),
    updatedAt: serializeDate(message.updatedAt),
  }
}
