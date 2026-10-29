import { Router } from 'express';
import {
  getCompanies,
  getCompanyById,
  updateCompanyById,
  testCompanyNotification,
  activateCompanyTrial,
  unlockPurchasedResume,
} from '../controllers/company.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Activate Free Trial for company (supports token or companyId/email body)
router.post('/activate-trial', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req as any, res, next);
  }
  next();
}, activateCompanyTrial);

router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', authenticate, updateCompanyById);
router.post('/:id/test-notification', authenticate, testCompanyNotification);
router.post('/resumes/:resumeId/unlock', authenticate, unlockPurchasedResume);

export default router;

