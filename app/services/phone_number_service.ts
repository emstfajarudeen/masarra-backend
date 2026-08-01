import { Exception } from '@adonisjs/core/exceptions'

const KUWAIT_LOCAL_PHONE_REGEX = /^[569]\d{7}$/
const KUWAIT_E164_PHONE_REGEX = /^\+965[569]\d{7}$/

export function normalizeKuwaitPhoneNumber(value: string) {
  const digitsOrPlus = value.trim().replace(/[^\d+]/g, '')
  const localNumber = digitsOrPlus.startsWith('+965')
    ? digitsOrPlus.slice(4)
    : digitsOrPlus.startsWith('965') && digitsOrPlus.length === 11
      ? digitsOrPlus.slice(3)
      : digitsOrPlus

  const normalized = `+965${localNumber}`

  if (!KUWAIT_E164_PHONE_REGEX.test(normalized) || !KUWAIT_LOCAL_PHONE_REGEX.test(localNumber)) {
    throw new Exception('Phone number must be a valid Kuwait mobile number.', {
      status: 422,
      code: 'INVALID_PHONE_NUMBER',
    })
  }

  return normalized
}

export function maskPhoneNumber(phoneNumber: string) {
  return `${phoneNumber.slice(0, 6)}***${phoneNumber.slice(-2)}`
}
