export interface ApiMeta {
  requestId?: string
  [key: string]: unknown
}

export interface ApiSuccess<T> {
  success: true
  code: string
  message: string
  data: T
  meta?: ApiMeta
}

export interface ApiFailure {
  success: false
  code: string
  message: string
  errors?: unknown
  meta?: ApiMeta
}

interface SuccessOptions {
  code: string
  message: string
  meta?: ApiMeta
}

interface FailureOptions {
  code: string
  message: string
  errors?: unknown
  meta?: ApiMeta
}

export function apiSuccess<T>(data: T, options: SuccessOptions): ApiSuccess<T> {
  return {
    success: true,
    code: options.code,
    message: options.message,
    data,
    ...(options.meta && { meta: options.meta }),
  }
}

export function apiFailure(options: FailureOptions): ApiFailure {
  return {
    success: false,
    code: options.code,
    message: options.message,
    ...(options.errors !== undefined && { errors: options.errors }),
    ...(options.meta && { meta: options.meta }),
  }
}
