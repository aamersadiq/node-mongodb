import { Account } from '../../domain/entities/account';
import { Money } from '../../domain/valueObjects/money';
import { AccountRepository } from '../../infrastructure/repositories/accountRepository';
import { AccountDto } from '../dtos/accountDto';

/**
 * Account Application Service
 * Orchestrates use cases related to accounts
 */
export class AccountApplicationService {
  private accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  /**
   * Get all accounts
   */
  async getAllAccounts(): Promise<AccountDto[]> {
    const accounts = await this.accountRepository.findAll();
    return accounts.map(account => this.mapToDto(account));
  }

  /**
   * Get account by ID
   */
  async getAccountById(id: string): Promise<AccountDto | null> {
    const account = await this.accountRepository.findById(id);
    return account ? this.mapToDto(account) : null;
  }

  /**
   * Create a new account
   */
  async createAccount(name: string): Promise<AccountDto> {
    const account = new Account(name);
    const savedAccount = await this.accountRepository.save(account);
    return this.mapToDto(savedAccount);
  }

  /**
   * Map domain entity to DTO
   */
  private mapToDto(account: Account): AccountDto {
    return {
      id: account.id,
      name: account.name,
      balance: account.balance.value,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }
}