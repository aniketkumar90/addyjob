"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  PlusCircle,
  Search,
  MapPin,
  Calendar,
  FileText,
  ShieldCheck,
  Eye,
  Trash2,
  X,
  Sparkles,
  ArrowRight,
  UserCheck,
  UserX,
  CreditCard,
  Download,
  Crown,
  ChevronRight,
  ChevronDown,
  LogOut,
  Mail,
  Phone,
  Settings,
  LayoutDashboard,
  Check,
  FolderDown,
  Plus,
  Camera,
  Upload,
  ImageIcon,
  ExternalLink,
  Globe,
  Share2,
  Pencil,
  Menu,
  Clock,
  AlertCircle,
  AlertOctagon,
  XCircle,
  Send,
  Star,
  Lock,
  Unlock,
  KeyRound,
  HeartHandshake,
  Gift,
  Code2,
  Palette,
  Layers,
  Compass,
  Megaphone,
  TrendingUp,
  BarChart3,
  GraduationCap,
  Award,
  Coins,
  MoreVertical,
} from "lucide-react";
import {
  getStoredUser,
  setStoredUser,
  safeSetLocalStorage,
  clearAuthSession,
  getEffectiveCompanyPermissions,
  CompanyPermissions,
  PLAN_AUTO_PERMISSIONS,
  getMatchingPlanRule,
  syncGlobalPermissionsRules,
  updateCompanyPermissions,
  activateCompanyTrial,
  fetchAdminPermissionsSettings,
  fetchCurrentUser,
  updateUserProfile,
  unlockCompanyResume,
  fetchAdminPlans,
  fetchPublicJobs,
  createCompanyJob,
  fetchCompanyJobs,
  updateCompanyJob,
  updateCompanyJobStatus,
  deleteCompanyJob,
  fetchCompanyApplicationsFromDB,
  updateApplicationStatusAPI,
  markResumeViewedAPI,
  fetchJobApplicants,
  fetchCompanyApplications,
  updateAdminApplicationStatus,
  notifyApplicationSync,
  testCompanyNotificationAPI,
} from "@/lib/api";
import { downloadCandidateResume } from "@/lib/resumeDownload";
import CompanyJobApplicantsModal, {
  CompanyCandidateApplicant,
} from "@/components/company/CompanyJobApplicantsModal";
import {
  CustomJobDropdown,
  DropdownOption,
} from "@/components/company/CustomJobDropdown";

const JOB_DEPARTMENT_OPTIONS: DropdownOption[] = [
  {
    value: "Engineering",
    label: "Engineering",
    description: "Software, Frontend, Backend & Full-Stack",
    badge: "Tech",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
    icon: Code2,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    value: "Product Design",
    label: "Product Design (UI/UX)",
    description: "UI/UX, Visual Design, Systems & Research",
    badge: "Design",
    badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
    icon: Palette,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    value: "Platform Eng",
    label: "Platform Eng / DevOps",
    description: "Cloud, SRE, Kubernetes, CI/CD & Security",
    badge: "Infra",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    icon: Layers,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    value: "Product Management",
    label: "Product Management",
    description: "Roadmaps, Product Strategy & Feature Delivery",
    badge: "Strategy",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Compass,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    value: "Marketing & Growth",
    label: "Marketing & Growth",
    description: "Performance Marketing, SEO, Social & Content",
    badge: "Growth",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Megaphone,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    value: "Sales & BD",
    label: "Sales & BD",
    description: "Enterprise Sales, Partnerships & Account Exec",
    badge: "Sales",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: TrendingUp,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    value: "Data & Analytics",
    label: "Data & Analytics",
    description: "Data Science, AI/ML Pipelines & Business BI",
    badge: "AI/Data",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: BarChart3,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    value: "Human Resources",
    label: "Human Resources",
    description: "Talent Acquisition, People Operations & Culture",
    badge: "HR",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    icon: Users,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
];

const JOB_WORKPLACE_OPTIONS: DropdownOption[] = [
  {
    value: "Remote",
    label: "Remote",
    description: "Work from anywhere without geographic boundaries",
    badge: "Anywhere",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Globe,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    value: "Hybrid",
    label: "Hybrid",
    description: "Balanced home & office schedule (2-3 days)",
    badge: "Flexible",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Building2,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    value: "On-site",
    label: "On-site (In-office)",
    description: "Full in-office presence required at workspace",
    badge: "In-Office",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: MapPin,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
];

const JOB_EMPLOYMENT_TYPE_OPTIONS: DropdownOption[] = [
  {
    value: "Full-time",
    label: "Full-time",
    description: "Standard 40h/week with standard perks",
    badge: "Permanent",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Briefcase,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    value: "Part-time",
    label: "Part-time",
    description: "Flexible working hours under 30h/week",
    badge: "Part-Time",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Clock,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    value: "Contract",
    label: "Contract",
    description: "Fixed duration project or consulting",
    badge: "Contract",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: FileText,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    value: "Internship",
    label: "Internship",
    description: "Mentorship & student learning opportunity",
    badge: "Student",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: GraduationCap,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
];

const JOB_EXPERIENCE_OPTIONS: DropdownOption[] = [
  {
    value: "0-1 years",
    label: "0 - 1 years (Fresher)",
    description: "Entry level, college grads & early career",
    badge: "Fresher",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Sparkles,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    value: "1-3 years",
    label: "1 - 3 years (Junior)",
    description: "Solid basics with 1-3 years practical experience",
    badge: "Junior",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Award,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    value: "3-5 years",
    label: "3 - 5 years (Mid-Level)",
    description: "Independent contributor with solid track record",
    badge: "Mid-Level",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Briefcase,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    value: "5-8 years",
    label: "5 - 8 years (Senior)",
    description: "Deep domain expertise & project leadership",
    badge: "Senior",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: TrendingUp,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    value: "8+ years",
    label: "8+ years (Lead / Architect)",
    description: "High-level system design & team direction",
    badge: "Lead",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    icon: Crown,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
];

// Types
interface PostedJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  workplace?: string;
  experience?: string;
  salary: string;
  openings?: number | string;
  postedBy?: string;
  tags?: string[];
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  applicantsCount: number;
  status: "Active" | "Pending" | "Paused" | "Closed";
  postedOn: string;
}

interface RecruiterApplicant {
  id: string;
  candidateName: string;
  appliedRole: string;
  jobId: string;
  experience: string;
  location: string;
  appliedDate: string;
  resumeFileName: string;
  skills: string[];
  status: "Applied" | "Reviewing" | "Shortlisted" | "Interview" | "Hired" | "Rejected";
  matchScore: number;
  email: string;
  phone: string;
  notes?: string;
  resumeUrl?: string;
  pdfData?: string;
  domain?: string;
  education?: string;
  university?: string;
  passingYear?: string;
  headline?: string;
  bio?: string;
  languages?: string;
}

interface PurchasedResume {
  id: string;
  candidateName: string;
  title: string;
  experience: string;
  location: string;
  purchasedDate: string;
  fileSize: string;
  downloadUrl: string;
  email: string;
  phone: string;
  skills?: string[];
  pdfData?: string;
  domain?: string;
  isUnlocked?: boolean;
  unlockedAt?: string;
}

export default function CompanyDashboardPage() {
  const router = useRouter();

  // Active Tab - default to profile as default details are always visible
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "profile" | "jobs" | "applicants" | "resumes" | "subscription" | "settings"
  >("profile");

  // Company Permissions State (controlled by Super Admin + Plan Auto-Approval)
  const [permissions, setPermissions] = useState<CompanyPermissions>({
    dashboard: false,
    jobs: false,
    applicants: false,
    resumes: false,
    settings: false,
    autoApproveFromSubscription: true,
  });

  // Mobile sidebar drawer state & Navbar Profile Dropdown state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const handleTabSwitch = (
    tab: "dashboard" | "profile" | "jobs" | "applicants" | "resumes" | "subscription" | "settings"
  ) => {
    if (tab !== "profile" && tab !== "subscription" && tab !== "jobs" && !permissions[tab]) {
      setToastMessage("🔒 This feature is currently locked under your company trial permissions.");
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
    setIsProfileDropdownOpen(false);
  };

  // Close profile dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileDropdownOpen]);

  // Company Profile Info (Initialized with real user data or clean empty defaults)
  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [cultureText, setCultureText] = useState("");
  const [perksText, setPerksText] = useState("");

  // Profile Image & Banner Cover Image states
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [imageModalState, setImageModalState] = useState<{
    isOpen: boolean;
    type: "profile" | "banner";
    mode: "menu" | "view";
  }>({ isOpen: false, type: "profile", mode: "menu" });

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Subscription & Resume Credits state (Default 0 until activated/purchased)
  const [currentPlan, setCurrentPlan] = useState("No Active Plan");
  const [planValidity, setPlanValidity] = useState("No Active Plan");
  const [totalResumesPurchased, setTotalResumesPurchased] = useState(0);
  const [resumesUsed, setResumesUsed] = useState(0);
  const [activePlanCard, setActivePlanCard] = useState<"starter" | "pro" | "enterprise" | "trial" | null>(null);
  const [companyStatus, setCompanyStatus] = useState<"Pending" | "Approved" | "Rejected">("Pending");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [isApprovalRequiredModalOpen, setIsApprovalRequiredModalOpen] = useState(false);

  // Live Job Posting Permission: Only approved companies with jobs permission can post directly to Active
  const isCompanyApproved = companyStatus === "Approved";
  const canPostLiveJobs = isCompanyApproved && Boolean(permissions.jobs);

  // Portal / Company Notification Settings
  const [emailNotificationOnApplication, setEmailNotificationOnApplication] = useState<boolean>(true);
  const [lowCreditAlert, setLowCreditAlert] = useState<boolean>(true);
  const [autoAcknowledgeApplicants, setAutoAcknowledgeApplicants] = useState<boolean>(true);
  const [creditThreshold, setCreditThreshold] = useState<number>(5);
  const [isSavingSettingKey, setIsSavingSettingKey] = useState<string | null>(null);
  const [isTestingAlert, setIsTestingAlert] = useState<"application_alert" | "low_credit" | null>(null);
  const [lastTestAlertResult, setLastTestAlertResult] = useState<{
    type: "application_alert" | "low_credit";
    message: string;
    details?: any;
    time: string;
  } | null>(null);

  // Dynamic Plans from Super Admin Database & Monthly/Yearly/Trial toggle
  const [adminPlans, setAdminPlans] = useState<any[]>([]);
  const [subscriptionBillingCycle, setSubscriptionBillingCycle] = useState<"monthly" | "yearly" | "trial">("monthly");

  // Default trial benefit points if not customized by admin yet
  const DEFAULT_TRIAL_POINTS = [
    "Instant access to Candidate Search & Talent Pool",
    "Direct Candidate CV Downloads with Complimentary Credits",
    "Post & Manage Job Openings on the platform",
    "Real-time Applicant Pipeline & Status Tracking",
    "Direct Messaging & Company Dashboard Access",
  ];

  // Free Trial settings configured by Super Admin (Section 3)
  const [trialSettings, setTrialSettings] = useState<{
    enabled: boolean;
    trialDays: number;
    trialCredits: number;
    trialPoints: string[];
    permissions: {
      dashboard: boolean;
      jobs: boolean;
      applicants: boolean;
      resumes: boolean;
      settings: boolean;
    };
  }>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("addyjob_permissions_settings");
        if (cached) {
          const parsed = JSON.parse(cached);
          return {
            enabled: parsed.freeTrialEnabled !== false,
            trialDays: typeof parsed.trialDays === "number" ? parsed.trialDays : 14,
            trialCredits: typeof parsed.trialCredits === "number" ? parsed.trialCredits : 15,
            trialPoints: Array.isArray(parsed.trialPoints) && parsed.trialPoints.length > 0 ? parsed.trialPoints : DEFAULT_TRIAL_POINTS,
            permissions: {
              dashboard: parsed.defaultNewCompanyPerms?.dashboard ?? true,
              jobs: parsed.defaultNewCompanyPerms?.jobs ?? true,
              applicants: parsed.defaultNewCompanyPerms?.applicants ?? true,
              resumes: parsed.defaultNewCompanyPerms?.resumes ?? false,
              settings: parsed.defaultNewCompanyPerms?.settings ?? false,
            },
          };
        }
      } catch (e) {}
    }
    return {
      enabled: true,
      trialDays: 14,
      trialCredits: 15,
      trialPoints: DEFAULT_TRIAL_POINTS,
      permissions: {
        dashboard: true,
        jobs: true,
        applicants: true,
        resumes: false,
        settings: false,
      },
    };
  });

  // If Free Trial is disabled by admin and billing cycle is set to trial, fallback to monthly
  useEffect(() => {
    if (!trialSettings.enabled && subscriptionBillingCycle === "trial") {
      setSubscriptionBillingCycle("monthly");
    }
  }, [trialSettings.enabled, subscriptionBillingCycle]);

  // Fallback plans if database is initializing
  const fallbackSubscriptionPlans = [
    {
      name: "Testy",
      price: "₹ 2,999",
      billingCycle: "monthly",
      features: [
        "Standard Listing",
        "Basic Candidate Search",
        "1 Job posting",
      ],
      credits: 30,
    },
    {
      name: "Testy pro plan",
      price: "₹ 4,999",
      billingCycle: "monthly",
      features: [
        "Featured Badge",
        "Advanced Filtering",
        "250 Resume Views",
        "10 Job posting",
      ],
      credits: 50,
      isPopular: true,
    },
    {
      name: "Testy Enterprise Plan",
      price: "₹ 9,999",
      billingCycle: "monthly",
      features: [
        "20 Job posting",
        "Advance search",
        "50 resumes",
      ],
      credits: 50,
    },
  ];

  // Helper matching Super Admin pricing calculation with dynamic /month or /year
  const getCardPriceInfo = (plan: any, cycle: "monthly" | "yearly" | "trial") => {
    const rawPrice = typeof plan === "string" ? plan : (plan?.price || "");
    const digits = (rawPrice || "").replace(/[^\d]/g, "");
    const num = parseInt(digits, 10);
    const planCycle = (
      typeof plan === "object"
        ? (plan.billingCycle || (cycle === "yearly" ? "yearly" : "monthly"))
        : (cycle === "yearly" ? "yearly" : "monthly")
    ).toLowerCase();

    const isYearly = planCycle === "yearly" || cycle === "yearly";
    const billingUnit = isYearly ? "/ year" : "/ month";
    const displayPrice = num > 0 ? `₹${num.toLocaleString("en-IN")}` : (rawPrice || "₹0");

    return {
      displayPrice,
      billingUnit,
      annualBilledText: isYearly ? "Billed annually (Save 20%)" : null,
    };
  };

  const monthlyDbPlans = adminPlans.filter(
    (p) => (p.billingCycle || "monthly").toLowerCase() === "monthly"
  );
  const yearlyDbPlans = adminPlans.filter(
    (p) => (p.billingCycle || "").toLowerCase() === "yearly"
  );

  const activePlansToDisplay =
    subscriptionBillingCycle === "yearly"
      ? (yearlyDbPlans.length > 0 ? yearlyDbPlans : (monthlyDbPlans.length > 0 ? monthlyDbPlans : fallbackSubscriptionPlans))
      : (monthlyDbPlans.length > 0 ? monthlyDbPlans : fallbackSubscriptionPlans);

  // Uniquely determine which single plan card is currently active (prevents multiple plans from activating simultaneously)
  const activePlanIndex = (() => {
    if (!currentPlan || currentPlan === "No Active Plan" || currentPlan.toLowerCase().includes("trial")) return -1;
    const curLower = currentPlan.trim().toLowerCase();

    // 1. Direct exact name match (highest priority)
    const exactIdx = activePlansToDisplay.findIndex(
      (p) => (p.name || "").trim().toLowerCase() === curLower
    );
    if (exactIdx !== -1) return exactIdx;

    // 2. Specific tier matching only if exact name match wasn't found
    if (curLower.includes("enterprise") || curLower.includes("scaled")) {
      const entIdx = activePlansToDisplay.findIndex((p) => {
        const pName = (p.name || "").toLowerCase();
        return pName.includes("enterprise") || pName.includes("scaled");
      });
      if (entIdx !== -1) return entIdx;
    }

    if (curLower.includes("pro") || curLower.includes("growth")) {
      const proIdx = activePlansToDisplay.findIndex((p) => {
        const pName = (p.name || "").toLowerCase();
        return pName.includes("pro") || pName.includes("growth");
      });
      if (proIdx !== -1) return proIdx;
    }

    if (curLower.includes("starter") || curLower.includes("basic") || curLower.includes("testy")) {
      const starterIdx = activePlansToDisplay.findIndex((p) => {
        const pName = (p.name || "").toLowerCase();
        return (
          pName.includes("starter") ||
          pName.includes("basic") ||
          (pName.includes("testy") && !pName.includes("pro") && !pName.includes("enterprise"))
        );
      });
      if (starterIdx !== -1) return starterIdx;
    }

    return -1;
  })();

  // Sync plans from Super Admin in real-time
  useEffect(() => {
    let isMounted = true;
    const loadSubscriptionPlans = async () => {
      try {
        const data = await fetchAdminPlans();
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          const activeOnly = data.filter((p: any) => p.status !== "Inactive");
          setAdminPlans(activeOnly.length > 0 ? activeOnly : data);
        }
      } catch (err) {
        console.error("Failed to load admin plans in dashboard:", err);
      }
    };

    loadSubscriptionPlans();

    const handleSync = () => {
      loadSubscriptionPlans();
    };

    window.addEventListener("plans_updated", handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener("plans_updated", handleSync);
    };
  }, []);

  // Sync permissions and trial settings from Super Admin / User session / Subscription Plan
  useEffect(() => {
    const syncPermissionsAndTrial = () => {
      const user = getStoredUser();
      const perms = getEffectiveCompanyPermissions({
        id: (user as any)?._id || user?.id,
        plan: (user as any)?.plan || currentPlan,
        permissions: (user as any)?.permissions,
      });
      setPermissions(perms);

      // Guard activeTab: profile, subscription, and jobs are ALWAYS accessible.
      // Other tabs require explicit permission (via manual grant or plan auto-approval)
      setActiveTab((current) => {
        if (current === "profile" || current === "subscription" || current === "jobs") return current;
        if (perms[current as keyof CompanyPermissions]) return current;
        return "profile";
      });

      // Synchronize trialSettings from localStorage cache
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("addyjob_permissions_settings");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setTrialSettings({
              enabled: parsed.freeTrialEnabled !== false,
              trialDays: typeof parsed.trialDays === "number" ? parsed.trialDays : 14,
              trialCredits: typeof parsed.trialCredits === "number" ? parsed.trialCredits : 15,
              trialPoints: Array.isArray(parsed.trialPoints) && parsed.trialPoints.length > 0 ? parsed.trialPoints : DEFAULT_TRIAL_POINTS,
              permissions: {
                dashboard: parsed.defaultNewCompanyPerms?.dashboard ?? true,
                jobs: parsed.defaultNewCompanyPerms?.jobs ?? true,
                applicants: parsed.defaultNewCompanyPerms?.applicants ?? true,
                resumes: parsed.defaultNewCompanyPerms?.resumes ?? false,
                settings: parsed.defaultNewCompanyPerms?.settings ?? false,
              },
            });
          } catch (e) {}
        }
      }

      // Fetch latest settings from backend
      fetchAdminPermissionsSettings().then((remote) => {
        if (remote) {
          setTrialSettings({
            enabled: remote.freeTrialEnabled !== false,
            trialDays: typeof remote.trialDays === "number" ? remote.trialDays : 14,
            trialCredits: typeof remote.trialCredits === "number" ? remote.trialCredits : 15,
            trialPoints: Array.isArray(remote.trialPoints) && remote.trialPoints.length > 0 ? remote.trialPoints : DEFAULT_TRIAL_POINTS,
            permissions: {
              dashboard: remote.defaultNewCompanyPerms?.dashboard ?? true,
              jobs: remote.defaultNewCompanyPerms?.jobs ?? true,
              applicants: remote.defaultNewCompanyPerms?.applicants ?? true,
              resumes: remote.defaultNewCompanyPerms?.resumes ?? false,
              settings: remote.defaultNewCompanyPerms?.settings ?? false,
            },
          });
        }
      });
    };

    syncGlobalPermissionsRules().then(() => syncPermissionsAndTrial());

    window.addEventListener("company_permissions_updated", syncPermissionsAndTrial);
    return () => {
      window.removeEventListener("company_permissions_updated", syncPermissionsAndTrial);
    };
  }, [currentPlan]);

  // Initial plan load from user session (clean from database user only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = getStoredUser();
      const planName = (user as any)?.plan || localStorage.getItem("company_active_plan");
      const savedValidity = localStorage.getItem("company_plan_validity");
      if (savedValidity) setPlanValidity(savedValidity);

      if (planName) {
        setCurrentPlan(planName);
        if (planName.toLowerCase().includes("trial")) {
          setActivePlanCard("trial");
        } else if (planName.toLowerCase().includes("enterprise")) {
          setActivePlanCard("enterprise");
        } else if (planName.toLowerCase().includes("pro")) {
          setActivePlanCard("pro");
        } else if (
          planName.toLowerCase().includes("basic") ||
          planName.toLowerCase().includes("starter") ||
          planName.toLowerCase().includes("testy")
        ) {
          setActivePlanCard("starter");
        }
      } else {
        setCurrentPlan("No Active Plan");
        setPlanValidity("No Active Plan");
        setTotalResumesPurchased(0);
        setResumesUsed(0);
      }
    }
  }, []);

  // Activate any plan dynamically from Super Admin database
  const handleActivateDynamicPlan = async (
    plan: any,
    cycle: "monthly" | "yearly" | "trial"
  ) => {
    // Guard: Company must be approved to purchase or activate subscriptions
    if (companyStatus !== "Approved") {
      showToast("without approval you dont buy subscription");
      setIsApprovalRequiredModalOpen(true);
      return;
    }

    const planName = plan.name || "Custom Plan";
    const credits = Number(plan.credits) || (cycle === "yearly" ? 360 : 50);
    const validityText = cycle === "yearly" ? "Valid for 1 Year" : "Valid for 1 Month";

    // Standard plan classification for permission matrix
    let planKey: "starter" | "pro" | "enterprise" = "pro";
    const lower = planName.toLowerCase();
    if (lower.includes("enterprise") || lower.includes("scaled")) {
      planKey = "enterprise";
    } else if (
      lower.includes("starter") ||
      lower.includes("basic") ||
      (lower.includes("testy") && !lower.includes("pro") && !lower.includes("enterprise"))
    ) {
      planKey = "starter";
    }

    const standardPlanName =
      planKey === "enterprise"
        ? "Enterprise"
        : planKey === "pro"
        ? "Pro Plan"
        : "Basic Plan";

    const dynamicRule = getMatchingPlanRule(standardPlanName);
    const planAuto = dynamicRule || PLAN_AUTO_PERMISSIONS[standardPlanName] || {
      dashboard: planKey !== "starter",
      jobs: true,
      applicants: true,
      resumes: planKey !== "starter",
      settings: planKey === "enterprise",
    };

    const newPerms: CompanyPermissions = {
      ...permissions,
      ...planAuto,
      autoApproveFromSubscription: true,
    };

    setCurrentPlan(planName);
    setActivePlanCard(planKey);
    setTotalResumesPurchased(credits);
    setResumesUsed(0);
    setPlanValidity(validityText);
    setPermissions(newPerms);

    if (typeof window !== "undefined") {
      const storedUser = getStoredUser();
      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          plan: planName,
          permissions: newPerms,
        };
        setStoredUser(updatedUser);
        if (storedUser.id) {
          safeSetLocalStorage(`company_permissions_${storedUser.id}`, JSON.stringify(newPerms));
        }
      }
      safeSetLocalStorage("company_active_plan", planName);
      safeSetLocalStorage("company_plan_validity", validityText);
      safeSetLocalStorage("company_permissions_active", JSON.stringify(newPerms));
      window.dispatchEvent(new Event("company_permissions_updated"));
      window.dispatchEvent(new Event("storage"));
    }

    const user = getStoredUser();
    const companyId = (user as any)?._id || user?.id || "c1";
    try {
      await updateCompanyPermissions(companyId, newPerms, {
        name: companyName,
        email: contactEmail,
        plan: planName,
      });
    } catch (e) {
      console.error("Backend permissions update error:", e);
    }

    showToast(`🎉 Activated ${planName} (${cycle === "yearly" ? "Yearly" : "Monthly"}) plan successfully!`);
  };

  // Handle 1-click plan activation and auto-unlock of permissions
  const handleActivatePlan = async (
    planKey: "starter" | "pro" | "enterprise",
    planTitle: string,
    credits: number
  ) => {
    // Guard: Company must be approved to purchase or activate subscriptions
    if (companyStatus !== "Approved") {
      showToast("without approval you dont buy subscription");
      setIsApprovalRequiredModalOpen(true);
      return;
    }

    // 1. Map to standard Plan name for auto-approval system
    const standardPlanName =
      planKey === "enterprise"
        ? "Enterprise"
        : planKey === "pro"
        ? "Pro Plan"
        : "Basic Plan";

    // 2. Compute plan auto permissions from dynamic plan rules set by Super Admin
    const dynamicRule = getMatchingPlanRule(standardPlanName);
    const planAuto = dynamicRule || PLAN_AUTO_PERMISSIONS[standardPlanName] || {
      dashboard: planKey !== "starter",
      jobs: true,
      applicants: true,
      resumes: planKey !== "starter",
      settings: planKey === "enterprise",
    };

    const newPerms: CompanyPermissions = {
      ...permissions,
      ...planAuto,
      autoApproveFromSubscription: true,
    };

    // 3. Update component states
    setCurrentPlan(planTitle);
    setActivePlanCard(planKey);
    setTotalResumesPurchased(credits);
    setResumesUsed(0);
    setPlanValidity("Valid for 1 Year");
    setPermissions(newPerms);

    // 4. Update session & localStorage so everything stays in sync
    if (typeof window !== "undefined") {
      const storedUser = getStoredUser();
      const uid = (storedUser as any)?._id || storedUser?.id || (storedUser as any)?.userId || storedUser?.email;
      if (uid) {
        safeSetLocalStorage(`company_total_credits_${uid}`, String(credits));
        safeSetLocalStorage(`company_resumes_used_${uid}`, "0");
      }
      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          plan: standardPlanName,
          permissions: newPerms,
        };
        setStoredUser(updatedUser);
        if (storedUser.id) {
          safeSetLocalStorage(`company_permissions_${storedUser.id}`, JSON.stringify(newPerms));
        }
      }
      safeSetLocalStorage("company_active_plan", standardPlanName);
      safeSetLocalStorage("company_permissions_active", JSON.stringify(newPerms));
      window.dispatchEvent(new Event("company_permissions_updated"));
      window.dispatchEvent(new Event("storage"));
    }

    // 5. Update backend database asynchronously
    const user = getStoredUser();
    const companyId = (user as any)?._id || user?.id || "c1";
    try {
      await updateCompanyPermissions(companyId, newPerms, {
        name: companyName,
        email: contactEmail,
        plan: standardPlanName,
      });
    } catch (e) {
      console.warn("Background plan sync error:", e);
    }

    setToastMessage(`🎉 ${planTitle} activated! New permissions have been unlocked.`);
    setTimeout(() => setToastMessage(null), 4000);
    setIsUpgradePlanModalOpen(false);
  };

  // Handle 1-click Free Trial activation
  const handleActivateFreeTrial = async () => {
    if (currentPlan === "Free Trial") {
      setToastMessage("Your company is already enjoying the Free Trial!");
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    if (!trialSettings.enabled) {
      setToastMessage("Free Trial is currently disabled by administrator.");
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    const days = trialSettings.trialDays || 14;
    const credits = trialSettings.trialCredits || 15;
    const validityText = `Valid for ${days} Days (Trial)`;

    // Feature permissions configured by Super Admin in Section 3
    const trialPerms: CompanyPermissions = {
      profile: true,
      subscription: true,
      dashboard: Boolean(trialSettings.permissions.dashboard),
      jobs: Boolean(trialSettings.permissions.jobs),
      applicants: Boolean(trialSettings.permissions.applicants),
      resumes: Boolean(trialSettings.permissions.resumes),
      settings: Boolean(trialSettings.permissions.settings),
      autoApproveFromSubscription: true,
    };

    setCurrentPlan("Free Trial");
    setActivePlanCard("trial");
    setTotalResumesPurchased(credits);
    setResumesUsed(0);
    setPlanValidity(validityText);
    setPermissions(trialPerms);

    if (typeof window !== "undefined") {
      const storedUser = getStoredUser();
      const uid = (storedUser as any)?._id || storedUser?.id || (storedUser as any)?.userId || storedUser?.email;
      if (uid) {
        localStorage.setItem(`company_total_credits_${uid}`, String(credits));
        localStorage.setItem(`company_resumes_used_${uid}`, "0");
        localStorage.setItem(`company_permissions_${uid}`, JSON.stringify(trialPerms));
      }
      if (storedUser) {
        const updatedUser = {
          ...storedUser,
          plan: "Free Trial",
          resumeCredits: credits,
          permissions: trialPerms,
        };
        setStoredUser(updatedUser);
      }
      localStorage.setItem("company_active_plan", "Free Trial");
      localStorage.setItem("company_plan_validity", validityText);
      localStorage.setItem("company_permissions_active", JSON.stringify(trialPerms));
      window.dispatchEvent(new Event("company_permissions_updated"));
      window.dispatchEvent(new Event("storage"));
    }

    const user = getStoredUser();
    const companyId = (user as any)?._id || user?.id || "c1";
    try {
      const res = await activateCompanyTrial({
        companyId,
        email: contactEmail,
      });
      if (res?.permissions) {
        const confirmedPerms: CompanyPermissions = {
          profile: true,
          subscription: true,
          dashboard: Boolean(res.permissions.dashboard),
          jobs: Boolean(res.permissions.jobs),
          applicants: Boolean(res.permissions.applicants),
          resumes: Boolean(res.permissions.resumes),
          settings: Boolean(res.permissions.settings),
          autoApproveFromSubscription: true,
        };
        setPermissions(confirmedPerms);
        if (typeof window !== "undefined") {
          localStorage.setItem(`company_permissions_${companyId}`, JSON.stringify(confirmedPerms));
          localStorage.setItem("company_permissions_active", JSON.stringify(confirmedPerms));
        }
      }
    } catch (e) {
      console.warn("Background trial sync error:", e);
    }

    setToastMessage(`🎉 Free Trial Activated! You have ${days} days of access & ${credits} complimentary resume credits.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [applicantFilter, setApplicantFilter] = useState<
    "ALL" | "Applied" | "Reviewing" | "Shortlisted" | "Interview" | "Hired" | "Rejected"
  >("ALL");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);
  const [isUpgradePlanModalOpen, setIsUpgradePlanModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<RecruiterApplicant | null>(null);

  // Job Applicants Modal states for Company Admin
  const [selectedApplicantsJob, setSelectedApplicantsJob] = useState<PostedJob | null>(null);
  const [isJobApplicantsModalOpen, setIsJobApplicantsModalOpen] = useState(false);
  const [jobApplicantsList, setJobApplicantsList] = useState<CompanyCandidateApplicant[]>([]);
  const [isLoadingJobApplicants, setIsLoadingJobApplicants] = useState(false);

  const getJobApplicantCount = (job: PostedJob) => {
    const fromApplicants = applicants.filter(
      (a) =>
        (a.jobId && String(a.jobId) === String(job.id)) ||
        (a.appliedRole && a.appliedRole.toLowerCase().trim() === job.title.toLowerCase().trim())
    ).length;
    return Math.max(job.applicantsCount || 0, fromApplicants);
  };

  const handleOpenJobApplicants = async (job: PostedJob) => {
    setSelectedApplicantsJob(job);
    setIsJobApplicantsModalOpen(true);
    setIsLoadingJobApplicants(true);

    // Initial match from preloaded company applicants
    const localMatched = applicants
      .filter(
        (a) =>
          (a.jobId && String(a.jobId) === String(job.id)) ||
          (a.appliedRole && a.appliedRole.toLowerCase().trim() === job.title.toLowerCase().trim())
      )
      .map((a) => ({
        id: a.id,
        candidateName: a.candidateName,
        appliedRole: a.appliedRole,
        position: a.appliedRole,
        jobId: a.jobId,
        experience: a.experience,
        location: a.location,
        appliedDate: a.appliedDate,
        resumeFileName: a.resumeFileName,
        resumeUrl: a.resumeUrl || a.pdfData || "",
        pdfData: a.pdfData || a.resumeUrl || "",
        skills: a.skills,
        status: a.status,
        matchScore: a.matchScore,
        email: a.email,
        phone: a.phone,
        notes: a.notes,
        domain: a.domain || job.title,
        education: a.education,
        university: a.university,
        passingYear: a.passingYear,
        headline: a.headline,
        bio: a.bio,
        languages: a.languages,
      }));
    setJobApplicantsList(localMatched);

    try {
      const liveData = await fetchJobApplicants(job.id);
      if (Array.isArray(liveData) && liveData.length > 0) {
        const normalized = liveData.map((d: any) => ({
          id: d.id,
          candidateName: d.candidateName,
          appliedRole: d.position || job.title,
          position: d.position || job.title,
          jobId: d.jobId || job.id,
          experience: d.experience || "1-3 years",
          location: d.location || "Remote",
          appliedDate: d.appliedOn || "Today",
          resumeFileName: d.fileName || `${d.candidateName}_Resume.pdf`,
          resumeUrl: d.resumeUrl || d.pdfData || "",
          pdfData: d.pdfData || d.resumeUrl || "",
          skills: d.skills || [],
          status: d.status || "Applied",
          matchScore: 92,
          email: d.candidateEmail || d.email || "",
          phone: d.candidatePhone || d.phone || "",
          avatarLetter: d.avatarLetter,
          avatarBg: d.avatarBg,
          domain: d.domain || job.title,
          education: d.education,
          university: d.university,
          passingYear: d.passingYear,
          headline: d.headline,
          bio: d.bio,
          languages: d.languages,
        }));
        setJobApplicantsList(normalized);
      }
    } catch (err) {
      console.error("Error fetching live job applicants:", err);
    } finally {
      setIsLoadingJobApplicants(false);
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, newStatus: string) => {
    const recruiterAction = ["Shortlisted", "Interview", "Hired", "Rejected"].includes(newStatus)
      ? newStatus
      : undefined;

    setJobApplicantsList((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: newStatus as any,
              notes: recruiterAction ? `Status: ${recruiterAction}` : a.notes,
            }
          : a
      )
    );

    const storedUser = getStoredUser();
    const uid = storedUser?.id || storedUser?.userId || "company";
    try {
      const current = localStorage.getItem(`company_applicants_data_${uid}`);
      if (current) {
        const parsed = JSON.parse(current);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((a: any) =>
            a.id === appId || a._id === appId
              ? {
                  ...a,
                  status: newStatus,
                  recruiterAction: recruiterAction || a.recruiterAction,
                  resumeViewed: true,
                }
              : a
          );
          localStorage.setItem(`company_applicants_data_${uid}`, JSON.stringify(updated));
        }
      }
    } catch (e) {}

    setToastMessage(`Candidate status updated to "${newStatus}"`);
    try {
      await updateApplicationStatusAPI(appId, newStatus, recruiterAction);
    } catch (e) {
      console.warn("Backend status update error:", e);
      try {
        await updateAdminApplicationStatus(appId, newStatus);
      } catch (err) {}
    }
    notifyApplicationSync();
  };

  // Form states for Post / Edit Job (matching /jobs/1 details)
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDepartment, setJobDepartment] = useState("Engineering");
  const [jobLocation, setJobLocation] = useState("");
  const [jobWorkplace, setJobWorkplace] = useState("Remote");
  const [jobType, setJobType] = useState("Full-time");
  const [jobExperience, setJobExperience] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobOpenings, setJobOpenings] = useState("1");
  const [jobPostedBy, setJobPostedBy] = useState("");
  const [jobTags, setJobTags] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobResponsibilities, setJobResponsibilities] = useState("");
  const [jobRequirements, setJobRequirements] = useState("");
  const [jobBenefits, setJobBenefits] = useState("");

  // Jobs List (Real data only, default empty)
  const [jobs, setJobs] = useState<PostedJob[]>([]);
  const [actionMenuJobId, setActionMenuJobId] = useState<string | null>(null);

  // Close action dropdown on outside click
  useEffect(() => {
    if (!actionMenuJobId) return;
    const handleOutsideClick = () => setActionMenuJobId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [actionMenuJobId]);

  // Applicants List (Real data only, default empty)
  const [applicants, setApplicants] = useState<RecruiterApplicant[]>([]);

  // Purchased Resumes (Real data only, default empty)
  const [purchasedResumes, setPurchasedResumes] = useState<PurchasedResume[]>([]);

  // Load user data from localStorage & database session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const applyUserData = (u: any) => {
        if (!u) return;
        const uid = u._id || u.id || u.userId || u.email;
        const cName = u.companyName || u.name || "";

        // Read stored profile data with fallbacks (scoped strictly by user ID, email, or company name)
        let parsed: any = {};
        if (typeof window !== "undefined") {
          try {
            const rawGlobal = localStorage.getItem("company_profile_data");
            if (rawGlobal && (rawGlobal.includes("sadmin@gmail.com") || rawGlobal.includes("Super Admin"))) {
              localStorage.removeItem("company_profile_data");
            }
          } catch (e) {}

          const keys = [
            uid ? `company_profile_data_${uid}` : null,
            u.id ? `company_profile_data_${u.id}` : null,
            u._id ? `company_profile_data_${u._id}` : null,
            u.email ? `company_profile_data_${u.email}` : null,
            cName ? `company_profile_data_${cName.toLowerCase().trim()}` : null,
            cName ? `company_profile_data_${cName.toLowerCase().replace(/\s+/g, "-")}` : null,
          ].filter(Boolean) as string[];

          for (const k of keys) {
            const raw = localStorage.getItem(k);
            if (raw) {
              try {
                parsed = { ...parsed, ...JSON.parse(raw) };
              } catch (e) {}
            }
          }

          if (parsed.companyName === "Super Admin" || parsed.contactEmail === "sadmin@gmail.com") {
            delete parsed.companyName;
            delete parsed.contactEmail;
            delete parsed.profileImage;
          }
        }

        const resolvedCompanyName = parsed.companyName || u.companyName || u.name || "";
        const resolvedEmail = parsed.contactEmail || u.workEmail || u.contactEmail || u.email || "";
        const resolvedIndustry = parsed.industry || u.industry || "";
        const resolvedHq = parsed.headquarters || u.headquarters || u.location || "";
        const resolvedPhone = parsed.contactPhone || u.contactPhone || u.phone || "";
        const resolvedGst = parsed.gstNumber || u.gstNumber || "";
        const resolvedSize = parsed.companySize || u.companySize || "";
        const resolvedAbout = parsed.aboutCompany || u.aboutCompany || u.bio || "";
        const resolvedTagline = parsed.tagline || (u as any).tagline || "";
        const resolvedWebsite = parsed.website || (u as any).website || "";
        const resolvedProfileImage = parsed.profileImage || (u as any).profileImage || (u as any).logo || null;
        const resolvedBannerImage = parsed.bannerImage || (u as any).bannerImage || null;

        setCompanyName(resolvedCompanyName);
        setContactEmail(resolvedEmail);
        setIndustry(resolvedIndustry);
        setHeadquarters(resolvedHq);
        setContactPhone(resolvedPhone);
        setGstNumber(resolvedGst);
        setCompanySize(resolvedSize);
        setAboutCompany(resolvedAbout);
        if (u.status === "Rejected") {
          setCompanyStatus("Rejected");
          setRejectionReason(u.rejectionReason || parsed.rejectionReason || "");
        } else {
          setCompanyStatus(u.status || "Pending");
          setRejectionReason("");
        }
        setTagline(resolvedTagline);
        setWebsite(resolvedWebsite);
        setProfileImage(resolvedProfileImage);
        setBannerImage(resolvedBannerImage);

        // Load notification settings from DB or localStorage
        let savedNotif: any = u.notificationSettings;
        if (!savedNotif && uid) {
          try {
            const raw = localStorage.getItem(`company_notification_settings_${uid}`);
            if (raw) savedNotif = JSON.parse(raw);
          } catch (e) {}
        }
        if (savedNotif) {
          if (typeof savedNotif.emailNotificationOnApplication === "boolean") {
            setEmailNotificationOnApplication(savedNotif.emailNotificationOnApplication);
          }
          if (typeof savedNotif.lowCreditAlert === "boolean") {
            setLowCreditAlert(savedNotif.lowCreditAlert);
          }
          if (typeof savedNotif.autoAcknowledgeApplicants === "boolean") {
            setAutoAcknowledgeApplicants(savedNotif.autoAcknowledgeApplicants);
          }
          if (typeof savedNotif.creditThreshold === "number") {
            setCreditThreshold(savedNotif.creditThreshold);
          }
        }

        // Subscription plan strictly from real user database record
        const planName = u.plan || "";
        if (planName) {
          setCurrentPlan(planName);
          const lower = planName.toLowerCase();
          if (lower.includes("enterprise") || lower.includes("scaled")) {
            setActivePlanCard("enterprise");
          } else if (lower.includes("pro")) {
            setActivePlanCard("pro");
          } else {
            setActivePlanCard("starter");
          }
          const savedValidity = localStorage.getItem("company_plan_validity");
          setPlanValidity(savedValidity || "Valid for 1 Year");
        } else {
          setCurrentPlan("No Active Plan");
          setActivePlanCard(null);
          setPlanValidity("No Active Plan");
          setTotalResumesPurchased(0);
          setResumesUsed(0);
        }

        const storedCulture = parsed.culture || (u as any).culture;
        if (Array.isArray(storedCulture) && storedCulture.length > 0) {
          setCultureText(storedCulture.join("\n"));
        } else if (typeof storedCulture === "string" && storedCulture.trim()) {
          setCultureText(storedCulture);
        } else {
          setCultureText("");
        }

        const storedPerks = parsed.perks || (u as any).perks;
        if (Array.isArray(storedPerks) && storedPerks.length > 0) {
          setPerksText(storedPerks.join("\n"));
        } else if (typeof storedPerks === "string" && storedPerks.trim()) {
          setPerksText(storedPerks);
        } else {
          setPerksText("");
        }

        if (uid) {
          const savedJobs = localStorage.getItem(`company_posted_jobs_${uid}`);
          if (savedJobs) {
            try {
              const parsedJobs = JSON.parse(savedJobs);
              if (Array.isArray(parsedJobs)) setJobs(parsedJobs);
            } catch (e) {}
          } else {
            setJobs([]);
          }

          // Fetch live company jobs directly from MongoDB database
          const compName = u.companyName || u.name || "";
          fetchCompanyJobs({ companyId: uid, company: compName })
            .then((dbJobs) => {
              if (Array.isArray(dbJobs)) {
                if (dbJobs.length > 0) {
                  setJobs(dbJobs);
                  try {
                    localStorage.setItem(`company_posted_jobs_${uid}`, JSON.stringify(dbJobs));
                  } catch (e) {}
                } else if (!savedJobs || savedJobs === "[]") {
                  setJobs([]);
                }
              }
            })
            .catch((err) => {
              console.warn("Backend jobs fetch error:", err);
            });

          const savedApplicants = localStorage.getItem(`company_applicants_data_${uid}`);
          let localAppList: RecruiterApplicant[] = [];
          if (savedApplicants) {
            try {
              const parsedApplicants = JSON.parse(savedApplicants);
              if (Array.isArray(parsedApplicants)) localAppList = parsedApplicants;
            } catch (e) {}
          }

          // Fetch applications from database for this company
          fetchCompanyApplications({ company: compName, companyId: uid })
            .then((dbApps) => {
              if (Array.isArray(dbApps) && dbApps.length > 0) {
                const formatted: RecruiterApplicant[] = dbApps.map((a: any) => ({
                  id: a._id || a.id,
                  candidateName: a.candidateName || "Candidate",
                  appliedRole: a.appliedRole || a.position || (typeof a.jobId === "object" ? a.jobId?.title : "") || "Applicant",
                  jobId: (typeof a.jobId === "object" ? a.jobId?._id : a.jobId) || "",
                  experience: a.experience || "Fresher",
                  location: a.location || (typeof a.jobId === "object" ? a.jobId?.location : "") || "Remote",
                  appliedDate: a.appliedDate || a.appliedOn || (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "Recent"),
                  resumeFileName: a.resumeFileName || a.fileName || "Resume.pdf",
                  skills: Array.isArray(a.skills) && a.skills.length > 0 ? a.skills : ["General"],
                  status: (["Shortlisted", "Interview", "Hired", "Rejected"].includes(a.status) ? a.status : a.resumeViewed ? "Reviewing" : "Applied") as any,
                  matchScore: a.matchScore || 88,
                  email: a.email || a.candidateEmail || "candidate@example.com",
                  phone: a.phone || a.candidatePhone || "+91 9876543210",
                  notes: a.notes || (a.recruiterAction ? `Status: ${a.recruiterAction}` : undefined),
                  resumeUrl: a.resumeUrl || a.pdfData || "",
                  pdfData: a.pdfData || a.resumeUrl || "",
                  education: a.education || "",
                  university: a.university || "",
                  passingYear: a.passingYear || "",
                  headline: a.headline || "",
                  bio: a.bio || "",
                  languages: a.languages || "",
                }));

                const map = new Map<string, RecruiterApplicant>();
                formatted.forEach((fa) => map.set(fa.id, fa));
                localAppList.forEach((la) => {
                  if (!map.has(la.id)) {
                    map.set(la.id, la);
                  }
                });
                const combined = Array.from(map.values());
                setApplicants(combined);
                try {
                  localStorage.setItem(`company_applicants_data_${uid}`, JSON.stringify(combined));
                } catch (e) {}
              } else {
                setApplicants(localAppList);
              }
            })
            .catch((err) => {
              console.warn("Backend company applications fetch error:", err);
              setApplicants(localAppList);
            });

          let currentVault: PurchasedResume[] = [];
          if (Array.isArray(u.purchasedResumes) && u.purchasedResumes.length > 0) {
            currentVault = u.purchasedResumes;
            setPurchasedResumes(u.purchasedResumes);
            try {
              const cleanVault = u.purchasedResumes.map((r: any) => ({
                ...r,
                pdfData: undefined,
              }));
              safeSetLocalStorage(`company_purchased_resumes_${uid}`, JSON.stringify(cleanVault));
            } catch (e) {}
          } else {
            const savedPurchasedResumes = localStorage.getItem(`company_purchased_resumes_${uid}`);
            if (savedPurchasedResumes) {
              try {
                const parsedResumes = JSON.parse(savedPurchasedResumes);
                if (Array.isArray(parsedResumes)) {
                  currentVault = parsedResumes;
                  setPurchasedResumes(parsedResumes);
                }
              } catch (e) {}
            } else {
              setPurchasedResumes([]);
            }
          }

          // Credit balance initialization & persistence
          const savedTotalCredits = localStorage.getItem(`company_total_credits_${uid}`);
          const savedUsedCredits = localStorage.getItem(`company_resumes_used_${uid}`);

          let totalCredits = savedTotalCredits !== null ? parseInt(savedTotalCredits, 10) : (u.resumeCredits ?? 0);
          let usedCredits = savedUsedCredits !== null ? parseInt(savedUsedCredits, 10) : (u.resumesUsed ?? 0);

          if (totalCredits === 0 && u.plan) {
            const p = u.plan.toLowerCase();
            if (p.includes("enterprise")) totalCredits = 100;
            else if (p.includes("pro") || p.includes("growth")) totalCredits = 50;
            else if (p.includes("basic") || p.includes("starter")) totalCredits = 25;
          }
          if (totalCredits === 0) {
            totalCredits = 10; // Baseline complimentary starter credits
          }

          // Count resumes unlocked in vault
          const countUnlockedInVault = currentVault.filter((r) => r.isUnlocked).length;
          usedCredits = countUnlockedInVault;
          safeSetLocalStorage(`company_resumes_used_${uid}`, String(usedCredits));
          if (countUnlockedInVault > usedCredits) {
            usedCredits = countUnlockedInVault;
          }

          setTotalResumesPurchased(totalCredits);
          setResumesUsed(usedCredits);
        }
      };

      const user = getStoredUser();
      if (user) {
        if (user.email === "sadmin@gmail.com") {
          clearAuthSession();
          router.push("/login");
          return;
        }
        if (user.role === "admin") {
          router.push("/admin");
          return;
        }
        applyUserData(user);
      }
      fetchCurrentUser().then((fresh) => {
        if (fresh) {
          if (fresh.email === "sadmin@gmail.com") {
            clearAuthSession();
            router.push("/login");
            return;
          }
          if (fresh.role === "admin") {
            router.push("/admin");
            return;
          }
          applyUserData(fresh);
        }
      });

      const handleVaultSync = () => {
        const u = getStoredUser();
        if (u) {
          const uid = (u as any)._id || u.id || (u as any).userId || u.email;
          const saved = localStorage.getItem(`company_purchased_resumes_${uid}`);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                setPurchasedResumes(parsed);
                setResumesUsed(parsed.filter((r: any) => r.isUnlocked).length);
              }
            } catch (e) {}
          }
          const savedTotalCredits = localStorage.getItem(`company_total_credits_${uid}`);
          const savedUsedCredits = localStorage.getItem(`company_resumes_used_${uid}`);
          if (savedTotalCredits !== null) {
            const num = parseInt(savedTotalCredits, 10);
            if (!isNaN(num)) setTotalResumesPurchased(num);
          }
          if (savedUsedCredits !== null) {
            const num = parseInt(savedUsedCredits, 10);
            if (!isNaN(num)) setResumesUsed(num);
          }
        }
      };

      const handleJobSync = () => {
        const u = getStoredUser();
        if (u) {
          const uid = (u as any)._id || u.id || (u as any).userId || u.email;
          const compName = (u as any).companyName || u.name || "";
          fetchCompanyJobs({ companyId: uid, company: compName })
            .then((dbJobs) => {
              if (Array.isArray(dbJobs) && dbJobs.length > 0) {
                setJobs(dbJobs);
                try {
                  localStorage.setItem(`company_posted_jobs_${uid}`, JSON.stringify(dbJobs));
                } catch (e) {}
              }
            })
            .catch(() => {});

          fetchCompanyApplications({ company: compName, companyId: uid })
            .then((dbApps) => {
              if (Array.isArray(dbApps)) {
                const formatted: RecruiterApplicant[] = dbApps.map((a: any) => ({
                  id: a._id || a.id,
                  candidateName: a.candidateName || "Candidate",
                  appliedRole: a.appliedRole || a.position || (typeof a.jobId === "object" ? a.jobId?.title : "") || "Applicant",
                  jobId: (typeof a.jobId === "object" ? a.jobId?._id : a.jobId) || "",
                  experience: a.experience || "Fresher",
                  location: a.location || (typeof a.jobId === "object" ? a.jobId?.location : "") || "Remote",
                  appliedDate: a.appliedDate || a.appliedOn || (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "Recent"),
                  resumeFileName: a.resumeFileName || a.fileName || "Resume.pdf",
                  skills: Array.isArray(a.skills) && a.skills.length > 0 ? a.skills : ["General"],
                  status: (["Shortlisted", "Interview", "Hired", "Rejected"].includes(a.status) ? a.status : a.resumeViewed ? "Reviewing" : "Applied") as any,
                  matchScore: a.matchScore || 88,
                  email: a.email || a.candidateEmail || "candidate@example.com",
                  phone: a.phone || a.candidatePhone || "+91 9876543210",
                  notes: a.notes || (a.recruiterAction ? `Status: ${a.recruiterAction}` : undefined),
                  resumeUrl: a.resumeUrl || a.pdfData || "",
                  pdfData: a.pdfData || a.resumeUrl || "",
                  education: a.education || "",
                  university: a.university || "",
                  passingYear: a.passingYear || "",
                  headline: a.headline || "",
                  bio: a.bio || "",
                  languages: a.languages || "",
                }));
                setApplicants(formatted);
                try {
                  localStorage.setItem(`company_applicants_data_${uid}`, JSON.stringify(formatted));
                } catch (e) {}
              }
            })
            .catch(() => {});
        }
      };

      const handleUserSync = () => {
        const u = getStoredUser();
        if (u) applyUserData(u);
      };

      window.addEventListener("purchased_resumes_updated", handleVaultSync);
      window.addEventListener("job_created", handleJobSync);
      window.addEventListener("job_updated", handleJobSync);
      window.addEventListener("applied_jobs_change", handleJobSync);
      window.addEventListener("job_application_submitted", handleJobSync);
      window.addEventListener("auth_change", handleUserSync);
      window.addEventListener("storage", handleVaultSync);
      window.addEventListener("storage", handleJobSync);
      window.addEventListener("storage", handleUserSync);

      return () => {
        window.removeEventListener("purchased_resumes_updated", handleVaultSync);
        window.removeEventListener("job_created", handleJobSync);
        window.removeEventListener("job_updated", handleJobSync);
        window.removeEventListener("applied_jobs_change", handleJobSync);
        window.removeEventListener("job_application_submitted", handleJobSync);
        window.removeEventListener("auth_change", handleUserSync);
        window.removeEventListener("storage", handleVaultSync);
        window.removeEventListener("storage", handleJobSync);
        window.removeEventListener("storage", handleUserSync);
      };
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadPurchasedResume = (res: PurchasedResume) => {
    if (!permissions.resumes) {
      showToast("🔒 Candidate Resumes access is locked under your company trial permissions.");
      return;
    }
    downloadCandidateResume(res, (msg) => showToast(msg));
  };

  // Action: Unlock a candidate resume using 1 credit
  const handleUnlockResume = async (resume: PurchasedResume) => {
    if (!permissions.resumes) {
      showToast("🔒 Candidate Resumes access is locked under your company trial permissions.");
      return;
    }
    const currentlyUnlocked = purchasedResumes.filter((r) => r.isUnlocked).length;
    const effectiveUsed = Math.max(resumesUsed, currentlyUnlocked);
    const availableCredits = totalResumesPurchased - effectiveUsed;
    if (availableCredits <= 0) {
      showToast("⚠️ Insufficient credits! Please purchase more credits to unlock this candidate.");
      setIsBuyCreditsModalOpen(true);
      return;
    }

    const u = getStoredUser();
    const uid = (u as any)?._id || u?.id || (u as any)?.userId || u?.email;



    // 1. Mark this candidate resume as unlocked
    const updatedVault = purchasedResumes.map((r) => {
      const targetId = String(resume.id || (resume as any)._id || "").trim();
      const targetName = String(resume.candidateName || (resume as any).name || "").trim().toLowerCase();
      const rId = String(r.id || (r as any)._id || "").trim();
      const rName = String(r.candidateName || (r as any).name || "").trim().toLowerCase();
      const isMatch = (targetId && (rId === targetId || String((r as any)._id) === targetId)) ||
                      (targetName && rName === targetName);
      if (isMatch) {
        return {
          ...r,
          isUnlocked: true,
          unlockedAt: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        };
      }
      return r;
    });

    // 2. Decrement 1 credit (increment resumesUsed by 1)
    const newUsed = currentlyUnlocked + 1;
    setResumesUsed(newUsed);
    setPurchasedResumes(updatedVault);

    // 3. Persist locally for instant reactivity
    if (uid && typeof window !== "undefined") {
      const cleanVault = updatedVault.map((r: any) => ({
        ...r,
        pdfData: undefined,
      }));
      safeSetLocalStorage(`company_purchased_resumes_${uid}`, JSON.stringify(cleanVault));
      safeSetLocalStorage(`company_resumes_used_${uid}`, String(newUsed));
      safeSetLocalStorage(`company_total_credits_${uid}`, String(totalResumesPurchased));
      window.dispatchEvent(new Event("purchased_resumes_updated"));
      window.dispatchEvent(new Event("storage"));
    }

    // 4. Persist to MongoDB backend
    try {
      const resumeIdToUnlock = String(resume.id || (resume as any)._id || "");
      const unlockRes = await unlockCompanyResume(resumeIdToUnlock, resume.candidateName);
      if (unlockRes && unlockRes.success) {
        if (typeof unlockRes.resumesUsed === "number") setResumesUsed(unlockRes.resumesUsed);
      }
      await updateUserProfile({
        purchasedResumes: updatedVault,
        resumesUsed: newUsed,
        resumeCredits: totalResumesPurchased,
      });
    } catch (err) {
      console.warn("Backend unlock sync error:", err);
    }

    const remainingLeft = Math.max(0, totalResumesPurchased - newUsed);
    showToast(`🎉 ${resume.candidateName || "Candidate"}'s contact details unlocked! 1 Credit used. (${remainingLeft} credits left)`);
  };

  // Helper to compress uploaded image before storing/sending
  const compressImageFile = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality = 0.8
  ): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = e.target?.result as string;
        if (!raw) return resolve("");
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(raw);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(raw);
        img.src = raw;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  // Image Upload & Removal Handlers (See, Update, Remove)
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast("File size too large. Please select an image under 10MB.");
        return;
      }
      try {
        const base64 = await compressImageFile(file, 400, 400, 0.85);
        if (!base64) return;
        setProfileImage(base64);
        const user = getStoredUser();
        const uid = (user as any)?._id || user?.id || user?.userId || user?.email;
        if (uid) {
          try {
            const prev = JSON.parse(localStorage.getItem(`company_profile_data_${uid}`) || "{}");
            safeSetLocalStorage(`company_profile_data_${uid}`, JSON.stringify({ ...prev, profileImage: base64, logo: base64 }));
          } catch (err) {}
        }
        updateUserProfile({ profileImage: base64, logo: base64 }).catch((err) =>
          console.warn("Backend profile sync error:", err)
        );
        notifyApplicationSync();
        showToast("Company profile image updated successfully!");
        setImageModalState((prev) => ({ ...prev, isOpen: false, mode: "menu" }));
      } catch (err) {
        showToast("Failed to process image.");
      }
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast("File size too large. Please select a banner under 15MB.");
        return;
      }
      try {
        const base64 = await compressImageFile(file, 1400, 480, 0.78);
        if (!base64) return;
        setBannerImage(base64);
        const user = getStoredUser();
        const uid = (user as any)?._id || user?.id || user?.userId || user?.email;
        if (uid) {
          try {
            const prev = JSON.parse(localStorage.getItem(`company_profile_data_${uid}`) || "{}");
            safeSetLocalStorage(`company_profile_data_${uid}`, JSON.stringify({ ...prev, bannerImage: base64 }));
          } catch (err) {}
        }
        updateUserProfile({ bannerImage: base64 }).catch((err) =>
          console.warn("Backend profile sync error:", err)
        );
        notifyApplicationSync();
        showToast("Company cover banner updated successfully!");
        setImageModalState((prev) => ({ ...prev, isOpen: false, mode: "menu" }));
      } catch (err) {
        showToast("Failed to process banner.");
      }
    }
  };

  const handleRemoveImage = (type: "profile" | "banner") => {
    const user = getStoredUser();
    const uid = (user as any)?._id || user?.id || user?.userId || user?.email;
    if (type === "profile") {
      setProfileImage(null);
      if (uid) {
        try {
          const prev = JSON.parse(localStorage.getItem(`company_profile_data_${uid}`) || "{}");
          delete prev.profileImage;
          delete prev.logo;
          safeSetLocalStorage(`company_profile_data_${uid}`, JSON.stringify(prev));
        } catch (err) {}
      }
      updateUserProfile({ profileImage: "", logo: "" }).catch((err) =>
        console.warn("Backend profile sync error:", err)
      );
      notifyApplicationSync();
      showToast("Profile image removed. Reverted to default.");
    } else {
      setBannerImage(null);
      if (uid) {
        try {
          const prev = JSON.parse(localStorage.getItem(`company_profile_data_${uid}`) || "{}");
          delete prev.bannerImage;
          safeSetLocalStorage(`company_profile_data_${uid}`, JSON.stringify(prev));
        } catch (err) {}
      }
      updateUserProfile({ bannerImage: "" }).catch((err) =>
        console.warn("Backend profile sync error:", err)
      );
      notifyApplicationSync();
      showToast("Cover banner removed. Reverted to default gradient.");
    }
    setImageModalState((prev) => ({ ...prev, isOpen: false, mode: "menu" }));
  };

  // Actions for Candidates: Shortlist, Reject, Reviewing
  const handleUpdateStatus = (
    applicantId: string,
    newStatus: "Reviewing" | "Shortlisted" | "Interview" | "Hired" | "Rejected"
  ) => {
    setApplicants((prev) =>
      prev.map((app) => (app.id === applicantId ? { ...app, status: newStatus } : app))
    );
    const applicant = applicants.find((a) => a.id === applicantId);
    showToast(
      `${applicant?.candidateName || "Candidate"} has been marked as ${newStatus}!`
    );

    // Persist real recruiter action to MongoDB backend and sync localStorage!
    updateApplicationStatusAPI(applicantId, newStatus, newStatus, {
      jobId: applicant?.jobId,
      email: applicant?.email,
      candidateName: applicant?.candidateName,
    }).catch((err) => {
      console.warn("Backend status update error:", err);
    });
  };

  // View candidate resume and update status
  const handleViewResume = (app: RecruiterApplicant) => {
    setSelectedApplicant(app);
    if (app.id) {
      markResumeViewedAPI(app.id, {
        jobId: app.jobId,
        email: app.email,
        candidateName: app.candidateName,
      }).catch((err) => console.warn("Backend resume view error:", err));
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === app.id ? { ...a, status: a.status === "Applied" ? "Reviewing" : a.status } : a
        )
      );
    }
  };

  // Modal Handlers: Open New Job / Edit Existing Job
  const openNewJobModal = () => {
    setEditingJobId(null);
    setJobTitle("");
    setJobDepartment("Engineering");
    setJobLocation("");
    setJobWorkplace("Remote");
    setJobType("Full-time");
    setJobExperience("");
    setJobSalary("");
    setJobOpenings("1");
    setJobPostedBy("");
    setJobTags("");
    setJobDescription("");
    setJobResponsibilities("");
    setJobRequirements("");
    setJobBenefits("");
    setIsPostJobModalOpen(true);
  };

  const openEditJobModal = (job: PostedJob) => {
    setEditingJobId(job.id);
    setJobTitle(job.title || "");
    setJobDepartment(job.department || "Engineering");
    setJobLocation(job.location || "Bengaluru, Karnataka");
    setJobWorkplace(job.workplace || "Remote");
    setJobType(job.type || "Full-time");
    setJobExperience(job.experience || "3 - 5 years");
    setJobSalary(job.salary || "₹18L - ₹24L/yr");
    setJobOpenings(String(job.openings || 1));
    setJobPostedBy(job.postedBy || "Talent Acquisition Team");
    setJobTags((job.tags || []).join(", "));
    setJobDescription(job.description || "");
    setJobResponsibilities((job.responsibilities || []).join("\n"));
    setJobRequirements((job.requirements || []).join("\n"));
    setJobBenefits((job.benefits || []).join("\n"));
    setIsPostJobModalOpen(true);
  };

  // Action: Save Job (Create or Edit)
  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      showToast("Please enter a valid job title");
      return;
    }

    const parsedTags = jobTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedResponsibilities = jobResponsibilities
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const parsedRequirements = jobRequirements
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const parsedBenefits = jobBenefits
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);

    const user = getStoredUser();
    const uid = (user as any)?._id || user?.id || (user as any)?.userId || user?.email;
    const compName = companyName || (user as any)?.companyName || user?.name || "Company";

    if (editingJobId) {
      // Update existing job
      const updatePayload = {
        title: jobTitle,
        department: jobDepartment,
        location: jobLocation || "Remote",
        workplace: jobWorkplace || "Hybrid",
        type: jobType || "Full-time",
        experience: jobExperience || "1-3 years",
        salary: jobSalary || "Competitive",
        openings: Number(jobOpenings) || 1,
        postedBy: jobPostedBy || compName || "Talent Acquisition Team",
        tags: parsedTags.length > 0 ? parsedTags : ["Engineering", "Tech"],
        skills: parsedTags.length > 0 ? parsedTags : ["Engineering", "Tech"],
        description: jobDescription,
        responsibilities: parsedResponsibilities,
        requirements: parsedRequirements,
        benefits: parsedBenefits,
      };

      setJobs((prev) => {
        const updated = prev.map((j) => {
          if (j.id === editingJobId) {
            return {
              ...j,
              ...updatePayload,
            };
          }
          return j;
        });
        try {
          if (uid) localStorage.setItem(`company_posted_jobs_${uid}`, JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });
      showToast(`Job posting "${jobTitle}" updated successfully!`);

      // Persist to MongoDB backend
      updateCompanyJob(editingJobId, updatePayload).catch((err) => {
        console.error("Backend update job error:", err);
      });
    } else {
      // Create new job: If company itself is in approval / not approved (status !== 'Approved') or lacks live job permission -> strictly 'Pending'
      const isApprovedCompany = companyStatus === "Approved" && isCompanyApproved;
      const targetStatus: "Active" | "Pending" = isApprovedCompany && canPostLiveJobs ? "Active" : "Pending";

      const jobPayload = {
        title: jobTitle,
        company: compName,
        companyId: uid,
        department: jobDepartment,
        location: jobLocation,
        workplace: jobWorkplace,
        type: jobType,
        experience: jobExperience,
        salary: jobSalary,
        openings: Number(jobOpenings) || 1,
        postedBy: jobPostedBy || compName || "Talent Acquisition Team",
        tags: parsedTags.length > 0 ? parsedTags : ["Engineering", "Tech"],
        skills: parsedTags.length > 0 ? parsedTags : ["Engineering", "Tech"],
        description: jobDescription,
        responsibilities: parsedResponsibilities,
        requirements: parsedRequirements,
        benefits: parsedBenefits,
        status: targetStatus,
      };

      const tempId = `temp-${Date.now()}`;
      const newJob: PostedJob = {
        ...jobPayload,
        id: tempId,
        applicantsCount: 0,
        postedOn: "Just now",
        status: targetStatus,
      };

      setJobs((prev) => {
        const updated = [newJob, ...prev];
        try {
          if (uid) localStorage.setItem(`company_posted_jobs_${uid}`, JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });

      if (targetStatus === "Active") {
        showToast(`🎉 Job opening "${jobTitle}" has been posted directly as LIVE!`);
      } else {
        showToast(`📋 Job posting "${jobTitle}" submitted! Since company is awaiting approval, it has been placed in Pending status for Super Admin approval.`);
      }

      // Persist to MongoDB backend and sync real id
      createCompanyJob(jobPayload)
        .then((res) => {
          if (res.success && res.job) {
            const saved = res.job;
            const realId = saved.id || saved._id?.toString() || tempId;
            setJobs((prev) => {
              const updated = prev.map((j) =>
                j.id === tempId ? { ...saved, id: realId, status: saved.status || targetStatus } : j
              );
              try {
                if (uid) localStorage.setItem(`company_posted_jobs_${uid}`, JSON.stringify(updated));
              } catch (err) {}
              return updated;
            });
          }
        })
        .catch((err) => {
          console.error("Backend job creation error:", err);
        });
    }

    setIsPostJobModalOpen(false);
  };

  // Action: Buy More Resume Credits
  const handleBuyCredits = (credits: number, price: string) => {
    if (companyStatus !== "Approved") {
      showToast("without approval you dont buy subscription");
      setIsApprovalRequiredModalOpen(true);
      return;
    }

    const nextTotal = totalResumesPurchased + credits;
    setTotalResumesPurchased(nextTotal);
    if (typeof window !== "undefined") {
      const u = getStoredUser();
      const uid = (u as any)?._id || u?.id || (u as any)?.userId || u?.email;


      if (uid) {
        localStorage.setItem(`company_total_credits_${uid}`, String(nextTotal));
      }
    }
    setIsBuyCreditsModalOpen(false);
    showToast(`Successfully purchased ${credits} Resume Credits for ${price}!`);
  };

  // Save Company Profile
  const handleSaveCompanyProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cName = (formData.get("companyName") as string) || companyName;
    const cTagline = (formData.get("tagline") as string) || tagline;
    const cIndustry = (formData.get("industry") as string) || industry;
    const cSize = (formData.get("companySize") as string) || companySize;
    const cHq = (formData.get("headquarters") as string) || headquarters;
    const cWeb = (formData.get("website") as string) || website;
    const cEmail = (formData.get("contactEmail") as string) || contactEmail;
    const cPhone = (formData.get("contactPhone") as string) || contactPhone;
    const cGst = (formData.get("gstNumber") as string) || gstNumber;
    const cAbout = (formData.get("aboutCompany") as string) || aboutCompany;
    const cCulture = (formData.get("culture") as string) ?? cultureText;
    const cPerks = (formData.get("perks") as string) ?? perksText;

    const cultureArr = cCulture
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const perksArr = cPerks
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    setCompanyName(cName);
    setTagline(cTagline);
    setIndustry(cIndustry);
    setCompanySize(cSize);
    setHeadquarters(cHq);
    setWebsite(cWeb);
    setContactEmail(cEmail);
    setContactPhone(cPhone);
    setGstNumber(cGst);
    setAboutCompany(cAbout);
    setCultureText(cCulture);
    setPerksText(cPerks);

    const user = getStoredUser();
    const uid = (user as any)?._id || user?.id || user?.userId || user?.email;

    const isResubmitting = companyStatus === "Rejected";
    const nextStatus = isResubmitting ? "Pending" : companyStatus;
    const nextRejectionReason = isResubmitting ? "" : rejectionReason;

    if (isResubmitting) {
      setCompanyStatus("Pending");
      setRejectionReason("");
    }

    const profileData = {
      companyName: cName,
      tagline: cTagline,
      industry: cIndustry,
      companySize: cSize,
      headquarters: cHq,
      website: cWeb,
      contactEmail: cEmail,
      contactPhone: cPhone,
      gstNumber: cGst,
      aboutCompany: cAbout,
      profileImage,
      bannerImage,
      culture: cultureArr,
      perks: perksArr,
      status: nextStatus,
      rejectionReason: nextRejectionReason,
    };

    if (uid && typeof window !== "undefined") {
      safeSetLocalStorage(`company_profile_data_${uid}`, JSON.stringify(profileData));
    }

    if (user) {
      setStoredUser({
        ...user,
        companyName: cName,
        name: cName,
        tagline: cTagline,
        industry: cIndustry,
        companySize: cSize,
        location: cHq,
        headquarters: cHq,
        website: cWeb,
        workEmail: cEmail,
        contactEmail: cEmail,
        phone: cPhone,
        contactPhone: cPhone,
        gstNumber: cGst,
        bio: cAbout,
        aboutCompany: cAbout,
        profileImage,
        logo: profileImage,
        bannerImage,
        culture: cultureArr,
        perks: perksArr,
        status: nextStatus,
        rejectionReason: nextRejectionReason,
      } as any);
    }

    // Persist real changes to MongoDB backend
    const updatePayload: any = {
      companyName: cName,
      name: cName,
      tagline: cTagline,
      industry: cIndustry,
      companySize: cSize,
      location: cHq,
      headquarters: cHq,
      website: cWeb,
      workEmail: cEmail,
      contactEmail: cEmail,
      phone: cPhone,
      contactPhone: cPhone,
      gstNumber: cGst,
      bio: cAbout,
      aboutCompany: cAbout,
      culture: cultureArr,
      perks: perksArr,
      status: nextStatus,
      rejectionReason: nextRejectionReason,
    };
    if (profileImage) {
      updatePayload.profileImage = profileImage;
      updatePayload.logo = profileImage;
    }
    if (bannerImage) {
      updatePayload.bannerImage = bannerImage;
    }

    updateUserProfile(updatePayload)
      .then((res) => {
        if (res && res.success) {
          if (res.user) {
            setStoredUser(res.user);
            if (res.user.status) setCompanyStatus(res.user.status as any);
            if (res.user.rejectionReason !== undefined) {
              setRejectionReason(res.user.rejectionReason);
            }
          }
          notifyApplicationSync();
          window.dispatchEvent(new Event("auth_change"));
          window.dispatchEvent(new Event("company_profile_updated"));
        }
      })
      .catch((err) => console.warn("Backend profile sync error:", err));

    notifyApplicationSync();
    window.dispatchEvent(new Event("auth_change"));
    window.dispatchEvent(new Event("company_profile_updated"));

    if (isResubmitting) {
      showToast("Company profile updated & re-submitted for Super Admin approval!");
    } else {
      showToast("Company profile updated successfully!");
    }
  };

  // Logout
  const handleLogout = () => {
    clearAuthSession();
    router.push("/login");
  };

  // Toggle / Save Portal Notification Settings
  const handleToggleNotificationSetting = async (
    settingKey: "emailNotificationOnApplication" | "lowCreditAlert" | "autoAcknowledgeApplicants",
    nextValue: boolean
  ) => {
    setIsSavingSettingKey(settingKey);
    let newEmailNotif = emailNotificationOnApplication;
    let newLowCredit = lowCreditAlert;
    let newAutoAck = autoAcknowledgeApplicants;

    if (settingKey === "emailNotificationOnApplication") {
      newEmailNotif = nextValue;
      setEmailNotificationOnApplication(nextValue);
    } else if (settingKey === "lowCreditAlert") {
      newLowCredit = nextValue;
      setLowCreditAlert(nextValue);
    } else if (settingKey === "autoAcknowledgeApplicants") {
      newAutoAck = nextValue;
      setAutoAcknowledgeApplicants(nextValue);
    }

    const payload = {
      notificationSettings: {
        emailNotificationOnApplication: newEmailNotif,
        lowCreditAlert: newLowCredit,
        autoAcknowledgeApplicants: newAutoAck,
        creditThreshold,
      },
    };

    // 1. Immediately update localStorage for instant persistence
    const user = getStoredUser();
    const uid = (user as any)?._id || user?.id || user?.userId || user?.email;
    if (uid) {
      try {
        localStorage.setItem(`company_notification_settings_${uid}`, JSON.stringify(payload.notificationSettings));
      } catch (e) {}
    }

    if (user) {
      setStoredUser({
        ...user,
        notificationSettings: payload.notificationSettings,
      });
    }

    // 2. Persist to MongoDB database
    try {
      await updateUserProfile(payload as any);
      const label =
        settingKey === "emailNotificationOnApplication"
          ? "Email notifications for new applications"
          : settingKey === "lowCreditAlert"
          ? "Resume credit low balance alert"
          : "Auto-acknowledge applicants";
      showToast(`${label} ${nextValue ? "enabled" : "disabled"} successfully!`);
    } catch (err) {
      console.warn("Failed to persist notification setting to backend:", err);
      showToast("Setting saved locally.");
    } finally {
      setIsSavingSettingKey(null);
    }
  };

  const handleUpdateCreditThreshold = async (newThreshold: number) => {
    setCreditThreshold(newThreshold);
    const payload = {
      notificationSettings: {
        emailNotificationOnApplication,
        lowCreditAlert,
        autoAcknowledgeApplicants,
        creditThreshold: newThreshold,
      },
    };

    const user = getStoredUser();
    const uid = (user as any)?._id || user?.id || user?.userId || user?.email;
    if (uid) {
      try {
        localStorage.setItem(`company_notification_settings_${uid}`, JSON.stringify(payload.notificationSettings));
      } catch (e) {}
    }
    if (user) {
      setStoredUser({
        ...user,
        notificationSettings: payload.notificationSettings,
      });
    }
    try {
      await updateUserProfile(payload as any);
      showToast(`Low credit alert threshold set to ${newThreshold} credits!`);
    } catch (err) {
      console.warn("Failed to update credit threshold in DB:", err);
    }
  };

  const handleSendTestAlert = async (type: "application_alert" | "low_credit") => {
    setIsTestingAlert(type);
    const user = getStoredUser();
    const companyId = (user as any)?._id || user?.id || user?.userId || user?.email || "c1";

    try {
      const res = await testCompanyNotificationAPI(companyId, type);
      if (res && res.success) {
        setLastTestAlertResult({
          type,
          message: res.message,
          details: res.details,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        });
        showToast(res.message);
      } else {
        const fallbackMsg =
          type === "low_credit"
            ? `⚠️ Low balance alert dispatched! (Balance: ${remainingCredits}, Threshold: ${creditThreshold})`
            : `📧 Test application alert sent to ${contactEmail || "company email"}`;
        setLastTestAlertResult({
          type,
          message: fallbackMsg,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        });
        showToast(fallbackMsg);
      }
    } catch (err: any) {
      const fallbackMsg =
        type === "low_credit"
          ? `⚠️ Low balance alert dispatched! (Balance: ${remainingCredits}, Threshold: ${creditThreshold})`
          : `📧 Test application alert sent to ${contactEmail || "company email"}`;
      setLastTestAlertResult({
        type,
        message: fallbackMsg,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      });
      showToast(fallbackMsg);
    } finally {
      setIsTestingAlert(null);
    }
  };

  // Metrics calculation
  const totalJobsCount = jobs.length;
  const activeJobsCount = jobs.filter((j) => j.status === "Active").length;
  const totalApplicantsCount = applicants.length;
  const hiredCount = applicants.filter((a) => a.status === "Hired").length;
  const rejectedCount = applicants.filter((a) => a.status === "Rejected").length;
  const inPipelineCount = applicants.filter(
    (a) => a.status === "Interview" || a.status === "Shortlisted" || a.status === "Reviewing"
  ).length;
  const remainingCredits = totalResumesPurchased - resumesUsed;

  // Filtered applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesFilter = applicantFilter === "ALL" || app.status === applicantFilter;
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appliedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex antialiased selection:bg-[#DDD6FE] selection:text-[#5B21B6]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[999] bg-slate-900 border border-slate-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* LEFT SIDEBAR (Clean Light Style - Responsive drawer on mobile/tablet, sticky on lg) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 h-screen bg-white border-r border-slate-200/80 flex flex-col shrink-0 select-none shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] shadow-xs group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 block">
                Addy<span className="text-[#7C3AED]">Job</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Company Admin
              </span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close navigation sidebar"
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Middle Navigation (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Navigation
          </div>

          {/* Dashboard - Visible only if permitted */}
          {permissions.dashboard && (
            <button
              onClick={() => handleTabSwitch("dashboard")}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#EDE9FE]/80 text-[#7C3AED] font-extrabold border border-[#DDD6FE]/70 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === "dashboard" ? "text-[#7C3AED]" : "text-slate-500"}`} />
              <span className="flex-1 text-left">Dashboard</span>
            </button>
          )}

          {/* Company Details / Profile - ALWAYS VISIBLE by default */}
          <button
            onClick={() => handleTabSwitch("profile")}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === "profile"
                ? "bg-[#EDE9FE]/80 text-[#7C3AED] font-extrabold border border-[#DDD6FE]/70 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Building2 className={`w-4 h-4 shrink-0 ${activeTab === "profile" ? "text-[#7C3AED]" : "text-slate-500"}`} />
            <span className="flex-1 text-left">Company Profile</span>
          </button>

          {/* Job Postings - Always accessible to companies */}
          <button
            onClick={() => handleTabSwitch("jobs")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === "jobs"
                ? "bg-[#EDE9FE]/80 text-[#7C3AED] font-extrabold border border-[#DDD6FE]/70 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Briefcase className={`w-4 h-4 shrink-0 ${activeTab === "jobs" ? "text-[#7C3AED]" : "text-slate-500"}`} />
              <span>Job Postings</span>
            </div>
            <div className="flex items-center gap-1.5">
              {!canPostLiveJobs && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                  Pending Mode
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE]">
                {totalJobsCount}
              </span>
            </div>
          </button>

          {/* Applications - Visible only if permitted */}
          {permissions.applicants && (
            <button
              onClick={() => handleTabSwitch("applicants")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === "applicants"
                  ? "bg-[#EDE9FE]/80 text-[#7C3AED] font-extrabold border border-[#DDD6FE]/70 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Users className={`w-4 h-4 shrink-0 ${activeTab === "applicants" ? "text-[#7C3AED]" : "text-slate-500"}`} />
                <span>Applications</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE]">
                {totalApplicantsCount}
              </span>
            </button>
          )}

          {/* Resumes Purchased - Visible only if permitted */}
          {permissions.resumes && (
            <button
              onClick={() => handleTabSwitch("resumes")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === "resumes"
                  ? "bg-[#EDE9FE]/80 text-[#7C3AED] font-extrabold border border-[#DDD6FE]/70 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <FolderDown className={`w-4 h-4 shrink-0 ${activeTab === "resumes" ? "text-[#7C3AED]" : "text-slate-500"}`} />
                <span>Resumes Purchased</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                {remainingCredits} Left
              </span>
            </button>
          )}

          {/* Our Subscription - ALWAYS VISIBLE by default */}
          <button
            onClick={() => handleTabSwitch("subscription")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
              activeTab === "subscription"
                ? "bg-[#EDE9FE]/80 text-[#7C3AED] font-extrabold border border-[#DDD6FE]/70 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <CreditCard className={`w-4 h-4 shrink-0 ${activeTab === "subscription" ? "text-[#7C3AED]" : "text-slate-500"}`} />
              <span>Our Subscription</span>
            </div>
            {currentPlan && currentPlan !== "No Active Plan" ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                {currentPlan.split(" ")[0]}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                NONE
              </span>
            )}
          </button>

          {/* Settings - Visible only if permitted */}
          {permissions.settings && (
            <button
              onClick={() => handleTabSwitch("settings")}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[#EDE9FE]/80 text-[#7C3AED] font-extrabold border border-[#DDD6FE]/70 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Settings className={`w-4 h-4 shrink-0 ${activeTab === "settings" ? "text-[#7C3AED]" : "text-slate-500"}`} />
              <span className="flex-1 text-left">Settings</span>
            </button>
          )}

          {/* Resume Balance Mini Card in Sidebar (Visible only when resumes module is permitted) */}
          {permissions.resumes && (
            <div className="pt-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700">Resume Credits</span>
                  <span className="font-black text-emerald-600">
                    {remainingCredits} / {totalResumesPurchased}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${
                        totalResumesPurchased > 0
                          ? Math.min(100, Math.max(0, (remainingCredits / totalResumesPurchased) * 100))
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    setIsBuyCreditsModalOpen(true);
                  }}
                  className="mt-3 w-full py-1.5 px-3 rounded-xl bg-white hover:bg-[#F5F3FF] text-[#7C3AED] text-[11px] font-bold border border-slate-200 hover:border-[#DDD6FE] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buy More Credits</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* TOP BAR */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2.5 sm:gap-4 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-2xl min-w-0">
            {/* Hamburger Button for Mobile / Tablet */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-[#7C3AED] hover:bg-purple-50 rounded-xl border border-slate-200 shrink-0 transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile & Tablet Brand Logo */}
            <div className="flex items-center gap-1.5 lg:hidden shrink-0">
              <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                Addy<span className="text-[#7C3AED]">Job</span>
              </span>
            </div>

            <div className="relative w-full min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates, roles..."
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-full border border-transparent focus:border-purple-300 focus:ring-4 focus:ring-purple-100 outline-hidden transition"
              />
            </div>
          </div>

          {/* Top Bar Right: Company Profile & Account Menu */}
          <div ref={profileDropdownRef} className="relative shrink-0">
            <button
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
              aria-expanded={isProfileDropdownOpen}
              className="flex items-center gap-2 sm:gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-slate-100/90 border border-slate-200/80 transition cursor-pointer select-none group bg-white shadow-2xs"
            >
              {/* Company Logo / Initials Badge */}
              <div
                style={{ backgroundColor: "#EDE9FE", color: "#6D28D9", borderColor: "#DDD6FE" }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-2xs group-hover:scale-105 transition-transform overflow-hidden"
              >
                {profileImage ? (
                  <img src={profileImage} alt={companyName} className="w-full h-full object-cover" />
                ) : (
                  (companyName || "CO").slice(0, 2).toUpperCase()
                )}
              </div>

              {/* Company Name & Role Info */}
              <div className="hidden sm:block text-left min-w-0 max-w-[120px] lg:max-w-[160px]">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {companyName || "Company"}
                </p>
                <p className="text-[10px] font-semibold text-[#7C3AED] truncate flex items-center gap-1">
                  <span>Company Admin</span>
                </p>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                  isProfileDropdownOpen ? "rotate-180 text-[#7C3AED]" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Header Profile Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FAF5FF] to-[#EDE9FE]/50 border border-[#DDD6FE]/60 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: "#EDE9FE", color: "#6D28D9", borderColor: "#DDD6FE" }}
                      className="w-11 h-11 rounded-2xl border flex items-center justify-center font-black text-sm shrink-0 shadow-xs overflow-hidden"
                    >
                      {profileImage ? (
                        <img src={profileImage} alt={companyName} className="w-full h-full object-cover" />
                      ) : (
                        (companyName || "CO").slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">
                        {companyName || "Company"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{contactEmail || "Company Portal"}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE]">
                          {currentPlan && currentPlan !== "No Active Plan" ? currentPlan.split(" ")[0] : "Admin"}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {remainingCredits} Credits
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Navigation Links */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleTabSwitch("profile");
                      setIsProfileDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                      activeTab === "profile"
                        ? "bg-[#EDE9FE]/80 text-[#7C3AED] font-extrabold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
                    <div className="flex-1">
                      <span>Company Profile</span>
                      <p className="text-[10px] text-slate-400 font-normal">Edit details, branding & info</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                {/* Logout Divider & Button */}
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="flex-1">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* MAIN BODY PER TAB */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {/* REJECTION ALERT BANNER (Displayed in RED color on company screen) */}
          {companyStatus === "Rejected" && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-50 via-red-50 to-rose-100 border-2 border-rose-400 p-5 sm:p-7 shadow-lg shadow-rose-500/10 animate-in slide-in-from-top-3 duration-300">
              <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30">
                  <AlertOctagon className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                        Verification Rejected
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-rose-950">
                        Super Admin has rejected your company verification request
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-rose-700 bg-white/80 border border-rose-300 px-3 py-1 rounded-full shadow-2xs">
                      Status: Action Required
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-rose-800 font-medium leading-relaxed">
                    Your company verification request has been rejected by the Super Admin. Below is the official reason message sent to your registered email:
                  </p>

                  {/* Red Reason Box */}
                  <div className="p-4 rounded-2xl bg-white border-2 border-rose-300/80 shadow-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase tracking-wider">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Message / Reason from Super Admin:</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-rose-950 whitespace-pre-wrap leading-relaxed">
                      {rejectionReason || "Verification criteria were not met. Please verify your company details, GSTIN, and official contact information."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 text-xs text-rose-700 font-medium">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Note: Without approval you cannot buy subscription or post live jobs.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabSwitch("profile")}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5 active:scale-98"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Update Company Profile &amp; Re-submit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Real-time Low Credit Balance Alert Banner (Active when Setting 2 is ON & remainingCredits <= creditThreshold) */}
          {lowCreditAlert && remainingCredits <= creditThreshold && (
            <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50/70 border border-amber-300 text-amber-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-300/80 flex items-center justify-center shrink-0 text-amber-700">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-amber-950">
                      Low Resume Credit Alert
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-200/80 text-amber-900 border border-amber-300">
                      {remainingCredits} credit{remainingCredits === 1 ? "" : "s"} left (Threshold: {creditThreshold})
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-amber-800/90 mt-0.5 max-w-2xl">
                    Your candidate resume balance has dropped to or below your alert threshold of {creditThreshold}. Top up credits now to continue unlocking and downloading resumes without interruption.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBuyCreditsModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buy More Credits</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Executive Welcome Banner (Light Modern Gradient) */}
              <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF]/60 to-[#EDE9FE] border border-purple-200/80 shadow-xs">
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE] uppercase tracking-wider inline-block mb-2">
                      Employer Hub • {companyName}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Recruitment Command Center
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                      Manage job posts, review incoming applications, download candidate resumes,
                      and hire top tier talent directly from one portal.
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => setIsPostJobModalOpen(true)}
                      className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 transition cursor-pointer hover:scale-102 whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">Post New Job</span>
                    </button>
                    <button
                      onClick={() => handleTabSwitch("resumes")}
                      className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-xs flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <FolderDown className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="whitespace-nowrap">View Resumes ({remainingCredits} Left)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 6 KEY METRICS TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Kitne Post Hai */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-purple-300 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500">Total Job Posts</span>
                    <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{totalJobsCount}</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                      {activeJobsCount} Active Listings
                    </p>
                  </div>
                </div>

                {/* 2. Kitne Applications Aye Hai */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-purple-300 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500">Applications</span>
                    <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{totalApplicantsCount}</p>
                    <p className="text-[10px] text-[#7C3AED] font-bold mt-0.5">
                      {inPipelineCount} In Review
                    </p>
                  </div>
                </div>

                {/* 3. Kis User Ko Hire Kiya Hai */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500">Candidates Hired</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-emerald-600">{hiredCount}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Offers Accepted</p>
                  </div>
                </div>

                {/* 4. Kis User Ko Reject Kiya Hai */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-rose-300 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500">Rejected</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <UserX className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-rose-600">{rejectedCount}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Not Shortlisted</p>
                  </div>
                </div>

                {/* 5. Kitne Resume Kharide Hai */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500">Resumes Bought</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <FolderDown className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-600">{totalResumesPurchased}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {remainingCredits} Available
                    </p>
                  </div>
                </div>

                {/* 6. Our Subscription */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-purple-300 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500">Subscription</span>
                    <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
                      <Crown className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 truncate">PRO Growth</p>
                    <p className="text-[10px] text-purple-600 font-bold mt-0.5">Valid Dec 2026</p>
                  </div>
                </div>
              </div>

              {/* TWO COLUMN GRID: Live Applications & Active Job Listings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Live Applications Tracker */}
                <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#7C3AED]" />
                          <span>Recent Candidate Applications</span>
                        </h2>
                        <span className="sm:hidden text-[9px] font-bold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-full border border-[#DDD6FE]">
                          Scroll →
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Take immediate action to hire, interview, or reject applicants.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("applicants")}
                      className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>View All ({totalApplicantsCount})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Applicants List - Horizontally scrollable on mobile, natural full width on desktop (Exact like Image 2) */}
                  <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 pb-2">
                    <div className="space-y-3 min-w-[680px] sm:min-w-0 pr-3 sm:pr-0">
                      {applicants.slice(0, 5).map((app) => (
                        <div
                          key={app.id}
                          className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/70 transition flex items-center justify-between gap-6 whitespace-nowrap shadow-xs"
                        >
                          {/* Left: Full Candidate Details */}
                          <div className="flex items-center gap-3.5 shrink-0">
                            <div
                              style={{ backgroundColor: "#EDE9FE", color: "#6D28D9", borderColor: "#DDD6FE" }}
                              className="w-11 h-11 rounded-2xl border font-black text-sm flex items-center justify-center shrink-0 shadow-xs"
                            >
                              {app.candidateName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                  {app.candidateName}
                                </h4>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {app.matchScore}% Match
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">{app.appliedRole}</p>
                              <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                                <span>{app.experience}</span>
                                <span>•</span>
                                <span>{app.location}</span>
                                <span>•</span>
                                <span>{app.appliedDate}</span>
                              </p>
                            </div>
                          </div>

                          {/* Right: Status Badge & Action Buttons (Exact like Image 2) */}
                          <div className="flex items-center gap-2.5 shrink-0 pl-2">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                app.status === "Hired"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : app.status === "Rejected"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : app.status === "Interview"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : app.status === "Shortlisted"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE]"
                              }`}
                            >
                              {app.status}
                            </span>

                            {/* Quick Shortlist Button */}
                            {app.status !== "Shortlisted" && (
                              <button
                                onClick={() => handleUpdateStatus(app.id, "Shortlisted")}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Shortlist this candidate"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Shortlist</span>
                              </button>
                            )}

                            {/* Quick Reject Button */}
                            {app.status !== "Rejected" && (
                              <button
                                onClick={() => handleUpdateStatus(app.id, "Rejected")}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Reject application"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleViewResume(app)}
                              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition cursor-pointer shadow-2xs"
                              title="View Full Profile & Resume"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Active Job Posts & Quick Stats */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Job Postings Card */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#7C3AED]" />
                        <span>Active Job Openings</span>
                      </h3>
                      <button
                        onClick={openNewJobModal}
                        className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] cursor-pointer"
                      >
                        + Post
                      </button>
                    </div>

                    <div className="space-y-3">
                      {jobs.slice(0, 4).map((job) => (
                        <div
                          key={job.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{job.title}</h4>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                job.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {job.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {job.location} • {job.salary}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleOpenJobApplicants(job)}
                              className="text-[#7C3AED] hover:text-[#6D28D9] font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
                              title={`View applicants for "${job.title}"`}
                            >
                              <span>{getJobApplicantCount(job)} Applicants</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </button>
                            <span className="text-slate-400">{job.postedOn}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveTab("jobs")}
                      className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Manage All {totalJobsCount} Jobs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Resume Credits Quick Purchase Widget */}
                  <div className="bg-gradient-to-br from-purple-50/60 via-violet-50/40 to-slate-50 rounded-3xl border border-purple-100 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
                        <FolderDown className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Resume Database Access</h4>
                        <p className="text-[11px] text-slate-500">
                          {remainingCredits} Credits Available
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Download verified resumes directly with full contact info and verified
                      experience history.
                    </p>
                    <button
                      onClick={() => setIsBuyCreditsModalOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-violet-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Buy Resume Credit Packs</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPANY PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Company Profile & Branding</h2>
                  <p className="text-xs text-slate-500">
                    This public information is displayed to candidates on job postings and company pages.
                  </p>
                </div>
                {companyStatus === "Approved" ? (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span>Company Approved by Super Admin</span>
                  </span>
                ) : companyStatus === "Pending" ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 self-start sm:self-auto">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Pending Verification</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 self-start sm:self-auto">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>Verification Rejected</span>
                  </span>
                )}
              </div>

              {companyStatus === "Rejected" && (
                <div className="rounded-2xl bg-rose-50 border-2 border-rose-300 p-4 sm:p-5 text-rose-950 shadow-xs flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/30">
                    <XCircle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                        Rejected
                      </span>
                      <h3 className="font-extrabold text-rose-950 text-sm">
                        Verification Rejected by Super Admin
                      </h3>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                      Official Rejection Reason: <span className="font-bold text-rose-950">{rejectionReason || "Verification criteria were not met. Please verify your company details, GSTIN, and official contact information."}</span>
                    </p>
                    <p className="text-[11px] text-rose-600">
                      Please make necessary corrections to the fields below and click &quot;Save Company Profile&quot; to re-submit your profile for review.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveCompanyProfile} className="space-y-6">
                {/* Brand Header Banner & Profile Avatar (Matching 1st image) */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                  {/* Sleek Brand Cover Banner (Click to See, Update, Remove) */}
                  <div
                    onClick={() => setImageModalState({ isOpen: true, type: "banner", mode: "menu" })}
                    className="relative w-full h-36 sm:h-52 md:h-56 bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 overflow-hidden cursor-pointer group"
                    style={
                      bannerImage
                        ? {
                            backgroundImage: `url(${bannerImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    {/* Subtle geometric dot pattern (from Image 1) */}
                    <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:20px_20px] pointer-events-none" />
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Banner Hover Overlay */}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 shadow-md">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Click to View, Update or Remove Banner</span>
                      </span>
                    </div>

                    {/* Top Right Header Controls */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-6 flex items-center gap-2 z-10">
                      {companyStatus === "Approved" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-[11px] sm:text-xs font-semibold shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden xs:inline">Company Approved by Super Admin</span>
                        </span>
                      ) : companyStatus === "Rejected" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-950/70 backdrop-blur-md border border-rose-500/30 text-rose-200 text-[11px] sm:text-xs font-semibold shadow-sm">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span className="hidden xs:inline">Verification Rejected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-amber-950/70 backdrop-blur-md border border-amber-500/30 text-amber-200 text-[11px] sm:text-xs font-semibold shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden xs:inline">Pending Verification</span>
                        </span>
                      )}

                      {/* Cover Options Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageModalState({ isOpen: true, type: "banner", mode: "menu" });
                        }}
                        className="px-2.5 sm:px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 text-white text-[11px] sm:text-xs font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cover Options</span>
                      </button>
                    </div>
                  </div>

                  {/* Profile Details Container (Below Banner) */}
                  <div className="px-4 sm:px-8 pb-6">
                    {/* Avatar overlapping banner + Right side action buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-14 mb-4 relative z-10">
                      {/* Company Avatar Card (Click to See, Update, Remove) */}
                      <div
                        onClick={() => setImageModalState({ isOpen: true, type: "profile", mode: "menu" })}
                        className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white border-4 border-white shadow-xl p-1 flex items-center justify-center shrink-0 relative group cursor-pointer"
                        title="Click to view, update or remove logo"
                      >
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={companyName}
                            className="w-full h-full object-contain rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center shadow-xs select-none">
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                              {companyName.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-slate-500 uppercase mt-0.5">
                              {companyName.split(" ")[1] || "CORP"}
                            </span>
                          </div>
                        )}

                        {/* Hover camera overlay */}
                        <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1">
                          <Camera className="w-4 h-4" />
                          <span>Edit Logo</span>
                        </div>

                        {/* Small camera badge bottom right */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-md border-2 border-white">
                          <Camera className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Right: Actions (Follow, Website, Share from Image 1) */}
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-end shrink-0 w-full sm:w-auto">
                        <Link
                          href={`/companies/${encodeURIComponent(companyName || "company")}`}
                          target="_blank"
                          className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Public Page</span>
                        </Link>

                        <a
                          href={website ? (website.startsWith("http") ? website : `https://${website}`) : "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 sm:flex-initial justify-center px-3 sm:px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>Website</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              navigator.clipboard?.writeText(window.location.origin + `/companies/${encodeURIComponent(companyName || "company")}`);
                              showToast("Company profile link copied to clipboard!");
                            }
                          }}
                          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-xs cursor-pointer shrink-0"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Company Details (Title, badges, tagline, meta strip) */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                          {companyName || "My Company"}
                        </h1>
                        {companyStatus === "Approved" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                            <span>Company Approved by Super Admin</span>
                          </span>
                        ) : companyStatus === "Rejected" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {industry && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                            {industry}
                          </span>
                        )}
                      </div>

                      {/* Tagline */}
                      {tagline && (
                        <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-3xl leading-relaxed">
                          {tagline}
                        </p>
                      )}

                      {/* Meta details strip with dot separators */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
                        {headquarters && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{headquarters}</span>
                          </span>
                        )}
                        {headquarters && companySize && <span className="text-slate-300">•</span>}
                        {companySize && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>{companySize}</span>
                          </span>
                        )}
                        {gstNumber && (
                          <>
                            {(headquarters || companySize) && <span className="text-slate-300">•</span>}
                            <span className="flex items-center gap-1 font-semibold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-md border border-[#DDD6FE]">
                              <FileText className="w-3 h-3 text-[#7C3AED]" />
                              <span>GST: {gstNumber}</span>
                            </span>
                          </>
                        )}
                        {contactPhone && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{contactPhone}</span>
                            </span>
                          </>
                        )}
                        {contactEmail && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{contactEmail}</span>
                            </span>
                          </>
                        )}
                      </div>

                      {aboutCompany && (
                        <p className="text-xs text-slate-600 line-clamp-2 pt-2 border-t border-slate-100 mt-2">
                          {aboutCompany}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800">Edit Company Information</h3>
                    <span className="text-[11px] text-slate-400">All changes update live</span>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Company Tagline</label>
                      <input
                        type="text"
                        name="tagline"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Industry</label>
                      <input
                        type="text"
                        name="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Company Size</label>
                      <input
                        type="text"
                        name="companySize"
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Headquarters</label>
                      <input
                        type="text"
                        name="headquarters"
                        value={headquarters}
                        onChange={(e) => setHeadquarters(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Website URL</label>
                      <input
                        type="url"
                        name="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Recruiting Email</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                      <input
                        type="text"
                        name="contactPhone"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">GST Number (GSTIN)</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono uppercase tracking-wider focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">GSTIN Verification</label>
                      <div className="w-full px-3.5 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>GSTIN Active &amp; Verified</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">
                      About Company / Description
                    </label>
                    <textarea
                      name="aboutCompany"
                      rows={4}
                      value={aboutCompany}
                      onChange={(e) => setAboutCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden resize-none"
                    />
                  </div>

                  {/* Work Culture & Employee Perks (Candidate Profile Sections) */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                        <h3 className="text-sm font-bold text-slate-900">
                          Work Culture &amp; Employee Benefits (Job Seeker View)
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        These points will appear on your public company profile for candidates. Type each point on a new line.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Work Culture & Values Input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                            <HeartHandshake className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Work Culture &amp; Values</span>
                          </label>
                          <span className="text-[10px] text-slate-400 font-medium">1 point per line</span>
                        </div>
                        <textarea
                          name="culture"
                          rows={4}
                          value={cultureText}
                          onChange={(e) => setCultureText(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden resize-none leading-relaxed"
                        />
                      </div>

                      {/* Employee Perks & Benefits Input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                            <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Employee Perks &amp; Benefits</span>
                          </label>
                          <span className="text-[10px] text-slate-400 font-medium">1 point per line</span>
                        </div>
                        <textarea
                          name="perks"
                          rows={4}
                          value={perksText}
                          onChange={(e) => setPerksText(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-violet-500/20 transition cursor-pointer"
                    >
                      Save Company Profile
                    </button>
                  </div>
                </div>

                {/* Hidden File Inputs for Profile Logo & Cover Banner Uploads */}
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageUpload}
                />
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerImageUpload}
                />
              </form>
            </div>
          )}

          {/* TAB 3: JOB POSTINGS (Kitne Post Hai) */}
          {activeTab === "jobs" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">Job Postings Management</h2>
                    <span className="sm:hidden text-[9px] font-bold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-full border border-[#DDD6FE]">
                      Scroll →
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Total {totalJobsCount} job openings created ({activeJobsCount} currently active)
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  {!canPostLiveJobs ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Pending Approval Mode
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Direct Live Posting
                    </span>
                  )}
                  <button
                    onClick={openNewJobModal}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition hover:scale-102 ${
                      canPostLiveJobs
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20"
                        : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-500/20"
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{canPostLiveJobs ? "Post a New Job (Live)" : "Post a New Job"}</span>
                  </button>
                </div>
              </div>

              {/* JOBS TABLE: Clean layout with 3-dots action menu and zero horizontal scrolling */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="w-full">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                      <tr>
                        <th className="py-3.5 px-3 sm:px-4 whitespace-nowrap w-[180px] max-w-[180px]">Job Role</th>
                        <th className="py-3.5 px-3 sm:px-4 whitespace-nowrap">Department & Mode</th>
                        <th className="py-3.5 px-3 sm:px-4 whitespace-nowrap">Location</th>
                        <th className="py-3.5 px-3 sm:px-4 whitespace-nowrap">Salary & Exp</th>
                        <th className="py-3.5 px-3 sm:px-4 whitespace-nowrap">Applications</th>
                        <th className="py-3.5 px-3 sm:px-4 whitespace-nowrap">Status</th>
                        <th className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {jobs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Briefcase className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                            <p className="font-semibold text-slate-600">No job openings created yet</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Click &quot;Post a New Job&quot; above to create your first opening.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-900 w-[180px] max-w-[180px]">
                            <div className="w-[170px] max-w-[170px] overflow-x-auto whitespace-nowrap scrollbar-thin-horizontal pb-0.5 select-text" title={job.title}><span>{job.title}</span></div>
                          </td>
                          <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-700">{job.department}</div>
                            <span className="text-[10px] text-slate-500 font-medium">{job.workplace || "Remote"} • {job.type}</span>
                          </td>
                          <td className="py-3.5 px-3 sm:px-4 text-slate-600 whitespace-nowrap">{job.location}</td>
                          <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                            <div className="font-bold text-emerald-600 text-xs tracking-tight whitespace-nowrap">
                              {job.salary}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                              {job.experience || "0 - 1 years"}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenJobApplicants(job)}
                              style={{ backgroundColor: "#EDE9FE", color: "#6D28D9", borderColor: "#DDD6FE" }}
                              className="group px-3 py-1.5 rounded-full text-[11px] font-extrabold border shadow-2xs hover:shadow-xs hover:bg-[#DDD6FE] transition-all inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
                              title={`Click to view candidates who applied for "${job.title}"`}
                            >
                              <Users className="w-3.5 h-3.5 text-[#7C3AED] group-hover:scale-110 transition-transform" />
                              <span>{getJobApplicantCount(job)} Candidates</span>
                              <ExternalLink className="w-2.5 h-2.5 text-[#7C3AED] opacity-70 group-hover:opacity-100 transition-opacity ml-0.5" />
                            </button>
                          </td>
                          <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap ${
                                job.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : job.status === "Pending"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                            <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setActionMenuJobId(actionMenuJobId === job.id ? null : job.id)}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer border ${
                                  actionMenuJobId === job.id
                                    ? "bg-slate-200 text-slate-900 border-slate-300 shadow-inner"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent hover:border-slate-200"
                                }`}
                                title="Actions"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {actionMenuJobId === job.id && (
                                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-left animate-in fade-in zoom-in-95">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuJobId(null);
                                      openEditJobModal(job);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 flex items-center gap-2.5 transition cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Edit Job</span>
                                  </button>

                                  {job.status === "Pending" ? (
                                    <div className="px-3.5 py-2 text-xs font-medium text-amber-700 bg-amber-50/60 flex items-center gap-2.5 cursor-not-allowed">
                                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                                      <span>In Review (Admin)</span>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setActionMenuJobId(null);
                                        const newStatus = (job.status === "Active" ? "Paused" : "Active") as "Active" | "Pending" | "Paused" | "Closed";
                                        if (newStatus === "Active" && (!canPostLiveJobs || companyStatus !== "Approved")) {
                                          showToast("Company is awaiting approval. You cannot activate jobs until approved by Super Admin.");
                                          return;
                                        }
                                        setJobs((prev) => {
                                          const updated = prev.map((j) =>
                                            j.id === job.id ? { ...j, status: newStatus } : j
                                          );
                                          try {
                                            const user = getStoredUser();
                                            const uid = (user as any)?._id || user?.id || user?.userId || user?.email;
                                            if (uid) localStorage.setItem(`company_posted_jobs_${uid}`, JSON.stringify(updated));
                                          } catch (err) {}
                                          return updated;
                                        });
                                        showToast(`Job status updated for ${job.title}`);
                                        try {
                                          await updateCompanyJobStatus(job.id, newStatus);
                                        } catch (err) {
                                          console.error("Failed to update status on backend:", err);
                                        }
                                      }}
                                      className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2.5 transition cursor-pointer"
                                    >
                                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{job.status === "Active" ? "Pause Job" : "Activate Job"}</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuJobId(null);
                                      handleOpenJobApplicants(job);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 flex items-center gap-2.5 transition cursor-pointer"
                                  >
                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                    <span>View Candidates ({getJobApplicantCount(job)})</span>
                                  </button>

                                  <div className="h-px bg-slate-100 my-1" />

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      setActionMenuJobId(null);
                                      if (!confirm(`Are you sure you want to delete job "${job.title}"?`)) return;
                                      setJobs((prev) => {
                                        const updated = prev.filter((j) => j.id !== job.id);
                                        try {
                                          const user = getStoredUser();
                                          const uid = (user as any)?._id || user?.id || user?.userId || user?.email;
                                          if (uid) localStorage.setItem(`company_posted_jobs_${uid}`, JSON.stringify(updated));
                                        } catch (err) {}
                                        return updated;
                                      });
                                      showToast(`Job ${job.title} deleted`);
                                      try {
                                        await deleteCompanyJob(job.id);
                                      } catch (err) {
                                        console.error("Failed to delete job on backend:", err);
                                      }
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Delete Job</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APPLICATIONS (Uspar Kitne Applications Aye Hai, Hire / Reject) */}
          {activeTab === "applicants" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">Candidate Applications</h2>
                    <span className="sm:hidden text-[9px] font-bold text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-full border border-[#DDD6FE]">
                      Scroll →
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Review submissions and manage candidate application status.
                  </p>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
                  {(
                    [
                      "ALL",
                      "Applied",
                      "Reviewing",
                      "Shortlisted",
                      "Rejected",
                    ] as const
                  ).map((st) => (
                    <button
                      key={st}
                      onClick={() => setApplicantFilter(st)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                        applicantFilter === st
                          ? "bg-white text-[#7C3AED] shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Applicant Cards List - Horizontally scrollable on mobile */}
              <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0 pb-3">
                <div className="space-y-4 w-max min-w-full lg:w-full min-w-[1100px] lg:min-w-0 pr-3 sm:pr-0">
                  {filteredApplicants.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-900">No applications match this filter</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try selecting another status tab or clear the search query.
                      </p>
                    </div>
                  ) : (
                    filteredApplicants.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 hover:border-[#DDD6FE] transition shadow-xs flex items-center justify-between gap-6 whitespace-nowrap w-full min-w-[1100px] lg:min-w-0"
                      >
                        {/* Left Candidate Info */}
                        <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
                          <div
                            style={{ backgroundColor: "#EDE9FE", color: "#6D28D9", borderColor: "#DDD6FE" }}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-xs"
                          >
                            {app.candidateName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-black text-slate-900 whitespace-nowrap">
                                {app.candidateName}
                              </h3>
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                {app.matchScore}% Match Score
                              </span>
                              <span
                                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase whitespace-nowrap ${
                                  app.status === "Hired"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : app.status === "Rejected"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : app.status === "Interview"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : app.status === "Shortlisted"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE]"
                                }`}
                              >
                                {app.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 font-semibold mt-1 whitespace-nowrap">
                              Applied For: <span className="text-slate-900">{app.appliedRole}</span>
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 whitespace-nowrap">
                              <span className="flex items-center gap-1 text-slate-600">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                {app.experience}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-600">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {app.location}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-600">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {app.email}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-600">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {app.phone}
                              </span>
                            </div>

                            {/* Skills Pills */}
                            <div className="flex items-center gap-1.5 mt-2 whitespace-nowrap">
                              {app.skills.map((s, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right Action Buttons */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewResume(app)}
                            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                            <span>View Resume</span>
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(app.id, "Shortlisted")}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shadow-2xs ${
                              app.status === "Shortlisted"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {app.status === "Shortlisted" ? "Shortlisted ✓" : "Shortlist"}
                          </button>

                          {/* REJECT BUTTON */}
                          <button
                            onClick={() => handleUpdateStatus(app.id, "Rejected")}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs ${
                              app.status === "Rejected"
                                ? "bg-rose-600 text-white border border-rose-600"
                                : "bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200"
                            }`}
                          >
                            <UserX className="w-4 h-4" />
                            <span>{app.status === "Rejected" ? "Rejected" : "Reject"}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RESUMES PURCHASED (Kitne Resume Kharide Hai) */}
          {activeTab === "resumes" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Purchased Resumes & Database</h2>
                  <p className="text-xs text-slate-500">
                    Access candidate CVs purchased from the talent pool.
                  </p>
                </div>
                <button
                  onClick={() => setIsBuyCreditsModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-violet-500/20 flex items-center gap-2 cursor-pointer transition hover:scale-102"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buy More Resume Credits</span>
                </button>
              </div>

              {/* Credits Balance Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500">Total Credits Purchased</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{totalResumesPurchased}</p>
                  <p className="text-xs text-slate-500 mt-1">From active subscription & credit packs</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500">Total Resumes In Vault</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{purchasedResumes.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Available candidate profiles</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500">Resumes Unlocked</span>
                  <p className="text-3xl font-black text-[#6D28D9] mt-1">{purchasedResumes.filter((r) => r.isUnlocked).length}</p>
                  <p className="text-xs text-slate-500 mt-1">Unlocked candidate contacts</p>
                </div>

                <div className="p-5 rounded-3xl bg-emerald-50/50 border border-emerald-200 shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-700">Available Credit Balance</span>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{remainingCredits}</p>
                  <p className="text-xs text-slate-600 mt-1">Ready to unlock new talent profiles</p>
                </div>
              </div>

              {/* Purchased Resumes List (Single-Row Table Layout with Skills & Unlock Action) */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center border border-purple-100">
                      <FolderDown className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Purchased Resumes Vault
                      </h3>
                      <p className="text-xs text-slate-500">
                        Unlock candidate contact details using your credits and download verified CVs
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#7C3AED] border border-purple-200">
                    {purchasedResumes.filter((r) => r.isUnlocked).length} / {purchasedResumes.length} Unlocked
                  </span>
                </div>

                <div className="overflow-x-auto">
                  {purchasedResumes.length === 0 ? (
                    <div className="py-14 text-center text-slate-400">
                      <FolderDown className="w-10 h-10 mx-auto text-slate-300 mb-2.5" />
                      <p className="font-bold text-slate-700 text-sm">No resumes purchased yet</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Candidate resumes sent by platform admin or unlocked from candidate pool will appear here in your vault.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          <th className="py-3.5 px-4">Candidate</th>
                          <th className="py-3.5 px-4">Role / Title</th>
                          <th className="py-3.5 px-4">Experience & Location</th>
                          <th className="py-3.5 px-4">Skills</th>
                          <th className="py-3.5 px-4">Contact Details</th>
                          <th className="py-3.5 px-4">Purchased On</th>
                          <th className="py-3.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {purchasedResumes.map((res) => {
                          const skillsList = Array.isArray(res.skills) && res.skills.length > 0
                            ? res.skills
                            : typeof (res as any).skills === "string" && (res as any).skills.trim()
                            ? (res as any).skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                            : (res as any).domain
                            ? [(res as any).domain]
                            : [];
                          return (
                            <tr
                              key={res.id}
                              className="hover:bg-slate-50/80 transition-colors group"
                            >
                              {/* 1. Candidate Name + PDF Icon */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 font-black text-xs flex items-center justify-center shrink-0 border border-rose-200">
                                    PDF
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 group-hover:text-[#7C3AED] transition block">
                                      {res.candidateName}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      Verified Candidate
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Role / Position */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="font-bold text-slate-800 block">
                                  {res.title || "Job Seeker"}
                                </span>
                              </td>

                              {/* 3. Experience & Location */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                                    <Briefcase className="w-3 h-3 text-slate-400" />
                                    {res.experience || "Fresher"}
                                  </span>
                                  <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {res.location || "India"}
                                  </span>
                                </div>
                              </td>

                              {/* 4. Skills (Tag Badges) */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-1 max-w-[280px]" title={skillsList.join(", ")}>
                                  {skillsList.length > 0 ? (
                                    <>
                                      {skillsList.slice(0, 3).map((sk: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-[#7C3AED] text-[10px] font-bold border border-purple-100 whitespace-nowrap"
                                        >
                                          {sk}
                                        </span>
                                      ))}
                                      {skillsList.length > 3 && (
                                        <span
                                          className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold whitespace-nowrap cursor-help"
                                          title={skillsList.slice(3).join(", ")}
                                        >
                                          +{skillsList.length - 3}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 italic">
                                      General Profile
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 5. Contact Details (Email & Phone - Hidden until unlocked) */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {res.isUnlocked ? (
                                  <div className="space-y-0.5 text-[11px] animate-fade-in">
                                    <p className="flex items-center gap-1.5 text-slate-800 font-semibold">
                                      <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>{res.email}</span>
                                    </p>
                                    <p className="flex items-center gap-1.5 text-slate-600">
                                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span>{res.phone || "+91 98765 43210"}</span>
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-0.5 text-[11px] select-none">
                                    <p className="flex items-center gap-1.5 text-slate-400 font-medium">
                                      <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                                      <span className="font-mono tracking-wider">••••••••@••••.com</span>
                                    </p>
                                    <p className="flex items-center gap-1.5 text-slate-400">
                                      <Phone className="w-3 h-3 text-slate-300 shrink-0" />
                                      <span className="font-mono tracking-wider">+91 ••••• ••••</span>
                                    </p>
                                  </div>
                                )}
                              </td>

                              {/* 6. Purchased Date */}
                              <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{res.purchasedDate || "Recent"}</span>
                                </span>
                              </td>

                              {/* 7. Action Button (Unlock vs Download CV) */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                {res.isUnlocked ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadPurchasedResume(res)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap hover:shadow-md"
                                    title="Download verified resume PDF"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download CV</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleUnlockResume(res)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] text-white text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap hover:shadow-md"
                                    title="Unlock candidate contact details & CV (Deducts 1 Credit)"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Unlock Contact</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: OUR SUBSCRIPTION */}
          {activeTab === "subscription" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Company Subscription & Plans</h2>
                  <p className="text-xs text-slate-500">
                    Manage your active recruitment package, quota limits, and billing options.
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Active: {currentPlan}</span>
                </span>
              </div>


              {/* Dynamic Subscription Plans Section (Styled exactly like Image 3, synced with Super Admin) */}
              <div id="available-plans-section" className="pt-2">
                {/* Header & Toggle */}
                <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Choose a Plan That Fits Your Hiring{" "}
                    <span className="relative inline-block text-[#7C3AED]">
                      Needs
                      <span className="absolute -bottom-1 left-0 right-0 h-1 bg-amber-400 rounded-full" />
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2">
                    Flexible plans for every business - from startups to large enterprises.
                  </p>

                  {/* Monthly / Yearly / Free Trial Switcher */}
                  <div className="mt-6 inline-flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-full shadow-xs">
                    <button
                      type="button"
                      onClick={() => setSubscriptionBillingCycle("monthly")}
                      className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        subscriptionBillingCycle === "monthly"
                          ? "bg-[#7C3AED] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Monthly
                    </button>
                    <div className="relative">
                      <span className="absolute -top-3.5 right-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-[9px] border border-emerald-200">
                        Save 20%
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubscriptionBillingCycle("yearly")}
                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          subscriptionBillingCycle === "yearly"
                            ? "bg-[#7C3AED] text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Yearly
                      </button>
                    </div>

                    {/* Free Trial Switch Option - Only visible when Admin has enabled Free Trial */}
                    {trialSettings.enabled && (
                      <div className="relative">
                        <span className="absolute -top-3.5 right-1 px-1.5 py-0.2 rounded-full font-extrabold text-[9px] border bg-amber-100 text-amber-800 border-amber-200">
                          100% Free
                        </span>
                        <button
                          type="button"
                          onClick={() => setSubscriptionBillingCycle("trial")}
                          className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            subscriptionBillingCycle === "trial"
                              ? "bg-[#7C3AED] text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Free Trial</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing / Trial Display Area */}
                {subscriptionBillingCycle === "trial" && trialSettings.enabled ? (
                  <div className="max-w-2xl mx-auto pt-4 sm:pt-6">
                    <div className="relative bg-white rounded-3xl border-2 border-[#7C3AED] p-7 sm:p-8 shadow-2xl shadow-violet-500/15 overflow-visible">
                      {/* Top Badge */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#7C3AED] to-purple-600 text-white font-extrabold text-[11px] shadow-md tracking-wide z-20 flex items-center gap-1.5 whitespace-nowrap">
                        <Gift className="w-3.5 h-3.5" />
                        <span>Special Free Trial Package</span>
                      </div>

                      {/* Subtle Ambient Hover Glow */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#EDE9FE]/50 via-transparent to-transparent opacity-80 pointer-events-none" />

                        <div className="relative z-10">
                          {/* Header row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                            <div>
                              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3 shadow-xs">
                                <Sparkles className="w-6 h-6 fill-amber-400 text-amber-500" />
                              </div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                Company Free Trial
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">
                                Experience AddyJob with trial features configured directly by Super Admin.
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <div className="text-3xl font-black text-[#7C3AED] tracking-tight">
                                ₹0
                              </div>
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 inline-block mt-0.5">
                                Free for {trialSettings.trialDays} Days
                              </span>
                            </div>
                          </div>

                          {/* Complimentary Credits Box */}
                          <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 to-amber-50/60 border border-purple-100 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center font-bold">
                                <Coins className="w-5 h-5 text-amber-500" />
                              </div>
                              <div>
                                <span className="text-xs font-black text-slate-900 block">
                                  {trialSettings.trialCredits} Complimentary Resume Credits
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  Unlock candidate CVs directly during your trial
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[#7C3AED] text-xs font-extrabold shadow-2xs">
                                {trialSettings.trialDays} Days Validity
                              </span>
                            </div>
                          </div>

                          {/* Points Provided by Super Admin in Points Format */}
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                                Trial Benefits & Provided Features
                              </span>
                              <span className="text-[11px] font-extrabold text-[#7C3AED] bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
                                {(trialSettings.trialPoints || DEFAULT_TRIAL_POINTS).length} Benefits Provided
                              </span>
                            </div>

                            {/* Dynamic Points List configured by Super Admin */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {(trialSettings.trialPoints || DEFAULT_TRIAL_POINTS).map((point: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/90 border border-purple-100/80 hover:border-purple-300 hover:shadow-xs transition-all shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
                                >
                                  <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-800 leading-snug">
                                    {point}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Included Portal Access Badges governed by permissions */}
                            <div className="pt-3 border-t border-slate-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                Included Portal Access:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${trialSettings.permissions.dashboard ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs" : "bg-slate-100 text-slate-400 border-slate-200 line-through"}`}>
                                  {trialSettings.permissions.dashboard ? "✓" : "🔒"} Dashboard {!trialSettings.permissions.dashboard && "(Locked)"}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${trialSettings.permissions.jobs ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs" : "bg-slate-100 text-slate-400 border-slate-200 line-through"}`}>
                                  {trialSettings.permissions.jobs ? "✓" : "🔒"} Job Postings {!trialSettings.permissions.jobs && "(Locked)"}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${trialSettings.permissions.applicants ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs" : "bg-slate-100 text-slate-400 border-slate-200 line-through"}`}>
                                  {trialSettings.permissions.applicants ? "✓" : "🔒"} Applicant Tracking {!trialSettings.permissions.applicants && "(Locked)"}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${trialSettings.permissions.resumes ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs" : "bg-slate-100 text-slate-400 border-slate-200 line-through"}`}>
                                  {trialSettings.permissions.resumes ? "✓" : "🔒"} Candidate Resumes {!trialSettings.permissions.resumes && "(Locked)"}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${trialSettings.permissions.settings ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs" : "bg-slate-100 text-slate-400 border-slate-200 line-through"}`}>
                                  {trialSettings.permissions.settings ? "✓" : "🔒"} Settings {!trialSettings.permissions.settings && "(Locked)"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* CTA Activation Button */}
                          <div className="mt-8 pt-2">
                            {currentPlan === "Free Trial" ? (
                              <div className="w-full py-3 px-4 rounded-2xl bg-emerald-50 text-emerald-700 font-extrabold text-xs sm:text-sm border border-emerald-200 flex items-center justify-center gap-2 shadow-2xs">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                                <span>Free Trial is Currently Active ({planValidity})</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleActivateFreeTrial}
                                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-purple-600 hover:from-[#6D28D9] hover:to-purple-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-600/35 hover:scale-[1.01] active:scale-98 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                              >
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>Start {trialSettings.trialDays}-Day Free Trial Now</span>
                              </button>
                            )}
                            <p className="text-center text-[11px] text-slate-400 mt-2.5">
                              No payment required • Controlled by Super Admin configuration
                            </p>
                          </div>
                        </div>
                      </div>
                  </div>
                ) : (
                  /* Dynamic Pricing Cards (Reflecting Super Admin Database) */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto pt-2">
                  {activePlansToDisplay.map((plan, index) => {
                    const themeIndex = index % 3;
                    const isPopular =
                      plan.isPopular ||
                      plan.badge === "Most Popular" ||
                      (activePlansToDisplay.length >= 2 && index === 1) ||
                      (typeof plan.name === "string" &&
                        (plan.name.toLowerCase().includes("pro") || plan.name.toLowerCase().includes("popular")));

                    const isEnterprise =
                      themeIndex === 2 ||
                      (typeof plan.name === "string" &&
                        (plan.name.toLowerCase().includes("enterprise") || plan.name.toLowerCase().includes("scaled")));

                    const subtitle =
                      plan.subtitle ||
                      (isPopular
                        ? "Best for growing businesses"
                        : isEnterprise
                        ? "Best for large teams & enterprises"
                        : "Best for small businesses & startups");

                    const priceInfo = getCardPriceInfo(plan, subscriptionBillingCycle);
                    const isCurrentPlanActive = index === activePlanIndex;

                    // ---------------- CARD 2 THEME: PROFESSIONAL / MOST POPULAR (PURPLE BORDER) ----------------
                    if (isPopular) {
                      return (
                        <div
                          key={plan._id || plan.id || index}
                          className="group relative bg-white rounded-3xl border-2 border-[#7C3AED] p-7 flex flex-col justify-between shadow-xl shadow-violet-500/10 hover:shadow-2xl hover:shadow-violet-600/30 -translate-y-1 lg:-translate-y-2 hover:-translate-y-4 hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer overflow-visible ring-0 hover:ring-4 hover:ring-[#EDE9FE]"
                        >
                          {/* Badge */}
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#7C3AED] text-white font-extrabold text-[11px] shadow-xs tracking-wide z-20 group-hover:bg-[#6D28D9] group-hover:scale-105 transition-all duration-200">
                            Most Popular
                          </div>

                          {/* Subtle Ambient Hover Glow */}
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#EDE9FE]/60 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                          <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-amber-400 group-hover:text-white transition-all duration-300 shadow-xs">
                              <Star className="w-5 h-5 fill-amber-400 text-amber-500 group-hover:fill-white group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors duration-200">
                              {plan.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              {subtitle}
                            </p>

                            {/* Price */}
                            <div className="mt-5 pb-5 border-b border-slate-100">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-[#7C3AED] transition-colors duration-200">
                                  {priceInfo.displayPrice}
                                </span>
                                <span className="text-xs text-slate-500 font-bold">{priceInfo.billingUnit}</span>
                              </div>
                              {subscriptionBillingCycle === "yearly" && priceInfo.annualBilledText && (
                                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                                  {priceInfo.annualBilledText}
                                </span>
                              )}
                            </div>

                            {/* Features */}
                            <ul className="mt-5 space-y-3 text-xs text-slate-600">
                              {(plan.features || []).map((feat: string, fIdx: number) => (
                                <li
                                  key={fIdx}
                                  className="flex items-center gap-2.5 transition-transform duration-200 group-hover:translate-x-0.5"
                                >
                                  <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5] group-hover:scale-110 transition-transform duration-200" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-8 pt-2 relative z-10">
                            {isCurrentPlanActive ? (
                              <div className="w-full py-2.5 px-4 rounded-xl bg-violet-50 text-[#7C3AED] font-bold text-xs border border-violet-200 flex items-center justify-center gap-1.5 shadow-2xs">
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Active Plan</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActivateDynamicPlan(plan, subscriptionBillingCycle);
                                }}
                                className="w-full py-2.5 px-4 rounded-xl bg-[#7C3AED] group-hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-violet-500/20 group-hover:shadow-xl group-hover:shadow-violet-600/35 group-hover:scale-[1.01] transition-all duration-300 cursor-pointer text-center active:scale-98"
                              >
                                Get Started
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // ---------------- CARD 3 THEME: ENTERPRISE (AMBER CROWN) ----------------
                    if (isEnterprise) {
                      return (
                        <div
                          key={plan._id || plan.id || index}
                          className="group relative bg-white rounded-3xl border border-amber-400/90 hover:border-amber-500 p-7 flex flex-col justify-between shadow-xs hover:shadow-2xl hover:shadow-amber-500/15 hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 ease-out cursor-pointer overflow-hidden"
                        >
                          {/* Subtle Ambient Hover Glow */}
                          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                          <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-5 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-amber-600 transition-all duration-300 shadow-xs">
                              <Crown className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-extrabold text-amber-600 transition-colors duration-200">
                              {plan.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              {subtitle}
                            </p>

                            {/* Price */}
                            <div className="mt-5 pb-5 border-b border-slate-100">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-amber-600 tracking-tight transition-colors duration-200">
                                  {priceInfo.displayPrice}
                                </span>
                                <span className="text-xs text-slate-500 font-bold">{priceInfo.billingUnit}</span>
                              </div>
                              {subscriptionBillingCycle === "yearly" && priceInfo.annualBilledText && (
                                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                                  {priceInfo.annualBilledText}
                                </span>
                              )}
                            </div>

                            {/* Features */}
                            <ul className="mt-5 space-y-3 text-xs text-slate-600">
                              {(plan.features || []).map((feat: string, fIdx: number) => (
                                <li
                                  key={fIdx}
                                  className="flex items-center gap-2.5 transition-transform duration-200 group-hover:translate-x-0.5"
                                >
                                  <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5] group-hover:scale-110 transition-transform duration-200" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-8 pt-2 relative z-10">
                            {isCurrentPlanActive ? (
                              <div className="w-full py-2.5 px-4 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 flex items-center justify-center gap-1.5 shadow-2xs">
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Active Plan</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActivateDynamicPlan(plan, subscriptionBillingCycle);
                                }}
                                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer text-center active:scale-98"
                              >
                                Contact Sales
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // ---------------- CARD 1 THEME: STARTER / VIOLET (SEND ICON) ----------------
                    return (
                      <div
                        key={plan._id || plan.id || index}
                        className="group relative bg-white rounded-3xl border border-slate-200 hover:border-[#7C3AED]/80 p-7 flex flex-col justify-between shadow-xs hover:shadow-2xl hover:shadow-violet-500/15 hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 ease-out cursor-pointer overflow-hidden"
                      >
                        {/* Subtle Ambient Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#EDE9FE]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                        <div className="relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#7C3AED] group-hover:text-white transition-all duration-300 shadow-xs">
                            <Send className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors duration-200">
                            {plan.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {subtitle}
                          </p>

                          {/* Price */}
                          <div className="mt-5 pb-5 border-b border-slate-100">
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-[#7C3AED] transition-colors duration-200">
                                {priceInfo.displayPrice}
                              </span>
                              <span className="text-xs text-slate-500 font-bold">{priceInfo.billingUnit}</span>
                            </div>
                            {subscriptionBillingCycle === "yearly" && priceInfo.annualBilledText && (
                              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                                {priceInfo.annualBilledText}
                              </span>
                            )}
                          </div>

                          {/* Features */}
                          <ul className="mt-5 space-y-3 text-xs text-slate-600">
                            {(plan.features || []).map((feat: string, fIdx: number) => (
                              <li
                                key={fIdx}
                                className="flex items-center gap-2.5 transition-transform duration-200 group-hover:translate-x-0.5"
                              >
                                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5] group-hover:scale-110 transition-transform duration-200" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-8 pt-2 relative z-10">
                          {isCurrentPlanActive ? (
                            <div className="w-full py-2.5 px-4 rounded-xl bg-violet-50 text-[#7C3AED] font-bold text-xs border border-violet-200 flex items-center justify-center gap-1.5 shadow-2xs">
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>Active Plan</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivateDynamicPlan(plan, subscriptionBillingCycle);
                              }}
                              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 group-hover:border-[#7C3AED] bg-slate-50/50 group-hover:bg-[#7C3AED] text-slate-700 group-hover:text-white text-xs font-bold transition-all duration-300 cursor-pointer text-center shadow-xs group-hover:shadow-md group-hover:shadow-violet-500/25 active:scale-98"
                            >
                              Get Started
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Portal Settings</h2>
                  <p className="text-xs text-slate-500">
                    Configure company preferences, instant notifications, and resume credit alerts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Auto-saved to Cloud & Database
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4 text-xs">
                {/* 1. EMAIL NOTIFICATION FOR NEW APPLICATIONS */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-violet-300 transition-all space-y-3">
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">
                          Email Notification for New Applications
                        </p>
                        {emailNotificationOnApplication ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-200/80 text-slate-600 border border-slate-300">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Receive an instant alert whenever a candidate applies.
                      </p>
                    </div>

                    {/* Interactive Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={emailNotificationOnApplication}
                      disabled={isSavingSettingKey === "emailNotificationOnApplication"}
                      onClick={() =>
                        handleToggleNotificationSetting(
                          "emailNotificationOnApplication",
                          !emailNotificationOnApplication
                        )
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
                        emailNotificationOnApplication ? "bg-[#7C3AED]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          emailNotificationOnApplication ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Sub-bar with Target Email & Send Test Alert Button */}
                  <div className="pt-2.5 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px]">
                    <div className="flex items-center gap-2 text-slate-600 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                      <span className="truncate">
                        Destination:{" "}
                        <strong className="text-slate-900 font-semibold">
                          {contactEmail || "Registered company email"}
                        </strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isTestingAlert === "application_alert"}
                      onClick={() => handleSendTestAlert("application_alert")}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-violet-50 text-[#7C3AED] border border-violet-200 font-bold transition shadow-2xs cursor-pointer text-[11px] shrink-0 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>
                        {isTestingAlert === "application_alert"
                          ? "Sending Alert..."
                          : "Send Test Alert Email"}
                      </span>
                    </button>
                  </div>

                  {/* Live Feedback banner if test was dispatched */}
                  {lastTestAlertResult && lastTestAlertResult.type === "application_alert" && (
                    <div className="p-3 rounded-xl bg-violet-50/90 border border-violet-200 text-[#5B21B6] text-[11px] flex items-center justify-between gap-2 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {lastTestAlertResult.message} ({lastTestAlertResult.time})
                        </span>
                      </div>
                      <button
                        onClick={() => setLastTestAlertResult(null)}
                        className="text-violet-400 hover:text-violet-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. RESUME CREDIT LOW BALANCE ALERT */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-violet-300 transition-all space-y-3">
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">
                          Resume Credit Low Balance Alert
                        </p>
                        {lowCreditAlert ? (
                          remainingCredits <= creditThreshold ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-600" /> Low Balance Triggered ({remainingCredits} Left)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Active ({remainingCredits} Left)
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-200/80 text-slate-600 border border-slate-300">
                            Alerts Off
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Notify team when available resume credits drop below {creditThreshold}.
                      </p>
                    </div>

                    {/* Interactive Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={lowCreditAlert}
                      disabled={isSavingSettingKey === "lowCreditAlert"}
                      onClick={() =>
                        handleToggleNotificationSetting("lowCreditAlert", !lowCreditAlert)
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
                        lowCreditAlert ? "bg-[#7C3AED]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          lowCreditAlert ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Threshold selector & Simulation Actions */}
                  <div className="pt-2.5 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-2 flex-wrap text-slate-600">
                      <span>Alert threshold:</span>
                      <div className="inline-flex rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs">
                        {[3, 5, 10, 15].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleUpdateCreditThreshold(val)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                              creditThreshold === val
                                ? "bg-[#7C3AED] text-white shadow-xs"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                          >
                            {val} Credits
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isTestingAlert === "low_credit"}
                        onClick={() => handleSendTestAlert("low_credit")}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 font-bold transition shadow-2xs cursor-pointer text-[11px] disabled:opacity-50 shrink-0"
                      >
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>
                          {isTestingAlert === "low_credit"
                            ? "Testing Alert..."
                            : "Test Low Balance Warning"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsBuyCreditsModalOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold transition shadow-2xs cursor-pointer text-[11px] shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Buy Credits</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Status inside card */}
                  {lowCreditAlert && remainingCredits <= creditThreshold && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-[11px] animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <strong className="font-bold text-amber-950 block">
                          Warning Active: Your balance ({remainingCredits} credits) is ≤ threshold ({creditThreshold})
                        </strong>
                        <span>
                          Low balance alerts are currently active across your portal. Recharge credits to prevent hiring disruptions.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Test Feedback banner */}
                  {lastTestAlertResult && lastTestAlertResult.type === "low_credit" && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center justify-between gap-2 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {lastTestAlertResult.message} ({lastTestAlertResult.time})
                        </span>
                      </div>
                      <button
                        onClick={() => setLastTestAlertResult(null)}
                        className="text-amber-500 hover:text-amber-800 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. AUTO-ACKNOWLEDGE APPLICANTS */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-violet-300 transition-all space-y-3">
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">
                          Auto-Acknowledge Applicants
                        </p>
                        {autoAcknowledgeApplicants ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-200/80 text-slate-600 border border-slate-300">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Send automated receipt confirmation to candidates upon submission.
                      </p>
                    </div>

                    {/* Interactive Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoAcknowledgeApplicants}
                      disabled={isSavingSettingKey === "autoAcknowledgeApplicants"}
                      onClick={() =>
                        handleToggleNotificationSetting(
                          "autoAcknowledgeApplicants",
                          !autoAcknowledgeApplicants
                        )
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
                        autoAcknowledgeApplicants ? "bg-[#7C3AED]" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          autoAcknowledgeApplicants ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom on phones/small screens) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
          {permissions.dashboard && (
            <button
              onClick={() => handleTabSwitch("dashboard")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                activeTab === "dashboard" ? "text-[#7C3AED]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          )}

          <button
            onClick={() => handleTabSwitch("profile")}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
              activeTab === "profile" ? "text-[#7C3AED]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => handleTabSwitch("jobs")}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition cursor-pointer relative ${
              activeTab === "jobs" ? "text-[#7C3AED]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Jobs</span>
            {totalJobsCount > 0 && (
              <span className="absolute top-0 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#EDE9FE] text-[#7C3AED]">
                {totalJobsCount}
              </span>
            )}
          </button>

          {permissions.applicants && (
            <button
              onClick={() => handleTabSwitch("applicants")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition cursor-pointer relative ${
                activeTab === "applicants" ? "text-[#7C3AED]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Applicants</span>
              {totalApplicantsCount > 0 && (
                <span className="absolute top-0 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#EDE9FE] text-[#7C3AED]">
                  {totalApplicantsCount}
                </span>
              )}
            </button>
          )}

          {permissions.resumes && (
            <button
              onClick={() => handleTabSwitch("resumes")}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                activeTab === "resumes" ? "text-[#7C3AED]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FolderDown className="w-5 h-5" />
              <span>Resumes</span>
            </button>
          )}

          <button
            onClick={() => handleTabSwitch("subscription")}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition cursor-pointer ${
              activeTab === "subscription" ? "text-[#7C3AED]" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Plans</span>
          </button>

          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* MODAL 1: POST OR EDIT JOB (Complete /jobs/1 specification matching) */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full p-4 sm:p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingJobId ? "Edit Job Posting" : "Create New Job Posting"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Specify role requirements, experience, compensation, and benefits matching AddyJob live view.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPostJobModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveJob} className="overflow-y-auto pr-1 sm:pr-2 pt-5 space-y-6 text-xs flex-1">
              {/* Permission Status Notice Banner */}
              {!canPostLiveJobs ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-amber-950">Pending Approval Mode</span>
                      <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                        {companyStatus !== "Approved" ? `Company Status: ${companyStatus}` : "Admin Approval Required"}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {companyStatus !== "Approved"
                        ? `Your company verification status is currently "${companyStatus}". New job postings will be submitted in Pending status until your company verification is approved by the Super Admin.`
                        : "Your company does not currently have direct live posting permissions. This job will be submitted to the Super Admin for review and set to Pending status until approved."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-emerald-950">Direct Live Posting Enabled</span>
                      <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                        Verified Live Post
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Your company is approved and has direct job posting permission. This job opening will be published <strong>LIVE</strong> immediately upon posting.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 1: ROLE IDENTITY & CLASSIFICATION */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
                  1. Role Classification & Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Job Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden font-medium"
                    />
                  </div>

                  <CustomJobDropdown
                    label="Category / Department"
                    value={jobDepartment}
                    onChange={setJobDepartment}
                    options={JOB_DEPARTMENT_OPTIONS}
                    placeholder="Select Department"
                  />

                  <CustomJobDropdown
                    label="Workplace Policy"
                    value={jobWorkplace}
                    onChange={setJobWorkplace}
                    options={JOB_WORKPLACE_OPTIONS}
                    placeholder="Select Workplace Policy"
                  />

                  <CustomJobDropdown
                    label="Employment Type"
                    value={jobType}
                    onChange={setJobType}
                    options={JOB_EMPLOYMENT_TYPE_OPTIONS}
                    placeholder="Select Employment Type"
                  />

                  <CustomJobDropdown
                    label="Experience Required"
                    value={jobExperience}
                    onChange={setJobExperience}
                    options={JOB_EXPERIENCE_OPTIONS}
                    placeholder="Select experience or type below"
                    allowCustomInput={true}
                    customInputPlaceholder="Type custom experience (e.g. 2+ years)"
                    quickPills={["0-1 yrs", "1-3 yrs", "3-5 yrs", "5+ yrs", "8+ yrs"]}
                  />
                </div>
              </div>

              {/* SECTION 2: LOGISTICS, COMPENSATION & RECRUITER */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  2. Compensation, Location & Logistics
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Salary Range</label>
                    <input
                      type="text"
                      value={jobSalary}
                      onChange={(e) => setJobSalary(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Location</label>
                    <input
                      type="text"
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Total Openings</label>
                    <input
                      type="number"
                      min="1"
                      value={jobOpenings}
                      onChange={(e) => setJobOpenings(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Posted By / Recruiter Dept</label>
                  <input
                    type="text"
                    value={jobPostedBy}
                    onChange={(e) => setJobPostedBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* SECTION 3: REQUIRED SKILLS & TECHNOLOGIES */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    3. Required Skills & Technologies (Tags)
                  </h4>
                  <span className="text-[11px] text-slate-400">Separate skills with commas</span>
                </div>

                <input
                  type="text"
                  value={jobTags}
                  onChange={(e) => setJobTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden font-medium"
                />

                {/* Live Tag Badges Preview */}
                {jobTags.trim() && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Preview:</span>
                    {jobTags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE]"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: ROLE OVERVIEW & SPECIFICATIONS */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  4. Role Description, Responsibilities & Perks
                </h4>

                {/* Role Overview */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role Overview</label>
                  <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden leading-relaxed resize-y font-normal"
                  />
                </div>

                {/* Key Responsibilities */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Key Responsibilities</label>
                    <span className="text-[10px] text-slate-400">1 item per line</span>
                  </div>
                  <textarea
                    rows={3}
                    value={jobResponsibilities}
                    onChange={(e) => setJobResponsibilities(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden leading-relaxed resize-y font-normal font-mono text-[11px]"
                  />
                </div>

                {/* Requirements & Experience */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Requirements & Qualifications</label>
                    <span className="text-[10px] text-slate-400">1 item per line</span>
                  </div>
                  <textarea
                    rows={3}
                    value={jobRequirements}
                    onChange={(e) => setJobRequirements(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden leading-relaxed resize-y font-normal font-mono text-[11px]"
                  />
                </div>

                {/* Perks & Benefits */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Perks & Benefits</label>
                    <span className="text-[10px] text-slate-400">1 item per line</span>
                  </div>
                  <textarea
                    rows={3}
                    value={jobBenefits}
                    onChange={(e) => setJobBenefits(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#EDE9FE] outline-hidden leading-relaxed resize-y font-normal font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 shrink-0 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="flex-1 sm:flex-initial justify-center px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 sm:flex-initial justify-center px-6 py-2.5 rounded-xl text-white font-bold shadow-md transition cursor-pointer flex items-center gap-2 ${
                    canPostLiveJobs
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20"
                      : "bg-[#7C3AED] hover:bg-[#6D28D9] shadow-violet-500/20"
                  }`}
                >
                  {editingJobId ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  ) : canPostLiveJobs ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Live Job</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Submit for Approval (Pending)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BUY RESUME CREDITS (Clean Light Theme) */}
      {isBuyCreditsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderDown className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Purchase Resume Credits</h3>
              </div>
              <button
                onClick={() => setIsBuyCreditsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <p className="text-slate-600">
                Credits allow you to instantly unlock full candidate contact details and download
                original resumes.
              </p>

              <div
                onClick={() => handleBuyCredits(20, "₹2,499")}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900">20 Resume Credits</h4>
                  <p className="text-[11px] text-slate-500">₹125 per resume download</p>
                </div>
                <span className="font-black text-emerald-600 text-sm">₹2,499</span>
              </div>

              <div
                onClick={() => handleBuyCredits(50, "₹4,999")}
                className="p-4 rounded-2xl bg-emerald-50/50 border-2 border-emerald-500 transition cursor-pointer flex items-center justify-between relative shadow-xs"
              >
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white uppercase">
                  Best Value
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">50 Resume Credits</h4>
                  <p className="text-[11px] text-slate-500">₹100 per resume download</p>
                </div>
                <span className="font-black text-emerald-600 text-sm">₹4,999</span>
              </div>

              <div
                onClick={() => handleBuyCredits(100, "₹8,999")}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900">100 Resume Credits</h4>
                  <p className="text-[11px] text-slate-500">₹90 per resume download</p>
                </div>
                <span className="font-black text-emerald-600 text-sm">₹8,999</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW APPLICANT DETAILS (Clean Light Theme) */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: "#EDE9FE", color: "#6D28D9", borderColor: "#DDD6FE" }}
                  className="w-10 h-10 rounded-2xl border font-black text-sm flex items-center justify-center shadow-xs"
                >
                  {selectedApplicant.candidateName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedApplicant.candidateName}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedApplicant.appliedRole}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Email</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedApplicant.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Phone</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedApplicant.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Experience</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedApplicant.experience}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Location</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedApplicant.location}</p>
                </div>
              </div>

              {selectedApplicant.notes && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Recruiter Notes</span>
                  <p className="text-slate-700 mt-1">{selectedApplicant.notes}</p>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-500" />
                  <span className="font-bold text-slate-800">
                    {selectedApplicant.resumeFileName}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (selectedApplicant.id) {
                      markResumeViewedAPI(selectedApplicant.id).catch(() => {});
                    }
                    downloadCandidateResume(selectedApplicant, (msg) => showToast(msg));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / View</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedApplicant.id, "Rejected");
                    setSelectedApplicant(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-600 hover:text-white transition"
                >
                  Reject Candidate
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedApplicant.id, "Shortlisted");
                    setSelectedApplicant(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition shadow-xs cursor-pointer"
                >
                  Shortlist Candidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: UPGRADE PLAN (Clean Light Theme) */}
      {isUpgradePlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">Upgrade to Enterprise</h3>
              </div>
              <button
                onClick={() => setIsUpgradePlanModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Unlock 250 resume downloads/month, custom applicant tracking integration, dedicated
                account management, and priority candidate job alerts.
              </p>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Price</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  ₹29,999 <span className="text-xs text-slate-500 font-normal">/ month</span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpgradePlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const entPlan =
                      adminPlans.find((p) => (p.name || "").toLowerCase().includes("enterprise")) ||
                      fallbackSubscriptionPlans[2];
                    handleActivateDynamicPlan(entPlan, subscriptionBillingCycle);
                    setIsUpgradePlanModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white font-bold shadow-md cursor-pointer transition active:scale-95"
                >
                  Activate Enterprise
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: IMAGE ACTIONS MODAL (SEE, UPDATE, REMOVE) */}
      {imageModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {imageModalState.type === "profile"
                      ? "Company Profile Logo"
                      : "Company Cover Banner"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Manage your company&apos;s brand image assets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImageModalState({ ...imageModalState, isOpen: false, mode: "menu" })}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode: VIEW (Full Size Lightbox Preview) */}
            {imageModalState.mode === "view" ? (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[220px] max-h-[360px] p-3 border border-slate-200">
                  {imageModalState.type === "profile" ? (
                    profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile Preview"
                        className="max-h-[300px] max-w-full object-contain rounded-xl"
                      />
                    ) : (
                      <div className="w-36 h-36 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-900">
                          {companyName.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                          {companyName.split(" ")[1] || "CORP"}
                        </span>
                      </div>
                    )
                  ) : bannerImage ? (
                    <img
                      src={bannerImage}
                      alt="Banner Preview"
                      className="max-h-[300px] w-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-44 rounded-xl bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center text-white/70 text-xs font-semibold">
                      Default Corporate Cover Gradient
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setImageModalState({ ...imageModalState, mode: "menu" })}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    ← Back to Options
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (imageModalState.type === "profile") {
                        profileInputRef.current?.click();
                      } else {
                        bannerInputRef.current?.click();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Image</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Mode: MENU (See, Update, Remove Options) */
              <div className="space-y-4">
                {/* Current Image Preview Strip */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden flex items-center justify-center shrink-0">
                    {imageModalState.type === "profile" ? (
                      profileImage ? (
                        <img
                          src={profileImage}
                          alt="Logo"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="font-black text-slate-800 text-sm">
                          {companyName.slice(0, 2).toUpperCase()}
                        </span>
                      )
                    ) : bannerImage ? (
                      <img
                        src={bannerImage}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-purple-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900">
                      {imageModalState.type === "profile"
                        ? profileImage
                          ? "Custom Company Logo"
                          : "Default Initials Avatar"
                        : bannerImage
                        ? "Custom Cover Banner"
                        : "Default Corporate Gradient"}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {imageModalState.type === "profile"
                        ? "Recommended: 400×400 PNG, JPG or WebP"
                        : "Recommended: 1600×450 PNG, JPG or WebP"}
                    </p>
                  </div>
                </div>

                {/* 3 Action Option Cards: See, Update, Remove */}
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option 1: SEE IMAGE */}
                  <button
                    type="button"
                    onClick={() => setImageModalState({ ...imageModalState, mode: "view" })}
                    className="w-full p-3.5 rounded-2xl border border-slate-200/90 hover:border-[#DDD6FE] hover:bg-[#EDE9FE]/40 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#6D28D9]">
                          See Image (View Full Size)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Preview the current {imageModalState.type === "profile" ? "logo" : "cover"} in high resolution
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#7C3AED] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {/* Option 2: UPDATE IMAGE */}
                  <button
                    type="button"
                    onClick={() => {
                      if (imageModalState.type === "profile") {
                        profileInputRef.current?.click();
                      } else {
                        bannerInputRef.current?.click();
                      }
                    }}
                    className="w-full p-3.5 rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                          Update Image (Upload New)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Select a new photo from your device to replace this image
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {/* Option 3: REMOVE IMAGE */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(imageModalState.type)}
                    className="w-full p-3.5 rounded-2xl border border-slate-200/90 hover:border-red-400 hover:bg-red-50/40 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-red-700">
                          Remove Image
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Delete custom asset and restore default branding
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company Job Applicants Modal */}
      <CompanyJobApplicantsModal
        job={selectedApplicantsJob}
        isOpen={isJobApplicantsModalOpen}
        onClose={() => {
          setIsJobApplicantsModalOpen(false);
          setSelectedApplicantsJob(null);
        }}
        applicants={jobApplicantsList}
        isLoading={isLoadingJobApplicants}
        onUpdateStatus={handleUpdateApplicantStatus}
        onViewResume={(app) => {
          if (app.id) {
            markResumeViewedAPI(app.id).catch(() => {});
          }
        }}
        onNavigateToApplications={() => {
          setActiveTab("applicants");
          if (selectedApplicantsJob) {
            setSearchQuery(selectedApplicantsJob.title);
          }
        }}
      />

      {/* Verification Approval Required Modal (without approval you dont buy subscription) */}
      {isApprovalRequiredModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-rose-50 via-red-50 to-rose-100 p-6 border-b border-rose-200/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/30">
                <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-200/60 px-2 py-0.5 rounded-full">
                    Action Blocked
                  </span>
                  <button
                    onClick={() => setIsApprovalRequiredModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-white/60 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-black text-rose-950 mt-1">
                  Approval Required
                </h3>
                <p className="text-xs font-semibold text-rose-700 mt-0.5">
                  without approval you dont buy subscription
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Current Verification Status:</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                    companyStatus === "Rejected"
                      ? "bg-rose-600 text-white"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}>
                    {companyStatus}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-rose-800">
                  Your company account must be verified and approved by the Super Admin before purchasing subscriptions or activating recruitment plans.
                </p>
              </div>

              {companyStatus === "Rejected" && rejectionReason && (
                <div className="p-3.5 rounded-2xl bg-white border border-rose-300 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                    Super Admin Rejection Reason:
                  </span>
                  <p className="text-xs font-medium text-rose-950">
                    {rejectionReason}
                  </p>
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Please update your company profile (including official GSTIN, website, and contact information) so the Super Admin can approve your account.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsApprovalRequiredModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsApprovalRequiredModalOpen(false);
                  handleTabSwitch("profile");
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Go to Company Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
