import { Account } from '../../domain/entities/account';
import { Transaction, TransactionType, TransactionStatus } from '../../domain/entities/transaction';
import { Money } from '../../domain/valueObjects/money';
import { AccountService } from '../../domain/services/accountService';
import { AccountRepository } from '../../infrastructure/repositories/accountRepository';
import { TransactionRepository } from '../../infrastructure/repositories/transactionRepository';
import { TransactionDto } from '../dtos/transactionDto';

/**
 * Transaction Application Service
 * Orchestrates use cases related to transactions
 */
export class TransactionApplicationService {
  private accountRepository: AccountRepository;
  private transactionRepository: TransactionRepository;
  private accountService: AccountService;

  constructor(
    accountRepository: AccountRepository,
    transactionRepository: TransactionRepository
  ) {
    this.accountRepository = accountRepository;
    this.transactionRepository = transactionRepository;
    this.accountService = new AccountService();
  }

  /**
   * Get transactions by account ID
   */
  async getTransactionsByAccountId(accountId: string): Promise<TransactionDto[]> {
    const transactions = await this.transactionRepository.findByAccountId(accountId);
    return transactions.map(transaction => this.mapToDto(transaction));
  }

  /**
   * Deposit money to an account
   */
  async deposit(accountId: string, amount: number, description: string): Promise<TransactionDto> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error(`Account with ID ${accountId} not found`);
    }

    const moneyAmount = new Money(amount);
    
    // Use domain service to handle deposit logic
    const transaction = this.accountService.deposit(account, moneyAmount, description);
    
    // Save updated account and transaction
    await this.accountRepository.save(account);
    const savedTransaction = await this.transactionRepository.save(transaction);
    
    return this.mapToDto(savedTransaction);
  }

  /**
   * Withdraw money from an account
   */
  async withdraw(accountId: string, amount: number, description: string): Promise<TransactionDto> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error(`Account with ID ${accountId} not found`);
    }

    const moneyAmount = new Money(amount);
    
    try {
      // Use domain service to handle withdrawal logic
      const transaction = this.accountService.withdraw(account, moneyAmount, description);
      
      // Save updated account and transaction
      await this.accountRepository.save(account);
      const savedTransaction = await this.transactionRepository.save(transaction);
      
      return this.mapToDto(savedTransaction);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Transfer money between accounts
   */
  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string
  ): Promise<TransactionDto> {
    const fromAccount = await this.accountRepository.findById(fromAccountId);
    const toAccount = await this.accountRepository.findById(toAccountId);
    
    if (!fromAccount) {
      throw new Error(`Source account with ID ${fromAccountId} not found`);
    }
    
    if (!toAccount) {
      throw new Error(`Target account with ID ${toAccountId} not found`);
    }
    
    const moneyAmount = new Money(amount);
    
    try {
      // Use domain service to handle transfer logic
      const transaction = this.accountService.transfer(
        fromAccount,
        toAccount,
        moneyAmount,
        description
      );
      
      // Save updated accounts and transaction
      await this.accountRepository.save(fromAccount);
      await this.accountRepository.save(toAccount);
      const savedTransaction = await this.transactionRepository.save(transaction);
      
      return this.mapToDto(savedTransaction);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Map domain entity to DTO
   */
  private mapToDto(transaction: Transaction): TransactionDto {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.value,
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      description: transaction.description,
      status: transaction.status,
      createdAt: transaction.createdAt
    };
  }
}