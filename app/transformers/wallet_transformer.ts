import type CreditTransaction from '#models/credit_transaction'

export interface WalletDto {
  balance: number
  currency: string
  transactions: CreditTransactionDto[]
}

export interface CreditTransactionDto {
  id: string
  type: string
  amount: number
  currency: string
  description: string | null
  gameSessionId: string | null
  createdAt: string | null
}

export function serializeWallet(balance: number, transactions: CreditTransaction[]): WalletDto {
  return {
    balance,
    currency: 'round_credit',
    transactions: transactions.map(serializeCreditTransaction),
  }
}

export function serializeCreditTransaction(transaction: CreditTransaction): CreditTransactionDto {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    currency: transaction.currency,
    description: transaction.description,
    gameSessionId: transaction.gameSessionId,
    createdAt: transaction.createdAt?.toISO() ?? null,
  }
}
