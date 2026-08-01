import { apiFailure } from '#http/api_response'
import app from '@adonisjs/core/services/app'
import { type HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'
import { errors as limiterErrors } from '@adonisjs/limiter'
import { errors as vineErrors } from '@vinejs/vine'

interface HttpLikeError {
  code?: string
  message?: string
  status?: number
}

const STATUS_CODES: Record<number, { code: string; message: string }> = {
  400: { code: 'BAD_REQUEST', message: 'The request is invalid.' },
  401: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' },
  403: { code: 'FORBIDDEN', message: 'You are not allowed to perform this action.' },
  404: { code: 'NOT_FOUND', message: 'The requested resource was not found.' },
  409: { code: 'CONFLICT', message: 'The request conflicts with the current state.' },
  422: { code: 'UNPROCESSABLE_ENTITY', message: 'The request could not be processed.' },
  429: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' },
  500: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' },
}

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (_, { inertia }) => inertia.render('errors/not_found', {}),
    '500..599': (_, { inertia }) => inertia.render('errors/server_error', {}),
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    if (!this.expectsApiResponse(ctx)) {
      return super.handle(error, ctx)
    }

    const requestId = ctx.request.id()

    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response.unprocessableEntity(
        apiFailure({
          code: 'VALIDATION_ERROR',
          message: 'One or more fields failed validation.',
          errors: error.messages,
          meta: { requestId },
        })
      )
    }

    if (error instanceof limiterErrors.E_TOO_MANY_REQUESTS) {
      const headers = error.getDefaultHeaders()
      for (const [name, value] of Object.entries(headers)) {
        ctx.response.header(name, value)
      }

      return ctx.response.status(error.status).send(
        apiFailure({
          ...STATUS_CODES[429],
          meta: { requestId },
        })
      )
    }

    const normalizedError = this.normalizeError(error)
    const responseDefinition = STATUS_CODES[normalizedError.status] ?? {
      code: normalizedError.code ?? `HTTP_${normalizedError.status}`,
      message: normalizedError.message ?? 'The request failed.',
    }

    return ctx.response.status(normalizedError.status).send(
      apiFailure({
        code: responseDefinition.code,
        message:
          normalizedError.status >= 500
            ? STATUS_CODES[500].message
            : normalizedError.message || responseDefinition.message,
        meta: { requestId },
      })
    )
  }

  private expectsApiResponse(ctx: HttpContext) {
    return ctx.request.url().startsWith('/api/') || ctx.request.accepts(['json', 'html']) === 'json'
  }

  private normalizeError(error: unknown): Required<Pick<HttpLikeError, 'status'>> & HttpLikeError {
    if (!error || typeof error !== 'object') {
      return { status: 500 }
    }

    const httpError = error as HttpLikeError

    if (httpError.code === '23505') {
      return { ...httpError, status: 409 }
    }

    const status =
      typeof httpError.status === 'number' && httpError.status >= 400 && httpError.status <= 599
        ? httpError.status
        : 500

    return { ...httpError, status }
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
