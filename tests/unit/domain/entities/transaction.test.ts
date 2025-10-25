import { Transaction, TransactionType, TransactionStatus } from '../../../../src/domain/entities/transaction';
import { Money } from '../../../../src/domain/valueObjects/money';

describe('Transaction Entity', () => {
  const validDepositParams = {
    type: TransactionType.DEPOSIT,
    amount: new Money(100),
    fromAccountId: null,
    toAccountId: 'account123',
    description: 'Test deposit'
  };

  const validWithdrawalParams = {
    type: TransactionType.WITHDRAWAL,
    amount: new Money(100),
    fromAccountId: 'account123',
    toAccountId: null,
    description: 'Test withdrawal'
  };

  const validTransferParams = {
    type: TransactionType.TRANSFER,
    amount: new Money(100),
    fromAccountId: 'account123',
    toAccountId: 'account456',
    description: 'Test transfer'
  };

  describe('Constructor', () => {
    it('should create a valid deposit transaction', () => {
      const transaction = new Transaction(
        validDepositParams.type,
        validDepositParams.amount,
        validDepositParams.fromAccountId,
        validDepositParams.toAccountId,
        validDepositParams.description
      );

      expect(transaction.type).toBe(TransactionType.DEPOSIT);
      expect(transaction.amount.value).toBe(100);
      expect(transaction.fromAccountId).toBeNull();
      expect(transaction.toAccountId).toBe('account123');
      expect(transaction.description).toBe('Test deposit');
      expect(transaction.status).toBe(TransactionStatus.PENDING);
      expect(transaction.id).toBeDefined();
      expect(transaction.createdAt).toBeDefined();
    });

    it('should create a valid withdrawal transaction', () => {
      const transaction = new Transaction(
        validWithdrawalParams.type,
        validWithdrawalParams.amount,
        validWithdrawalParams.fromAccountId,
        validWithdrawalParams.toAccountId,
        validWithdrawalParams.description
      );

      expect(transaction.type).toBe(TransactionType.WITHDRAWAL);
      expect(transaction.amount.value).toBe(100);
      expect(transaction.fromAccountId).toBe('account123');
      expect(transaction.toAccountId).toBeNull();
      expect(transaction.description).toBe('Test withdrawal');
      expect(transaction.status).toBe(TransactionStatus.PENDING);
    });

    it('should create a valid transfer transaction', () => {
      const transaction = new Transaction(
        validTransferParams.type,
        validTransferParams.amount,
        validTransferParams.fromAccountId,
        validTransferParams.toAccountId,
        validTransferParams.description
      );

      expect(transaction.type).toBe(TransactionType.TRANSFER);
      expect(transaction.amount.value).toBe(100);
      expect(transaction.fromAccountId).toBe('account123');
      expect(transaction.toAccountId).toBe('account456');
      expect(transaction.description).toBe('Test transfer');
      expect(transaction.status).toBe(TransactionStatus.PENDING);
    });
  });

  describe('Validation', () => {
    it('should throw error when amount is not positive', () => {
      expect(() => {
        new Transaction(
          TransactionType.DEPOSIT,
          new Money(0),
          null,
          'account123',
          'Invalid deposit'
        );
      }).toThrow('Transaction amount must be positive');
    });

    it('should throw error when deposit has fromAccountId', () => {
      expect(() => {
        new Transaction(
          TransactionType.DEPOSIT,
          new Money(100),
          'account123',
          'account456',
          'Invalid deposit'
        );
      }).toThrow('Deposit transaction should not have a source account');
    });

    it('should throw error when deposit has no toAccountId', () => {
      expect(() => {
        new Transaction(
          TransactionType.DEPOSIT,
          new Money(100),
          null,
          null,
          'Invalid deposit'
        );
      }).toThrow('Deposit transaction must have a target account');
    });

    it('should throw error when withdrawal has no fromAccountId', () => {
      expect(() => {
        new Transaction(
          TransactionType.WITHDRAWAL,
          new Money(100),
          null,
          null,
          'Invalid withdrawal'
        );
      }).toThrow('Withdrawal transaction must have a source account');
    });

    it('should throw error when withdrawal has toAccountId', () => {
      expect(() => {
        new Transaction(
          TransactionType.WITHDRAWAL,
          new Money(100),
          'account123',
          'account456',
          'Invalid withdrawal'
        );
      }).toThrow('Withdrawal transaction should not have a target account');
    });

    it('should throw error when transfer has no fromAccountId', () => {
      expect(() => {
        new Transaction(
          TransactionType.TRANSFER,
          new Money(100),
          null,
          'account456',
          'Invalid transfer'
        );
      }).toThrow('Transfer transaction must have both source and target accounts');
    });

    it('should throw error when transfer has no toAccountId', () => {
      expect(() => {
        new Transaction(
          TransactionType.TRANSFER,
          new Money(100),
          'account123',
          null,
          'Invalid transfer'
        );
      }).toThrow('Transfer transaction must have both source and target accounts');
    });

    it('should throw error when transfer has same source and target account', () => {
      expect(() => {
        new Transaction(
          TransactionType.TRANSFER,
          new Money(100),
          'account123',
          'account123',
          'Invalid transfer'
        );
      }).toThrow('Transfer source and target accounts cannot be the same');
    });
  });

  describe('Status changes', () => {
    it('should change status to COMPLETED when complete() is called', () => {
      const transaction = new Transaction(
        validDepositParams.type,
        validDepositParams.amount,
        validDepositParams.fromAccountId,
        validDepositParams.toAccountId,
        validDepositParams.description
      );
      
      transaction.complete();
      expect(transaction.status).toBe(TransactionStatus.COMPLETED);
    });

    it('should change status to FAILED when fail() is called', () => {
      const transaction = new Transaction(
        validDepositParams.type,
        validDepositParams.amount,
        validDepositParams.fromAccountId,
        validDepositParams.toAccountId,
        validDepositParams.description
      );
      
      transaction.fail();
      expect(transaction.status).toBe(TransactionStatus.FAILED);
    });
  });
});