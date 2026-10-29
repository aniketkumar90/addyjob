import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { UserProfile } from '../models/profile.model.js';
import { Job } from '../models/job.model.js';
import { Settings } from '../models/settings.model.js';
import { ensureDBConnection } from '../config/db.js';

const iconNames = ['Layers', 'Sparkles', 'Sprout', 'Globe', 'Boxes', 'Triangle'] as const;
const iconColors = [
  { iconBg: 'bg-blue-50 border-blue-100', color: 'text-blue-600', banner: 'from-slate-900 via-blue-950 to-indigo-900', accent: 'from-blue-600 to-indigo-700' },
  { iconBg: 'bg-rose-50 border-rose-100', color: 'text-rose-600', banner: 'from-slate-900 via-rose-950 to-pink-900', accent: 'from-rose-600 to-pink-700' },
  { iconBg: 'bg-emerald-50 border-emerald-100', color: 'text-emerald-600', banner: 'from-slate-900 via-emerald-950 to-teal-900', accent: 'from-emerald-600 to-teal-700' },
  { iconBg: 'bg-indigo-50 border-indigo-100', color: 'text-indigo-600', banner: 'from-slate-900 via-indigo-950 to-blue-900', accent: 'from-indigo-600 to-blue-700' },
  { iconBg: 'bg-purple-50 border-purple-100', color: 'text-purple-600', banner: 'from-slate-900 via-purple-950 to-indigo-900', accent: 'from-purple-600 to-indigo-700' },
  { iconBg: 'bg-cyan-50 border-cyan-100', color: 'text-cyan-600', banner: 'from-slate-900 via-cyan-950 to-sky-900', accent: 'from-cyan-600 to-sky-700' },
];

const getInitials = (n: string): string => {
  if (!n) return 'CO';
  const clean = n.trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

const getThemeForCompany = (name: string, id: string) => {
  let hash = 0;
  const str = (name || '') + (id || '');
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % iconColors.length;
  const iconIndex = Math.abs(hash) % iconNames.length;
  return {
    iconName: iconNames[iconIndex],
    ...iconColors[index],
  };
};

// @desc    Get all registered companies from MongoDB with their real active job counts
// @route   GET /api/companies
export const getCompanies = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();

    const { search, location, industry } = req.query;

    const query: Record<string, any> = {
      role: 'company',
    };

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      query.$or = [
        { companyName: searchRegex },
        { name: searchRegex },
        { industry: searchRegex },
        { location: searchRegex },
      ];
    }

    if (location && String(location).toLowerCase() !== 'all locations' && String(location).toLowerCase() !== 'all') {
      query.location = new RegExp(String(location).trim(), 'i');
    }

    if (industry && String(industry).toLowerCase() !== 'all industries' && String(industry).toLowerCase() !== 'all') {
      query.industry = new RegExp(String(industry).trim(), 'i');
    }

    const companyUsers = await User.find(query).select('-password -purchasedResumes').sort({ createdAt: -1 }).lean();

    // Fetch active jobs with minimal fields to aggregate count per company
    const activeJobs = await Job.find({ status: 'Active' }).select('company companyId').lean();

    const companyIds = companyUsers.map((u) => u._id.toString());
    const profiles = await UserProfile.find({ userId: { $in: companyIds } }).lean();
    const profileMap = new Map();
    profiles.forEach((p: any) => profileMap.set(p.userId, p));

    const formatted = companyUsers.map((u) => {
      const cName = u.companyName || u.name || 'Company';
      const cKey = cName.toLowerCase().trim();
      const idStr = u._id.toString();
      const customId = u.userId || u.customId || '';
      const p = profileMap.get(idStr);

      // Count all active jobs belonging to this company by ID or Name
      const matchingJobs = activeJobs.filter((j) => {
        if (j.companyId && (j.companyId.toString() === idStr || (customId && j.companyId.toString() === customId))) {
          return true;
        }
        if (j.company && j.company.toLowerCase().trim() === cKey) {
          return true;
        }
        return false;
      });

      const openRoles = matchingJobs.length;
      const theme = getThemeForCompany(cName, idStr);

      const realBanner = u.bannerImage || (p as any)?.bannerImage || '';
      const realLogo = u.profileImage || u.logo || (p as any)?.profileImage || (p as any)?.logo || '';
      const realTagline = u.tagline || (p as any)?.tagline || u.industry || u.headline || '';
      const realAbout = u.aboutCompany || u.bio || (p as any)?.aboutCompany || (p as any)?.bio || '';
      const realWebsite = u.website || (p as any)?.website || (u.workEmail && u.workEmail.includes('@') && !u.workEmail.toLowerCase().endsWith('gmail.com') ? u.workEmail.split('@')[1] : '');
      const realGst = u.gstNumber || (p as any)?.gstNumber || '';
      const realPhone = u.phone || (p as any)?.phone || '';
      const realStatus = u.status || (p as any)?.status || 'Pending';

      return {
        id: idStr,
        _id: idStr,
        customId: u.userId || u.customId || idStr,
        name: cName,
        companyName: cName,
        logo: realLogo,
        profileImage: realLogo,
        bannerImage: realBanner,
        tagline: realTagline,
        industry: u.industry || p?.industry || 'Technology & Software',
        location: u.location || p?.location || 'India',
        size: u.companySize || p?.companySize || '1-10 employees',
        rating: 4.8,
        reviewsCount: '250',
        recommendRate: '95%',
        ceoApproval: '96%',
        followers: '12.5k',
        companyType: 'Private Enterprise',
        openRoles,
        about: realAbout,
        aboutCompany: realAbout,
        founded: (u as any).incorporationYear || (p as any)?.incorporationYear || '',
        website: realWebsite,
        gstNumber: realGst,
        phone: realPhone,
        email: u.workEmail || u.email || '',
        status: realStatus,
        iconName: theme.iconName,
        iconBg: theme.iconBg,
        color: theme.color,
        accentColor: theme.accent,
        bannerGradient: theme.banner,
        initials: getInitials(cName),
        culture: (Array.isArray(u.culture) && u.culture.length > 0)
          ? u.culture
          : (Array.isArray((p as any)?.culture) && (p as any).culture.length > 0)
          ? (p as any).culture
          : [],
        perks: (Array.isArray(u.perks) && u.perks.length > 0)
          ? u.perks
          : (Array.isArray((p as any)?.perks) && (p as any).perks.length > 0)
          ? (p as any).perks
          : [],
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      companies: formatted,
    });
  } catch (error: any) {
    console.error('getCompanies error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve companies', error: error.message });
  }
};

// @desc    Get single company profile and ALL its real jobs from MongoDB
// @route   GET /api/companies/:id
export const getCompanyById = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const id = String(req.params.id);

    let companyUser = null;

    if (mongoose.isValidObjectId(id)) {
      companyUser = await User.findById(id);
    }

    if (!companyUser) {
      // Find by customId / userId
      companyUser = await User.findOne({
        role: 'company',
        $or: [{ userId: id }, { customId: id }],
      });
    }

    if (!companyUser) {
      // Find by slug / company name
      const cleanName = id.replace(/-/g, ' ');
      companyUser = await User.findOne({
        role: 'company',
        $or: [
          { companyName: new RegExp(`^${cleanName}$`, 'i') },
          { name: new RegExp(`^${cleanName}$`, 'i') },
        ],
      });
    }

    if (!companyUser && (/^\d+$/.test(id) || id === '1')) {
      companyUser = await User.findOne({ role: 'company' });
    }

    if (!companyUser) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }

    const cName = companyUser.companyName || companyUser.name || 'Company';
    const idStr = companyUser._id.toString();
    const theme = getThemeForCompany(cName, idStr);

    // Also load userProfile to ensure bannerImage, logo, and descriptions are fully merged
    const profileLookupConditions: any[] = [{ userId: companyUser._id.toString() }];
    if (companyUser.userId) profileLookupConditions.push({ userId: companyUser.userId });
    if (companyUser.customId) profileLookupConditions.push({ userId: companyUser.customId });
    if (companyUser.email) profileLookupConditions.push({ email: companyUser.email });

    const userProfile = await UserProfile.findOne({ $or: profileLookupConditions });

    const prof = userProfile as any;
    const realBanner = companyUser.bannerImage || prof?.bannerImage || '';
    const realLogo = companyUser.profileImage || companyUser.logo || prof?.profileImage || prof?.logo || '';
    const realTagline = companyUser.tagline || prof?.tagline || companyUser.industry || companyUser.headline || '';
    const realAbout = companyUser.aboutCompany || companyUser.bio || prof?.aboutCompany || prof?.bio || '';
    const realWebsite = companyUser.website || prof?.website || (companyUser.workEmail && companyUser.workEmail.includes('@') && !companyUser.workEmail.toLowerCase().endsWith('gmail.com') ? companyUser.workEmail.split('@')[1] : '');
    const realGst = companyUser.gstNumber || prof?.gstNumber || '';
    const realPhone = companyUser.phone || prof?.phone || '';
    const realStatus = companyUser.status || prof?.status || 'Pending';
    const realIndustry = companyUser.industry || prof?.industry || 'Technology & Software';
    const realLocation = companyUser.location || prof?.location || 'India';
    const realSize = companyUser.companySize || prof?.companySize || '1-10 employees';

    // Fetch all jobs posted by this company from MongoDB
    const jobs = await Job.find({
      $or: [
        { companyId: idStr },
        { companyId: companyUser.userId || companyUser.customId },
        { company: new RegExp(`^${cName}$`, 'i') },
      ],
      status: { $ne: 'Closed' },
    }).sort({ createdAt: -1 });

    const formattedJobs = jobs.map((j) => ({
      id: j._id.toString(),
      _id: j._id.toString(),
      title: j.title,
      company: j.company,
      companyId: idStr,
      logo: j.logo || realLogo,
      type: j.type,
      location: j.location,
      salary: j.salary,
      status: j.status,
      postedOn: j.postedOn || 'Recent',
      applicantsCount: j.applicantsCount || 0,
      department: j.department || 'Engineering',
      category: j.department || 'Engineering',
      workplace: j.workplace || 'Hybrid',
      experience: j.experience || '1-3 years',
      skills: j.skills || [],
      tags: j.tags && j.tags.length > 0 ? j.tags : j.skills || [],
      openings: j.openings || 1,
      postedBy: j.postedBy || cName,
      description: j.description || '',
      responsibilities: j.responsibilities || [],
      requirements: j.requirements || [],
      benefits: j.benefits || [],
      createdAt: j.createdAt,
    }));

    const formattedCompany = {
      id: idStr,
      _id: idStr,
      customId: companyUser.userId || companyUser.customId || idStr,
      name: cName,
      companyName: cName,
      logo: realLogo,
      profileImage: realLogo,
      bannerImage: realBanner,
      tagline: realTagline,
      industry: realIndustry,
      location: realLocation,
      size: realSize,
      rating: 4.8,
      reviewsCount: '250',
      recommendRate: '95%',
      ceoApproval: '96%',
      followers: '12.5k',
      companyType: 'Private Enterprise',
      openRoles: formattedJobs.filter((j) => j.status === 'Active').length,
      about: realAbout,
      aboutCompany: realAbout,
      founded: (companyUser as any).incorporationYear || prof?.incorporationYear || '',
      website: realWebsite,
      gstNumber: realGst,
      phone: realPhone,
      email: companyUser.workEmail || companyUser.email || '',
      status: realStatus,
      iconName: theme.iconName,
      iconBg: theme.iconBg,
      color: theme.color,
      accentColor: theme.accent,
      bannerGradient: theme.banner,
      initials: getInitials(cName),
      culture: (Array.isArray(companyUser.culture) && companyUser.culture.length > 0)
        ? companyUser.culture
        : (Array.isArray(prof?.culture) && prof.culture.length > 0)
        ? prof.culture
        : [],
      perks: (Array.isArray(companyUser.perks) && companyUser.perks.length > 0)
        ? companyUser.perks
        : (Array.isArray(prof?.perks) && prof.perks.length > 0)
        ? prof.perks
        : [],
      notificationSettings: companyUser.notificationSettings || {
        emailNotificationOnApplication: true,
        lowCreditAlert: true,
        autoAcknowledgeApplicants: true,
        creditThreshold: 5,
      },
    };

    res.json({
      success: true,
      company: formattedCompany,
      jobs: formattedJobs,
    });
  } catch (error: any) {
    console.error('getCompanyById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve company details', error: error.message });
  }
};

// @desc    Update single company profile directly by ID, customId, email, or name
// @route   PUT /api/companies/:id
export const updateCompanyById = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const id = String(req.params.id);

    let companyUser = null;
    if (mongoose.isValidObjectId(id)) {
      companyUser = await User.findById(id);
    }
    if (!companyUser) {
      companyUser = await User.findOne({
        role: 'company',
        $or: [{ userId: id }, { customId: id }, { email: id }],
      });
    }
    if (!companyUser) {
      const cleanName = id.replace(/-/g, ' ');
      companyUser = await User.findOne({
        role: 'company',
        $or: [
          { companyName: new RegExp(`^${cleanName}$`, 'i') },
          { name: new RegExp(`^${cleanName}$`, 'i') },
        ],
      });
    }

    if (!companyUser) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }

    const reqUser = (req as any).user;
    if (!reqUser) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const isAdmin = reqUser.role === 'admin' || reqUser.role === 'sadmin';
    const isOwner = companyUser._id.toString() === reqUser.id ||
      (companyUser.userId && companyUser.userId === reqUser.userId) ||
      (companyUser.email && companyUser.email.toLowerCase() === reqUser.email?.toLowerCase());

    if (!isAdmin && !isOwner) {
      res.status(403).json({ success: false, message: 'Access forbidden. You can only update your own company profile.' });
      return;
    }

    const {
      companyName,
      name,
      tagline,
      industry,
      companySize,
      location,
      headquarters,
      website,
      workEmail,
      contactEmail,
      phone,
      contactPhone,
      gstNumber,
      aboutCompany,
      bio,
      profileImage,
      logo,
      bannerImage,
      culture,
      perks,
      status,
      rejectionReason,
    } = req.body;

    const oldCompanyName = companyUser.companyName || companyUser.name || '';

    if (companyName !== undefined) {
      companyUser.companyName = companyName;
      if (!name) companyUser.name = companyName;
    }
    if (name !== undefined) companyUser.name = name;
    if (tagline !== undefined) companyUser.tagline = tagline;
    if (industry !== undefined) companyUser.industry = industry;
    if (companySize !== undefined) companyUser.companySize = companySize;
    if (location !== undefined) companyUser.location = location;
    if (headquarters !== undefined && location === undefined) companyUser.location = headquarters;
    if (website !== undefined) companyUser.website = website;
    if (workEmail !== undefined) companyUser.workEmail = workEmail;
    if (contactEmail !== undefined && workEmail === undefined) companyUser.workEmail = contactEmail;
    if (phone !== undefined) companyUser.phone = phone;
    if (contactPhone !== undefined && phone === undefined) companyUser.phone = contactPhone;
    if (gstNumber !== undefined) companyUser.gstNumber = gstNumber;
    if (aboutCompany !== undefined) companyUser.aboutCompany = aboutCompany;
    if (bio !== undefined && aboutCompany === undefined) companyUser.bio = bio;
    if (profileImage !== undefined) {
      companyUser.profileImage = profileImage;
      companyUser.logo = profileImage;
    }
    if (logo !== undefined && profileImage === undefined) {
      companyUser.logo = logo;
      companyUser.profileImage = logo;
    }
    if (bannerImage !== undefined) companyUser.bannerImage = bannerImage;

    if (culture !== undefined) {
      companyUser.culture = Array.isArray(culture)
        ? culture
        : typeof culture === 'string'
        ? culture.split('\n').map((s: string) => s.trim()).filter(Boolean)
        : [];
    }
    if (perks !== undefined) {
      companyUser.perks = Array.isArray(perks)
        ? perks
        : typeof perks === 'string'
        ? perks.split('\n').map((s: string) => s.trim()).filter(Boolean)
        : [];
    }

    if (isAdmin) {
      if (status !== undefined) {
        companyUser.status = status;
        if (status === 'Pending') companyUser.rejectionReason = '';
      }
      if (rejectionReason !== undefined) {
        companyUser.rejectionReason = rejectionReason;
      }
    } else if (companyUser.status === 'Rejected') {
      companyUser.status = 'Pending';
      companyUser.rejectionReason = '';
    }

    if (req.body.notificationSettings !== undefined) {
      companyUser.notificationSettings = {
        ...(companyUser.notificationSettings || {
          emailNotificationOnApplication: true,
          lowCreditAlert: true,
          autoAcknowledgeApplicants: true,
          creditThreshold: 5,
        }),
        ...req.body.notificationSettings,
      };
    }
    if (req.body.plan !== undefined) {
      companyUser.plan = req.body.plan;
    }
    if (typeof req.body.resumeCredits === 'number') {
      companyUser.resumeCredits = req.body.resumeCredits;
    }
    if (req.body.permissions !== undefined && typeof req.body.permissions === 'object') {
      companyUser.permissions = {
        dashboard: false,
        jobs: false,
        applicants: false,
        resumes: false,
        settings: false,
        ...(companyUser.permissions || {}),
        ...req.body.permissions,
        autoApproveFromSubscription: true,
      };
    }

    await companyUser.save();

    // Also sync to UserProfile collection
    const idStr = companyUser._id.toString();
    const profileLookupConditions: any[] = [{ userId: idStr }];
    if (companyUser.userId) profileLookupConditions.push({ userId: companyUser.userId });
    if (companyUser.customId) profileLookupConditions.push({ userId: companyUser.customId });
    if (companyUser.email) profileLookupConditions.push({ email: companyUser.email });

    await UserProfile.findOneAndUpdate(
      { $or: profileLookupConditions },
      {
        userId: companyUser.userId || companyUser.customId || idStr,
        email: companyUser.email,
        companyName: companyUser.companyName,
        tagline: companyUser.tagline,
        industry: companyUser.industry,
        companySize: companyUser.companySize,
        location: companyUser.location,
        website: companyUser.website,
        mobile: companyUser.phone,
        gstNumber: companyUser.gstNumber,
        aboutCompany: companyUser.aboutCompany,
        profileImage: companyUser.profileImage,
        logo: companyUser.logo,
        bannerImage: companyUser.bannerImage,
        culture: companyUser.culture,
        perks: companyUser.perks,
      },
      { upsert: true, new: true }
    );

    // Sync to Jobs
    const newCompName = companyUser.companyName || companyUser.name || '';
    if (newCompName || companyUser.logo || companyUser.profileImage) {
      const jobUpdate: any = {};
      if (newCompName) {
        jobUpdate.company = newCompName;
        jobUpdate.postedBy = newCompName;
      }
      if (companyUser.logo || companyUser.profileImage) {
        jobUpdate.logo = companyUser.logo || companyUser.profileImage;
      }
      await Job.updateMany(
        {
          $or: [
            { companyId: idStr },
            { companyId: companyUser.userId },
            { company: oldCompanyName },
          ].filter(Boolean),
        },
        { $set: jobUpdate }
      );
    }

    res.json({
      success: true,
      message: 'Company profile updated successfully',
      company: {
        id: idStr,
        name: newCompName,
        companyName: newCompName,
        bannerImage: companyUser.bannerImage,
        logo: companyUser.profileImage || companyUser.logo,
        profileImage: companyUser.profileImage || companyUser.logo,
        culture: companyUser.culture,
        perks: companyUser.perks,
        tagline: companyUser.tagline,
        aboutCompany: companyUser.aboutCompany,
        notificationSettings: companyUser.notificationSettings,
      },
    });
  } catch (error: any) {
    console.error('updateCompanyById error:', error);
    res.status(500).json({ success: false, message: 'Failed to update company profile', error: error.message });
  }
};

// @desc    Send test notification (Application alert or Low credit alert)
// @route   POST /api/companies/:id/test-notification
// @access  Private / Company Admin
export const testCompanyNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const { type } = req.body; // 'application_alert' | 'low_credit'

    let companyUser = null;
    if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
      companyUser = await User.findById(id);
    }
    if (!companyUser) {
      companyUser = await User.findOne({
        $or: [{ userId: id }, { customId: id }, { email: id }],
      });
    }

    if (!companyUser) {
      res.status(404).json({ success: false, message: 'Company account not found' });
      return;
    }

    const recipient = companyUser.workEmail || companyUser.email || 'company@example.com';
    const cName = companyUser.companyName || companyUser.name || 'Company';

    if (type === 'low_credit') {
      const remainingCredits = (companyUser.resumeCredits ?? 0) - (companyUser.resumesUsed ?? 0);
      const threshold = companyUser.notificationSettings?.creditThreshold ?? 5;
      res.json({
        success: true,
        message: `⚠️ Low balance alert dispatched to ${recipient}! Balance: ${remainingCredits} credits, Threshold: ${threshold}.`,
        details: {
          recipient,
          type: 'low_credit',
          remainingCredits,
          threshold,
          alertMessage: `Heads up! Your company ${cName} has only ${remainingCredits} resume credits left. Please recharge your plan to keep accessing candidates.`,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      res.json({
        success: true,
        message: `📧 New application email alert sent to ${recipient}!`,
        details: {
          recipient,
          type: 'application_alert',
          candidateName: 'Alex Morgan',
          position: 'Senior Software Engineer',
          appliedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          alertMessage: `New application alert for ${cName}: Alex Morgan has applied for "Senior Software Engineer". Review this candidate in your AddyJob recruiter portal.`,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error: any) {
    console.error('testCompanyNotification error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to dispatch test notification' });
  }
};

// @desc    Activate Free Trial for the logged-in company user
// @route   POST /api/companies/activate-trial
export const activateCompanyTrial = async (req: Request, res: Response) => {
  try {
    await ensureDBConnection();
    const authReq = req as any;
    const userId = authReq.user?.id || authReq.user?.userId;
    const userEmail = authReq.user?.email;

    let company = null;
    if (userId && mongoose.isValidObjectId(userId)) {
      company = await User.findById(userId);
    }
    if (!company && userId) {
      company = await User.findOne({
        role: 'company',
        $or: [{ userId }, { customId: userId }],
      });
    }
    if (!company && userEmail) {
      company = await User.findOne({
        role: 'company',
        $or: [{ email: userEmail.toLowerCase() }, { workEmail: userEmail.toLowerCase() }],
      });
    }

    // Fallback: check body email, name, or companyId if provided
    if (!company && req.body?.email) {
      const email = String(req.body.email).toLowerCase().trim();
      company = await User.findOne({
        role: 'company',
        $or: [{ email }, { workEmail: email }],
      });
    }
    if (!company && req.body?.companyId) {
      const cId = String(req.body.companyId).trim();
      if (mongoose.isValidObjectId(cId)) {
        company = await User.findById(cId);
      }
      if (!company) {
        company = await User.findOne({
          role: 'company',
          $or: [{ userId: cId }, { customId: cId }],
        });
      }
    }

    if (!company) {
      res.status(404).json({ success: false, message: 'Company account not found' });
      return;
    }

    // Load active settings from MongoDB
    const settingsDoc = await Settings.findOne({ key: 'global_permissions' });
    const globalSettings = settingsDoc?.value || {};

    const trialDays = typeof globalSettings.trialDays === 'number' ? globalSettings.trialDays : 14;
    const trialCredits = typeof globalSettings.trialCredits === 'number' ? globalSettings.trialCredits : 15;
    const trialPerms = globalSettings.defaultNewCompanyPerms || {
      dashboard: true,
      jobs: true,
      applicants: true,
      resumes: false,
      settings: false,
    };

    company.plan = 'Free Trial';
    company.resumeCredits = trialCredits;
    company.resumesUsed = 0;
    company.permissions = {
      dashboard: false,
      jobs: false,
      applicants: false,
      resumes: false,
      settings: false,
      ...trialPerms,
      autoApproveFromSubscription: true,
    };

    await company.save();

    res.json({
      success: true,
      message: `🎉 Free Trial activated! You have ${trialDays} days access and ${trialCredits} complimentary resume credits.`,
      plan: 'Free Trial',
      trialDays,
      resumeCredits: company.resumeCredits,
      permissions: company.permissions,
      company: {
        id: company._id.toString(),
        userId: company.userId || company.customId,
        name: company.companyName || company.name,
        companyName: company.companyName || company.name,
        plan: company.plan,
        resumeCredits: company.resumeCredits,
        permissions: company.permissions,
      },
    });
  } catch (error: any) {
    console.error('activateCompanyTrial error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to activate Free Trial' });
  }
};

// @desc    Unlock candidate contact details from company's purchased resumes vault
// @route   POST /api/companies/resumes/:resumeId/unlock
// @access  Private / Company
export const unlockPurchasedResume = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureDBConnection();
    const authReq = req as any;
    const userId = authReq.user?.id || authReq.user?.userId;
    const userEmail = authReq.user?.email;

    if (!userId && !userEmail) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let company = null;
    if (userId && mongoose.isValidObjectId(userId)) {
      company = await User.findById(userId);
    }
    if (!company && userId) {
      company = await User.findOne({
        role: 'company',
        $or: [{ userId }, { customId: userId }],
      });
    }
    if (!company && userEmail) {
      company = await User.findOne({
        role: 'company',
        $or: [{ email: userEmail.toLowerCase() }, { workEmail: userEmail.toLowerCase() }],
      });
    }

    if (!company) {
      res.status(404).json({ success: false, message: 'Company account not found' });
      return;
    }

    const { resumeId } = req.params;
    const { candidateName } = req.body || {};

    const targetId = String(resumeId || '').trim();
    const targetName = String(candidateName || '').trim().toLowerCase();

    const vault = company.purchasedResumes || [];
    const matchedResume: any = vault.find((r: any) => {
      const rId = String(r.id || r._id || '').trim();
      if (targetId && (rId === targetId || String(r._id) === targetId)) return true;
      if (targetName && String(r.candidateName || r.name || '').trim().toLowerCase() === targetName) return true;
      return false;
    });

    if (!matchedResume) {
      res.status(404).json({ success: false, message: 'Resume not found in your company vault' });
      return;
    }

    const currentlyUnlocked = vault.filter((r: any) => r.isUnlocked).length;
    const totalCredits = company.resumeCredits ?? 0;

    // If already unlocked, return success immediately
    if (matchedResume.isUnlocked) {
      const remainingCredits = Math.max(0, totalCredits - Math.max(currentlyUnlocked, company.resumesUsed ?? 0));
      res.json({
        success: true,
        message: `${matchedResume.candidateName || 'Candidate'} contact details are already unlocked`,
        resume: matchedResume,
        resumesUsed: company.resumesUsed ?? currentlyUnlocked,
        remainingCredits,
        totalCredits,
      });
      return;
    }

    // Reconcile resumesUsed so it doesn't erroneously block valid credits
    const currentUsed = Math.max(currentlyUnlocked, company.resumesUsed ?? 0);
    const availableCredits = totalCredits - currentUsed;

    if (availableCredits <= 0) {
      res.status(400).json({
        success: false,
        message: 'Insufficient credits! Please purchase more credits to unlock this candidate.',
        remainingCredits: 0,
        totalCredits,
      });
      return;
    }

    // Unlock candidate
    matchedResume.isUnlocked = true;
    matchedResume.unlockedAt = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    company.resumesUsed = currentUsed + 1;
    company.markModified('purchasedResumes');
    await company.save();

    const remaining = Math.max(0, totalCredits - company.resumesUsed);

    res.json({
      success: true,
      message: `🎉 ${matchedResume.candidateName || 'Candidate'}'s contact details unlocked! 1 credit deducted.`,
      resume: matchedResume,
      resumesUsed: company.resumesUsed,
      remainingCredits: remaining,
      totalCredits,
    });
  } catch (error: any) {
    console.error('unlockPurchasedResume error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to unlock resume' });
  }
  }
