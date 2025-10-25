import { TransactionType, TransactionStatus } from '../../domain/entities/transaction';

/**
 * Transaction Data Transfer Object
 * Used for transferring transaction data between layers
 */
export interface TransactionDto {
  id: string;
  type: TransactionType;
  amount: number;
  fromAccountId: string | null;
  toAccountId: string | null;
  description: string;
  status: TransactionStatus;
  createdAt: Date;
}