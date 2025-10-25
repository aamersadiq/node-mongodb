import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { TransactionApplicationService } from '../../application/services/transactionApplicationService';
import { AccountRepository } from '../../infrastructure/repositories/accountRepository';
import { TransactionRepository } from '../../infrastructure/repositories/transactionRepository';

/**
 * Transaction routes
 */
const router = Router();

// Initialize repositories
const accountRepository = new AccountRepository();
const transactionRepository = new TransactionRepository();

// Initialize service
const transactionService = new TransactionApplicationService(accountRepository, transactionRepository);

// Initialize controller
const transactionController = new TransactionController(transactionService);

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

// Transaction routes
router.post('/deposit', transactionController.deposit);
router.post('/withdraw', transactionController.withdraw);
router.post('/transfer', transactionController.transfer);

export default router;