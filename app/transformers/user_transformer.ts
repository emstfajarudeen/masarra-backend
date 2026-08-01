import type User from '#models/user'

export interface UserDto {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string
  status: string
  preferredLocale: string
  phoneVerified: boolean
  emailVerified: boolean
  createdAt: string | null
}

export function serializeUser(user: User): UserDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    status: user.status,
    preferredLocale: user.preferredLocale,
    phoneVerified: user.phoneVerifiedAt !== null,
    emailVerified: user.emailVerifiedAt !== null,
    createdAt: user.createdAt?.toISO() ?? null,
  }
}
