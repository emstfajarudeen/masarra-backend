import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Adds a correlation ID to every response and emits one structured access log.
 * Request bodies are intentionally excluded to avoid logging credentials or PII.
 */
export default class RequestContextMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const startedAt = performance.now()
    const requestId = ctx.request.id()

    if (requestId) {
      ctx.response.header('X-Request-Id', requestId)
    }

    try {
      await next()
    } finally {
      ctx.logger.info(
        {
          durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
          method: ctx.request.method(),
          requestId,
          statusCode: ctx.response.getStatus(),
          url: ctx.request.url(),
        },
        'HTTP request completed'
      )
    }
  }
}
