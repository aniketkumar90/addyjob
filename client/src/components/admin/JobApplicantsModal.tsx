"use client";

import React, { useState } from "react";
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
  Eye,
  UserCheck,
} from "lucide-react";
import { JobPosting } from "./JobsModerator";
import { ApplicationItem } from "./RecentApplications";
import ResumeDetailModal from "./ResumeDetailModal";

interface JobApplicantsModalProps {
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  applicants: ApplicationItem[];
  isLoading?: boolean;
  onNavigateToApplications?: () => void;
}

export default function JobApplicantsModal({
  job,
  isOpen,
  onClose,
  applicants,
  isLoading = false,
  onNavigateToApplications,
}: JobApplicantsModalProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedCandidateForDetail, setSelectedCandidateForDetail] = useState<ApplicationItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  if (!isOpen || !job) return null;

  // Filter applicants
  const filteredApplicants = applicants.filter((app) => {
    // 1. Status Filter
    const appStatus = (app.status || "Applied").toLowerCase();
    const filterKey = statusFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "ALL" ||
      statusFilter === "All" ||
      appStatus === filterKey ||
      (filterKey === "applied" && (appStatus === "new" || appStatus === "applied")) ||
      (filterKey === "reviewing" && (appStatus === "reviewed" || appStatus === "reviewing"));

    // 2. Search
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.candidateName?.toLowerCase().includes(q) ||
      app.candidateEmail?.toLowerCase().includes(q) ||
      app.candidatePhone?.toLowerCase().includes(q) ||
      (app.domain && app.domain.toLowerCase().includes(q)) ||
      (app.skills && app.skills.some((s) => s.toLowerCase().includes(q)));

    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeClass = (status: ApplicationItem["status"]) => {
    switch (status) {
      case "Shortlisted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "New":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Reviewed":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Hired":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleOpenDetail = (app: ApplicationItem) => {
    setSelectedCandidateForDetail(app);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden h-full max-h-[94dvh] sm:max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3.5 py-3 sm:px-6 sm:py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-black text-white tracking-tight truncate">
                  Applied Candidates
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0">
                  {applicants.length} {applicants.length === 1 ? "Applicant" : "Applicants"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 flex items-center gap-1.5 mt-0.5 truncate">
                <span className="font-semibold text-white truncate max-w-[120px] sm:max-w-none">{job.title}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-slate-300 truncate max-w-[100px] sm:max-w-none">
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{job.company}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-slate-400">{job.type}</span>
                {job.location && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 sm:px-6 sm:py-4 bg-slate-50/80 border-b border-slate-200/80 shrink-0 space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Status Filter Tabs (with scrollbar hidden on all browsers) */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full bg-slate-200/60 p-1 rounded-xl sm:rounded-2xl border border-slate-200 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {(
                [
                  "ALL",
                  "Applied",
                  "Reviewing",
                  "Shortlisted",
                  "Interview",
                  "Hired",
                  "Rejected",
                ] as const
              ).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                    statusFilter === st
                      ? "bg-white text-blue-600 shadow-sm"
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
        <div className="p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 text-xs text-slate-700 flex-1 min-h-0">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Loading applied candidates...</p>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="py-12 sm:py-16 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6 sm:p-8">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {applicants.length === 0
                  ? "No Candidates Have Applied Yet"
                  : "No Applicants Match Your Search"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {applicants.length === 0
                  ? `There are currently no candidate applications recorded for "${job.title}". As soon as candidates apply, they will show up here.`
                  : "Try clearing your search query or switching filters to see other applicants."}
              </p>
              {applicants.length > 0 && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredApplicants.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-blue-300 p-3.5 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col gap-3"
                >
                  {/* Top: Avatar & Candidate Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-white text-sm sm:text-base shadow-sm shrink-0 ${
                        app.avatarBg || "bg-blue-600"
                      }`}
                    >
                      {app.avatarLetter || "CD"}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors truncate">
                          {app.candidateName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getStatusBadgeClass(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </div>

                      {/* Contact row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-slate-500">
                        {app.candidateEmail && (
                          <a
                            href={`mailto:${app.candidateEmail}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors truncate max-w-[200px] sm:max-w-none"
                            title="Send email"
                          >
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{app.candidateEmail}</span>
                          </a>
                        )}

                        {app.candidatePhone && (
                          <a
                            href={`tel:${app.candidatePhone}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
                            title="Call candidate"
                          >
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{app.candidatePhone}</span>
                          </a>
                        )}

                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>Applied {app.appliedOn || "Recently"}</span>
                        </span>
                      </div>

                      {/* Skills or Experience if present */}
                      {(app.experience || (app.skills && app.skills.length > 0)) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {app.experience && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              {app.experience}
                            </span>
                          )}
                          {app.domain && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold truncate max-w-[140px]">
                              {app.domain}
                            </span>
                          )}
                          {app.skills?.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {app.skills && app.skills.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{app.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions row: Responsive 50-50 on mobile, flex-end on desktop */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(app)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="View Candidate Resume & Credentials"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Resume</span>
                      <Eye className="w-3 h-3 opacity-70" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDetail(app)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Inspect full candidate details"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-slate-300" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-50/90 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <p className="text-[11px] sm:text-xs text-slate-500 text-center sm:text-left">
            Showing <span className="font-bold text-slate-800">{filteredApplicants.length}</span> of{" "}
            <span className="font-bold text-slate-800">{applicants.length}</span> total candidate applications.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNavigateToApplications && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToApplications();
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Applications Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer text-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Nested Full Candidate Detail Modal if requested */}
      <ResumeDetailModal
        application={selectedCandidateForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCandidateForDetail(null);
        }}
      />
    </div>
  );
}
