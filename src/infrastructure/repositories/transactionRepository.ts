import { Transaction, TransactionType, TransactionStatus } from '../../domain/entities/transaction';
import { Money } from '../../domain/valueObjects/money';
import TransactionModel, { ITransactionDocument } from '../schemas/transactionSchema';

/**
 * Transaction Repository
 * Handles data access operations for transactions
 */
export class TransactionRepository {
  /**
   * Find all transactions
   */
  async findAll(): Promise<Transaction[]> {
    const transactionDocs = await TransactionModel.find().sort({ createdAt: -1 });
    return transactionDocs.map(doc => this.mapToEntity(doc));
  }

  /**
   * Find transaction by ID
   */
  async findById(id: string): Promise<Transaction | null> {
    const transactionDoc = await TransactionModel.findOne({ uuid: id });
    return transactionDoc ? this.mapToEntity(transactionDoc) : null;
  }

  /**
   * Find transactions by account ID (either as source or target)
   */
  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const transactionDocs = await TransactionModel.find({
      $or: [
        { fromAccountId: accountId },
        { toAccountId: accountId }
      ]
    }).sort({ createdAt: -1 });
    
    return transactionDocs.map(doc => this.mapToEntity(doc));
  }

  /**
   * Save transaction (create or update)
   */
  async save(transaction: Transaction): Promise<Transaction> {
    const transactionData = {
      type: transaction.type,
      amount: transaction.amount.value,
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      description: transaction.description,
      status: transaction.status,
    };

    let transactionDoc: ITransactionDocument;

    // Check if transaction exists
    const existingTransaction = await TransactionModel.findOne({ uuid: transaction.id });
    if (existingTransaction) {
      // Update existing transaction
      transactionDoc = await TransactionModel.findByIdAndUpdate(
        existingTransaction._id,
        { ...transactionData, uuid: transaction.id },
        { new: true, runValidators: true }
      ) as ITransactionDocument;
    } else {
      // Create new transaction
      transactionDoc = await TransactionModel.create({
        ...transactionData,
        uuid: transaction.id
      });
    }

    return this.mapToEntity(transactionDoc);
  }

  /**
   * Map MongoDB document to domain entity
   */
  private mapToEntity(doc: ITransactionDocument): Transaction {
    return new Transaction(
      doc.type as TransactionType,
      new Money(doc.amount),
      doc.fromAccountId,
      doc.toAccountId,
      doc.description,
      doc.status as TransactionStatus,
      doc.uuid,
      doc.createdAt
    );
  }
}