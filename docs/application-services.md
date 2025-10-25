# Application Services and API Layer

This document outlines the application services layer and API controllers/routes for our banking application.

## Application Services Layer

The application services layer acts as a facade between the API layer and the domain layer. It orchestrates the use cases of the application by coordinating domain objects and services.

### Account Application Service

```typescript
// src/application/services/accountApplicationService.ts
import { Account } from '../../domain/entities/account';
import { Money } from '../../domain/valueObjects/money';
import { AccountRepository } from '../../infrastructure/repositories/accountRepository';
import { AccountDto } from '../dtos/accountDto';

export class AccountApplicationService {
  private accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  async getAllAccounts(): Promise<AccountDto[]> {
    const accounts = await this.accountRepository.findAll();
    return accounts.map(account => this.mapToDto(account));
  }

  async getAccountById(id: string): Promise<AccountDto | null> {
    const account = await this.accountRepository.findById(id);
    return account ? this.mapToDto(account) : null;
  }

  async createAccount(name: string): Promise<AccountDto> {
    const account = new Account(name);
    const savedAccount = await this.accountRepository.save(account);
    return this.mapToDto(savedAccount);
  }

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
```

### Transaction Application Service

```typescript
// src/application/services/transactionApplicationService.ts
import { Account } from '../../domain/entities/account';
import { Transaction, TransactionType, TransactionStatus } from '../../domain/entities/transaction';
import { Money } from '../../domain/valueObjects/money';
import { AccountRepository } from '../../infrastructure/repositories/accountRepository';
import { TransactionRepository } from '../../infrastructure/repositories/transactionRepository';
import { TransactionDto } from '../dtos/transactionDto';

export class TransactionApplicationService {
  private accountRepository: AccountRepository;
  private transactionRepository: TransactionRepository;

  constructor(
    accountRepository: AccountRepository,
    transactionRepository: TransactionRepository
  ) {
    this.accountRepository = accountRepository;
    this.transactionRepository = transactionRepository;
  }

  async getTransactionsByAccountId(accountId: string): Promise<TransactionDto[]> {
    const transactions = await this.transactionRepository.findByAccountId(accountId);
    return transactions.map(transaction => this.mapToDto(transaction));
  }

  async deposit(accountId: string, amount: number, description: string): Promise<TransactionDto> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error(`Account with ID ${accountId} not found`);
    }

    const moneyAmount = new Money(amount);
    
    // Create and save the transaction
    const transaction = new Transaction(
      TransactionType.DEPOSIT,
      moneyAmount,
      null,
      accountId,
      description
    );
    
    // Update account balance
    account.deposit(moneyAmount);
    await this.accountRepository.save(account);
    
    // Complete and save the transaction
    transaction.complete();
    const savedTransaction = await this.transactionRepository.save(transaction);
    
    return this.mapToDto(savedTransaction);
  }

  async withdraw(accountId: string, amount: number, description: string): Promise<TransactionDto> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error(`Account with ID ${accountId} not found`);
    }

    const moneyAmount = new Money(amount);
    
    // Check if withdrawal is possible
    if (!account.canWithdraw(moneyAmount)) {
      throw new Error('Insufficient funds');
    }
    
    // Create the transaction
    const transaction = new Transaction(
      TransactionType.WITHDRAWAL,
      moneyAmount,
      accountId,
      null,
      description
    );
    
    try {
      // Update account balance
      account.withdraw(moneyAmount);
      await this.accountRepository.save(account);
      
      // Complete and save the transaction
      transaction.complete();
      const savedTransaction = await this.transactionRepository.save(transaction);
      
      return this.mapToDto(savedTransaction);
    } catch (error) {
      // If something goes wrong, mark the transaction as failed
      transaction.fail();
      await this.transactionRepository.save(transaction);
      throw error;
    }
  }

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
    
    // Check if transfer is possible
    if (!fromAccount.canWithdraw(moneyAmount)) {
      throw new Error('Insufficient funds');
    }
    
    // Create the transaction
    const transaction = new Transaction(
      TransactionType.TRANSFER,
      moneyAmount,
      fromAccountId,
      toAccountId,
      description
    );
    
    try {
      // Update account balances
      fromAccount.withdraw(moneyAmount);
      toAccount.deposit(moneyAmount);
      
      await this.accountRepository.save(fromAccount);
      await this.accountRepository.save(toAccount);
      
      // Complete and save the transaction
      transaction.complete();
      const savedTransaction = await this.transactionRepository.save(transaction);
      
      return this.mapToDto(savedTransaction);
    } catch (error) {
      // If something goes wrong, mark the transaction as failed
      transaction.fail();
      await this.transactionRepository.save(transaction);
      throw error;
    }
  }

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
```

### DTOs (Data Transfer Objects)

```typescript
// src/application/dtos/accountDto.ts
export interface AccountDto {
  id: string;
  name: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

// src/application/dtos/transactionDto.ts
import { TransactionType, TransactionStatus } from '../../domain/entities/transaction';

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
```

## API Controllers and Routes

### Account Controller

```typescript
// src/api/controllers/accountController.ts
import { Request, Response } from 'express';
import { AccountApplicationService } from '../../application/services/accountApplicationService';
import { validateAccount } from '../middleware/validation';

export class AccountController {
  private accountService: AccountApplicationService;

  constructor(accountService: AccountApplicationService) {
    this.accountService = accountService;
  }

  getAllAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const accounts = await this.accountService.getAllAccounts();
      res.status(200).json(accounts);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving accounts', error: error.message });
    }
  };

  getAccountById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const account = await this.accountService.getAccountById(id);
      
      if (!account) {
        res.status(404).json({ message: `Account with ID ${id} not found` });
        return;
      }
      
      res.status(200).json(account);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving account', error: error.message });
    }
  };

  createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error } = validateAccount(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }
      
      const { name } = req.body;
      const account = await this.accountService.createAccount(name);
      
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ message: 'Error creating account', error: error.message });
    }
  };

  getAccountTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // First check if the account exists
      const account = await this.accountService.getAccountById(id);
      if (!account) {
        res.status(404).json({ message: `Account with ID ${id} not found` });
        return;
      }
      
      // This will be implemented in the routes by calling the transaction service
      res.status(501).json({ message: 'Not implemented yet' });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving account transactions', error: error.message });
    }
  };
}
```

### Transaction Controller

```typescript
// src/api/controllers/transactionController.ts
import { Request, Response } from 'express';
import { TransactionApplicationService } from '../../application/services/transactionApplicationService';
import { validateDeposit, validateWithdrawal, validateTransfer } from '../middleware/validation';

export class TransactionController {
  private transactionService: TransactionApplicationService;

  constructor(transactionService: TransactionApplicationService) {
    this.transactionService = transactionService;
  }

  getTransactionsByAccountId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accountId } = req.params;
      const transactions = await this.transactionService.getTransactionsByAccountId(accountId);
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving transactions', error: error.message });
    }
  };

  deposit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error } = validateDeposit(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }
      
      const { accountId, amount, description } = req.body;
      const transaction = await this.transactionService.deposit(accountId, amount, description);
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'Error processing deposit', error: error.message });
      }
    }
  };

  withdraw = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error } = validateWithdrawal(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }
      
      const { accountId, amount, description } = req.body;
      const transaction = await this.transactionService.withdraw(accountId, amount, description);
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else if (error.message.includes('Insufficient funds')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'Error processing withdrawal', error: error.message });
      }
    }
  };

  transfer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error } = validateTransfer(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }
      
      const { fromAccountId, toAccountId, amount, description } = req.body;
      const transaction = await this.transactionService.transfer(
        fromAccountId,
        toAccountId,
        amount,
        description
      );
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else if (error.message.includes('Insufficient funds')) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: 'Error processing transfer', error: error.message });
      }
    }
  };
}
```

### Routes

```typescript
// src/api/routes/accountRoutes.ts
import { Router } from 'express';
import { AccountController } from '../controllers/accountController';
import { TransactionController } from '../controllers/transactionController';
import { AccountApplicationService } from '../../application/services/accountApplicationService';
import { TransactionApplicationService } from '../../application/services/transactionApplicationService';
import { AccountRepository } from '../../infrastructure/repositories/accountRepository';
import { TransactionRepository } from '../../infrastructure/repositories/transactionRepository';

const router = Router();

// Initialize repositories
const accountRepository = new AccountRepository();
const transactionRepository = new TransactionRepository();

// Initialize services
const accountService = new AccountApplicationService(accountRepository);
const transactionService = new TransactionApplicationService(accountRepository, transactionRepository);

// Initialize controllers
const accountController = new AccountController(accountService);
const transactionController = new TransactionController(transactionService);

// Account routes
router.get('/', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);
router.post('/', accountController.createAccount);
router.get('/:id/transactions', transactionController.getTransactionsByAccountId);

export default router;

// src/api/routes/transactionRoutes.ts
import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { TransactionApplicationService } from '../../application/services/transactionApplicationService';
import { AccountRepository } from '../../infrastructure/repositories/accountRepository';
import { TransactionRepository } from '../../infrastructure/repositories/transactionRepository';

const router = Router();

// Initialize repositories
const accountRepository = new AccountRepository();
const transactionRepository = new TransactionRepository();

// Initialize service
const transactionService = new TransactionApplicationService(accountRepository, transactionRepository);

// Initialize controller
const transactionController = new TransactionController(transactionService);

// Transaction routes
router.post('/deposit', transactionController.deposit);
router.post('/withdraw', transactionController.withdraw);
router.post('/transfer', transactionController.transfer);

export default router;
```

### Validation Middleware

```typescript
// src/api/middleware/validation.ts
import Joi from 'joi';

export const validateAccount = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required()
  });
  
  return schema.validate(data);
};

export const validateDeposit = (data: any) => {
  const schema = Joi.object({
    accountId: Joi.string().required(),
    amount: Joi.number().positive().precision(2).required(),
    description: Joi.string().min(3).max(100).required()
  });
  
  return schema.validate(data);
};

export const validateWithdrawal = (data: any) => {
  const schema = Joi.object({
    accountId: Joi.string().required(),
    amount: Joi.number().positive().precision(2).required(),
    description: Joi.string().min(3).max(100).required()
  });
  
  return schema.validate(data);
};

export const validateTransfer = (data: any) => {
  const schema = Joi.object({
    fromAccountId: Joi.string().required(),
    toAccountId: Joi.string().required(),
    amount: Joi.number().positive().precision(2).required(),
    description: Joi.string().min(3).max(100).required()
  }).custom((value, helpers) => {
    if (value.fromAccountId === value.toAccountId) {
      return helpers.error('any.invalid', { message: 'Source and target accounts cannot be the same' });
    }
    return value;
  });
  
  return schema.validate(data);
};
```

### Error Handling Middleware

```typescript
// src/api/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);
  
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    message: `Not Found - ${req.originalUrl}`
  });
};
```

## Server Setup

```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './infrastructure/database/connection';
import { setupSwagger } from './api/swagger/swagger';
import accountRoutes from './api/routes/accountRoutes';
import transactionRoutes from './api/routes/transactionRoutes';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler';
import config from './infrastructure/config/config';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Swagger documentation
setupSwagger(app);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Connect to database and start server
const PORT = config.port || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

## Configuration

```typescript
// src/infrastructure/config/config.ts
import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/banking?authSource=admin',
  nodeEnv: process.env.NODE_ENV || 'development',
};
```

## README.md

```markdown
# Banking Application

A Node.js application for managing bank accounts and transactions using Domain-Driven Design principles.

## Features

- Create and manage bank accounts
- Deposit and withdraw money
- Transfer money between accounts
- View transaction history
- RESTful API with Swagger documentation

## Tech Stack

- Node.js & Express
- TypeScript
- MongoDB with Mongoose
- Docker & Docker Compose
- Swagger UI for API documentation
- Jest for testing

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   cd banking-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start MongoDB using Docker Compose:
   ```
   docker-compose up -d
   ```

4. Create a `.env` file in the root directory:
   ```
   PORT=3000
   MONGO_URI=mongodb://admin:password@localhost:27017/banking?authSource=admin
   NODE_ENV=development
   ```

5. Build and run the application:
   ```
   npm run build
   npm start
   ```

   For development with hot-reloading:
   ```
   npm run dev
   ```

6. Access the API documentation:
   ```
   http://localhost:3000/api-docs
   ```

## API Endpoints

### Account Endpoints

- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/:id` - Get account by ID
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id/transactions` - Get transactions for account

### Transaction Endpoints

- `POST /api/transactions/deposit` - Deposit money to account
- `POST /api/transactions/withdraw` - Withdraw money from account
- `POST /api/transactions/transfer` - Transfer money between accounts

## Running Tests

```
npm test
```

For test coverage:
```
npm run test:coverage
```

## Project Structure

The project follows Domain-Driven Design principles with a layered architecture:

- **Domain Layer**: Core business logic and rules
- **Application Layer**: Orchestrates the domain objects
- **Infrastructure Layer**: Database access and external services
- **API Layer**: REST API controllers and routes

## License

MIT