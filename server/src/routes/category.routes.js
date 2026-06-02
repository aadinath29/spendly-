import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = Router();
router.use(requireAuth);

const colorRule = (chain) =>
  chain.matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a hex value like #6366f1.');

router.get('/', listCategories);

router.post(
  '/',
  body('name').trim().notEmpty().withMessage('Category name is required.').isLength({ max: 80 }),
  colorRule(body('color').optional()),
  body('icon').optional().isLength({ max: 40 }),
  validate,
  createCategory
);

router.put(
  '/:id',
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty.').isLength({ max: 80 }),
  colorRule(body('color').optional()),
  body('icon').optional().isLength({ max: 40 }),
  validate,
  updateCategory
);

router.delete('/:id', deleteCategory);

export default router;
