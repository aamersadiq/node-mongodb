import { Account } from '../../../../src/domain/entities/account';
import { Money } from '../../../../src/domain/valueObjects/money';

describe('Account Entity', () => {
  let account: Account;

  beforeEach(() => {
    account = new Account('Test Account', new Money(1000));
  });

  describe('Constructor', () => {
    it('should create an account with correct properties', () => {
      expect(account.name).toBe('Test Account');
      expect(account.balance.value).toBe(1000);
      expect(account.id).toBeDefined();
      expect(account.createdAt).toBeDefined();
      expect(account.updatedAt).toBeDefined();
    });

    it('should create an account with zero balance if not provided', () => {
      const newAccount = new Account('Zero Balance Account');
      expect(newAccount.balance.value).toBe(0);
    });
  });

  describe('Deposit', () => {
    it('should increase balance when depositing money', () => {
      account.deposit(new Money(500));
      expect(account.balance.value).toBe(1500);
    });

    it('should throw error when depositing negative amount', () => {
      expect(() => account.deposit(new Money(-100))).toThrow('Deposit amount must be positive');
    });

    it('should throw error when depositing zero amount', () => {
      expect(() => account.deposit(new Money(0))).toThrow('Deposit amount must be positive');
    });
  });

  describe('Withdraw', () => {
    it('should decrease balance when withdrawing money', () => {
      account.withdraw(new Money(300));
      expect(account.balance.value).toBe(700);
    });

    it('should throw error when withdrawing negative amount', () => {
      expect(() => account.withdraw(new Money(-100))).toThrow('Withdrawal amount must be positive');
    });

    it('should throw error when withdrawing zero amount', () => {
      expect(() => account.withdraw(new Money(0))).toThrow('Withdrawal amount must be positive');
    });

    it('should throw error when withdrawing more than balance', () => {
      expect(() => account.withdraw(new Money(1500))).toThrow('Insufficient funds');
    });
  });

  describe('CanWithdraw', () => {
    it('should return true when amount is less than balance', () => {
      expect(account.canWithdraw(new Money(500))).toBe(true);
    });

    it('should return true when amount is equal to balance', () => {
      expect(account.canWithdraw(new Money(1000))).toBe(true);
    });

    it('should return false when amount is greater than balance', () => {
      expect(account.canWithdraw(new Money(1500))).toBe(false);
    });

    it('should return false when amount is negative', () => {
      expect(account.canWithdraw(new Money(-100))).toBe(false);
    });

    it('should return false when amount is zero', () => {
      expect(account.canWithdraw(new Money(0))).toBe(false);
    });
  });
});