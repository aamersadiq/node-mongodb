import { v4 as uuidv4 } from 'uuid';
import { Money } from '../valueObjects/money';

/**
 * Account Entity
 * Represents a bank account with methods for deposits and withdrawals
 */
export class Account {
  private _id: string;
  private _name: string;
  private _balance: Money;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    name: string,
    balance: Money = new Money(0),
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this._id = id || uuidv4();
    this._name = name;
    this._balance = balance;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get balance(): Money {
    return this._balance;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Methods
  deposit(amount: Money): void {
    if (amount.value <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this._balance = this._balance.add(amount);
    this._updatedAt = new Date();
  }

  withdraw(amount: Money): void {
    if (amount.value <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (this._balance.value < amount.value) {
      throw new Error('Insufficient funds');
    }
    this._balance = this._balance.subtract(amount);
    this._updatedAt = new Date();
  }

  canWithdraw(amount: Money): boolean {
    return amount.value > 0 && this._balance.value >= amount.value;
  }

  toString(): string {
    return `Account(id=${this._id}, name=${this._name}, balance=${this._balance.value})`;
  }
}