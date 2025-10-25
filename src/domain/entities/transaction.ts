import { v4 as uuidv4 } from 'uuid';
import { Money } from '../valueObjects/money';

/**
 * Transaction Types
 */
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER'
}

/**
 * Transaction Statuses
 */
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * Transaction Entity
 * Represents a financial transaction between accounts
 */
export class Transaction {
  private _id: string;
  private _type: TransactionType;
  private _amount: Money;
  private _fromAccountId: string | null;
  private _toAccountId: string | null;
  private _description: string;
  private _status: TransactionStatus;
  private _createdAt: Date;

  constructor(
    type: TransactionType,
    amount: Money,
    fromAccountId: string | null,
    toAccountId: string | null,
    description: string,
    status: TransactionStatus = TransactionStatus.PENDING,
    id?: string,
    createdAt?: Date
  ) {
    this._id = id || uuidv4();
    this._type = type;
    this._amount = amount;
    this._fromAccountId = fromAccountId;
    this._toAccountId = toAccountId;
    this._description = description;
    this._status = status;
    this._createdAt = createdAt || new Date();

    this.validateTransaction();
  }

  private validateTransaction(): void {
    if (this._amount.value <= 0) {
      throw new Error('Transaction amount must be positive');
    }

    switch (this._type) {
      case TransactionType.DEPOSIT:
        if (!this._toAccountId) {
          throw new Error('Deposit transaction must have a target account');
        }
        if (this._fromAccountId) {
          throw new Error('Deposit transaction should not have a source account');
        }
        break;
      case TransactionType.WITHDRAWAL:
        if (!this._fromAccountId) {
          throw new Error('Withdrawal transaction must have a source account');
        }
        if (this._toAccountId) {
          throw new Error('Withdrawal transaction should not have a target account');
        }
        break;
      case TransactionType.TRANSFER:
        if (!this._fromAccountId || !this._toAccountId) {
          throw new Error('Transfer transaction must have both source and target accounts');
        }
        if (this._fromAccountId === this._toAccountId) {
          throw new Error('Transfer source and target accounts cannot be the same');
        }
        break;
      default:
        throw new Error('Invalid transaction type');
    }
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get type(): TransactionType {
    return this._type;
  }

  get amount(): Money {
    return this._amount;
  }

  get fromAccountId(): string | null {
    return this._fromAccountId;
  }

  get toAccountId(): string | null {
    return this._toAccountId;
  }

  get description(): string {
    return this._description;
  }

  get status(): TransactionStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Methods
  complete(): void {
    this._status = TransactionStatus.COMPLETED;
  }

  fail(): void {
    this._status = TransactionStatus.FAILED;
  }

  toString(): string {
    return `Transaction(id=${this._id}, type=${this._type}, amount=${this._amount.value}, status=${this._status})`;
  }
}