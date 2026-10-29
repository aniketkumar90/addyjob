import { Router } from 'express';
import {
  getAdminOverview,
  getAdminCompanies,
  updateCompanyStatus,
  deleteCompany,
  updateCompanyPermissions,
  getAdminPermissionsSettings,
  updateAdminPermissionsSettings,
  getAdminJobs,
  getJobApplicants,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getAdminApplications,
  getAdminApplicationResume,
  createAdminApplication,
  updateApplicationStatus,
  getAdminPlans,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
  getAdminJobSeekers,
  deleteAdminJobSeeker,
  sendBulkResumesToCompany,
  getAdminNotifications,
  getAdminReports,
} from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public read for system permissions & Free Trial configuration (used by company dashboard & pricing)
router.get('/permissions-settings', getAdminPermissionsSettings);
router.get('/plans', getAdminPlans);


// 🔒 All remaining admin routes require valid JWT + admin/sadmin role
router.use(authenticate);
router.use(requireAdmin);

// Overview stats, notifications & Reports
router.get('/overview', getAdminOverview);
router.get('/notifications', getAdminNotifications);
router.get('/reports', getAdminReports);

// Companies management
router.get('/companies', getAdminCompanies);
router.patch('/companies/:id/status', updateCompanyStatus);
router.patch('/companies/:id/permissions', updateCompanyPermissions);
router.delete('/companies/:id', deleteCompany);

// Job Seekers management
router.get('/jobseekers', getAdminJobSeekers);
router.delete('/jobseekers/:id', deleteAdminJobSeeker);

// Permissions & Auto-approval Settings (Super Admin update)
router.put('/permissions-settings', updateAdminPermissionsSettings);

// Jobs moderation
router.get('/jobs', getAdminJobs);
router.get('/jobs/:id/applicants', getJobApplicants);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.patch('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteJob);

// Applications & Resumes management
router.get('/applications', getAdminApplications);
router.get('/applications/:id/resume', getAdminApplicationResume);
router.post('/applications', createAdminApplication);
router.patch('/applications/:id/status', updateApplicationStatus);
router.post('/resumes/bulk-send', sendBulkResumesToCompany);
router.post('/companies/:id/send-resumes', sendBulkResumesToCompany);

// Plans & Pricing

router.post('/plans', createAdminPlan);
router.put('/plans/:id', updateAdminPlan);
router.patch('/plans/:id', updateAdminPlan);
router.delete('/plans/:id', deleteAdminPlan);

export default router;
