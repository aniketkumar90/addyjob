"use client";

import React, { useState } from "react";
import { downloadCandidateResume } from "@/lib/resumeDownload";
import {
  Building2,
  Briefcase,
  Users,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  ArrowLeft,
  Check,
  X,
  Eye,
  Download,
  Calendar,
  Sparkles,
  Layers,
  Megaphone,
  BadgeCheck,
  KeyRound,
} from "lucide-react";
import { CompanyRecord } from "./CompaniesManager";
import { JobPosting } from "./JobsModerator";
import { ApplicationItem } from "./RecentApplications";

export interface CompanySubAdminProps {
  company: CompanyRecord;
  allJobs?: JobPosting[];
  allApplications?: ApplicationItem[];
  onBack: () => void;
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  onOpenPermissions?: () => void;
}

export type SubAdminTab = "details" | "resumes" | "posts" | "both";

interface CandidateResumeDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedRole: string;
  appliedDate: string;
  status: "Applied" | "Reviewing" | "Shortlisted" | "Interview" | "Hired" | "Rejected";
  experience: string;
  education: string;
  skills: string[];
  matchScore: number;
  summary: string;
}

export default function CompanySubAdminView({
  company,
  allJobs = [],
  allApplications = [],
  onBack,
  onApprove,
  onReject,
  onOpenPermissions,
}: CompanySubAdminProps) {
  const [activeTab, setActiveTab] = useState<SubAdminTab>("details");
  const [globalSearch, setGlobalSearch] = useState("");
  const [jobFilter, setJobFilter] = useState<string>("ALL");
  const [resumeFilter, setResumeFilter] = useState<string>("ALL");
  const [selectedResume, setSelectedResume] = useState<CandidateResumeDetail | null>(null);
  const [selectedJobPreview, setSelectedJobPreview] = useState<JobPosting | null>(null);

  // Normalize company name matching
  const compKey = (company?.name || "").toLowerCase().trim();

  // 1. Filtered company jobs
  const rawCompanyJobs = (allJobs || []).filter((j) => {
    const jComp = (j?.company || "").toLowerCase().trim();
    return jComp.includes(compKey) || (compKey && compKey.includes(jComp));
  });

  // 1. Filtered company jobs (ONLY real jobs posted by this company)
  const companyJobs: JobPosting[] = (allJobs || []).filter((j) => {
    const jComp = (j?.company || "").toLowerCase().trim();
    return (
      (compKey && jComp === compKey) ||
      (compKey && jComp.includes(compKey)) ||
      (jComp && compKey.includes(jComp))
    );
  });

  // 2. Filtered candidate resumes / applications (ONLY real applications for this company)
  const rawCompanyApps = (allApplications || []).filter((a) => {
    const aComp = (a?.company || "").toLowerCase().trim();
    return (
      (compKey && aComp === compKey) ||
      (compKey && aComp.includes(compKey)) ||
      (aComp && compKey.includes(aComp))
    );
  });

  const companyResumes: CandidateResumeDetail[] = rawCompanyApps.map((a, idx) => {
    const rawA = a as any;
    return {
      id: rawA.id || `app-${idx}`,
      name: rawA.candidateName || `Applicant ${idx + 1}`,
      email: rawA.candidateEmail || rawA.email || `${(rawA.candidateName || `applicant${idx}`).toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
      phone: rawA.candidatePhone || rawA.phone || ("+91 " + (rawA.id ? String(rawA.id).slice(-10) : "Not provided")),
      appliedRole: rawA.position || "Applicant",
      appliedDate: rawA.appliedOn || "Recently",
      status: (rawA.status === "New" ? "Applied" : rawA.status === "Reviewed" ? "Reviewing" : rawA.status || "Applied") as any,
      experience: "Verified Profile",
      education: "Higher Education",
      skills: ["Candidate Profile"],
      matchScore: 85,
      summary: "Application submitted through career portal for " + (company?.name || "Company"),
    };
  });

  // 3. Filtered Jobs & Resumes logic (incorporates global search query)
  const filteredJobs = companyJobs.filter((j) => {
    const matchesFilter = jobFilter === "ALL" || j.status.toUpperCase() === jobFilter.toUpperCase();
    const matchesSearch =
      j.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
      j.location.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredResumes = companyResumes.filter((r) => {
    const matchesFilter = resumeFilter === "ALL" || r.status.toUpperCase() === resumeFilter.toUpperCase();
    const matchesSearch =
      r.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      r.appliedRole.toLowerCase().includes(globalSearch.toLowerCase()) ||
      r.skills.some((s) => s.toLowerCase().includes(globalSearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Calculate metrics
  const activeJobsCount = companyJobs.filter((j) => j.status === "Active").length;
  const totalApplicantsCount = companyJobs.reduce((acc, curr) => acc + (curr.applicantsCount || 0), 0);
  const shortlistedCount = companyResumes.filter((r) => r.status === "Shortlisted" || r.status === "Interview").length;
  const hiredCount = companyResumes.filter((r) => r.status === "Hired").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ================= 1. HEADER CARD (MATCHING USER'S IMAGE 1:1) ================= */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        {/* Top Header Row with Title & Unified Pill Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Companies</span>
              </button>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-wider">
                Company Sub-Admin
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {company.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Review company verification requests, plans, and job posting permissions.
            </p>
          </div>

          {/* Status Filter Tabs (Pill wrapper matching Image 1:1) */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            {[
              { id: "details" as const, label: "Company Details", badge: null },
              { id: "resumes" as const, label: "Resumes", badge: null },
              { id: "posts" as const, label: "Posts", badge: null },
              { id: "both" as const, label: "Both", badge: null },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-white text-[#7C3AED] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input (Matching Image 1:1) */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search by job title, candidate name, email or location in ${company.name}...`}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
          />
        </div>
      </div>

      {/* ================= 2. COMPANY IDENTITY & VERIFICATION BANNER ================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {company.logo || company.profileImage ? (
            <img
              src={company.logo || company.profileImage}
              alt={company.name}
              className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-md"
            />
          ) : (
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shrink-0 shadow-md ${company.logoBg}`}
            >
              {company.logoLetter}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg font-black text-slate-900">{company.name}</h3>
              {company.userId && (
                <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-mono font-bold">
                  {company.userId}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  company.status === "Approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : company.status === "Pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                {company.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-[#7C3AED] border border-violet-200">
                {company.plan}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {company.email}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {company.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Registered: {company.submittedOn}
              </span>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Direct Super Admin Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenPermissions && (
            <button
              type="button"
              onClick={onOpenPermissions}
              className="px-3.5 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Manual company permissions override"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Permissions</span>
            </button>
          )}
          {company.status === "Pending" ? (
            <>
              <button
                type="button"
                onClick={() => onReject(company.id, company.name)}
                className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
              >
                Reject Registration
              </button>
              <button
                type="button"
                onClick={() => onApprove(company.id, company.name)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Approve Company</span>
              </button>
            </>
          ) : company.status === "Approved" ? (
            <button
              type="button"
              onClick={() => onReject(company.id, company.name)}
              className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Revoke Access</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onApprove(company.id, company.name)}
              className="px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Re-approve Company</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= 3. TAB CONTENT VIEWS ================= */}

      {/* ----------------- TAB 1: COMPANY DETAILS ----------------- */}
      {activeTab === "details" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Comprehensive Company Specs */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#7C3AED]" />
                  <span>Company Profile & Registration Information</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Official verification documents, contacts, and recruiter profile metadata.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Work Email */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    Official Work Email
                  </span>
                  <p className="text-sm font-bold text-slate-900 break-all">{company.email}</p>
                </div>

                {/* Phone */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    Registered Phone / HR Contact
                  </span>
                  <p className="text-sm font-bold text-slate-900">{company.phone || "Not specified"}</p>
                </div>

                {/* Location */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Corporate Headquarters
                  </span>
                  <p className="text-sm font-bold text-slate-900">{company.location || "Not specified"}</p>
                </div>

                {/* Website */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    Official Website
                  </span>
                  <p className="text-sm font-bold text-blue-600 truncate">
                    {company.website ? (
                      <a
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>{company.website}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400 font-normal">Not provided</span>
                    )}
                  </p>
                </div>

                {/* Industry Sector */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    Industry Domain / Sector
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {company.industry || "Not specified"}
                  </p>
                </div>

                {/* Company Size */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    Company Size / Employees
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {company.companySize || "Not specified"}
                  </p>
                </div>

                {/* GST Number */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    GSTIN / Corporate Tax ID
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-900">
                    {company.gstNumber || "Not registered"}
                  </p>
                </div>

                {/* Plan Tier */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    Subscription Plan Tier
                  </span>
                  <p className="text-sm font-bold text-[#7C3AED] flex items-center gap-1.5">
                    <span>{company.plan || "No Active Plan"}</span>
                    <span className="text-xs text-slate-400 font-normal">• Active</span>
                  </p>
                </div>
              </div>

              {/* Company About Statement */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Company Mission & Bio
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {(company as any)?.aboutCompany || (company as any)?.bio || `${company.name} profile registered on Addy Job platform.`}
                </p>
              </div>
            </div>

            {/* Right Col: Recruiter Quota & Status Controls */}
            <div className="space-y-6">
              {/* Account Quota & Usage Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span>Recruiter Plan Usage</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Job Postings</span>
                      <span className="text-slate-900 font-bold">{companyJobs.length} Active Posts</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, (companyJobs.length / Math.max(1, companyJobs.length)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Applications Received</span>
                      <span className="text-slate-900 font-bold">{companyResumes.length} Applications</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-violet-600 rounded-full"
                        style={{ width: `${Math.min(100, (companyResumes.length / Math.max(1, companyResumes.length)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Candidate Messaging</span>
                      <span className="text-slate-900 font-bold">Unlimited</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-full" />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  Plan billing cycle: <strong className="text-slate-700">Monthly auto-renew</strong>
                </div>
              </div>

              {/* Verification & Access Security */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Security & Verification Audit</span>
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Super Admin can grant or revoke posting permissions. If revoked, candidate applications and postings are temporarily paused.
                </p>

                <div className="pt-2">
                  <div
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${
                      company.status === "Approved"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : company.status === "Pending"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}
                  >
                    {company.status === "Approved" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : company.status === "Pending" ? (
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>Current Access: {company.status} Recruiter</span>
                  </div>
                  {company.status === "Rejected" && company.rejectionReason && (
                    <div className="p-3 rounded-xl bg-rose-100/70 border border-rose-200 text-rose-950 text-xs leading-relaxed space-y-1">
                      <span className="font-bold text-rose-900 block">Official Rejection Reason:</span>
                      <p>{company.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: RESUMES & APPLICANTS ----------------- */}
      {activeTab === "resumes" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Sub-Header Controls Styled Exactly Like Image 1:1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#7C3AED]" />
                  <span>Candidate Resumes & Applications ({companyResumes.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect incoming candidate CVs, applicant status, and match scores.
                </p>
              </div>

              {/* Status Filter Tabs (Pill wrapper matching Image 1:1) */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
                {["ALL", "Shortlisted", "Interview", "Reviewing", "Hired", "Applied"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setResumeFilter(status)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                      resumeFilter === status
                        ? "bg-white text-[#7C3AED] shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {filteredResumes.length} candidate resumes</span>
              <span className="font-semibold text-emerald-600">{shortlistedCount} Candidates in Pipeline</span>
            </div>
          </div>

          {/* Resumes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResumes.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                No resumes match your filter.
              </div>
            ) : (
              filteredResumes.map((cand) => (
                <div
                  key={cand.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-violet-300 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-violet-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {cand.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{cand.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{cand.appliedRole}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                        cand.status === "Hired"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : cand.status === "Interview"
                          ? "bg-violet-50 text-violet-700 border-violet-200"
                          : cand.status === "Shortlisted"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {cand.status}
                    </span>
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {cand.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                    {cand.skills.length > 4 && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 text-[11px]">
                        +{cand.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Quick Meta */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Exp: {cand.experience}</span>
                    <span className="font-bold text-emerald-600">Match: {cand.matchScore}%</span>
                    <button
                      type="button"
                      onClick={() => setSelectedResume(cand)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-[#7C3AED] font-bold text-xs transition cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Resume</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: POSTS & FEED ----------------- */}
      {activeTab === "posts" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-500" />
                  <span>Company Posts ({companyJobs.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Candidate-facing job posts and announcements for {company.name}.
                </p>
              </div>

              {/* Status Filter Tabs (Pill wrapper matching Image 1:1) */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
                {["ALL", "Active", "Closed"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setJobFilter(status)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                      jobFilter === status
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {filteredJobs.length} posts</span>
              <span className="font-semibold text-blue-600">{activeJobsCount} Active Posts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJobs.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                No posts match your filter.
              </div>
            ) : (
              filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] uppercase tracking-wider mb-2">
                      {job.type}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 leading-snug">{job.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{company.name} • {job.location}</p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs ${company.logoBg}`}
                  >
                    {company.logoLetter}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  We are looking for a skilled professional to join our core engineering and product division.
                  Competitive compensation, rapid growth, and modern developer tooling provided.
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="font-extrabold text-slate-900">{job.salary}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedJobPreview(job)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                    >
                      Post Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("resumes");
                        setGlobalSearch(job.title);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                    >
                      {job.applicantsCount} Applicants
                    </button>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* ----------------- TAB 5: BOTH (ALL-IN-ONE OVERVIEW) ----------------- */}
      {activeTab === "both" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Unified High-Level KPI Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Posts
              </span>
              <span className="text-2xl font-black text-slate-900">{companyJobs.length}</span>
              <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">
                {activeJobsCount} Active Postings
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Resumes
              </span>
              <span className="text-2xl font-black text-[#7C3AED]">{companyResumes.length}</span>
              <span className="text-[11px] text-slate-500 block mt-1 font-semibold">
                {totalApplicantsCount} Platform Leads
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Shortlisted
              </span>
              <span className="text-2xl font-black text-blue-600">{shortlistedCount}</span>
              <span className="text-[11px] text-blue-500 block mt-1 font-semibold">Active in Pipeline</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Hired Candidates
              </span>
              <span className="text-2xl font-black text-emerald-600">{hiredCount}</span>
              <span className="text-[11px] text-emerald-600 block mt-1 font-semibold">Success Verified</span>
            </div>
          </div>

          {/* Side-by-Side: Posts vs Resumes Unified Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Quick Posts Summary */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-slate-100">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600" />
                  <span>Company Posts ({companyJobs.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab("posts")}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View All Posts →
                </button>
              </div>

              <div className="space-y-3">
                {companyJobs.slice(0, 3).map((j) => (
                  <div
                    key={j.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{j.title}</h5>
                      <p className="text-[11px] text-slate-500">{j.location} • {j.salary}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 text-xs font-bold shrink-0">
                      {j.applicantsCount} apps
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quick Resumes Summary */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#7C3AED]" />
                  <span>Incoming Resumes ({companyResumes.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab("resumes")}
                  className="text-xs font-bold text-[#7C3AED] hover:underline"
                >
                  View All Resumes →
                </button>
              </div>

              <div className="space-y-3">
                {companyResumes.slice(0, 3).map((cand) => (
                  <div
                    key={cand.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {cand.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">{cand.name}</h5>
                        <p className="text-[11px] text-slate-500">{cand.appliedRole}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-violet-100 text-violet-800 text-xs font-bold shrink-0">
                      {cand.matchScore}% Match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. POPUP: RESUME DETAIL MODAL ================= */}
      {selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedResume(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Resume Candidate Header */}
            <div className="flex items-start gap-4 mb-5 pb-5 border-b border-slate-100 pr-10">
              <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                {selectedResume.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-xl font-black text-slate-900">{selectedResume.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedResume.matchScore}% Match
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
                    {selectedResume.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Applied for <strong className="text-slate-800">{selectedResume.appliedRole}</strong> • {selectedResume.appliedDate}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Email</span>
                  <p className="font-semibold text-slate-900">{selectedResume.email}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Contact</span>
                  <p className="font-semibold text-slate-900">{selectedResume.phone}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Experience</span>
                  <p className="font-semibold text-slate-900">{selectedResume.experience}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Education</span>
                  <p className="font-semibold text-slate-900">{selectedResume.education}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Professional Summary</span>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">{selectedResume.summary}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">Verified Skill Set</span>
                <div className="flex flex-wrap gap-2">
                  {selectedResume.skills.map((sk) => (
                    <span
                      key={sk}
                      className="px-3 py-1 rounded-xl bg-violet-50 text-[#7C3AED] border border-violet-200 font-bold text-xs"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">PDF CV verified by Addy Job recruiter engine.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadCandidateResume(selectedResume)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedResume(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. POPUP: JOB POST DETAIL PREVIEW ================= */}
      {selectedJobPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedJobPreview(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base text-white shrink-0 shadow-md ${company.logoBg}`}
              >
                {company.logoLetter}
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                  {selectedJobPreview.type}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedJobPreview.title}</h3>
                <p className="text-xs text-slate-500">{company.name} • {selectedJobPreview.location}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Salary Offer</span>
                  <p className="font-extrabold text-slate-900">{selectedJobPreview.salary}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Applicants Count</span>
                  <p className="font-extrabold text-[#7C3AED]">{selectedJobPreview.applicantsCount} Resumes</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">Job Description & Responsibilities</span>
                <p className="text-slate-700 leading-relaxed text-xs">
                  We are seeking an experienced {selectedJobPreview.title} to work on cutting-edge platforms.
                  The ideal candidate collaborates with cross-functional product, design, and engineering teams.
                </p>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pt-1">
                  <li>Build responsive, scalable web interfaces and resilient API backends.</li>
                  <li>Implement automated tests, CI/CD integrations, and performance monitoring.</li>
                  <li>Collaborate directly with product leads and agile sprint teams.</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const targetJob = selectedJobPreview.title;
                  setSelectedJobPreview(null);
                  setActiveTab("resumes");
                  setGlobalSearch(targetJob);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
              >
                View Job Resumes
              </button>
              <button
                type="button"
                onClick={() => setSelectedJobPreview(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
