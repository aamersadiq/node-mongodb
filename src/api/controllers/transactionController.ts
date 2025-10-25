import { Request, Response } from 'express';
import { TransactionApplicationService } from '../../application/services/transactionApplicationService';
import { validateDeposit, validateWithdrawal, validateTransfer } from '../middleware/validation';

/**
 * Transaction Controller
 * Handles HTTP requests related to transactions
 */
export class TransactionController {
  private transactionService: TransactionApplicationService;

  constructor(transactionService: TransactionApplicationService) {
    this.transactionService = transactionService;
  }

  /**
   * @swagger
   * /api/accounts/{accountId}/transactions:
   *   get:
   *     summary: Get transactions for an account
   *     tags: [Transactions]
   *     parameters:
   *       - in: path
   *         name: accountId
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
  getTransactionsByAccountId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accountId } = req.params;
      const transactions = await this.transactionService.getTransactionsByAccountId(accountId);
      
      res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving transactions',
        error: error.message
      });
    }
  };

  /**
   * @swagger
   * /api/transactions/deposit:
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
  deposit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error } = validateDeposit(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }
      
      const { accountId, amount, description } = req.body;
      const transaction = await this.transactionService.deposit(accountId, amount, description);
      
      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error processing deposit',
          error: error.message
        });
      }
    }
  };

  /**
   * @swagger
   * /api/transactions/withdraw:
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
  withdraw = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error } = validateWithdrawal(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }
      
      const { accountId, amount, description } = req.body;
      const transaction = await this.transactionService.withdraw(accountId, amount, description);
      
      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error.message.includes('Insufficient funds')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error processing withdrawal',
          error: error.message
        });
      }
    }
  };

  /**
   * @swagger
   * /api/transactions/transfer:
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
  transfer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error } = validateTransfer(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }
      
      const { fromAccountId, toAccountId, amount, description } = req.body;
      const transaction = await this.transactionService.transfer(
        fromAccountId,
        toAccountId,
        amount,
        description
      );
      
      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error.message.includes('Insufficient funds')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error processing transfer',
          error: error.message
        });
      }
    }
  };
}