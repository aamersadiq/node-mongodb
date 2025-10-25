import { Request, Response } from 'express';
import { AccountApplicationService } from '../../application/services/accountApplicationService';
import { validateAccount } from '../middleware/validation';

/**
 * Account Controller
 * Handles HTTP requests related to accounts
 */
export class AccountController {
  private accountService: AccountApplicationService;

  constructor(accountService: AccountApplicationService) {
    this.accountService = accountService;
  }

  /**
   * @swagger
   * /api/accounts:
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
  getAllAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const accounts = await this.accountService.getAllAccounts();
      res.status(200).json({
        success: true,
        data: accounts
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving accounts',
        error: error.message
      });
    }
  };

  /**
   * @swagger
   * /api/accounts/{id}:
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
  getAccountById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const account = await this.accountService.getAccountById(id);
      
      if (!account) {
        res.status(404).json({
          success: false,
          message: `Account with ID ${id} not found`
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: account
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving account',
        error: error.message
      });
    }
  };

  /**
   * @swagger
   * /api/accounts:
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
  createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error } = validateAccount(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message
        });
        return;
      }
      
      const { name } = req.body;
      const account = await this.accountService.createAccount(name);
      
      res.status(201).json({
        success: true,
        data: account
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error creating account',
        error: error.message
      });
    }
  };
}