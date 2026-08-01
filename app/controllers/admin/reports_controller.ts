import { apiSuccess } from '#http/api_response'
import ContactMessage from '#models/contact_message'
import Game from '#models/game'
import GameSession from '#models/game_session'
import Payment from '#models/payment'
import Question from '#models/question'
import QuestionCategory from '#models/question_category'
import User from '#models/user'
import { adminReportRangeValidator } from '#validators/admin_reports'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

interface DateRange {
  from: DateTime | null
  to: DateTime | null
}

export default class AdminReportsController {
  async summary({ request, response }: HttpContext) {
    const range = await this.validatedRange(request)

    const [
      totalUsers,
      activeUsers,
      totalGames,
      publishedGames,
      totalCategories,
      enabledCategories,
      totalQuestions,
      publishedQuestions,
      totalSessions,
      completedSessions,
      activeSessions,
      paidPayments,
      paymentRevenue,
      newContactMessages,
    ] = await Promise.all([
      User.query().count('* as total').first(),
      User.query().where('status', 'active').count('* as total').first(),
      Game.query().count('* as total').first(),
      Game.query().where('status', 'published').count('* as total').first(),
      QuestionCategory.query().count('* as total').first(),
      QuestionCategory.query().where('is_enabled', true).count('* as total').first(),
      Question.query().count('* as total').first(),
      Question.query().where('status', 'published').count('* as total').first(),
      this.applyRange(GameSession.query(), range).count('* as total').first(),
      this.applyRange(GameSession.query().where('status', 'completed'), range)
        .count('* as total')
        .first(),
      GameSession.query().where('status', 'active').count('* as total').first(),
      this.applyRange(Payment.query().where('status', 'paid'), range).count('* as total').first(),
      this.paymentRevenue(range),
      ContactMessage.query().where('status', 'new').count('* as total').first(),
    ])

    return response.ok(
      apiSuccess(
        {
          users: {
            total: this.countValue(totalUsers),
            active: this.countValue(activeUsers),
          },
          catalog: {
            games: {
              total: this.countValue(totalGames),
              published: this.countValue(publishedGames),
            },
            categories: {
              total: this.countValue(totalCategories),
              enabled: this.countValue(enabledCategories),
            },
            questions: {
              total: this.countValue(totalQuestions),
              published: this.countValue(publishedQuestions),
            },
          },
          sessions: {
            total: this.countValue(totalSessions),
            completed: this.countValue(completedSessions),
            active: this.countValue(activeSessions),
          },
          payments: {
            paidCount: this.countValue(paidPayments),
            revenue: paymentRevenue,
          },
          contactMessages: {
            new: this.countValue(newContactMessages),
          },
          range: this.serializeRange(range),
        },
        {
          code: 'ADMIN_DASHBOARD_SUMMARY',
          message: 'Admin dashboard summary retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async payments({ request, response }: HttpContext) {
    const range = await this.validatedRange(request)

    const [byStatus, byMethod, revenue] = await Promise.all([
      this.groupCount('payments', 'status', range),
      this.groupCount('payments', 'method', range),
      this.paymentRevenue(range),
    ])

    return response.ok(
      apiSuccess(
        {
          byStatus,
          byMethod,
          revenue,
          range: this.serializeRange(range),
        },
        {
          code: 'ADMIN_PAYMENT_REPORT',
          message: 'Admin payment report retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async gameSessions({ request, response }: HttpContext) {
    const range = await this.validatedRange(request)

    const [byStatus, roundTotals, mostPlayedGames] = await Promise.all([
      this.groupCount('game_sessions', 'status', range),
      this.roundTotals(range),
      this.mostPlayedGames(range),
    ])

    return response.ok(
      apiSuccess(
        {
          byStatus,
          roundTotals,
          mostPlayedGames,
          range: this.serializeRange(range),
        },
        {
          code: 'ADMIN_GAME_SESSION_REPORT',
          message: 'Admin game session report retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async users({ request, response }: HttpContext) {
    const range = await this.validatedRange(request)

    const [byStatus, byRole, registeredCount] = await Promise.all([
      this.groupCount('users', 'status', range),
      this.groupCount('users', 'role', range),
      this.applyRange(User.query(), range).count('* as total').first(),
    ])

    return response.ok(
      apiSuccess(
        {
          registeredCount: this.countValue(registeredCount),
          byStatus,
          byRole,
          range: this.serializeRange(range),
        },
        {
          code: 'ADMIN_USER_REPORT',
          message: 'Admin user report retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async contactMessages({ request, response }: HttpContext) {
    const range = await this.validatedRange(request)
    const byStatus = await this.groupCount('contact_messages', 'status', range)

    return response.ok(
      apiSuccess(
        {
          byStatus,
          range: this.serializeRange(range),
        },
        {
          code: 'ADMIN_CONTACT_MESSAGE_REPORT',
          message: 'Admin contact message report retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  private async validatedRange(request: HttpContext['request']): Promise<DateRange> {
    const payload = await request.validateUsing(adminReportRangeValidator)

    const from = payload.from
      ? DateTime.fromISO(payload.from, { zone: 'utc' }).startOf('day')
      : null
    const to = payload.to ? DateTime.fromISO(payload.to, { zone: 'utc' }).endOf('day') : null

    if ((from && !from.isValid) || (to && !to.isValid)) {
      throw new Exception('Invalid report date range.', {
        status: 422,
        code: 'INVALID_REPORT_DATE_RANGE',
      })
    }

    if (from && to && from > to) {
      throw new Exception('Report start date must be before end date.', {
        status: 422,
        code: 'INVALID_REPORT_DATE_RANGE',
      })
    }

    return { from, to }
  }

  private applyRange<T extends { where(column: string, operator: string, value: string): T }>(
    query: T,
    range: DateRange
  ) {
    if (range.from) {
      query.where('created_at', '>=', range.from.toSQL()!)
    }

    if (range.to) {
      query.where('created_at', '<=', range.to.toSQL()!)
    }

    return query
  }

  private async groupCount(table: string, column: string, range: DateRange) {
    const query = db.from(table).select(column).count('* as total').groupBy(column)

    this.applyRange(query, range)

    const rows = await query

    return rows.map((row) => ({
      key: String(row[column]),
      count: Number(row.total),
    }))
  }

  private async paymentRevenue(range: DateRange) {
    const query = db
      .from('payments')
      .select('currency')
      .sum('amount as amount')
      .where('status', 'paid')
      .groupBy('currency')

    this.applyRange(query, range)

    const rows = await query

    return rows.map((row) => ({
      currency: String(row.currency),
      amount: Number(row.amount ?? 0).toFixed(3),
    }))
  }

  private async roundTotals(range: DateRange) {
    const query = db
      .from('game_sessions')
      .sum('selected_round_count as selected')
      .sum('completed_round_count as completed')
      .sum('reserved_credit_count as reservedCredits')
      .sum('refunded_credit_count as refundedCredits')

    this.applyRange(query, range)

    const [row] = await query

    return {
      selected: Number(row?.selected ?? 0),
      completed: Number(row?.completed ?? 0),
      reservedCredits: Number(row?.reservedCredits ?? 0),
      refundedCredits: Number(row?.refundedCredits ?? 0),
    }
  }

  private async mostPlayedGames(range: DateRange) {
    const query = db
      .from('game_sessions')
      .join('games', 'games.id', 'game_sessions.game_id')
      .select('games.id', 'games.slug')
      .count('* as sessionCount')
      .groupBy('games.id', 'games.slug')
      .orderBy('sessionCount', 'desc')
      .limit(10)

    this.applyRange(query, range)

    const rows = await query

    return rows.map((row) => ({
      id: String(row.id),
      slug: String(row.slug),
      sessionCount: Number(row.sessionCount),
    }))
  }

  private countValue(row: { $extras?: { total?: string | number } } | null) {
    return Number(row?.$extras?.total ?? 0)
  }

  private serializeRange(range: DateRange) {
    return {
      from: range.from?.toISODate() ?? null,
      to: range.to?.toISODate() ?? null,
    }
  }
}
