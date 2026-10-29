"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Users,
  Search,
  Building2,
  MapPin,
  Clock,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Download,
  Eye,
  CheckCircle2,
  Briefcase,
  Layers,
  Sparkles,
  UserCheck,
  ChevronDown,
  Check,
} from "lucide-react";
import ResumeDetailModal from "../admin/ResumeDetailModal";
import { markResumeViewedAPI, notifyApplicationSync } from "@/lib/api";
import { downloadCandidateResume } from "@/lib/resumeDownload";

export interface CompanyCandidateApplicant {
  id: string;
  candidateName: string;
  appliedRole?: string;
  position?: string;
  company?: string;
  jobId?: string;
  experience?: string;
  location?: string;
  appliedDate?: string;
  appliedOn?: string;
  resumeFileName?: string;
  fileName?: string;
  resumeUrl?: string;
  pdfData?: string;
  skills?: string[];
  status: "Applied" | "Reviewing" | "Shortlisted" | "Interview" | "Hired" | "Rejected" | "New" | string;
  matchScore?: number;
  email?: string;
  candidateEmail?: string;
  phone?: string;
  candidatePhone?: string;
  notes?: string;
  avatarLetter?: string;
  avatarBg?: string;
}

interface CompanyJobApplicantsModalProps {
  job: {
    id: string;
    title: string;
    department?: string;
    location?: string;
    type?: string;
    workplace?: string;
    experience?: string;
    salary?: string;
    openings?: number | string;
    applicantsCount?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  applicants: CompanyCandidateApplicant[];
  isLoading?: boolean;
  onUpdateStatus?: (id: string, newStatus: string) => void;
  onViewResume?: (applicant: CompanyCandidateApplicant) => void;
  onNavigateToApplications?: () => void;
}

const STATUS_OPTIONS = [
  {
    value: "Applied",
    label: "Status: Applied",
    dotColor: "bg-blue-500",
    badgeBg: "bg-blue-50/80",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200/80",
    hoverBg: "hover:bg-blue-50/70",
  },
  {
    value: "Reviewing",
    label: "Status: Reviewing",
    dotColor: "bg-amber-500",
    badgeBg: "bg-amber-50/80",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200/80",
    hoverBg: "hover:bg-amber-50/70",
  },
  {
    value: "Shortlisted",
    label: "Status: Shortlisted",
    dotColor: "bg-teal-500",
    badgeBg: "bg-teal-50/80",
    badgeText: "text-teal-700",
    badgeBorder: "border-teal-200/80",
    hoverBg: "hover:bg-teal-50/70",
  },
  {
    value: "Rejected",
    label: "Status: Rejected",
    dotColor: "bg-rose-500",
    badgeBg: "bg-rose-50/80",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200/80",
    hoverBg: "hover:bg-rose-50/70",
  },
];

function ApplicantStatusDropdown({
  currentStatus,
  onSelect,
}: {
  currentStatus: string;
  onSelect: (newStatus: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const activeOption =
    STATUS_OPTIONS.find(
      (opt) => opt.value.toLowerCase() === (currentStatus || "").toLowerCase()
    ) || STATUS_OPTIONS[0];

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer shadow-2xs select-none ${activeOption.badgeBg} ${activeOption.badgeText} ${activeOption.badgeBorder} hover:brightness-95 active:scale-98`}
      >
        <span className={`w-2 h-2 rounded-full ${activeOption.dotColor} shrink-0`} />
        <span className="whitespace-nowrap">{activeOption.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
            Select Status
          </div>
          <div className="space-y-0.5 mt-0.5">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected =
                opt.value.toLowerCase() === (currentStatus || "").toLowerCase();
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSelect(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer text-left select-none ${
                    isSelected
                      ? `${opt.badgeBg} ${opt.badgeText} font-bold shadow-2xs`
                      : `text-slate-700 hover:bg-slate-50 ${opt.hoverBg}`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${opt.dotColor} shrink-0`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-current" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompanyJobApplicantsModal({
  job,
  isOpen,
  onClose,
  applicants,
  isLoading = false,
  onUpdateStatus,
  onViewResume,
  onNavigateToApplications,
}: CompanyJobApplicantsModalProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedCandidateForDetail, setSelectedCandidateForDetail] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  if (!isOpen || !job) return null;

  // Filter candidates
  const filteredApplicants = applicants.filter((app) => {
    // 1. Status Filter
    const appStatus = (app.status || "Applied").toLowerCase();
    const filterKey = statusFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "ALL" ||
      appStatus === filterKey ||
      (filterKey === "applied" && (appStatus === "new" || appStatus === "applied")) ||
      (filterKey === "reviewing" && (appStatus === "reviewed" || appStatus === "reviewing"));

    // 2. Search
    const q = search.toLowerCase().trim();
    const candidateName = app.candidateName || "";
    const email = app.email || app.candidateEmail || "";
    const phone = app.phone || app.candidatePhone || "";
    const skills = app.skills || [];

    const matchesSearch =
      !q ||
      candidateName.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      phone.toLowerCase().includes(q) ||
      skills.some((s) => s.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeStyle = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "hired") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "rejected") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (s === "interview") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    if (s === "shortlisted") {
      return "bg-teal-50 text-teal-700 border-teal-200";
    }
    if (s === "reviewing" || s === "reviewed") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-violet-50 text-[#7C3AED] border-[#DDD6FE]";
  };

  const handleOpenDetail = (app: CompanyCandidateApplicant) => {
    // Mark resume as viewed in DB and notify candidate dashboard
    if (app.id) {
      markResumeViewedAPI(app.id).catch((err) =>
        console.warn("Backend resume view error:", err)
      );
      if (app.status === "Applied" || app.status === "New") {
        if (onUpdateStatus) {
          onUpdateStatus(app.id, "Reviewing");
        }
      }
    }
    if (onViewResume) {
      onViewResume(app);
    }
    notifyApplicationSync();

    // Normalize into format expected by ResumeDetailModal
    const cName = app.candidateName || "Candidate";
    const normalizedApp: any = {
      id: app.id,
      candidateName: cName,
      candidateEmail: app.email || app.candidateEmail || "",
      candidatePhone: app.phone || app.candidatePhone || "",
      avatarLetter: app.avatarLetter || cName.slice(0, 2).toUpperCase(),
      avatarBg: app.avatarBg || "bg-[#7C3AED]",
      position: app.appliedRole || app.position || job.title,
      company: app.company || "Your Company",
      appliedOn: app.appliedDate || app.appliedOn || "Recently",
      status: (app.status === "Applied" ? "New" : app.status === "Interview" ? "Shortlisted" : app.status) as any,
      resumeUrl: app.resumeUrl || "",
      pdfData: app.pdfData || app.resumeUrl || "",
      fileName: app.resumeFileName || app.fileName || `${cName.replace(/\s+/g, "_")}_Resume.pdf`,
      skills: app.skills || [],
      experience: app.experience || "1-3 years",
      domain: (app as any).domain || job.title,
      education: (app as any).education,
      university: (app as any).university,
      passingYear: (app as any).passingYear,
      headline: (app as any).headline,
      bio: (app as any).bio,
      languages: (app as any).languages,
      location: (app as any).location,
    };
    setSelectedCandidateForDetail(normalizedApp);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-900 via-purple-950 to-violet-950 text-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#7C3AED]/30 border border-[#7C3AED]/40 flex items-center justify-center text-violet-300 shadow-inner">
              <Users className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Applied Candidates
                </h2>
                <span
                  style={{ backgroundColor: "#EDE9FE", color: "#6D28D9", borderColor: "#DDD6FE" }}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border shadow-2xs"
                >
                  {applicants.length} {applicants.length === 1 ? "Candidate" : "Candidates"}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                <span className="font-semibold text-white">{job.title}</span>
                <span>•</span>
                <span className="text-slate-300">{job.department || "Engineering"}</span>
                {job.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.location}
                    </span>
                  </>
                )}
                {job.type && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400">{job.type}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Status Filter Bar */}
        <div className="p-4 sm:px-6 bg-slate-50/80 border-b border-slate-200/80 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates by name, email, phone or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Status Filter Tabs (Matching Image 1) */}
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
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                    statusFilter === st
                      ? "bg-white text-[#7C3AED] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Loading applied candidates...</p>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8">
              <div
                style={{ backgroundColor: "#EDE9FE", color: "#6D28D9" }}
                className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
              >
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {applicants.length === 0
                  ? "No Candidates Have Applied Yet"
                  : "No Candidates Match Your Filter"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {applicants.length === 0
                  ? `There are currently no job submissions recorded for "${job.title}". As soon as candidates apply, their resumes and contact details will appear here.`
                  : "Try clearing your search query or switching status filters to see other applicants."}
              </p>
              {applicants.length > 0 && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="px-3.5 py-1.5 bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#7C3AED] font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredApplicants.map((app) => {
                const candidateName = app.candidateName || "Candidate";
                const email = app.email || app.candidateEmail || "";
                const phone = app.phone || app.candidatePhone || "";
                const appliedDate = app.appliedDate || app.appliedOn || "Today";
                const resumeLink = app.resumeUrl || app.pdfData || "";

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#DDD6FE] p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Avatar & Candidate Info */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div
                        style={{ backgroundColor: "#EDE9FE", color: "#6D28D9", borderColor: "#DDD6FE" }}
                        className="w-12 h-12 rounded-2xl border font-black text-base flex items-center justify-center shrink-0 shadow-2xs"
                      >
                        {candidateName.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900 hover:text-[#7C3AED] transition-colors">
                            {candidateName}
                          </span>
                          {app.matchScore && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {app.matchScore}% Match
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadgeStyle(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </span>
                        </div>

                        {/* Contact details */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {email && (
                            <a
                              href={`mailto:${email}`}
                              className="flex items-center gap-1 text-slate-600 hover:text-[#7C3AED] transition-colors"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{email}</span>
                            </a>
                          )}

                          {phone && (
                            <a
                              href={`tel:${phone}`}
                              className="flex items-center gap-1 text-slate-600 hover:text-[#7C3AED] transition-colors"
                              title="Call Candidate"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{phone}</span>
                            </a>
                          )}

                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Applied {appliedDate}</span>
                          </span>
                        </div>

                        {/* Experience & Skills */}
                        {(app.experience || (app.skills && app.skills.length > 0)) && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {app.experience && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                {app.experience}
                              </span>
                            )}
                            {app.location && (
                              <span className="px-2 py-0.5 rounded-md bg-[#EDE9FE] text-[#7C3AED] text-[10px] font-semibold">
                                {app.location}
                              </span>
                            )}
                            {app.skills?.slice(0, 4).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px] font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {app.skills && app.skills.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{app.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions & Status Dropdown */}
                    <div className="flex items-center gap-2 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0 flex-wrap">
                      {/* Recruiter Status Dropdown */}
                      {onUpdateStatus && (
                        <ApplicantStatusDropdown
                          currentStatus={app.status}
                          onSelect={(newStatus) => onUpdateStatus(app.id, newStatus)}
                        />
                      )}

                      {/* View Resume Button - Always accessible for every candidate */}
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(app)}
                        className="px-3 py-1.5 bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#7C3AED] border border-[#DDD6FE] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="View Candidate Resume & Full Credentials"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>Resume</span>
                        <Eye className="w-3 h-3 opacity-70" />
                      </button>

                      {/* View Full Detail Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(app)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="View candidate details & credentials"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-slate-300" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredApplicants.length}</span> of{" "}
            <span className="font-bold text-slate-800">{applicants.length}</span> candidates for this job opening.
          </p>

          <div className="flex items-center gap-2">
            {onNavigateToApplications && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToApplications();
                }}
                className="px-4 py-2 bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#7C3AED] text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <span>View All in Applications Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Nested Full Candidate Detail Modal */}
      {selectedCandidateForDetail && (
        <ResumeDetailModal
          application={selectedCandidateForDetail}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedCandidateForDetail(null);
          }}
          onUpdateStatus={(id, status) => {
            if (onUpdateStatus) onUpdateStatus(id, status);
            setSelectedCandidateForDetail((prev: any) => (prev ? { ...prev, status } : null));
          }}
        />
      )}
    </div>
  );
}
