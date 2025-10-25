import { Account } from '../../domain/entities/account';
import { Money } from '../../domain/valueObjects/money';
import AccountModel, { IAccountDocument } from '../schemas/accountSchema';

/**
 * Account Repository
 * Handles data access operations for accounts
 */
export class AccountRepository {
  /**
   * Find all accounts
   */
  async findAll(): Promise<Account[]> {
    const accountDocs = await AccountModel.find().sort({ createdAt: -1 });
    return accountDocs.map(doc => this.mapToEntity(doc));
  }

  /**
   * Find account by ID
   */
  async findById(id: string): Promise<Account | null> {
    const accountDoc = await AccountModel.findOne({ uuid: id });
    return accountDoc ? this.mapToEntity(accountDoc) : null;
  }

  /**
   * Save account (create or update)
   */
  async save(account: Account): Promise<Account> {
    const accountData = {
      name: account.name,
      balance: account.balance.value,
    };

    let accountDoc: IAccountDocument;

    // Check if account exists by UUID (stored in a custom field)
    const existingAccount = await AccountModel.findOne({ uuid: account.id });
    if (existingAccount) {
      // Update existing account
      accountDoc = await AccountModel.findByIdAndUpdate(
        existingAccount._id,
        { ...accountData, uuid: account.id },
        { new: true, runValidators: true }
      ) as IAccountDocument;
    } else {
      // Create new account
      accountDoc = await AccountModel.create({
        ...accountData,
        uuid: account.id
      });
    }

    return this.mapToEntity(accountDoc);
  }

  /**
   * Delete account by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await AccountModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  /**
   * Map MongoDB document to domain entity
   */
  private mapToEntity(doc: IAccountDocument): Account {
    return new Account(
      doc.name,
      new Money(doc.balance),
      doc.uuid,
      doc.createdAt,
      doc.updatedAt
    );
  }
}