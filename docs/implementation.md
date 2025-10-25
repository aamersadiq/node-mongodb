# Banking Application Implementation Plan

## Docker Compose Configuration

The following Docker Compose configuration will be used to run MongoDB:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: banking-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongodb-data:/data/db
    networks:
      - banking-network

  mongo-express:
    image: mongo-express:latest
    container_name: banking-mongo-express
    restart: always
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=admin
      - ME_CONFIG_MONGODB_ADMINPASSWORD=password
      - ME_CONFIG_MONGODB_SERVER=mongodb
    networks:
      - banking-network
    depends_on:
      - mongodb

networks:
  banking-network:
    driver: bridge

volumes:
  mongodb-data:
```

## Project Setup

### Package.json

```json
{
  "name": "banking-app",
  "version": "1.0.0",
  "description": "Banking application with DDD architecture",
  "main": "dist/server.js",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "dotenv": "^16.3.1",
    "swagger-ui-express": "^5.0.0",
    "swagger-jsdoc": "^6.2.8",
    "uuid": "^9.0.0",
    "joi": "^17.9.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.5.6",
    "@types/swagger-ui-express": "^4.1.3",
    "@types/swagger-jsdoc": "^6.0.1",
    "@types/uuid": "^9.0.3",
    "@types/cors": "^2.8.13",
    "@types/morgan": "^1.9.5",
    "@types/jest": "^29.5.4",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1",
    "jest": "^29.6.4",
    "ts-jest": "^29.1.1",
    "eslint": "^8.48.0",
    "@typescript-eslint/eslint-plugin": "^6.5.0",
    "@typescript-eslint/parser": "^6.5.0"
  }
}
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## Domain Models Implementation

### Account Entity

```typescript
// src/domain/entities/account.ts
import { v4 as uuidv4 } from 'uuid';
import { Money } from '../valueObjects/money';

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
```

### Transaction Entity

```typescript
// src/domain/entities/transaction.ts
import { v4 as uuidv4 } from 'uuid';
import { Money } from '../valueObjects/money';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

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
```

### Money Value Object

```typescript
// src/domain/valueObjects/money.ts
export class Money {
  private readonly _value: number;

  constructor(value: number) {
    // Ensure value has at most 2 decimal places
    this._value = Math.round(value * 100) / 100;
  }

  get value(): number {
    return this._value;
  }

  add(money: Money): Money {
    return new Money(this._value + money.value);
  }

  subtract(money: Money): Money {
    return new Money(this._value - money.value);
  }

  multiply(factor: number): Money {
    return new Money(this._value * factor);
  }

  equals(money: Money): boolean {
    return this._value === money.value;
  }

  greaterThan(money: Money): boolean {
    return this._value > money.value;
  }

  lessThan(money: Money): boolean {
    return this._value < money.value;
  }

  toString(): string {
    return `$${this._value.toFixed(2)}`;
  }
}
```

## Database Connection and Schemas

### Database Connection

```typescript
// src/infrastructure/database/connection.ts
import mongoose from 'mongoose';
import config from '../config/config';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error}`);
  }
};
```

### Account Schema

```typescript
// src/infrastructure/schemas/accountSchema.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAccountDocument extends Document {
  name: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAccountDocument>('Account', AccountSchema);
```

### Transaction Schema

```typescript
// src/infrastructure/schemas/transactionSchema.ts
import mongoose, { Schema, Document } from 'mongoose';
import { TransactionType, TransactionStatus } from '../../domain/entities/transaction';

export interface ITransactionDocument extends Document {
  type: TransactionType;
  amount: number;
  fromAccountId: mongoose.Types.ObjectId | null;
  toAccountId: mongoose.Types.ObjectId | null;
  description: string;
  status: TransactionStatus;
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    fromAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    toAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);
```

## API Endpoints and Swagger Documentation

### Swagger Configuration

```typescript
// src/api/swagger/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Banking API',
      version: '1.0.0',
      description: 'API for banking operations',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/api/routes/*.ts', './src/api/controllers/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
```

### Account Controller Documentation

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the account
 *         name:
 *           type: string
 *           description: The name of the account
 *         balance:
 *           type: number
 *           description: The current balance of the account
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the account was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the account was last updated
 *       example:
 *         id: 60d21b4667d0d8992e610c85
 *         name: John Doe
 *         balance: 1000.00
 *         createdAt: 2023-01-01T00:00:00.000Z
 *         updatedAt: 2023-01-01T00:00:00.000Z
 */

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Returns a list of all accounts
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: The list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 */

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Get an account by id
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The account id
 *     responses:
 *       200:
 *         description: The account details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       404:
 *         description: The account was not found
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the account
 *     responses:
 *       201:
 *         description: The account was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /accounts/{id}/transactions:
 *   get:
 *     summary: Get transactions for an account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The account id
 *     responses:
 *       200:
 *         description: List of transactions for the account
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: The account was not found
 */
```

### Transaction Controller Documentation

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - type
 *         - amount
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the transaction
 *         type:
 *           type: string
 *           enum: [DEPOSIT, WITHDRAWAL, TRANSFER]
 *           description: The type of transaction
 *         amount:
 *           type: number
 *           description: The amount of the transaction
 *         fromAccountId:
 *           type: string
 *           description: The source account id (null for deposits)
 *         toAccountId:
 *           type: string
 *           description: The target account id (null for withdrawals)
 *         description:
 *           type: string
 *           description: Description of the transaction
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED]
 *           description: The status of the transaction
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the transaction was created
 *       example:
 *         id: 60d21b4667d0d8992e610c85
 *         type: DEPOSIT
 *         amount: 500.00
 *         fromAccountId: null
 *         toAccountId: 60d21b4667d0d8992e610c85
 *         description: Initial deposit
 *         status: COMPLETED
 *         createdAt: 2023-01-01T00:00:00.000Z
 */

/**
 * @swagger
 * /transactions/deposit:
 *   post:
 *     summary: Deposit money to an account
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - amount
 *               - description
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: The account id to deposit to
 *               amount:
 *                 type: number
 *                 description: The amount to deposit
 *               description:
 *                 type: string
 *                 description: Description of the deposit
 *     responses:
 *       201:
 *         description: The deposit was successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Account not found
 */

/**
 * @swagger
 * /transactions/withdraw:
 *   post:
 *     summary: Withdraw money from an account
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *               - amount
 *               - description
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: The account id to withdraw from
 *               amount:
 *                 type: number
 *                 description: The amount to withdraw
 *               description:
 *                 type: string
 *                 description: Description of the withdrawal
 *     responses:
 *       201:
 *         description: The withdrawal was successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input or insufficient funds
 *       404:
 *         description: Account not found
 */

/**
 * @swagger
 * /transactions/transfer:
 *   post:
 *     summary: Transfer money between accounts
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountId
 *               - toAccountId
 *               - amount
 *               - description
 *             properties:
 *               fromAccountId:
 *                 type: string
 *                 description: The source account id
 *               toAccountId:
 *                 type: string
 *                 description: The target account id
 *               amount:
 *                 type: number
 *                 description: The amount to transfer
 *               description:
 *                 type: string
 *                 description: Description of the transfer
 *     responses:
 *       201:
 *         description: The transfer was successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input or insufficient funds
 *       404:
 *         description: One or both accounts not found
 */
```

## Testing Strategy

### Unit Tests

```typescript
// tests/unit/domain/entities/account.test.ts
import { Account } from '../../../../src/domain/entities/account';
import { Money } from '../../../../src/domain/valueObjects/money';

describe('Account Entity', () => {
  let account: Account;

  beforeEach(() => {
    account = new Account('Test Account', new Money(1000));
  });

  test('should create an account with correct properties', () => {
    expect(account.name).toBe('Test Account');
    expect(account.balance.value).toBe(1000);
    expect(account.id).toBeDefined();
    expect(account.createdAt).toBeDefined();
    expect(account.updatedAt).toBeDefined();
  });

  test('should deposit money correctly', () => {
    account.deposit(new Money(500));
    expect(account.balance.value).toBe(1500);
  });

  test('should throw error when depositing negative amount', () => {
    expect(() => account.deposit(new Money(-100))).toThrow('Deposit amount must be positive');
  });

  test('should withdraw money correctly', () => {
    account.withdraw(new Money(300));
    expect(account.balance.value).toBe(700);
  });

  test('should throw error when withdrawing negative amount', () => {
    expect(() => account.withdraw(new Money(-100))).toThrow('Withdrawal amount must be positive');
  });

  test('should throw error when withdrawing more than balance', () => {
    expect(() => account.withdraw(new Money(1500))).toThrow('Insufficient funds');
  });

  test('should check if can withdraw correctly', () => {
    expect(account.canWithdraw(new Money(500))).toBe(true);
    expect(account.canWithdraw(new Money(1500))).toBe(false);
    expect(account.canWithdraw(new Money(-100))).toBe(false);
  });
});
```

## Implementation Plan

1. Set up the project structure and initial configuration
   - Create package.json, tsconfig.json
   - Install dependencies

2. Set up Docker Compose for MongoDB
   - Create docker-compose.yml
   - Test MongoDB connection

3. Implement domain models
   - Create value objects
   - Create entities
   - Create domain services

4. Implement infrastructure layer
   - Set up database connection
   - Create Mongoose schemas
   - Implement repositories

5. Implement application services
   - Create DTOs
   - Implement application services for accounts and transactions

6. Implement API layer
   - Create controllers
   - Set up routes
   - Implement validation middleware
   - Configure Swagger documentation

7. Implement unit tests
   - Test domain entities
   - Test application services
   - Test repositories

8. Create README with setup and usage instructions