import { Account } from '../entities/account';
import { Money } from '../valueObjects/money';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction';

/**
 * Account Service
 * Contains domain logic for account operations
 */
export class AccountService {
  /**
   * Creates a new account with the given name and initial balance of zero
   */
  createAccount(name: string): Account {
    return new Account(name);
  }

  /**
   * Deposits money into an account and creates a transaction record
   */
  deposit(account: Account, amount: Money, description: string): Transaction {
    // Create transaction
    const transaction = new Transaction(
      TransactionType.DEPOSIT,
      amount,
      null,
      account.id,
      description
    );

    try {
      // Update account balance
      account.deposit(amount);
      
      // Mark transaction as completed
      transaction.complete();
      
      return transaction;
    } catch (error) {
      // If deposit fails, mark transaction as failed
      transaction.fail();
      throw error;
    }
  }

  /**
   * Withdraws money from an account and creates a transaction record
   */
  withdraw(account: Account, amount: Money, description: string): Transaction {
    // Create transaction
    const transaction = new Transaction(
      TransactionType.WITHDRAWAL,
      amount,
      account.id,
      null,
      description
    );

    try {
      // Check if withdrawal is possible
      if (!account.canWithdraw(amount)) {
        throw new Error('Insufficient funds');
      }
      
      // Update account balance
      account.withdraw(amount);
      
      // Mark transaction as completed
      transaction.complete();
      
      return transaction;
    } catch (error) {
      // If withdrawal fails, mark transaction as failed
      transaction.fail();
      throw error;
    }
  }

  /**
   * Transfers money between accounts and creates a transaction record
   */
  transfer(
    fromAccount: Account,
    toAccount: Account,
    amount: Money,
    description: string
  ): Transaction {
    // Create transaction
    const transaction = new Transaction(
      TransactionType.TRANSFER,
      amount,
      fromAccount.id,
      toAccount.id,
      description
    );

    try {
      // Check if transfer is possible
      if (!fromAccount.canWithdraw(amount)) {
        throw new Error('Insufficient funds');
      }
      
      // Update account balances
      fromAccount.withdraw(amount);
      toAccount.deposit(amount);
      
      // Mark transaction as completed
      transaction.complete();
      
      return transaction;
    } catch (error) {
      // If transfer fails, mark transaction as failed
      transaction.fail();
      throw error;
    }
  }
}