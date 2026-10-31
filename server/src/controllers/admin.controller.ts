import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { UserCredential } from '../models/credential.model.js';
import { UserProfile } from '../models/profile.model.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';
import { Plan } from '../models/plan.model.js';
import { Settings } from '../models/settings.model.js';
import { ensureDBConnection } from '../config/db.js';
import { sendCompanyRejectionEmail } from '../utils/email.service.js';

// Helper to generate initials & color
const getInitials = (name: string): string => {
  if (!name) return 'CO';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const bgColors = [
  'bg-blue-600',
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-amber-500',
  'bg-rose-600',
  'bg-teal-600',
  'bg-purple-600',
];

const getColorForName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % bgColors.length;
  return bgColors[index];
};

// No-op: seed function removed. Super Admin shows only real DB data.
export const seedInitialAdminData = async () => {
  // Nothing to seed — all data is real from database.
  return;
};



// @desc    Get dashboard overview metrics & statistics
// @desc    Get dashboard overview metrics & statistics
// @route   GET /api/admin/overview
export const getAdminOverview = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();

    const [userStats, jobStats, totalApplications, plansCount] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: { role: '$role', status: '$status' },
            count: { $sum: 1 },
          },
        },
      ]),
      Job.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Application.countDocuments(),
      Plan.countDocuments({ status: 'Active' }),
    ]);

    let totalCompanies = 0;
    let pendingCompanies = 0;
    let approvedCompanies = 0;
    let rejectedCompanies = 0;
    let totalCandidates = 0;

    userStats.forEach((u) => {
      const role = u._id?.role;
      const status = u._id?.status;
      if (role === 'company') {
        totalCompanies += u.count;
        if (status === 'Pending') pendingCompanies += u.count;
        else if (status === 'Approved') approvedCompanies += u.count;
        else if (status === 'Rejected') rejectedCompanies += u.count;
      } else if (role === 'job_seeker') {
        totalCandidates += u.count;
      }
    });

    let totalJobs = 0;
    let activeJobs = 0;
    let expiredJobs = 0;

    jobStats.forEach((j) => {
      totalJobs += j.count;
      if (j._id === 'Active') activeJobs += j.count;
      else if (j._id === 'Expired') expiredJobs += j.count;
    });

    res.json({
      success: true,
      data: {
        totalCompanies,
        pendingCompanies,
        approvedCompanies,
        rejectedCompanies,
        totalJobs,
        activeJobs,
        expiredJobs,
        totalApplications,
        totalCandidates,
        plansCount,
        totalRevenue: '₹ 0',
      },
    });
  } catch (error: any) {
    console.error('getAdminOverview error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve overview statistics' });
  }
};

// @desc    Get all companies list with live database details
// @route   GET /api/admin/companies
export const getAdminCompanies = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    await seedInitialAdminData();

    const [users, jobCounts] = await Promise.all([
      User.find({ role: 'company' })
        .select('-purchasedResumes -password -bannerImage')
        .sort({ createdAt: -1 })
        .lean(),
      Job.aggregate([
        { $match: { company: { $exists: true, $ne: '' } } },
        { $group: { _id: { $toLower: '$company' }, count: { $sum: 1 } } },
      ]),
    ]);

    const jobsCountMap: Record<string, number> = {};
    jobCounts.forEach((jc) => {
      if (jc._id) {
        jobsCountMap[jc._id] = jc.count;
      }
    });

    const companies = users.map((u: any) => {
      const name = u.companyName || u.name || 'Unnamed Company';
      const cKey = name.toLowerCase().trim();
      const activeJobs = jobsCountMap[cKey] || 0;

      return {
        id: u._id.toString(),
        userId: u.userId || u.customId,
        name,
        email: u.workEmail || u.email,
        location: u.location || 'India',
        activeJobs,
        plan: (u.plan && String(u.plan).trim()) ? String(u.plan).trim() : 'Basic Plan',
        status: (u.status || 'Pending') as 'Approved' | 'Pending' | 'Rejected',
        createdAt: u.createdAt,
        submittedOn: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
          : 'Recent',
        logoBg: getColorForName(name),
        logoLetter: getInitials(name),
        phone: u.phone || '',
        gstNumber: u.gstNumber || '',
        industry: u.industry || '',
        companySize: u.companySize || '',
        website: (u as any).website || '',
        tagline: u.tagline || '',
        aboutCompany: u.aboutCompany || u.bio || '',
        bio: u.aboutCompany || u.bio || '',
        culture: u.culture || [],
        perks: u.perks || [],
        logo: u.logo || u.profileImage || '',
        profileImage: u.profileImage || u.logo || '',
        bannerImage: u.bannerImage || '',
        rejectionReason: u.rejectionReason || '',
        permissions: u.permissions || {
          dashboard: false,
          jobs: false,
          applicants: false,
          resumes: false,
          settings: false,
          autoApproveFromSubscription: true,
        },
      };
    });

    res.json({ success: true, companies });
  } catch (error: any) {
    console.error('getAdminCompanies error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve companies' });
  }
};

// @desc    Approve or reject company registration status
// @route   PATCH /api/admin/companies/:id/status
export const updateCompanyStatus = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const id = String(req.params.id);
    const { status, reason, rejectionReason } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status value' });
      return;
    }

    const finalReason = reason || rejectionReason || '';
    const updateData: any = { status };
    if (status === 'Rejected') {
      updateData.rejectionReason = finalReason || 'Verification requirements were not met. Please review your company profile, GSTIN, and contact details.';
    } else if (status === 'Approved' || status === 'Pending') {
      updateData.rejectionReason = '';
      if (status === 'Approved') {
        try {
          const doc = await Settings.findOne({ key: 'global_permissions' });
          if (doc && doc.value) {
            globalPermissionsSettings = { ...globalPermissionsSettings, ...doc.value };
          }
        } catch (e) {}

        let existingComp = null;
        if (mongoose.isValidObjectId(id)) {
          existingComp = await User.findById(id);
        } else {
          const mappedCoId = id.replace(/^c(\d+)$/i, 'co0$1');
          existingComp = await User.findOne({
            $or: [{ userId: id }, { customId: id }, { userId: mappedCoId }, { customId: mappedCoId }],
          });
        }

        if (existingComp) {
          const compPlan = existingComp.plan || '';
          const planRules = globalPermissionsSettings.planRules || {};
          const matchedRule = findMatchingPlanRule(compPlan, planRules);

          if (matchedRule) {
            updateData.permissions = {
              dashboard: false,
              jobs: false,
              applicants: false,
              resumes: false,
              settings: false,
              ...(existingComp.permissions || {}),
              ...matchedRule,
              autoApproveFromSubscription: true,
            };
          } else if (
            globalPermissionsSettings.enableDefaultPermissions &&
            (globalPermissionsSettings as any).defaultNewCompanyPerms
          ) {
            updateData.permissions = {
              dashboard: false,
              jobs: false,
              applicants: false,
              resumes: false,
              settings: false,
              ...(existingComp.permissions || {}),
              ...(globalPermissionsSettings as any).defaultNewCompanyPerms,
              autoApproveFromSubscription: true,
            };
          }
        }
      }
    }

    let company = null;
    if (mongoose.isValidObjectId(id)) {
      company = await User.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const mappedCoId = id.replace(/^c(\d+)$/i, 'co0$1');
      company = await User.findOneAndUpdate(
        { $or: [{ userId: id }, { customId: id }, { userId: mappedCoId }, { customId: mappedCoId }] },
        updateData,
        { new: true }
      );
    }

    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }

    // Send email to company admin on rejection
    if (status === 'Rejected') {
      const recipientEmail = company.workEmail || company.email;
      const compName = company.companyName || company.name || 'Company';
      if (recipientEmail) {
        sendCompanyRejectionEmail({
          toEmail: recipientEmail,
          companyName: compName,
          rejectionReason: updateData.rejectionReason,
        }).catch((err) => console.warn('Company rejection email delivery warning:', err));
      }
    }

    res.json({
      success: true,
      message: `Company status updated to ${status}`,
      company: {
        id: company._id.toString(),
        name: company.companyName || company.name,
        status: company.status,
        rejectionReason: company.rejectionReason || '',
      },
    });
  } catch (error: any) {
    console.error('updateCompanyStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update company status' });
  }
};

// @desc    Delete company
// @route   DELETE /api/admin/companies/:id
export const deleteCompany = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const id = String(req.params.id);

    let deleted = null;
    if (mongoose.isValidObjectId(id)) {
      deleted = await User.findByIdAndDelete(id);
    } else {
      deleted = await User.findOneAndDelete({
        $or: [{ userId: id }, { customId: id }],
      });
    }

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }

    // Also remove company's jobs and associated candidate applications
    const companyName = deleted.companyName || deleted.name;
    const companyIdStr = deleted._id.toString();
    const customIdStr = deleted.userId || deleted.customId;

    const jobOrConditions: any[] = [
      { companyId: deleted._id },
      { companyId: companyIdStr },
    ];
    if (customIdStr) jobOrConditions.push({ companyId: customIdStr });
    if (companyName) jobOrConditions.push({ company: new RegExp(`^${companyName}$`, 'i') });

    const companyJobs = await Job.find({ $or: jobOrConditions });
    const jobIds = companyJobs.map((j) => j._id);

    await Job.deleteMany({ $or: jobOrConditions });

    // Cascade delete candidate applications for this company and its jobs
    const { Application } = await import('../models/application.model.js');
    const appOrConditions: any[] = [
      { companyId: deleted._id },
      { companyId: companyIdStr },
    ];
    if (customIdStr) appOrConditions.push({ companyId: customIdStr });
    if (companyName) appOrConditions.push({ company: new RegExp(`^${companyName}$`, 'i') });
    if (jobIds.length > 0) appOrConditions.push({ jobId: { $in: jobIds } });

    await Application.deleteMany({ $or: appOrConditions });

    res.json({ success: true, message: 'Company and associated records deleted' });
  } catch (error: any) {
    console.error('deleteCompany error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete company' });
  }
};

// @desc    Get all jobs from database (supports company filtering)
// @route   GET /api/admin/jobs or GET /api/jobs
export const getAdminJobs = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    await seedInitialAdminData();

    const { companyId, company } = req.query;
    const filter: any = {};
    const orConditions: any[] = [];

    if (companyId) {
      orConditions.push({ companyId: String(companyId) });
      orConditions.push({ companyId: companyId });
      if (mongoose.isValidObjectId(companyId)) {
        orConditions.push({ companyId: new mongoose.Types.ObjectId(String(companyId)) });
      }
    }
    if (company) {
      const trimmed = String(company).trim();
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      orConditions.push({ company: new RegExp(`^${escaped}$`, 'i') });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    // Look up company users to enrich company displayName and companyEmail
    const compIds = jobs.map((j) => j.companyId).filter(Boolean);
    const companyNamesOrEmails = jobs.map((j) => j.company).filter(Boolean);

    const orUserConditions: any[] = [];
    const validObjectIds = compIds.filter((id) => mongoose.isValidObjectId(id));
    if (validObjectIds.length > 0) {
      orUserConditions.push({ _id: { $in: validObjectIds } });
    }
    if (compIds.length > 0) {
      orUserConditions.push({ customId: { $in: compIds } });
      orUserConditions.push({ userId: { $in: compIds } });
    }
    const emailMatches = companyNamesOrEmails.filter((c) => c && c.includes('@'));
    if (emailMatches.length > 0) {
      orUserConditions.push({ email: { $in: emailMatches.map((e) => e.toLowerCase()) } });
    }
    const nonEmailNames = companyNamesOrEmails.filter((c) => c && !c.includes('@'));
    if (nonEmailNames.length > 0) {
      orUserConditions.push({ companyName: { $in: nonEmailNames } });
      orUserConditions.push({ name: { $in: nonEmailNames } });
    }

    const userMap = new Map<string, any>();
    if (orUserConditions.length > 0) {
      try {
        const users = await User.find({ $or: orUserConditions })
          .select('_id customId userId email workEmail companyName name')
          .lean();
        users.forEach((u: any) => {
          if (u._id) userMap.set(u._id.toString(), u);
          if (u.customId) userMap.set(String(u.customId), u);
          if (u.userId) userMap.set(String(u.userId), u);
          if (u.email) userMap.set(u.email.toLowerCase(), u);
          if (u.companyName) userMap.set(u.companyName.toLowerCase(), u);
          if (u.name) userMap.set(u.name.toLowerCase(), u);
        });
      } catch (err) {
        console.warn('Admin jobs user mapping warning:', err);
      }
    }

    // Aggregate real application counts from Application collection
    const appCounts = await Application.aggregate([
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);
    const appCountMap = new Map<string, number>();
    appCounts.forEach((c: any) => {
      if (c._id) appCountMap.set(String(c._id), c.count);
    });

    const formatted = jobs.map((j) => {
      const matchedUser =
        (j.companyId && userMap.get(String(j.companyId))) ||
        (j.company && userMap.get(j.company.toLowerCase()));

      const companyEmail =
        matchedUser?.workEmail ||
        matchedUser?.email ||
        (j.company && j.company.includes('@') ? j.company : '') ||
        (j.postedBy && j.postedBy.includes('@') ? j.postedBy : '');

      const companyDisplayName =
        matchedUser?.companyName ||
        (j.company && !j.company.includes('@')
          ? j.company
          : matchedUser?.name || j.company);

      const realApplicantsCount = Math.max(
        j.applicantsCount || 0,
        appCountMap.get(j._id.toString()) || 0
      );

      return {
        id: j._id.toString(),
        title: j.title,
        company: companyDisplayName || j.company,
        companyEmail: companyEmail || '',
        companyId: j.companyId ? j.companyId.toString() : undefined,
        type: j.type,
        location: j.location,
        salary: j.salary,
        status: j.status,
        postedOn: j.postedOn || 'Recent',
        applicantsCount: realApplicantsCount,
        department: j.department || 'Engineering',
        workplace: j.workplace || 'Hybrid',
        experience: j.experience || '2-4 years',
        openings: j.openings || 1,
        postedBy: j.postedBy || 'Talent Acquisition Team',
        tags: j.tags && j.tags.length > 0 ? j.tags : j.skills || [],
        skills: j.skills || [],
        description: j.description || '',
        responsibilities: j.responsibilities || [],
        requirements: j.requirements || [],
        benefits: j.benefits || [],
      };
    });

    res.json({ success: true, jobs: formatted });
  } catch (error: any) {
    console.error('getAdminJobs error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve jobs' });
  }
};

// @desc    Create a new job posting (used by companies or admin)
// @route   POST /api/admin/jobs or POST /api/jobs
export const createJob = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const {
      title,
      company,
      companyId,
      department = 'Engineering',
      location = 'Remote',
      workplace = 'Hybrid',
      type = 'Full-time',
      experience = '2-4 years',
      salary = 'Competitive',
      openings = 1,
      postedBy = 'Talent Acquisition Team',
      tags = [],
      skills = [],
      description = '',
      responsibilities = [],
      requirements = [],
      benefits = [],
      status = 'Active',
    } = req.body;

    if (!title || !String(title).trim()) {
      res.status(400).json({ success: false, message: 'Job title is required' });
      return;
    }

    if (!company || !String(company).trim()) {
      res.status(400).json({ success: false, message: 'Company name is required' });
      return;
    }

    const tagList = Array.isArray(tags) ? tags : [];
    const skillList = Array.isArray(skills) ? skills : tagList;

    let initialStatus = ['Active', 'Pending', 'Expired', 'Closed', 'Paused'].includes(status) ? status : 'Active';
    const reqUser = (req as any).user;
    const isCompanyRole = reqUser?.role === 'company' || (!reqUser && companyId);

    if (isCompanyRole) {
      let compUser: any = null;
      const candidateLookupIds = [
        companyId,
        reqUser?.id,
        reqUser?._id,
        reqUser?.userId,
        reqUser?.email,
        company,
      ].filter(Boolean);

      for (const lookupId of candidateLookupIds) {
        if (compUser) break;
        try {
          if (mongoose.isValidObjectId(lookupId)) {
            compUser = await User.findById(lookupId);
          }
        } catch (e) {}
        if (!compUser) {
          try {
            compUser = await User.findOne({
              $or: [
                { userId: lookupId },
                { customId: lookupId },
                { email: lookupId },
                { companyName: lookupId },
              ],
            });
          } catch (e) {}
        }
      }

      // If company does not exist, or is not Approved, or lacks job posting permission, strictly force Pending
      if (!compUser || compUser.status !== 'Approved' || compUser.permissions?.jobs !== true) {
        initialStatus = 'Pending';
      }
    }

    const newJob = new Job({
      title: String(title).trim(),
      company: String(company).trim(),
      companyId: companyId || undefined,
      department: String(department || 'Engineering').trim(),
      location: String(location || 'Remote').trim(),
      workplace: String(workplace || 'Hybrid').trim(),
      type: String(type || 'Full-time').trim(),
      experience: String(experience || '2-4 years').trim(),
      salary: String(salary || 'Competitive').trim(),
      openings: Number(openings) || 1,
      postedBy: String(postedBy || 'Talent Acquisition Team').trim(),
      tags: tagList,
      skills: skillList,
      description: String(description || '').trim(),
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      status: initialStatus,
      postedOn: 'Just now',
      applicantsCount: 0,
    });

    await newJob.save();

    res.status(201).json({
      success: true,
      message: `Job "${newJob.title}" posted successfully!`,
      job: {
        id: newJob._id.toString(),
        title: newJob.title,
        company: newJob.company,
        companyId: newJob.companyId,
        department: newJob.department,
        location: newJob.location,
        workplace: newJob.workplace,
        type: newJob.type,
        experience: newJob.experience,
        salary: newJob.salary,
        openings: newJob.openings,
        postedBy: newJob.postedBy,
        tags: newJob.tags,
        skills: newJob.skills,
        description: newJob.description,
        responsibilities: newJob.responsibilities,
        requirements: newJob.requirements,
        benefits: newJob.benefits,
        status: newJob.status,
        postedOn: newJob.postedOn,
        applicantsCount: newJob.applicantsCount,
      },
    });
  } catch (error: any) {
    console.error('createJob error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create job posting' });
  }
};

// @desc    Update existing job posting details
// @route   PUT /api/admin/jobs/:id or PUT /api/jobs/:id
export const updateJob = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;

    if (updateData.tags && !updateData.skills) {
      updateData.skills = updateData.tags;
    }

    let job = null;
    if (mongoose.isValidObjectId(id)) {
      job = await Job.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      job = await Job.findOneAndUpdate({ $or: [{ customId: id }, { title: id }] }, updateData, { new: true });
    }

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    res.json({
      success: true,
      message: `Job "${job.title}" updated successfully`,
      job: {
        id: job._id.toString(),
        title: job.title,
        company: job.company,
        companyId: job.companyId,
        department: job.department,
        location: job.location,
        workplace: job.workplace,
        type: job.type,
        experience: job.experience,
        salary: job.salary,
        openings: job.openings,
        postedBy: job.postedBy,
        tags: job.tags,
        skills: job.skills,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        benefits: job.benefits,
        status: job.status,
        postedOn: job.postedOn,
        applicantsCount: job.applicantsCount,
      },
    });
  } catch (error: any) {
    console.error('updateJob error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update job' });
  }
};

// @desc    Update job status (Active, Pending, Expired, Closed, Paused)
// @route   PATCH /api/admin/jobs/:id/status or PATCH /api/jobs/:id/status
export const updateJobStatus = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Pending', 'Expired', 'Closed', 'Paused'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid job status' });
      return;
    }

    const reqUser = (req as any).user;
    if (reqUser?.role === 'company' && status === 'Active') {
      const compUser = mongoose.isValidObjectId(reqUser.id) ? await User.findById(reqUser.id) : null;
      if (compUser && (compUser.status !== 'Approved' || compUser.permissions?.jobs !== true)) {
        res.status(403).json({ success: false, message: 'Company is pending approval. You cannot activate jobs until approved by Super Admin.' });
        return;
      }
    }

    let job = null;
    if (mongoose.isValidObjectId(id)) {
      job = await Job.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      job = await Job.findOneAndUpdate({ $or: [{ customId: id }, { title: id }] }, { status }, { new: true });
    }

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    res.json({
      success: true,
      message: `Job status changed to ${status}`,
      job: {
        id: job._id.toString(),
        title: job.title,
        status: job.status,
      },
    });
  } catch (error: any) {
    console.error('updateJobStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update job status' });
  }
};

// @desc    Delete a job
// @route   DELETE /api/admin/jobs/:id or DELETE /api/jobs/:id
export const deleteJob = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const { id } = req.params;

    let job = null;
    if (mongoose.isValidObjectId(id)) {
      job = await Job.findByIdAndDelete(id);
    } else {
      job = await Job.findOneAndDelete({ $or: [{ customId: id }, { title: id }] });
    }

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    res.json({ success: true, message: 'Job posting deleted successfully' });
  } catch (error: any) {
    console.error('deleteJob error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete job' });
  }
};

// @desc    Get applicants for a specific job posting
// @route   GET /api/admin/jobs/:id/applicants
export const getJobApplicants = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const id = String(req.params.id);

    let job: any = null;
    if (mongoose.isValidObjectId(id)) {
      job = await Job.findById(id);
    } else {
      job = await Job.findOne({ $or: [{ customId: id }, { title: id }] });
    }

    const orConditions: any[] = [];
    if (mongoose.isValidObjectId(id)) {
      orConditions.push({ jobId: new mongoose.Types.ObjectId(id) });
      orConditions.push({ jobId: id });
    }
    if (job) {
      if (job._id) {
        orConditions.push({ jobId: job._id });
        orConditions.push({ jobId: job._id.toString() });
      }
      if (job.title && job.company) {
        orConditions.push({
          position: new RegExp(`^${job.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
          company: new RegExp(`^${job.company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        });
      }
    }

    const apps = await Application.find(orConditions.length > 0 ? { $or: orConditions } : { jobId: id })
      .select('-pdfData')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch user details for candidate enrichment if registered user (lean & exclude heavy buffers)
    const emails = apps.map((a: any) => a.candidateEmail).filter(Boolean);
    const users = await User.find({ email: { $in: emails }, role: 'job_seeker' })
      .select('name email phone headline targetRole specialization experience skills resumeUrl resumeName education highestQualification course university passingYear bio languages location preferredLocation')
      .lean();
    const userMap = new Map(users.map((u: any) => [u.email.toLowerCase().trim(), u]));

    const formatted = apps.map((a: any) => {
      const u = a.candidateEmail ? userMap.get(a.candidateEmail.toLowerCase().trim()) : null;
      const cName = a.candidateName || (u ? u.name : 'Candidate');
      const isHttp = typeof (a.resumeUrl || (u ? u.resumeUrl : '')) === 'string' &&
        ((a.resumeUrl || (u ? u.resumeUrl : '')).startsWith('http://') || (a.resumeUrl || (u ? u.resumeUrl : '')).startsWith('https://'));
      const hasPdf = Boolean(a.resumeUrl || a.fileName || (u && (u.resumeUrl || u.resumeName)));
      return {
        id: a._id.toString(),
        candidateName: cName,
        candidateEmail: a.candidateEmail || (u ? u.email : ''),
        candidatePhone: a.candidatePhone || (u ? u.phone : ''),
        avatarLetter: a.avatarLetter || getInitials(cName),
        avatarBg: a.avatarBg || getColorForName(cName),
        position: a.position || (job ? job.title : 'Job Applicant'),
        company: a.company || (job ? job.company : ''),
        appliedOn: a.appliedOn || (a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'),
        status: a.status || 'New',
        resumeViewed: Boolean(a.resumeViewed),
        resumeViewedAt: a.resumeViewedAt,
        recruiterAction: a.recruiterAction || '',
        recruiterActionAt: a.recruiterActionAt,
        resumeUrl: isHttp ? (a.resumeUrl || (u ? u.resumeUrl : '')) : '',
        domain: a.domain || (u ? u.specialization || u.targetRole : '') || '',
        experience: a.experience || (u ? u.experience : '') || '',
        skills: (a.skills && a.skills.length > 0) ? a.skills : (u && u.skills ? u.skills : (job && job.skills ? job.skills : [])),
        pdfData: isHttp ? (a.resumeUrl || (u ? u.resumeUrl : '')) : '',
        fileName: a.fileName || (u ? u.resumeName : '') || 'Application_Resume.pdf',
        hasPdf,
        jobId: a.jobId ? a.jobId.toString() : (job ? job._id.toString() : id),
        education: (u ? (u.education || u.highestQualification || u.course) : '') || '',
        university: (u ? u.university : '') || '',
        passingYear: (u ? u.passingYear : '') || '',
        headline: (u ? u.headline : '') || '',
        bio: (u ? u.bio : '') || '',
        languages: (u ? u.languages : '') || '',
        location: (u ? (u.preferredLocation || u.location) : '') || '',
      };
    });

    res.json({
      success: true,
      job: job ? { id: job._id.toString(), title: job.title, company: job.company, applicantsCount: formatted.length } : null,
      count: formatted.length,
      applicants: formatted,
    });
  } catch (error: any) {
    console.error('getJobApplicants error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve job applicants' });
  }
};

// @desc    Get all resumes (both jobseeker profile resumes and application resumes)
// @route   GET /api/admin/applications
export const getAdminApplications = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();

    // 1 & 2. Fetch real applications and candidates without heavy base64 strings from MongoDB Atlas
    const [allApps, users] = await Promise.all([
      Application.find()
        .select('-pdfData -resumeUrl')
        .sort({ createdAt: -1 })
        .lean(),
      User.find({ role: 'job_seeker' })
        .select('name email phone headline targetRole resumeDate specialization experience skills resumeName createdAt')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const apps = allApps.filter((a: any) => a.company !== 'Candidate Profile Upload');
    const candidatesWithResume = users.filter((u: any) => Boolean(u.resumeName || u.resumeDate));

    // 3. Format job seeker profile resumes (strip base64 strings from list)
    const profileResumes = candidatesWithResume.map((u) => {
      const cName = u.name || 'Candidate';
      const isHttp = typeof u.resumeUrl === 'string' && (u.resumeUrl.startsWith('http://') || u.resumeUrl.startsWith('https://'));
      const hasPdf = Boolean(u.resumeUrl || u.resumeName);
      return {
        id: `profile-${u._id.toString()}`,
        candidateName: cName,
        candidateEmail: u.email,
        candidatePhone: u.phone || '',
        avatarLetter: getInitials(cName),
        avatarBg: getColorForName(cName),
        position: u.headline || u.targetRole || 'Candidate Profile',
        company: 'Candidate Profile',
        appliedOn: u.resumeDate ? u.resumeDate.split('•')[0].trim() : 'Profile Resume',
        status: 'Shortlisted' as const,
        resumeUrl: isHttp ? u.resumeUrl : '',
        domain: u.specialization || u.targetRole || 'General Pool',
        experience: u.experience || 'Fresher',
        skills: u.skills || [],
        pdfData: isHttp ? u.resumeUrl : '',
        fileName: u.resumeName || `${cName.replace(/\s+/g, '_')}_Resume.pdf`,
        isProfileResume: true,
        resumeType: 'Profile Resume',
        jobId: '',
        hasPdf,
      };
    });

    // 4. Format job application resumes (strip base64 strings from list)
    const applicationResumes = apps.map((a: any) => {
      const isHttp = typeof a.resumeUrl === 'string' && (a.resumeUrl.startsWith('http://') || a.resumeUrl.startsWith('https://'));
      const hasPdf = Boolean(a.pdfData || a.resumeUrl || a.fileName);
      return {
        id: a._id.toString(),
        candidateName: a.candidateName,
        candidateEmail: a.candidateEmail || '',
        candidatePhone: a.candidatePhone || '',
        avatarLetter: a.avatarLetter || getInitials(a.candidateName),
        avatarBg: a.avatarBg || getColorForName(a.candidateName),
        position: a.position,
        company: a.company,
        appliedOn: a.appliedOn || 'Recent',
        status: a.status,
        resumeUrl: isHttp ? a.resumeUrl : '',
        domain: a.domain || '',
        experience: a.experience || '',
        skills: a.skills || [],
        pdfData: isHttp ? a.resumeUrl : '',
        fileName: a.fileName || 'Application_Resume.pdf',
        isApplicationResume: true,
        resumeType: 'Application Resume',
        jobId: a.jobId ? a.jobId.toString() : '',
        hasPdf,
      };
    });

    const allResumes = [...applicationResumes, ...profileResumes];

    res.json({ success: true, applications: allResumes });
  } catch (error: any) {
    console.error('getAdminApplications error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve resumes' });
  }
};

// @desc    Get single application or profile resume file on-demand
// @route   GET /api/admin/applications/:id/resume
export const getAdminApplicationResume = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const id = String(req.params.id || "");

    if (id.startsWith('profile-')) {
      const userId = id.replace('profile-', '');
      const user = await User.findById(userId).select('resumeUrl resumeName name').lean();
      if (!user) {
        return res.status(404).json({ success: false, message: 'Candidate not found' });
      }
      return res.json({
        success: true,
        pdfData: user.resumeUrl || '',
        resumeUrl: user.resumeUrl || '',
        fileName: user.resumeName || `${(user.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`,
      });
    }

    const app = await Application.findById(id).select('pdfData resumeUrl fileName candidateName').lean();
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const pdfData = app.pdfData || app.resumeUrl || '';
    return res.json({
      success: true,
      pdfData,
      resumeUrl: app.resumeUrl || pdfData,
      fileName: app.fileName || `${(app.candidateName || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`,
    });
  } catch (error: any) {
    console.error('getAdminApplicationResume error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve resume document' });
  }
};

// @desc    Upload / Create candidate application or resume
// @route   POST /api/admin/applications
export const createAdminApplication = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const {
      candidateName,
      candidateEmail,
      candidatePhone,
      position,
      company,
      domain,
      experience,
      skills,
      pdfData,
      fileName,
      status,
      resumeUrl,
    } = req.body;

    if (!candidateName || !domain || !experience) {
      res.status(400).json({
        success: false,
        message: 'Candidate name, domain, and experience are required.',
      });
      return;
    }

    const newApp = new Application({
      candidateName: candidateName.trim(),
      candidateEmail: (candidateEmail || '').trim(),
      candidatePhone: (candidatePhone || '').trim(),
      position: (position || domain || 'Candidate').trim(),
      company: (company || 'General Pool / Open').trim(),
      domain: domain.trim(),
      experience: experience.trim(),
      skills: Array.isArray(skills)
        ? skills
        : skills
        ? String(skills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      pdfData: pdfData || '',
      fileName: fileName || '',
      resumeUrl: resumeUrl || '',
      status: status || 'New',
      avatarLetter: getInitials(candidateName),
      avatarBg: getColorForName(candidateName),
    });

    await newApp.save();

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      application: {
        id: newApp._id.toString(),
        candidateName: newApp.candidateName,
        candidateEmail: newApp.candidateEmail,
        candidatePhone: newApp.candidatePhone,
        avatarLetter: newApp.avatarLetter,
        avatarBg: newApp.avatarBg,
        position: newApp.position,
        company: newApp.company,
        appliedOn: newApp.appliedOn,
        status: newApp.status,
        domain: newApp.domain,
        experience: newApp.experience,
        skills: newApp.skills,
        pdfData: newApp.pdfData,
        fileName: newApp.fileName,
        resumeUrl: newApp.resumeUrl,
      },
    });
  } catch (error: any) {
    console.error('createAdminApplication error:', error);
    res.status(500).json({ success: false, message: 'Failed to create resume/application' });
  }
};

// @desc    Send bulk resumes to a specific company
// @route   POST /api/admin/resumes/bulk-send
export const sendBulkResumesToCompany = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const { companyId, resumes, resumeIds } = req.body;
    const targetCompanyId = req.params.id || companyId;

    if (!targetCompanyId) {
      res.status(400).json({ success: false, message: 'Company ID is required' });
      return;
    }

    // Find company by _id, userId, customId, email, or companyName
    let company: any = null;
    if (mongoose.Types.ObjectId.isValid(targetCompanyId)) {
      company = await User.findById(targetCompanyId);
    }
    if (!company) {
      company = await User.findOne({
        $or: [
          { userId: targetCompanyId },
          { customId: targetCompanyId },
          { email: String(targetCompanyId).toLowerCase().trim() },
          { companyName: String(targetCompanyId).trim() },
        ],
        role: 'company',
      });
    }

    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found with specified ID or email' });
      return;
    }

    // Determine resumes to transfer
    let resumesToAdd: any[] = [];
    if (Array.isArray(resumes) && resumes.length > 0) {
      resumesToAdd = resumes.map((r: any, idx: number) => ({
        id: r.id || `purchased-${Date.now()}-${idx}`,
        candidateName: r.candidateName || r.name || 'Candidate',
        title: r.targetRole || r.headline || r.position || r.title || r.domain || 'Candidate Profile',
        experience: r.experience || 'Fresher',
        location: r.location || 'India',
        purchasedDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        fileSize: r.fileSize || '250 KB',
        downloadUrl: r.resumeUrl || r.downloadUrl || '',
        email:
          r.candidateEmail ||
          r.email ||
          `${String(r.candidateName || r.name || 'candidate').toLowerCase().replace(/\s+/g, '')}@example.com`,
        phone: r.candidatePhone || r.phone || '+91 98765 43210',
        pdfData: r.resumeUrl || r.pdfData || '',
        domain: r.targetRole || r.domain || '',
        skills: Array.isArray(r.skills)
          ? r.skills
          : typeof r.skills === 'string' && r.skills.trim()
          ? r.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : r.specialization
          ? [r.specialization]
          : r.domain
          ? [r.domain]
          : [],
        isUnlocked: Boolean(r.isUnlocked),
        unlockedAt: r.unlockedAt || '',
      }));
    } else if (Array.isArray(resumeIds) && resumeIds.length > 0) {
      const dbApps = await Application.find({ _id: { $in: resumeIds } });
      resumesToAdd = dbApps.map((a: any) => ({
        id: a._id.toString(),
        candidateName: a.candidateName,
        title: a.position || a.domain || 'Candidate Profile',
        experience: a.experience || '1-2 Years',
        location: 'India',
        purchasedDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        fileSize: '280 KB',
        downloadUrl: a.resumeUrl || '',
        email: a.candidateEmail || `${a.candidateName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        phone: a.candidatePhone || '+91 98765 43210',
        pdfData: a.pdfData || '',
        domain: a.domain || '',
        skills: Array.isArray(a.skills)
          ? a.skills
          : typeof a.skills === 'string' && a.skills.trim()
          ? a.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : a.domain
          ? [a.domain]
          : [],
        isUnlocked: false,
        unlockedAt: '',
      }));
    }

    if (resumesToAdd.length === 0) {
      res.status(400).json({ success: false, message: 'No resumes provided to send.' });
      return;
    }

    // Initialize purchasedResumes if undefined
    if (!company.purchasedResumes) {
      company.purchasedResumes = [];
    }

    // Avoid duplicate additions by ID
    const existingIds = new Set(company.purchasedResumes.map((r: any) => r.id));
    const newItems = resumesToAdd.filter((r) => !existingIds.has(r.id));
    company.purchasedResumes = [...newItems, ...company.purchasedResumes];

    // Ensure company has resumes tab unlocked in permissions
    if (!company.permissions) {
      company.permissions = {
        dashboard: false,
        jobs: false,
        applicants: false,
        resumes: true,
        settings: false,
        autoApproveFromSubscription: true,
      };
    } else {
      company.permissions.resumes = true;
    }

    await company.save();

    res.json({
      success: true,
      message: `Successfully sent ${newItems.length} candidate resumes to ${company.companyName || company.name || company.email}.`,
      company: {
        id: company._id.toString(),
        userId: company.userId || company.customId,
        companyName: company.companyName || company.name,
        email: company.email,
        phone: company.phone,
        industry: company.industry,
        location: company.location,
        plan: company.plan,
        purchasedResumesCount: company.purchasedResumes.length,
      },
      sentResumesCount: newItems.length,
      purchasedResumes: company.purchasedResumes,
    });
  } catch (error: any) {
    console.error('sendBulkResumesToCompany error:', error);
    res.status(500).json({ success: false, message: 'Failed to send bulk resumes to company' });
  }
};

// @desc    Update application status
// @route   PATCH /api/admin/applications/:id/status
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const { id } = req.params;
    const { status } = req.body;

    if (!['New', 'Applied', 'Shortlisted', 'Reviewed', 'Reviewing', 'Interview', 'Hired', 'Rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid application status' });
      return;
    }

    const updateFields: any = { status };
    if (['Shortlisted', 'Interview', 'Hired', 'Rejected'].includes(status)) {
      updateFields.recruiterAction = status;
      updateFields.recruiterActionAt = new Date();
      updateFields.resumeViewed = true;
      updateFields.resumeViewedAt = new Date();
    } else if (['Reviewed', 'Reviewing'].includes(status)) {
      updateFields.resumeViewed = true;
      updateFields.resumeViewedAt = new Date();
    }

    const app = await Application.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      application: {
        id: app._id.toString(),
        candidateName: app.candidateName,
        status: app.status,
        recruiterAction: app.recruiterAction,
        resumeViewed: app.resumeViewed,
      },
    });
  } catch (error: any) {
    console.error('updateApplicationStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
};

// @desc    Get subscription plans
// @route   GET /api/admin/plans
export const getAdminPlans = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    await seedInitialAdminData();

    const plans = await Plan.find({}).sort({ createdAt: 1 });
    res.json({ success: true, plans });
  } catch (error: any) {
    console.error('getAdminPlans error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve plans' });
  }
};

// @desc    Create a new subscription plan
// @route   POST /api/admin/plans
export const createAdminPlan = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const {
      name,
      price,
      yearlyPrice = '',
      billingCycle = 'monthly',
      features = [],
      credits = 50,
      status = 'Active',
    } = req.body;

    if (!name || !price) {
      res.status(400).json({ success: false, message: 'Name and price are required' });
      return;
    }

    const newPlan = await Plan.create({
      name,
      price,
      yearlyPrice,
      billingCycle,
      features,
      credits,
      status,
    });

    res.status(201).json({
      success: true,
      message: `Plan "${name}" created successfully`,
      plan: newPlan,
    });
  } catch (error: any) {
    console.error('createAdminPlan error:', error);
    res.status(500).json({ success: false, message: 'Failed to create plan' });
  }
};

// @desc    Update an existing plan
// @route   PUT /api/admin/plans/:id
export const updateAdminPlan = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const id = String(req.params.id);
    const { name, price, yearlyPrice, billingCycle, features, credits, status } = req.body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (yearlyPrice !== undefined) updateData.yearlyPrice = yearlyPrice;
    if (billingCycle !== undefined) updateData.billingCycle = billingCycle;
    if (features !== undefined) updateData.features = features;
    if (credits !== undefined) updateData.credits = credits;
    if (status !== undefined) updateData.status = status;

    const updatedPlan = await Plan.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPlan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    res.json({
      success: true,
      message: `Plan "${updatedPlan.name}" updated successfully`,
      plan: updatedPlan,
    });
  } catch (error: any) {
    console.error('updateAdminPlan error:', error);
    res.status(500).json({ success: false, message: 'Failed to update plan' });
  }
};

// @desc    Delete a plan
// @route   DELETE /api/admin/plans/:id
export const deleteAdminPlan = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const id = String(req.params.id);

    const deletedPlan = await Plan.findByIdAndDelete(id);
    if (!deletedPlan) {
      res.status(404).json({ success: false, message: 'Plan not found' });
      return;
    }

    res.json({
      success: true,
      message: `Plan "${deletedPlan.name}" deleted successfully`,
    });
  } catch (error: any) {
    console.error('deleteAdminPlan error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete plan' });
  }
};

// Global permissions settings store
let globalPermissionsSettings: {
  defaultPermissions: Record<string, boolean>;
  autoApprovalEnabled: boolean;
  freeTrialEnabled?: boolean;
  trialDays?: number;
  trialCredits?: number;
  trialPoints?: string[];
  enableDefaultPermissions?: boolean;
  defaultNewCompanyPerms?: Record<string, boolean>;
  planRules: Record<string, any>;
  planRulesDetails?: any[];
} = {
  defaultPermissions: {
    profile: true,
    subscription: true,
    dashboard: false,
    jobs: false,
    applicants: false,
    resumes: false,
    settings: false,
  },
  autoApprovalEnabled: true,
  freeTrialEnabled: true,
  trialDays: 14,
  trialCredits: 15,
  trialPoints: [
    'Instant access to Candidate Search & Talent Pool',
    'Direct Candidate CV Downloads with Complimentary Credits',
    'Post & Manage Job Openings on the platform',
    'Real-time Applicant Pipeline & Status Tracking',
    'Direct Messaging & Company Dashboard Access',
  ],
  enableDefaultPermissions: true,
  defaultNewCompanyPerms: {
    dashboard: true,
    jobs: true,
    applicants: true,
    resumes: false,
    settings: false,
  },
  planRules: {
    'Free Trial': {
      dashboard: true,
      jobs: true,
      applicants: true,
      resumes: false,
      settings: false,
    },
    'Basic Plan': {
      dashboard: false,
      jobs: true,
      applicants: true,
      resumes: false,
      settings: false,
    },
    'Pro Plan': {
      dashboard: true,
      jobs: true,
      applicants: true,
      resumes: true,
      settings: false,
    },
    'Enterprise': {
      dashboard: true,
      jobs: true,
      applicants: true,
      resumes: true,
      settings: true,
    },
  },
};

// Helper to find matching plan rule for a plan string
export const findMatchingPlanRule = (planName?: string, planRules: Record<string, any> = globalPermissionsSettings.planRules) => {
  if (!planName) return null;
  const p = planName.trim().toLowerCase();

  // 1. Direct exact key match first
  for (const [key, rule] of Object.entries(planRules)) {
    const k = key.trim().toLowerCase();
    if (p === k) {
      return rule;
    }
  }

  // 2. Free Trial matching
  if (p.includes('trial')) {
    return (
      planRules['Free Trial'] ||
      globalPermissionsSettings.defaultNewCompanyPerms || {
        dashboard: true,
        jobs: true,
        applicants: true,
        resumes: false,
        settings: false,
      }
    );
  }

  // 3. Specific tier matching
  if (p.includes('enterprise')) return planRules['Enterprise'] || planRules['Tier 3'] || null;
  if (p.includes('growth') || p.includes('pro')) return planRules['Pro Plan'] || planRules['Tier 2'] || null;
  if (p.includes('starter') || p.includes('basic') || p.includes('testy')) return planRules['Basic Plan'] || planRules['Tier 1'] || null;

  // 4. Last fallback
  for (const [key, rule] of Object.entries(planRules)) {
    const k = key.trim().toLowerCase();
    if (k && (p === k || (k.length > 5 && p.includes(k)))) {
      return rule;
    }
  }

  return null;
};

// @desc    Update company permissions manually (works with or without active subscription)
// @route   PATCH /api/admin/companies/:id/permissions
export const updateCompanyPermissions = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    await seedInitialAdminData();
    const id = String(req.params.id);
    const { permissions, email, name, companyName, plan, resumeCredits } = req.body;

    let company = null;
    if (mongoose.isValidObjectId(id)) {
      company = await User.findById(id);
    }

    if (!company) {
      // Find by userId or customId (including c1 -> co01 mapping)
      const mappedCoId = id.replace(/^c(\d+)$/i, 'co0$1');
      company = await User.findOne({
        $or: [
          { userId: id },
          { customId: id },
          { userId: mappedCoId },
          { customId: mappedCoId },
        ],
      });
    }

    // Try finding by email
    if (!company && (email || req.query.email)) {
      const searchEmail = String(email || req.query.email).trim().toLowerCase();
      company = await User.findOne({
        $or: [
          { email: searchEmail },
          { workEmail: searchEmail },
        ],
      });
    }

    // Try finding by company name
    if (!company && (name || companyName || req.query.name)) {
      const searchName = String(name || companyName || req.query.name).trim();
      company = await User.findOne({
        $or: [
          { companyName: new RegExp(`^${searchName}$`, 'i') },
          { name: new RegExp(`^${searchName}$`, 'i') },
        ],
      });
    }

    const assignedCredits =
      typeof resumeCredits === 'number'
        ? resumeCredits
        : plan === 'Free Trial' && typeof globalPermissionsSettings.trialCredits === 'number'
        ? globalPermissionsSettings.trialCredits
        : 0;

    // If company not in database yet (e.g. demo mock), upsert it directly
    if (!company) {
      const compName = name || companyName || `Company ${id}`;
      const compEmail = (email || `${id.toLowerCase()}@example.com`).toLowerCase();
      company = await User.create({
        userId: id,
        customId: id,
        email: compEmail,
        workEmail: compEmail,
        password: 'Password@123',
        role: 'company',
        companyName: compName,
        name: compName,
        location: 'India',
        status: 'Approved',
        plan: plan || '',
        resumeCredits: assignedCredits,
        permissions: {
          dashboard: false,
          jobs: false,
          applicants: false,
          resumes: false,
          settings: false,
          autoApproveFromSubscription: true,
          ...permissions,
        },
      });
    } else {
      if (plan && typeof plan === 'string') {
        company.plan = plan;
      }
      if (typeof resumeCredits === 'number') {
        company.resumeCredits = resumeCredits;
      } else if (plan === 'Free Trial' && typeof globalPermissionsSettings.trialCredits === 'number' && (!company.resumeCredits || company.resumeCredits === 0)) {
        company.resumeCredits = globalPermissionsSettings.trialCredits;
      }
      company.permissions = {
        dashboard: false,
        jobs: false,
        applicants: false,
        resumes: false,
        settings: false,
        autoApproveFromSubscription: true,
        ...(company.permissions || {}),
        ...permissions,
      };
      await company.save();
    }

    res.json({
      success: true,
      message: `Permissions updated successfully for ${company.companyName || company.name}`,
      permissions: company.permissions,
      plan: company.plan,
      resumeCredits: company.resumeCredits,
      company: {
        id: company._id.toString(),
        userId: company.userId || company.customId,
        name: company.companyName || company.name,
        plan: company.plan,
        resumeCredits: company.resumeCredits,
      },
    });
  } catch (error: any) {
    console.error('updateCompanyPermissions error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update company permissions' });
  }
};

// @desc    Get admin permissions settings & plan auto-approval rules
// @route   GET /api/admin/permissions-settings
export const getAdminPermissionsSettings = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const doc = await Settings.findOne({ key: 'global_permissions' });
    if (doc && doc.value) {
      globalPermissionsSettings = {
        ...globalPermissionsSettings,
        ...doc.value,
      };
    }
    res.json({ success: true, settings: globalPermissionsSettings });
  } catch (error: any) {
    console.error('getAdminPermissionsSettings error:', error);
    res.json({ success: true, settings: globalPermissionsSettings });
  }
};

// @desc    Update admin permissions settings & plan auto-approval rules
// @route   PUT /api/admin/permissions-settings
export const updateAdminPermissionsSettings = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const { settings } = req.body;
    let updatedCompaniesCount = 0;

    if (settings) {
      globalPermissionsSettings = {
        ...globalPermissionsSettings,
        ...settings,
      };

      // Keep Free Trial rule synchronized with defaultNewCompanyPerms
      if (globalPermissionsSettings.defaultNewCompanyPerms) {
        globalPermissionsSettings.planRules = {
          ...(globalPermissionsSettings.planRules || {}),
          'Free Trial': globalPermissionsSettings.defaultNewCompanyPerms,
        };
      }

      // Persist to MongoDB
      await Settings.findOneAndUpdate(
        { key: 'global_permissions' },
        { key: 'global_permissions', value: globalPermissionsSettings },
        { upsert: true, new: true }
      );

      // PROPAGATE: Update all company accounts whose subscriptions match the modified plan rules
      const planRules = globalPermissionsSettings.planRules || {};
      const companies = await User.find({ role: 'company' });

      for (const comp of companies) {
        // Skip if company manually opted out of subscription auto-approval
        if (comp.permissions?.autoApproveFromSubscription === false) {
          continue;
        }

        const compPlan = comp.plan || '';
        const isTrialComp = compPlan.toLowerCase().includes('trial') || compPlan === 'Free Trial';
        const isUnsubscribed = !compPlan || compPlan === 'No Active Plan';

        if (isTrialComp) {
          const trialPerms = globalPermissionsSettings.defaultNewCompanyPerms || {
            dashboard: true,
            jobs: true,
            applicants: true,
            resumes: false,
            settings: false,
          };
          comp.permissions = {
            profile: true,
            subscription: true,
            dashboard: Boolean(trialPerms.dashboard),
            jobs: Boolean(trialPerms.jobs),
            applicants: Boolean(trialPerms.applicants),
            resumes: Boolean(trialPerms.resumes),
            settings: Boolean(trialPerms.settings),
            autoApproveFromSubscription: true,
          };
          await comp.save();
          updatedCompaniesCount++;
        } else if (isUnsubscribed && globalPermissionsSettings.enableDefaultPermissions) {
          const basePerms = globalPermissionsSettings.defaultNewCompanyPerms || {
            dashboard: true,
            jobs: true,
            applicants: true,
            resumes: false,
            settings: false,
          };
          comp.permissions = {
            profile: true,
            subscription: true,
            dashboard: Boolean(basePerms.dashboard),
            jobs: Boolean(basePerms.jobs),
            applicants: Boolean(basePerms.applicants),
            resumes: Boolean(basePerms.resumes),
            settings: Boolean(basePerms.settings),
            autoApproveFromSubscription: true,
          };
          await comp.save();
          updatedCompaniesCount++;
        } else {
          const matchedRule = findMatchingPlanRule(compPlan, planRules);
          if (matchedRule) {
            comp.permissions = {
              profile: true,
              subscription: true,
              dashboard: Boolean(matchedRule.dashboard),
              jobs: Boolean(matchedRule.jobs),
              applicants: Boolean(matchedRule.applicants),
              resumes: Boolean(matchedRule.resumes),
              settings: Boolean(matchedRule.settings),
              autoApproveFromSubscription: true,
            };
            await comp.save();
            updatedCompaniesCount++;
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Global permissions updated and applied to ${updatedCompaniesCount} company subscriptions`,
      settings: globalPermissionsSettings,
      updatedCompaniesCount,
    });
  } catch (error: any) {
    console.error('updateAdminPermissionsSettings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update permissions settings' });
  }
};

// @desc    Get all registered job seekers
// @route   GET /api/admin/jobseekers
export const getAdminJobSeekers = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();

    const users = await User.find({ role: 'job_seeker' })
      .select('-password -purchasedResumes -resumeUrl -bannerImage -profileImage')
      .sort({ createdAt: -1 })
      .lean();

    const jobSeekers = users.map((u) => {
      const name = u.name || 'Candidate';
      return {
        id: u._id.toString(),
        userId: u.userId || u.customId || 'N/A',
        name,
        email: u.email,
        phone: u.phone || '',
        headline: u.headline || u.targetRole || 'Job Seeker',
        targetRole: u.targetRole || '',
        experience: u.experience || 'Fresher',
        location: u.preferredLocation || u.location || 'India',
        highestQualification: u.highestQualification || '',
        course: u.course || '',
        courseType: u.courseType || '',
        specialization: u.specialization || '',
        university: u.university || '',
        startingYear: u.startingYear || '',
        passingYear: u.passingYear || '',
        gradingSystem: u.gradingSystem || '',
        gradeScore: u.gradeScore || '',
        skills: u.skills || [],
        languages: u.languages || '',
        workStatus: u.workStatus || '',
        expectedSalary: u.expectedSalary || '',
        resumeName: u.resumeName || '',
        resumeDate: u.resumeDate || '',
        resumeUrl: '',
        hasResume: Boolean(u.resumeName),
        status: u.status || 'Active',
        createdAt: u.createdAt,
        registeredOn: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Recent',
        avatarBg: getColorForName(name),
        avatarLetter: getInitials(name),
      };
    });

    res.json({ success: true, jobSeekers, count: jobSeekers.length });
  } catch (error: any) {
    console.error('getAdminJobSeekers error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve job seekers' });
  }
};

// @desc    Delete a job seeker
// @route   DELETE /api/admin/jobseekers/:id
export const deleteAdminJobSeeker = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Job seeker not found' });
      return;
    }

    const email = user.email;
    const customId = user.userId || user.customId;

    await User.findByIdAndDelete(id);

    if (customId) {
      await Promise.all([
        UserCredential.deleteMany({ $or: [{ userId: customId }, { email }] }).catch(() => {}),
        UserProfile.deleteMany({ $or: [{ userId: customId }, { email }] }).catch(() => {}),
      ]);
    }
    await Application.deleteMany({
      $or: [{ candidateId: id }, { candidateEmail: email }],
    }).catch(() => {});

    res.json({ success: true, message: 'Job seeker removed successfully' });
  } catch (error: any) {
    console.error('deleteAdminJobSeeker error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete job seeker' });
  }
};

// @desc    Get real notifications for Super Admin (Companies & Job Seekers registration only)
// @route   GET /api/admin/notifications
export const getAdminNotifications = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();

    // 1. Fetch recent companies
    const companies = await User.find({ role: 'company' })
      .select('_id userId customId companyName name workEmail email status createdAt')
      .sort({ createdAt: -1 })
      .limit(30);

    // 2. Fetch recent job seekers
    const jobSeekers = await User.find({
      $or: [{ role: 'job_seeker' }, { role: { $nin: ['company', 'admin'] } }],
    })
      .select('_id userId customId name email headline targetRole createdAt')
      .sort({ createdAt: -1 })
      .limit(30);

    const notifications: any[] = [];

    companies.forEach((comp) => {
      const cName = comp.companyName || comp.name || 'Unnamed Company';
      const isPending = comp.status === 'Pending';
      notifications.push({
        id: `comp-${comp._id.toString()}`,
        type: 'company_registered',
        title: 'New Company Registered',
        desc: isPending
          ? `${cName} applied for approval`
          : `${cName} registered as employer`,
        createdAt: comp.createdAt || new Date(),
        targetTab: isPending ? 'approvals' : 'companies',
        entityId: comp._id.toString(),
        iconType: 'company',
      });
    });

    jobSeekers.forEach((seeker) => {
      const sName = seeker.name || 'Candidate';
      const roleText = seeker.targetRole || seeker.headline || 'Job Seeker';
      notifications.push({
        id: `seeker-${seeker._id.toString()}`,
        type: 'jobseeker_registered',
        title: 'New Jobseeker Registered',
        desc: `${sName} registered (${roleText})`,
        createdAt: seeker.createdAt || new Date(),
        targetTab: 'jobseekers',
        entityId: seeker._id.toString(),
        iconType: 'jobseeker',
      });
    });

    // Sort all notifications by createdAt descending
    notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      count: notifications.length,
      notifications: notifications.slice(0, 30),
    });
  } catch (error: any) {
    console.error('getAdminNotifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
  }
};

// @desc    Get detailed platform analytics and reports data
// @route   GET /api/admin/reports
export const getAdminReports = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();

    const [
      allUsers,
      allJobs,
      allApplications,
      allPlans
    ] = await Promise.all([
      User.find({}).select('role plan experience createdAt skills').lean(),
      Job.find({}).select('department createdAt status').lean(),
      Application.find({}).select('status createdAt').lean(),
      Plan.find({}).select('name price status').lean(),
    ]);

    const companies = allUsers.filter((u: any) => u.role === 'company');
    const jobSeekers = allUsers.filter((u: any) => u.role === 'job_seeker');

    // 1. Applications Funnel
    const funnel = {
      total: allApplications.length,
      new: allApplications.filter((a: any) => a.status === 'New').length,
      reviewed: allApplications.filter((a: any) => a.status === 'Reviewed' || a.status === 'Reviewing').length,
      shortlisted: allApplications.filter((a: any) => a.status === 'Shortlisted').length,
      interview: allApplications.filter((a: any) => a.status === 'Interview').length,
      hired: allApplications.filter((a: any) => a.status === 'Hired').length,
      rejected: allApplications.filter((a: any) => a.status === 'Rejected').length,
    };

    // 2. Company Plans Distribution
    const planCounts: Record<string, number> = {};
    companies.forEach((c: any) => {
      const p = c.plan || 'Free Tier';
      planCounts[p] = (planCounts[p] || 0) + 1;
    });

    // 3. Jobs Domain Breakdown (Real departments from jobs, no defaults)
    const domainCounts: Record<string, number> = {};
    allJobs.forEach((j: any) => {
      const d = (j.department || 'General').trim();
      domainCounts[d] = (domainCounts[d] || 0) + 1;
    });

    // 4. Candidate Experience Distribution (Real candidate profiles only)
    const expCounts: Record<string, number> = {
      'Fresher (0-1 Yrs)': 0,
      'Junior (1-3 Yrs)': 0,
      'Mid-Level (3-5 Yrs)': 0,
      'Senior (5+ Yrs)': 0,
    };
    jobSeekers.forEach((c: any) => {
      const exp = (c.experience || '').toLowerCase().trim();
      if (exp.includes('0-1') || exp.includes('fresher')) expCounts['Fresher (0-1 Yrs)']++;
      else if (exp.includes('1-3')) expCounts['Junior (1-3 Yrs)']++;
      else if (exp.includes('3-5')) expCounts['Mid-Level (3-5 Yrs)']++;
      else if (exp.length > 0) expCounts['Senior (5+ Yrs)']++;
    });

    // 5. 100% Real Monthly trends calculation based on actual document createdAt timestamps
    const now = new Date();
    const monthsList: Array<{ label: string; year: number; monthIdx: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsList.push({
        label: d.toLocaleString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
      });
    }

    const monthlyTrends = monthsList.map((m) => {
      const isSameMonth = (d: Date | string | undefined) => {
        if (!d) return false;
        const dateObj = new Date(d);
        return dateObj.getFullYear() === m.year && dateObj.getMonth() === m.monthIdx;
      };

      return {
        month: m.label,
        jobs: allJobs.filter((j: any) => isSameMonth(j.createdAt)).length,
        applications: allApplications.filter((a: any) => isSameMonth(a.createdAt)).length,
        companies: companies.filter((c: any) => isSameMonth(c.createdAt)).length,
        candidates: jobSeekers.filter((u: any) => isSameMonth(u.createdAt)).length,
      };
    });

    // 6. Real Candidate and Application skills extraction (no defaults)
    const skillCounts: Record<string, number> = {};
    const addSkills = (skillsList: any) => {
      if (Array.isArray(skillsList)) {
        skillsList.forEach((s) => {
          const str = String(s).trim();
          if (str && str.length > 0) {
            skillCounts[str] = (skillCounts[str] || 0) + 1;
          }
        });
      } else if (typeof skillsList === 'string' && skillsList.trim().length > 0) {
        skillsList.split(',').forEach((s) => {
          const str = s.trim();
          if (str && str.length > 0) {
            skillCounts[str] = (skillCounts[str] || 0) + 1;
          }
        });
      }
    };

    jobSeekers.forEach((c: any) => addSkills(c.skills));
    allApplications.forEach((a: any) => addSkills(a.skills));

    const topSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 7. Estimated revenue and ARPU based on real company plans
    let calculatedRevenue = 0;
    companies.forEach((c: any) => {
      if (c.plan) {
        const matched = allPlans.find((p: any) => p.name?.toLowerCase().trim() === c.plan?.toLowerCase().trim());
        if (matched && matched.price) {
          const numPrice = parseInt(String(matched.price).replace(/[^\d]/g, ''), 10) || 0;
          calculatedRevenue += numPrice;
        }
      }
    });

    const avgArpu = companies.length > 0 ? Math.round(calculatedRevenue / companies.length) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalCompanies: companies.length,
          approvedCompanies: companies.filter((c: any) => c.status === 'Approved').length,
          pendingCompanies: companies.filter((c: any) => c.status === 'Pending').length,
          totalJobs: allJobs.length,
          activeJobs: allJobs.filter((j: any) => j.status === 'Active').length,
          totalApplications: allApplications.length,
          totalCandidates: jobSeekers.length,
          estimatedRevenue: calculatedRevenue > 0 ? `₹ ${calculatedRevenue.toLocaleString('en-IN')}` : '₹ 0',
          avgArpu: avgArpu > 0 ? `₹ ${avgArpu.toLocaleString('en-IN')}` : '₹ 0',
          conversionRate: allApplications.length > 0 
            ? `${Math.round(((funnel.shortlisted + funnel.hired) / allApplications.length) * 100)}%` 
            : '0%',
        },
        funnel,
        planCounts,
        domainCounts,
        expCounts,
        monthlyTrends,
        topSkills,
      },
    });
  } catch (error: any) {
    console.error('getAdminReports error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate reports' });
  }
};
