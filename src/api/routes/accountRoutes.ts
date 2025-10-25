import { Router } from 'express';
import { AccountController } from '../controllers/accountController';
import { TransactionController } from '../controllers/transactionController';
import { AccountApplicationService } from '../../application/services/accountApplicationService';
import { TransactionApplicationService } from '../../application/services/transactionApplicationService';
import { AccountRepository } from '../../infrastructure/repositories/accountRepository';
import { TransactionRepository } from '../../infrastructure/repositories/transactionRepository';

/**
 * Account routes
 */
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

// Account routes
router.get('/', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);
router.post('/', accountController.createAccount);
router.get('/:accountId/transactions', transactionController.getTransactionsByAccountId);

export default router;