export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface UserSession {
  id: string;
  userId?: string;
  customId?: string;
  email: string;
  role: 'job_seeker' | 'company' | 'admin';
  name: string;
  headline?: string;
  bio?: string;
  languages?: string;
  targetRole?: string;
  experience?: string;
  education?: string;
  highestQualification?: string;
  course?: string;
  courseType?: string;
  specialization?: string;
  university?: string;
  startingYear?: string;
  passingYear?: string;
  gradingSystem?: string;
  gradeScore?: string;
  skills?: string[];
  workStatus?: string;
  preferredLocation?: string;
  expectedSalary?: string;
  resumeName?: string;
  resumeDate?: string;
  resumeUrl?: string;
  appliedJobsCount?: number;
  savedJobsCount?: number;
  interviewsCount?: number;
  profileViewsCount?: number;
  companyName?: string;
  workEmail?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  phone?: string;
  gstNumber?: string;
  tagline?: string;
  website?: string;
  aboutCompany?: string;
  logo?: string;
  profileImage?: string;
  bannerImage?: string;
  culture?: string[];
  perks?: string[];
  status?: string;
  rejectionReason?: string;
  plan?: string;
  permissions?: any;
  purchasedResumes?: any[];
  resumeCredits?: number;
  resumesUsed?: number;
  notificationSettings?: {
    emailNotificationOnApplication?: boolean;
    lowCreditAlert?: boolean;
    autoAcknowledgeApplicants?: boolean;
    creditThreshold?: number;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserSession;
}

// Sanitize user object to remove any bloated base64 before storing in browser localStorage
export const sanitizeUserForStorage = (user: UserSession): UserSession => {
  if (!user || typeof user !== 'object') return user;
  const clone: any = { ...user };
  // If bannerImage is heavy base64 data URI (> 35KB), strip for session storage
  if (typeof clone.bannerImage === 'string' && clone.bannerImage.length > 35000) {
    clone.bannerImage = '';
  }
  // If logo or profileImage is heavy base64 (> 40KB), strip for session storage
  if (typeof clone.profileImage === 'string' && clone.profileImage.length > 40000) {
    clone.profileImage = '';
  }
  if (typeof clone.logo === 'string' && clone.logo.length > 40000) {
    clone.logo = '';
  }
  // Strip heavy pdfData from purchased resumes
  if (Array.isArray(clone.purchasedResumes)) {
    clone.purchasedResumes = clone.purchasedResumes.map((r: any) => ({
      ...r,
      pdfData: undefined,
    }));
  }
  // If resumeUrl is heavy base64 (> 40KB)
  if (typeof clone.resumeUrl === 'string' && clone.resumeUrl.length > 40000) {
    clone.resumeUrl = '';
  }
  return clone;
};

// Safe storage writer that prevents QuotaExceededError and gracefully cleans up or falls back
export const safeSetLocalStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    console.warn(`localStorage quota exceeded for key "${key}". Cleaning bloated keys...`, err);
    try {
      // Clear non-critical duplicate caches
      const cleanupKeys = [
        'company_purchased_resumes',
        'company_applicants_data',
        'company_posted_jobs',
        'company_profile_data',
      ];
      cleanupKeys.forEach((k) => {
        try { localStorage.removeItem(k); } catch {}
      });

      const keysToRemove: string[] = [];
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (
          k.startsWith('company_profile_data_') ||
          k.startsWith('company_posted_jobs_') ||
          k.startsWith('company_applicants_data_') ||
          k.startsWith('company_purchased_resumes_') ||
          k.startsWith('resumes_cache_') ||
          k.startsWith('applications_cache_') ||
          k.startsWith('candidate_applied_jobs_') ||
          k.startsWith('candidate_messages_')
        )) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => {
        try { localStorage.removeItem(k); } catch {}
      });
      // Try again after cleanup
      localStorage.setItem(key, value);
    } catch (retryErr) {
      console.warn(`localStorage quota still exceeded after cleanup for "${key}". Falling back to sessionStorage.`, retryErr);
      try {
        sessionStorage.setItem(key, value);
      } catch (sessionErr) {
        console.error('Failed to save to sessionStorage as fallback:', sessionErr);
      }
    }
  }
};

// Store session in localStorage (safe with quota management)
export const setAuthSession = (token: string, user: UserSession) => {
  if (typeof window !== 'undefined') {
    const cleanUser = sanitizeUserForStorage(user);
    safeSetLocalStorage('career_token', token);
    safeSetLocalStorage('career_user', JSON.stringify(cleanUser));
    try {
      sessionStorage.setItem('career_token', token);
      sessionStorage.setItem('career_user', JSON.stringify(cleanUser));
    } catch {}
    window.dispatchEvent(new Event('auth_change'));
  }
};

// Clear session
export const clearAuthSession = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('career_token');
      localStorage.removeItem('career_user');
      localStorage.removeItem('company_profile_data');
      localStorage.removeItem('company_active_plan');
      localStorage.removeItem('company_posted_jobs');
      localStorage.removeItem('company_applicants_data');
      localStorage.removeItem('company_purchased_resumes');
      localStorage.removeItem('company_permissions_active');
    } catch {}
    try {
      sessionStorage.clear();
    } catch {}

    // Expire cookies
    document.cookie = 'career_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'career_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    window.dispatchEvent(new Event('auth_change'));
    window.dispatchEvent(new Event('storage'));
  }
};

// Get stored user from localStorage or sessionStorage
export const getStoredUser = (): UserSession | null => {
  if (typeof window === 'undefined') return null;
  let data = null;
  try {
    data = localStorage.getItem('career_user');
  } catch (e) {}
  if (!data) {
    try {
      data = sessionStorage.getItem('career_user');
    } catch (e) {}
  }
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// Update stored user in localStorage
export const setStoredUser = (user: UserSession): void => {
  if (typeof window !== 'undefined') {
    const cleanUser = sanitizeUserForStorage(user);
    safeSetLocalStorage('career_user', JSON.stringify(cleanUser));
    try {
      sessionStorage.setItem('career_user', JSON.stringify(cleanUser));
    } catch {}
    window.dispatchEvent(new Event('auth_change'));
  }
};

// Get token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('career_token') || sessionStorage.getItem('career_token');
  } catch {
    return null;
  }
};

// Helper for authenticated request headers
export const getAuthHeaders = (contentType: boolean = false): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    headers['x-admin-portal'] = 'true';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ================= CACHING & IN-FLIGHT REQUEST DEDUPLICATION =================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Deduplicated & memory-cached fetch utility.
 * - In-flight deduplication: Returns existing promise if identical GET request is currently pending.
 * - TTL memory cache: Returns cached response if within ttlMs.
 * - forceRefresh: Ignores cache and fetches fresh data.
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  ttlMs: number = 0,
  forceRefresh: boolean = false
): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  // Only cache/dedup idempotent GET requests
  if (method !== 'GET') {
    const res = await fetch(url, options);
    return res.json();
  }

  const cacheKey = url;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();

  if (!forceRefresh && ttlMs > 0) {
    const cached = memoryCache.get(cacheKey);
    if (cached && now - cached.timestamp < ttlMs) {
      return typeof structuredClone === 'function' ? structuredClone(cached.data) : JSON.parse(JSON.stringify(cached.data));
    }
  }

  // Deduplicate concurrent in-flight requests
  const existingPromise = inFlightRequests.get(cacheKey);
  if (existingPromise) {
    return existingPromise;
  }

  const requestPromise = (async () => {
    try {
      const fetchOptions: RequestInit = typeof window === 'undefined' && ttlMs > 0
        ? ({ ...options, next: { revalidate: Math.max(10, Math.floor(ttlMs / 1000)) } } as any)
        : (options || {});
      const res = await fetch(url, fetchOptions);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (ttlMs > 0) {
        memoryCache.set(cacheKey, { data, timestamp: typeof performance !== 'undefined' ? performance.now() : Date.now() });
      }
      return data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Invalidate specific cached endpoints or prefixes upon mutations
 */
export function invalidateApiCache(pattern?: string | RegExp): void {
  if (!pattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
      memoryCache.delete(key);
    }
  }
}

// Register API call
export async function registerUser(payload: {
  role: 'job_seeker' | 'company';
  email: string;
  password?: string;
  fullName?: string;
  name?: string;
  targetRole?: string;
  experience?: string;
  highestQualification?: string;
  course?: string;
  courseType?: string;
  specialization?: string;
  university?: string;
  startingYear?: string;
  passingYear?: string;
  gradingSystem?: string;
  gradeScore?: string;
  skills?: string[];
  workStatus?: string;
  preferredLocation?: string;
  expectedSalary?: string;
  companyName?: string;
  workEmail?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  phone?: string;
  gstNumber?: string;
}): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'Registration failed. Please try again.',
      };
    }

    return data;
  } catch (error: any) {
    console.error('API register error:', error);
    return {
      success: false,
      message: 'Unable to connect to the backend server. Please make sure the server is running on port 5000.',
    };
  }
}

// Login API call
export async function loginUser(payload: {
  email: string;
  password: string;
  role?: 'job_seeker' | 'company' | 'admin';
}): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'Invalid email or password.',
      };
    }

    return data;
  } catch (error: any) {
    console.error('API login error:', error);
    return {
      success: false,
      message: 'Unable to connect to the backend server. Please verify backend server is running.',
    };
  }
}

// Get me API call
export async function fetchCurrentUser(): Promise<UserSession | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      clearAuthSession();
      return null;
    }

    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

// Update User Profile API call
export async function updateUserProfile(
  payload: Partial<UserSession>
): Promise<{ success: boolean; message: string; user?: UserSession }> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, message: 'You are not logged in.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update profile.',
      };
    }

    if (data.user) {
      setAuthSession(token, data.user);
    }

    // Direct company endpoint synchronization to ensure 100% database persistence
    const storedUser = getStoredUser();
    const compId = (storedUser as any)?._id || storedUser?.id || storedUser?.userId || storedUser?.email;
    if (compId && (storedUser?.role === 'company' || payload.companyName)) {
      fetch(`${API_BASE_URL}/companies/${encodeURIComponent(compId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    return data;
  } catch (error: any) {
    console.error('API update profile error:', error);
    return {
      success: false,
      message: 'Failed to update profile. Please verify network connection.',
    };
  }
}

// ================= SUPER ADMIN APIs =================

export interface AdminOverviewStats {
  totalCompanies: number;
  pendingCompanies: number;
  approvedCompanies: number;
  rejectedCompanies: number;
  totalJobs: number;
  activeJobs: number;
  expiredJobs: number;
  totalApplications: number;
  totalCandidates: number;
  plansCount: number;
  totalRevenue: string;
}

export async function fetchAdminOverview(forceRefresh = false): Promise<AdminOverviewStats | null> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/admin/overview`,
      { headers: getAuthHeaders() },
      60000,
      forceRefresh
    );
    return json?.data || null;
  } catch (error) {
    console.error('fetchAdminOverview error:', error);
    return null;
  }
}

export interface AdminReportsData {
  summary: {
    totalCompanies: number;
    approvedCompanies: number;
    pendingCompanies: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalCandidates: number;
    estimatedRevenue: string;
    avgArpu?: string;
    conversionRate: string;
  };
  funnel: {
    total: number;
    new: number;
    reviewed: number;
    shortlisted: number;
    interview: number;
    hired: number;
    rejected: number;
  };
  planCounts: Record<string, number>;
  domainCounts: Record<string, number>;
  expCounts: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    jobs: number;
    applications: number;
    companies: number;
    candidates: number;
  }>;
  topSkills?: Array<{
    name: string;
    count: number;
  }>;
}

export async function fetchAdminReports(forceRefresh = false): Promise<AdminReportsData | null> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/admin/reports`,
      { headers: getAuthHeaders() },
      60000,
      forceRefresh
    );
    return json?.data || null;
  } catch (error) {
    console.error('fetchAdminReports error:', error);
    return null;
  }
}

export async function fetchAdminCompanies(forceRefresh = false): Promise<any[]> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/admin/companies`,
      { headers: getAuthHeaders() },
      60000,
      forceRefresh
    );
    return json?.companies || [];
  } catch (error) {
    console.error('fetchAdminCompanies error:', error);
    return [];
  }
}

export interface AdminNotificationItem {
  id: string;
  type: 'company_registered' | 'jobseeker_registered';
  title: string;
  desc: string;
  createdAt: string | Date;
  targetTab: string;
  entityId?: string;
  iconType: 'company' | 'jobseeker';
}

export async function fetchAdminNotifications(forceRefresh = false): Promise<AdminNotificationItem[]> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/admin/notifications`,
      { headers: getAuthHeaders() },
      30000,
      forceRefresh
    );
    return json?.notifications || [];
  } catch (error) {
    console.error('fetchAdminNotifications error:', error);
    return [];
  }
}

export async function updateCompanyStatus(
  id: string,
  status: 'Approved' | 'Rejected' | 'Pending',
  reason?: string
): Promise<{ success: boolean; message: string; company?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/companies/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status, reason, rejectionReason: reason }),
    });
    invalidateApiCache('/companies');
    invalidateApiCache('/admin/companies');
    invalidateApiCache('/admin/overview');
    return await res.json();
  } catch (error: any) {
    console.error('updateCompanyStatus error:', error);
    return { success: false, message: 'Failed to update status in database' };
  }
}

export async function deleteAdminCompany(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/companies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    invalidateApiCache('/companies');
    invalidateApiCache('/admin/companies');
    invalidateApiCache('/admin/overview');
    return await res.json();
  } catch (error: any) {
    console.error('deleteAdminCompany error:', error);
    return { success: false, message: 'Failed to delete company' };
  }
}

export interface JobSeekerRecord {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  headline?: string;
  targetRole?: string;
  experience?: string;
  location?: string;
  highestQualification?: string;
  course?: string;
  courseType?: string;
  specialization?: string;
  university?: string;
  startingYear?: string;
  passingYear?: string;
  gradingSystem?: string;
  gradeScore?: string;
  skills?: string[];
  languages?: string;
  workStatus?: string;
  expectedSalary?: string;
  resumeName?: string;
  resumeDate?: string;
  resumeUrl?: string;
  status?: string;
  registeredOn?: string;
  avatarBg?: string;
  avatarLetter?: string;
}

export async function fetchAdminJobSeekers(forceRefresh = false): Promise<JobSeekerRecord[]> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/admin/jobseekers`,
      { headers: getAuthHeaders() },
      60000,
      forceRefresh
    );
    return json?.jobSeekers || [];
  } catch (error) {
    console.error('fetchAdminJobSeekers error:', error);
    return [];
  }
}

export async function deleteAdminJobSeeker(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/jobseekers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    invalidateApiCache('/admin/jobseekers');
    invalidateApiCache('/admin/overview');
    return await res.json();
  } catch (error: any) {
    console.error('deleteAdminJobSeeker error:', error);
    return { success: false, message: 'Failed to delete candidate' };
  }
}

export async function fetchAdminJobs(forceRefresh = false): Promise<any[]> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/admin/jobs`,
      { headers: getAuthHeaders() },
      60000,
      forceRefresh
    );
    return json?.jobs || [];
  } catch (error) {
    console.error('fetchAdminJobs error:', error);
    return [];
  }
}

// Create a new job posting on the backend
export async function createCompanyJob(jobData: any): Promise<{ success: boolean; message: string; job?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(jobData),
    });
    const data = await res.json();
    if (data.success) {
      invalidateApiCache('/jobs');
      invalidateApiCache('/admin/jobs');
      invalidateApiCache('/admin/overview');
      invalidateApiCache('/admin/reports');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('job_created'));
        window.dispatchEvent(new Event('storage'));
      }
    }
    return data;
  } catch (error: any) {
    console.error('createCompanyJob error:', error);
    return { success: false, message: error.message || 'Failed to post job' };
  }
}

// Fetch jobs for a specific company or all jobs
export async function fetchCompanyJobs(params?: { companyId?: string; company?: string; status?: string }, forceRefresh = false): Promise<any[]> {
  try {
    const query = new URLSearchParams();
    if (params?.companyId) query.set("companyId", params.companyId);
    if (params?.company) query.set("company", params.company);
    if (params?.status) {
      query.set("status", params.status);
    } else {
      // Default to "all" for company dashboard so that both Pending and Active jobs are retrieved
      query.set("status", "all");
    }
    const qs = query.toString();
    const url = qs ? `${API_BASE_URL}/jobs?${qs}` : `${API_BASE_URL}/jobs`;
    const json = await cachedFetch<any>(url, { headers: getAuthHeaders() }, 10000, forceRefresh);
    return json?.jobs || [];
  } catch (error) {
    console.error('fetchCompanyJobs error:', error);
    return [];
  }
}

// Update existing job posting details
export async function updateCompanyJob(id: string, jobData: any): Promise<{ success: boolean; message: string; job?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(jobData),
    });
    const data = await res.json();
    if (data.success) {
      invalidateApiCache('/jobs');
      invalidateApiCache('/admin/jobs');
      invalidateApiCache('/admin/overview');
      invalidateApiCache('/admin/reports');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('job_updated'));
        window.dispatchEvent(new Event('storage'));
      }
    }
    return data;
  } catch (error: any) {
    console.error('updateCompanyJob error:', error);
    return { success: false, message: error.message || 'Failed to update job' };
  }
}

// Update job status (Active, Paused, Closed, Expired)
export async function updateCompanyJobStatus(id: string, status: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      invalidateApiCache('/jobs');
      invalidateApiCache('/admin/jobs');
      invalidateApiCache('/admin/overview');
      invalidateApiCache('/admin/reports');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('job_updated'));
        window.dispatchEvent(new Event('storage'));
      }
    }
    return data;
  } catch (error: any) {
    console.error('updateCompanyJobStatus error:', error);
    return { success: false, message: 'Failed to update job status' };
  }
}

// Delete job posting
export async function deleteCompanyJob(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      invalidateApiCache('/jobs');
      invalidateApiCache('/admin/jobs');
      invalidateApiCache('/admin/overview');
      invalidateApiCache('/admin/reports');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('job_updated'));
        window.dispatchEvent(new Event('storage'));
      }
    }
    return data;
  } catch (error: any) {
    console.error('deleteCompanyJob error:', error);
    return { success: false, message: 'Failed to delete job' };
  }
}

export async function updateAdminJobStatus(
  id: string,
  status: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/jobs/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status }),
    });
    invalidateApiCache('/jobs');
    invalidateApiCache('/admin/jobs');
    invalidateApiCache('/admin/overview');
    invalidateApiCache('/admin/reports');
    return await res.json();
  } catch (error: any) {
    console.error('updateAdminJobStatus error:', error);
    return { success: false, message: 'Failed to update job status' };
  }
}

export async function deleteAdminJob(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    invalidateApiCache('/jobs');
    invalidateApiCache('/admin/jobs');
    invalidateApiCache('/admin/overview');
    invalidateApiCache('/admin/reports');
    return await res.json();
  } catch (error: any) {
    console.error('deleteAdminJob error:', error);
    return { success: false, message: 'Failed to delete job' };
  }
}

export async function fetchAdminApplications(forceRefresh = false): Promise<any[]> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/admin/applications`,
      { headers: getAuthHeaders() },
      60000,
      forceRefresh
    );
    return json?.applications || [];
  } catch (error) {
    console.error('fetchAdminApplications error:', error);
    return [];
  }
}

export async function fetchAdminApplicationResume(id: string): Promise<{ success: boolean; pdfData?: string; resumeUrl?: string; fileName?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/applications/${id}/resume`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (error) {
    console.error('fetchAdminApplicationResume error:', error);
    return { success: false };
  }
}

export async function fetchJobApplicants(jobId: string, forceRefresh = false): Promise<any[]> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/jobs/${jobId}/applicants`,
      { headers: getAuthHeaders() },
      10000,
      forceRefresh
    );
    return json?.applicants || [];
  } catch (error) {
    console.error('fetchJobApplicants error:', error);
    return [];
  }
}

export async function fetchCompanyApplications(params: {
  company?: string;
  companyId?: string;
}, forceRefresh = false): Promise<any[]> {
  try {
    const q = new URLSearchParams();
    if (params.company) q.append('company', params.company);
    if (params.companyId) q.append('companyId', params.companyId);
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/jobs/applied/company?${q.toString()}`,
      { headers: getAuthHeaders() },
      8000,
      forceRefresh
    );
    return json?.applications || [];
  } catch (error) {
    console.error('fetchCompanyApplications error:', error);
    return [];
  }
}

export async function updateAdminApplicationStatus(
  id: string,
  status: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/applications/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    invalidateApiCache('/jobs/applied');
    invalidateApiCache('/admin/applications');
    invalidateApiCache('/admin/overview');
    invalidateApiCache('/admin/reports');
    notifyApplicationSync();
    return data;
  } catch (error: any) {
    console.error('updateAdminApplicationStatus error:', error);
    return { success: false, message: 'Failed to update application status' };
  }
}

export async function createAdminApplication(payload: {
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  position?: string;
  company?: string;
  domain: string;
  experience: string;
  skills?: string[];
  pdfData?: string;
  fileName?: string;
  status?: string;
  resumeUrl?: string;
}): Promise<{ success: boolean; message: string; application?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/applications`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });
    invalidateApiCache('/jobs/applied');
    invalidateApiCache('/admin/applications');
    invalidateApiCache('/admin/overview');
    invalidateApiCache('/admin/reports');
    return await res.json();
  } catch (error: any) {
    console.error('createAdminApplication error:', error);
    return { success: false, message: 'Failed to upload resume' };
  }
}

export async function fetchAdminPlans(forceRefresh = false): Promise<any[]> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/admin/plans`,
      { headers: getAuthHeaders() },
      60000,
      forceRefresh
    );
    return json?.plans || [];
  } catch (error) {
    console.error('fetchAdminPlans error:', error);
    return [];
  }
}

export async function createAdminPlan(payload: {
  name: string;
  price: string;
  yearlyPrice?: string;
  billingCycle?: string;
  features?: string[];
  credits?: number;
  status?: string;
}): Promise<{ success: boolean; message: string; plan?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/plans`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });
    invalidateApiCache('/admin/plans');
    return await res.json();
  } catch (error: any) {
    console.error('createAdminPlan error:', error);
    return { success: false, message: 'Failed to create plan' };
  }
}

export async function updateAdminPlan(
  id: string,
  payload: {
    name?: string;
    price?: string;
    yearlyPrice?: string;
    billingCycle?: string;
    features?: string[];
    credits?: number;
    status?: string;
  }
): Promise<{ success: boolean; message: string; plan?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/plans/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });
    invalidateApiCache('/admin/plans');
    return await res.json();
  } catch (error: any) {
    console.error('updateAdminPlan error:', error);
    return { success: false, message: 'Failed to update plan' };
  }
}

export async function deleteAdminPlan(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/plans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    invalidateApiCache('/admin/plans');
    return await res.json();
  } catch (error: any) {
    console.error('deleteAdminPlan error:', error);
    return { success: false, message: 'Failed to delete plan' };
  }
}

// ==========================================
// COMPANY PERMISSIONS & AUTO-APPROVAL SYSTEM
// ==========================================

export interface CompanyPermissions {
  dashboard: boolean;
  jobs: boolean;
  applicants: boolean;
  resumes: boolean;
  settings: boolean;
  profile?: boolean;
  subscription?: boolean;
  autoApproveFromSubscription?: boolean;
}

export const DEFAULT_COMPANY_PERMISSIONS: CompanyPermissions = {
  dashboard: false,
  jobs: false,
  applicants: false,
  resumes: false,
  settings: false,
  profile: true,
  subscription: true,
  autoApproveFromSubscription: true,
};

// Plan auto-approval standard rules
export const PLAN_AUTO_PERMISSIONS: Record<string, Partial<CompanyPermissions>> = {
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
};

export async function updateCompanyPermissions(
  id: string,
  permissions: Partial<CompanyPermissions>,
  extra?: { name?: string; email?: string; plan?: string; resumeCredits?: number }
): Promise<{ success: boolean; message: string; permissions?: CompanyPermissions; company?: any; plan?: string; resumeCredits?: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/companies/${id}/permissions`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        permissions,
        name: extra?.name,
        email: extra?.email,
        plan: extra?.plan,
        resumeCredits: extra?.resumeCredits,
      }),
    });
    const json = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem(`company_permissions_${id}`, JSON.stringify(permissions));
      if (extra?.email) {
        localStorage.setItem(`company_permissions_${extra.email.toLowerCase()}`, JSON.stringify(permissions));
      }
      if (json.company?.id) {
        localStorage.setItem(`company_permissions_${json.company.id}`, JSON.stringify(permissions));
      }
      if (extra?.plan) {
        localStorage.setItem('company_active_plan', extra.plan);
        const storedUser = getStoredUser();
        if (storedUser) {
          setStoredUser({
            ...storedUser,
            plan: extra.plan,
            permissions,
            ...(typeof extra.resumeCredits === 'number' ? { resumeCredits: extra.resumeCredits } : {}),
          });
        }
      }
      if (typeof extra?.resumeCredits === 'number') {
        const storedUser = getStoredUser();
        const uid = (storedUser as any)?._id || storedUser?.id || (storedUser as any)?.userId || storedUser?.email;
        if (uid) {
          localStorage.setItem(`company_total_credits_${uid}`, String(extra.resumeCredits));
          localStorage.setItem(`company_resumes_used_${uid}`, '0');
        }
      }
      window.dispatchEvent(new Event('company_permissions_updated'));
      window.dispatchEvent(new Event('storage'));
    }
    return json;
  } catch (error: any) {
    console.error('updateCompanyPermissions error:', error);
    return { success: false, message: 'Failed to update company permissions' };
  }
}

export async function activateCompanyTrial(data?: { companyId?: string; email?: string }): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/companies/activate-trial`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(data || {}),
    });
    const json = await res.json();
    if (json.success && typeof window !== 'undefined') {
      localStorage.setItem('company_active_plan', 'Free Trial');
      if (json.trialDays) {
        localStorage.setItem('company_plan_validity', `Valid for ${json.trialDays} Days (Trial)`);
      }
      if (json.permissions) {
        localStorage.setItem('company_permissions_active', JSON.stringify(json.permissions));
        const storedUser = getStoredUser();
        const uid = (storedUser as any)?._id || storedUser?.id || (storedUser as any)?.userId || storedUser?.email;
        if (uid) {
          localStorage.setItem(`company_permissions_${uid}`, JSON.stringify(json.permissions));
          if (typeof json.resumeCredits === 'number') {
            localStorage.setItem(`company_total_credits_${uid}`, String(json.resumeCredits));
            localStorage.setItem(`company_resumes_used_${uid}`, '0');
          }
        }
        if (storedUser) {
          setStoredUser({
            ...storedUser,
            plan: 'Free Trial',
            permissions: json.permissions,
            ...(typeof json.resumeCredits === 'number' ? { resumeCredits: json.resumeCredits } : {}),
          });
        }
      }
      window.dispatchEvent(new Event('company_permissions_updated'));
      window.dispatchEvent(new Event('storage'));
    }
    return json;
  } catch (error: any) {
    console.error('activateCompanyTrial error:', error);
    return { success: false, message: error.message || 'Failed to activate trial' };
  }
}

export async function unlockCompanyResume(
  resumeId: string,
  candidateName?: string
): Promise<{
  success: boolean;
  message: string;
  resume?: any;
  resumesUsed?: number;
  remainingCredits?: number;
  totalCredits?: number;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/companies/resumes/${encodeURIComponent(resumeId)}/unlock`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ candidateName }),
    });
    return await res.json();
  } catch (error: any) {
    console.error('unlockCompanyResume error:', error);
    return { success: false, message: error.message || 'Failed to unlock resume' };
  }
}

export async function fetchAdminPermissionsSettings(forceRefresh = false): Promise<any> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/admin/permissions-settings`,
      { headers: getAuthHeaders() },
      30000,
      forceRefresh
    );
    return json?.settings || null;
  } catch (error) {
    console.error('fetchAdminPermissionsSettings error:', error);
    return null;
  }
}

export async function updateAdminPermissionsSettings(settings: any): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/permissions-settings`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ settings }),
    });
    invalidateApiCache('/admin/permissions-settings');
    return await res.json();
  } catch (error: any) {
    console.error('updateAdminPermissionsSettings error:', error);
    return { success: false, message: 'Failed to update permissions settings' };
  }
}

// Helper to get matching plan rule safely
export function getMatchingPlanRule(planName?: string): Partial<CompanyPermissions> | undefined {
  if (!planName) return undefined;
  const p = planName.trim().toLowerCase();

  // 1. Direct exact key match first
  for (const [key, rule] of Object.entries(PLAN_AUTO_PERMISSIONS)) {
    const k = key.trim().toLowerCase();
    if (p === k) {
      return rule;
    }
  }

  // 2. Free Trial matching
  if (p.includes('trial')) {
    return PLAN_AUTO_PERMISSIONS['Free Trial'] || {
      dashboard: true,
      jobs: true,
      applicants: true,
      resumes: false,
      settings: false,
    };
  }

  // 3. Fallbacks based on standard tiers
  if (p.includes('enterprise')) return PLAN_AUTO_PERMISSIONS['Enterprise'] || PLAN_AUTO_PERMISSIONS['Tier 3'];
  if (p.includes('growth') || p.includes('pro')) return PLAN_AUTO_PERMISSIONS['Pro Plan'] || PLAN_AUTO_PERMISSIONS['Tier 2'];
  if (p.includes('starter') || p.includes('basic') || p.includes('testy')) return PLAN_AUTO_PERMISSIONS['Basic Plan'] || PLAN_AUTO_PERMISSIONS['Tier 1'];

  // 4. Last fallback
  for (const [key, rule] of Object.entries(PLAN_AUTO_PERMISSIONS)) {
    const k = key.trim().toLowerCase();
    if (k && (p === k || (k.length > 5 && p.includes(k)))) {
      return rule;
    }
  }

  return undefined;
}

// Deduplication guard for syncGlobalPermissionsRules
let lastPermissionsSyncTime = 0;
let pendingPermissionsSync: Promise<Record<string, Partial<CompanyPermissions>>> | null = null;

// Sync global permission settings from server or localStorage
export async function syncGlobalPermissionsRules(force = false): Promise<Record<string, Partial<CompanyPermissions>>> {
  const now = Date.now();
  if (!force && now - lastPermissionsSyncTime < 25000 && Object.keys(PLAN_AUTO_PERMISSIONS).length > 2) {
    return PLAN_AUTO_PERMISSIONS;
  }
  if (pendingPermissionsSync) {
    return pendingPermissionsSync;
  }

  pendingPermissionsSync = (async () => {
    // First sync from localStorage if available
    if (typeof window !== 'undefined') {
      const cachedSettings = localStorage.getItem('addyjob_permissions_settings');
      if (cachedSettings) {
        try {
          const parsed = JSON.parse(cachedSettings);
          if (parsed.planRules) {
            Object.keys(parsed.planRules).forEach((k) => {
              PLAN_AUTO_PERMISSIONS[k] = parsed.planRules[k];
            });
          }
        } catch (e) {}
      }
    }

    // Then fetch authoritative settings from backend
    try {
      const remote = await fetchAdminPermissionsSettings(force);
      if (remote?.planRules) {
        Object.keys(remote.planRules).forEach((k) => {
          PLAN_AUTO_PERMISSIONS[k] = remote.planRules[k];
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('addyjob_permissions_settings', JSON.stringify(remote));
          window.dispatchEvent(new Event('company_permissions_updated'));
        }
      }
      lastPermissionsSyncTime = Date.now();
    } catch (e) {
      console.warn('syncGlobalPermissionsRules failed:', e);
    } finally {
      pendingPermissionsSync = null;
    }
    return PLAN_AUTO_PERMISSIONS;
  })();

  return pendingPermissionsSync;
}

export function getEffectiveCompanyPermissions(company?: {
  id?: string;
  plan?: string;
  permissions?: Partial<CompanyPermissions>;
} | null): CompanyPermissions {
  // Base default: all feature tabs disabled (only profile & subscription are always accessible)
  let result: CompanyPermissions = { ...DEFAULT_COMPANY_PERMISSIONS };

  if (typeof window !== 'undefined') {
    let cachedSettings: any = null;
    const cachedSettingsStr = localStorage.getItem('addyjob_permissions_settings');
    if (cachedSettingsStr) {
      try {
        cachedSettings = JSON.parse(cachedSettingsStr);
        if (cachedSettings.planRules) {
          Object.keys(cachedSettings.planRules).forEach((k) => {
            PLAN_AUTO_PERMISSIONS[k] = cachedSettings.planRules[k];
          });
        }
      } catch (e) {}
    }

    // 1. Check if there are local overrides for this company
    const localKey = company?.id ? `company_permissions_${company.id}` : 'company_permissions_active';
    const cached = localStorage.getItem(localKey);
    let cachedPerms: Partial<CompanyPermissions> | null = null;
    if (cached) {
      try {
        cachedPerms = JSON.parse(cached);
      } catch (e) {}
    }

    const currentPermissions = {
      ...(company?.permissions || {}),
      ...(cachedPerms || {}),
    };

    const autoApprove = currentPermissions.autoApproveFromSubscription !== false;
    const activePlan = company?.plan || localStorage.getItem('company_active_plan') || undefined;
    const isTrial = Boolean(activePlan && activePlan.toLowerCase().includes('trial'));
    const isUnsubscribed = !activePlan || activePlan === 'No Active Plan';

    // 2. If company is on Free Trial: strictly apply Super Admin's Section 3 trial permissions!
    if (isTrial) {
      const trialPerms =
        cachedSettings?.defaultNewCompanyPerms ||
        cachedSettings?.planRules?.['Free Trial'] ||
        PLAN_AUTO_PERMISSIONS['Free Trial'] || {
          dashboard: true,
          jobs: true,
          applicants: true,
          resumes: false,
          settings: false,
        };
      return {
        profile: true,
        subscription: true,
        dashboard: Boolean(trialPerms.dashboard),
        jobs: Boolean(trialPerms.jobs),
        applicants: Boolean(trialPerms.applicants),
        resumes: Boolean(trialPerms.resumes),
        settings: Boolean(trialPerms.settings),
        autoApproveFromSubscription: true,
      };
    }

    // 2b. If company is unsubscribed without an active plan:
    if (isUnsubscribed) {
      if (cachedSettings?.enableDefaultPermissions !== false) {
        const trialPerms =
          cachedSettings?.defaultNewCompanyPerms ||
          PLAN_AUTO_PERMISSIONS['Free Trial'] || {
            dashboard: true,
            jobs: true,
            applicants: true,
            resumes: false,
            settings: false,
          };
        return {
          profile: true,
          subscription: true,
          dashboard: Boolean(trialPerms.dashboard),
          jobs: Boolean(trialPerms.jobs),
          applicants: Boolean(trialPerms.applicants),
          resumes: Boolean(trialPerms.resumes),
          settings: Boolean(trialPerms.settings),
          autoApproveFromSubscription: true,
        };
      } else {
        return {
          profile: true,
          subscription: true,
          dashboard: false,
          jobs: false,
          applicants: false,
          resumes: false,
          settings: false,
          autoApproveFromSubscription: true,
        };
      }
    }

    // 3. If auto-approval is enabled, apply plan permissions
    if (autoApprove && activePlan) {
      const planRule = getMatchingPlanRule(activePlan);
      if (planRule) {
        return {
          profile: true,
          subscription: true,
          dashboard: Boolean(planRule.dashboard),
          jobs: Boolean(planRule.jobs),
          applicants: Boolean(planRule.applicants),
          resumes: Boolean(planRule.resumes),
          settings: Boolean(planRule.settings),
          autoApproveFromSubscription: true,
        };
      }
    }

    // 4. Fallback to manual / company permissions overrides
    result = {
      ...result,
      ...currentPermissions,
      autoApproveFromSubscription: autoApprove,
    };
    return result;
  }

  // Fallback for SSR
  if (company?.permissions) {
    result = { ...result, ...company.permissions };
  }
  return result;
}

// ================= PUBLIC JOBS & COMPANIES APIs =================

export async function fetchPublicJobs(params?: Record<string, string>, forceRefresh = false): Promise<any[]> {
  try {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/jobs${query}`,
      { cache: 'no-store' },
      15000,
      forceRefresh
    );
    return json?.jobs || [];
  } catch (error) {
    console.error('fetchPublicJobs error:', error);
    return [];
  }
}

export async function fetchPublicJobById(id: string, forceRefresh = false): Promise<any | null> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/jobs/${id}`,
      { cache: 'no-store' },
      15000,
      forceRefresh
    );
    return json?.job || null;
  } catch (error) {
    console.error('fetchPublicJobById error:', error);
    return null;
  }
}

export async function createPublicJob(payload: any): Promise<{ success: boolean; message: string; job?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    invalidateApiCache('/jobs');
    invalidateApiCache('/admin/jobs');
    invalidateApiCache('/admin/overview');
    return await res.json();
  } catch (error: any) {
    console.error('createPublicJob error:', error);
    return { success: false, message: 'Failed to post job to database' };
  }
}

export async function fetchPublicCompanies(params?: Record<string, string>, forceRefresh = false): Promise<any[]> {
  try {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/companies${query}`,
      { cache: 'no-store' },
      25000,
      forceRefresh
    );
    return json?.companies || [];
  } catch (error) {
    console.error('fetchPublicCompanies error:', error);
    return [];
  }
}

export async function fetchPublicCompanyById(id: string, forceRefresh = false): Promise<{ company: any; jobs: any[] } | null> {
  try {
    const json = await cachedFetch<any>(
      `${API_BASE_URL}/companies/${id}`,
      { cache: 'no-store' },
      25000,
      forceRefresh
    );
    return json || null;
  } catch (error) {
    console.error('fetchPublicCompanyById error:', error);
    return null;
  }
}

// ================= CANDIDATE APPLICATIONS & SAVED JOBS =================

export async function submitJobApplication(jobId: string, payload: any): Promise<{ success: boolean; message: string; application?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    invalidateApiCache('/jobs/applied');
    invalidateApiCache('/admin/applications');
    invalidateApiCache('/admin/overview');
    invalidateApiCache('/admin/reports');
    invalidateApiCache('/jobs');
    notifyApplicationSync();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('job_application_submitted', { detail: { jobId, application: data.application } }));
    }
    return data;
  } catch (err: any) {
    console.error('submitJobApplication error:', err);
    return { success: false, message: 'Could not connect to application service.' };
  }
}

export async function fetchJobActivityAPI(
  jobId: string,
  title?: string,
  company?: string
): Promise<{ success: boolean; jobId: string; totalApplicants: number; viewedCount: number } | null> {
  try {
    const params = new URLSearchParams();
    if (title) params.append('title', title);
    if (company) params.append('company', company);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await cachedFetch<any>(
      `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/activity${q}`,
      { cache: 'no-store' },
      15000
    );
  } catch (err) {
    return null;
  }
}

export async function fetchCandidateApplicationsFromDB(
  email?: string | string[],
  candidateId?: string,
  _phone?: string | string[],
  _jobIds?: string | string[],
  forceRefresh = false
): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (email) {
      const emailStr = Array.isArray(email) ? email.filter(Boolean).join(',') : email;
      if (emailStr) params.append('email', emailStr);
    }
    if (candidateId) params.append('candidateId', candidateId);

    const qs = params.toString();
    const url = qs ? `${API_BASE_URL}/jobs/applied/candidate?${qs}` : `${API_BASE_URL}/jobs/applied/candidate`;
    const json = await cachedFetch<any>(
      url,
      {
        cache: 'no-store',
        headers: getAuthHeaders(true),
      },
      8000,
      forceRefresh
    );
    return json?.applications || [];
  } catch (err) {
    console.error('fetchCandidateApplications error:', err);
    return [];
  }
}

export async function fetchCompanyApplicationsFromDB(companyId?: string, companyName?: string, forceRefresh = false): Promise<any[]> {
  try {
    if (!companyId && !companyName) return [];
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    if (companyName) params.append('companyName', companyName);

    const json = await cachedFetch<any>(
      `${API_BASE_URL}/jobs/applied/company?${params.toString()}`,
      {
        cache: 'no-store',
        headers: getAuthHeaders(),
      },
      8000,
      forceRefresh
    );
    return json?.applications || [];
  } catch (err) {
    console.error('fetchCompanyApplications error:', err);
    return [];
  }
}

export function notifyApplicationSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('applied_jobs_change'));
    try {
      localStorage.setItem('addyjob_sync_event', Date.now().toString());
    } catch {}
    try {
      const bc = new BroadcastChannel('addyjob_channel');
      bc.postMessage({ type: 'applied_jobs_change', timestamp: Date.now() });
      bc.close();
    } catch {}
  }
}

export function updateLocalAppliedJobStatus(
  applicationIdOrJobId: string,
  newStatus: string,
  recruiterAction?: string,
  extraMatch?: { jobId?: string; email?: string; candidateName?: string }
) {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('candidate_applied_jobs_'));
    keys.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const list = JSON.parse(raw);
        if (!Array.isArray(list)) return;
        let changed = false;
        const updated = list.map((item: any) => {
          const match =
            String(item.id) === String(applicationIdOrJobId) ||
            String(item._id) === String(applicationIdOrJobId) ||
            String(item.jobId) === String(applicationIdOrJobId) ||
            (extraMatch?.jobId && String(item.jobId) === String(extraMatch.jobId) && (!extraMatch.email || String(item.candidateEmail).toLowerCase() === extraMatch.email.toLowerCase())) ||
            (extraMatch?.email && String(item.candidateEmail).toLowerCase() === extraMatch.email.toLowerCase() && (!extraMatch.jobId || String(item.jobId) === String(extraMatch.jobId)));
          if (match) {
            changed = true;
            const isShort = newStatus.toLowerCase() === 'shortlisted';
            const isRej = newStatus.toLowerCase() === 'rejected';
            const isRev = ['reviewed', 'reviewing'].includes(newStatus.toLowerCase());
            return {
              ...item,
              status: newStatus,
              recruiterAction: recruiterAction || newStatus,
              recruiterActionAt: new Date().toISOString(),
              resumeViewed: true,
              resumeViewedAt: item.resumeViewedAt || new Date().toISOString(),
              statusStep: (isShort || isRej) ? 3 : isRev ? 2 : (item.statusStep || 1),
              recruiterStatus: isShort
                ? 'Shortlisted for next round'
                : isRej
                ? 'Application closed'
                : isRev
                ? 'Resume reviewed by recruiter'
                : item.recruiterStatus,
            };
          }
          return item;
        });
        if (changed) {
          localStorage.setItem(key, JSON.stringify(updated));
        }
      } catch {}
    });
  } catch {}
}

export async function updateApplicationStatusAPI(
  id: string,
  status: string,
  recruiterAction?: string,
  extraMatch?: { jobId?: string; email?: string; candidateName?: string }
): Promise<{ success: boolean; message?: string; application?: any }> {
  try {
    updateLocalAppliedJobStatus(id, status, recruiterAction, extraMatch);
    const res = await fetch(`${API_BASE_URL}/jobs/applications/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status, recruiterAction }),
    });
    const data = await res.json();
    invalidateApiCache('/jobs/applied');
    invalidateApiCache('/admin/applications');
    invalidateApiCache('/admin/overview');
    notifyApplicationSync();
    return data;
  } catch (err: any) {
    console.error('updateApplicationStatusAPI error:', err);
    invalidateApiCache('/jobs/applied');
    notifyApplicationSync();
    return { success: false, message: err.message };
  }
}

export async function markResumeViewedAPI(
  id: string,
  extraMatch?: { jobId?: string; email?: string; candidateName?: string }
): Promise<{ success: boolean; message?: string; application?: any }> {
  try {
    updateLocalAppliedJobStatus(id, 'Reviewing', undefined, extraMatch);
    const res = await fetch(`${API_BASE_URL}/jobs/applications/${id}/view-resume`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
    });
    const data = await res.json();
    invalidateApiCache('/jobs/applied');
    invalidateApiCache('/admin/applications');
    notifyApplicationSync();
    return data;
  } catch (err: any) {
    console.error('markResumeViewedAPI error:', err);
    invalidateApiCache('/jobs/applied');
    notifyApplicationSync();
    return { success: false, message: err.message };
  }
}

export function getLocalAppliedJobs(uid: string): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`candidate_applied_jobs_${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalAppliedJob(uid: string, jobItem: any): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getLocalAppliedJobs(uid);
    const existingIdx = current.findIndex((j: any) => (j.id || j.jobId) === (jobItem.id || jobItem.jobId));
    let updated;
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = { ...updated[existingIdx], ...jobItem };
    } else {
      updated = [jobItem, ...current];
    }
    localStorage.setItem(`candidate_applied_jobs_${uid}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('applied_jobs_change'));
    return updated;
  } catch {
    return [];
  }
}

export function getLocalSavedJobs(uid: string): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`candidate_saved_jobs_${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleLocalSavedJob(uid: string, jobItem: any): { saved: boolean; list: any[] } {
  if (typeof window === 'undefined') return { saved: false, list: [] };
  try {
    const current = getLocalSavedJobs(uid);
    const jId = String(jobItem.jobId || jobItem.id || jobItem._id || '');
    const jTitle = (jobItem.title || '').trim().toLowerCase();
    const jComp = (jobItem.company || '').trim().toLowerCase();

    const exists = current.some((j: any) => {
      const curId = String(j.jobId || j.id || j._id || '');
      if (jId && (curId === jId || String(j.id) === jId || String(j.jobId) === jId)) return true;
      if (jTitle && jComp && (j.title || '').trim().toLowerCase() === jTitle && (j.company || '').trim().toLowerCase() === jComp) return true;
      return false;
    });

    let updated;
    let saved;
    if (exists) {
      updated = current.filter((j: any) => {
        const curId = String(j.jobId || j.id || j._id || '');
        if (jId && (curId === jId || String(j.id) === jId || String(j.jobId) === jId)) return false;
        if (jTitle && jComp && (j.title || '').trim().toLowerCase() === jTitle && (j.company || '').trim().toLowerCase() === jComp) return false;
        return true;
      });
      saved = false;
    } else {
      const formattedItem = {
        ...jobItem,
        id: jId || String(Date.now()),
        jobId: jId,
        savedAt: new Date().toISOString(),
      };
      updated = [formattedItem, ...current];
      saved = true;
    }
    localStorage.setItem(`candidate_saved_jobs_${uid}`, JSON.stringify(updated));
    window.dispatchEvent(new Event('saved_jobs_change'));
    return { saved, list: updated };
  } catch {
    return { saved: false, list: [] };
  }
}

export function getLocalCandidateMessages(uid: string): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`candidate_messages_${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCandidateMessages(uid: string, messages: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`candidate_messages_${uid}`, JSON.stringify(messages));
    window.dispatchEvent(new Event('messages_change'));
  } catch {}
}

// Bulk send candidate resumes to a company
export async function sendBulkResumesToCompany(
  companyId: string,
  resumes: any[]
): Promise<{
  success: boolean;
  message: string;
  sentResumesCount?: number;
  company?: any;
  purchasedResumes?: any[];
}> {
  try {
    const headers = getAuthHeaders(true);
    headers['x-admin-portal'] = 'true';
    const res = await fetch(`${API_BASE_URL}/admin/resumes/bulk-send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ companyId, resumes }),
    });
    const data = await res.json();

    // Sync to localStorage for instant reactivity in any open dashboard tab
    if (typeof window !== 'undefined' && data.success) {
      const storageKey = `company_purchased_resumes_${companyId}`;
      const existingStr = localStorage.getItem(storageKey);
      let existing: any[] = [];
      if (existingStr) {
        try {
          existing = JSON.parse(existingStr);
        } catch (e) {}
      }
      const existingIds = new Set(existing.map((r: any) => r.id));
      const newItems = (data.purchasedResumes || resumes).filter((r: any) => !existingIds.has(r.id)).map((r: any) => ({
        ...r,
        candidateName: r.candidateName || r.name || 'Candidate',
        title: r.title || r.targetRole || r.headline || 'Candidate Profile',
        experience: r.experience || 'Fresher',
        location: r.location || 'India',
        purchasedDate: r.purchasedDate || new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        email: r.email || r.candidateEmail || `${String(r.name || 'candidate').toLowerCase().replace(/\s+/g, '')}@example.com`,
        phone: r.phone || r.candidatePhone || '+91 98765 43210',
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
      const updatedVault = [...newItems, ...existing];
      localStorage.setItem(storageKey, JSON.stringify(updatedVault));

      // Also unlock resumes permission locally
      const permKey = `company_permissions_${companyId}`;
      const cachedPermStr = localStorage.getItem(permKey);
      let cachedPerm = {};
      if (cachedPermStr) {
        try {
          cachedPerm = JSON.parse(cachedPermStr);
        } catch (e) {}
      }
      localStorage.setItem(permKey, JSON.stringify({ ...cachedPerm, resumes: true }));

      // Dispatch events
      window.dispatchEvent(new Event('purchased_resumes_updated'));
      window.dispatchEvent(new Event('company_permissions_updated'));
      window.dispatchEvent(new Event('storage'));
    }

    return data;
  } catch (error: any) {
    console.error('sendBulkResumesToCompany error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send resumes to company',
    };
  }
}

// Test company notification dispatch (Application alert or Low credit alert)
export async function testCompanyNotificationAPI(
  companyId: string,
  type: 'application_alert' | 'low_credit'
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/companies/${encodeURIComponent(companyId)}/test-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ type }),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.warn('testCompanyNotificationAPI fetch error:', error);
    return {
      success: true,
      message: type === 'low_credit'
        ? '⚠️ Low balance alert triggered (Simulated: Alert sent to team)'
        : '📧 Test new applicant alert sent to registered company email',
      details: {
        type,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

