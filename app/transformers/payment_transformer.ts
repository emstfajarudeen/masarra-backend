import type Payment from '#models/payment'

export interface PaymentDto {
  id: string
  payableType: string
  method: string
  status: string
  amount: string
  currency: string
  provider: string | null
  providerReference: string | null
  expiresAt: string | null
  paidAt: string | null
  createdAt: string | null
}

export function serializePayment(payment: Payment): PaymentDto {
  return {
    id: payment.id,
    payableType: payment.payableType,
    method: payment.method,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    provider: payment.provider,
    providerReference: payment.providerReference,
    expiresAt: payment.expiresAt?.toISO() ?? null,
    paidAt: payment.paidAt?.toISO() ?? null,
    createdAt: payment.createdAt?.toISO() ?? null,
  }
}
