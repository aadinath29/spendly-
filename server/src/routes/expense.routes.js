import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';

const router = Router();
router.use(requireAuth);

const dateRule = (chain) => chain.matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('A valid date (YYYY-MM-DD) is required.');

const createValidators = [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0.').toFloat(),
  dateRule(body('expense_date')),
  body('description').optional().isLength({ max: 255 }).withMessage('Description is too long.'),
  body('payment_method').optional().isLength({ max: 40 }),
  body('category_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid category.').toInt(),
];

const updateValidators = [
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than 0.').toFloat(),
  dateRule(body('expense_date').optional()),
  body('description').optional().isLength({ max: 255 }).withMessage('Description is too long.'),
  body('payment_method').optional().isLength({ max: 40 }),
  body('category_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid category.').toInt(),
];

router.get('/', listExpenses);
router.post('/', createValidators, validate, createExpense);
router.put('/:id', updateValidators, validate, updateExpense);
router.delete('/:id', deleteExpense);

export default router;
