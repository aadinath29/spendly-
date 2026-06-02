import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { summary, byCategory, overTime } from '../controllers/analyticsController.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', summary);
router.get('/by-category', byCategory);
router.get('/over-time', overTime);

export default router;
