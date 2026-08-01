import type Game from '#models/game'
import type GameTranslation from '#models/game_translation'
import type QuestionCategory from '#models/question_category'
import type QuestionCategoryTranslation from '#models/question_category_translation'

export interface MasterGameDto {
  slug: string
  title: string
  description: string | null
  setup: {
    minTeamCount: number
    maxTeamCount: number
    allowedRoundCounts: number[]
    allowedQuestionDurations: number[]
    baseRoundCreditCost: number
    optionalCategoriesEnabled: boolean
  }
  instructions: string | null
  categories: MasterQuestionCategoryDto[]
  locale: string
  metadata: Record<string, unknown>
}

export interface MasterQuestionCategoryDto {
  slug: string
  title: string
  description: string | null
  price: {
    amount: string | null
    currency: string
  }
  locale: string
  metadata: Record<string, unknown>
}

export function serializeMasterGame(
  game: Game,
  translation: GameTranslation,
  categories: MasterQuestionCategoryDto[] = []
): MasterGameDto {
  return {
    slug: game.slug,
    title: translation.title,
    description: translation.description,
    setup: {
      minTeamCount: game.minTeamCount,
      maxTeamCount: game.maxTeamCount,
      allowedRoundCounts: game.allowedRoundCounts,
      allowedQuestionDurations: game.allowedQuestionDurations,
      baseRoundCreditCost: game.baseRoundCreditCost,
      optionalCategoriesEnabled: game.optionalCategoriesEnabled,
    },
    instructions: translation.instructions,
    categories,
    locale: translation.locale,
    metadata: translation.metadata,
  }
}

export function serializeMasterQuestionCategory(
  category: QuestionCategory,
  translation: QuestionCategoryTranslation
): MasterQuestionCategoryDto {
  return {
    slug: category.slug,
    title: translation.title,
    description: translation.description,
    price: {
      amount: category.priceAmount,
      currency: category.priceCurrency,
    },
    locale: translation.locale,
    metadata: translation.metadata,
  }
}
