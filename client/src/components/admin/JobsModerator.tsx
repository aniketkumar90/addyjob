"use client";

import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Clock,
  Eye,
  Trash2,
  ShieldAlert,
  Users,
  ExternalLink,
  Mail,
  MoreVertical,
  XCircle,
  Pause,
  Play,
} from "lucide-react";
import JobDetailModal from "./JobDetailModal";
import JobApplicantsModal from "./JobApplicantsModal";
import { ApplicationItem } from "./RecentApplications";
import { CompanyRecord } from "./CompaniesManager";
import { fetchJobApplicants } from "@/lib/api";

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  companyEmail?: string;
  companyId?: string;
  type: string;
  location: string;
  salary: string;
  status: "Active" | "Pending" | "Expired" | "Closed" | "Paused";
  postedOn: string;
  applicantsCount: number;
  department?: string;
  workplace?: string;
  experience?: string;
  openings?: number | string;
  postedBy?: string;
  tags?: string[];
  skills?: string[];
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
}

interface JobsModeratorProps {
  jobs: JobPosting[];
  companies?: CompanyRecord[];
  applications?: ApplicationItem[];
  onToggleStatus: (id: string, newStatus: JobPosting["status"]) => void;
  onDeleteJob: (id: string) => void;
  onUpdateApplicationStatus?: (id: string, newStatus: ApplicationItem["status"]) => void;
  onNavigateToApplications?: () => void;
}

export default function JobsModerator({
  jobs,
  companies = [],
  applications = [],
  onToggleStatus,
  onDeleteJob,
  onUpdateApplicationStatus,
  onNavigateToApplications,
}: JobsModeratorProps) {
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Applicants modal state
  const [selectedApplicantsJob, setSelectedApplicantsJob] = useState<JobPosting | null>(null);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [jobApplicants, setJobApplicants] = useState<ApplicationItem[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [actionMenuJobId, setActionMenuJobId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setActionMenuJobId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleViewJob = (job: JobPosting) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  const handleOpenApplicants = async (job: JobPosting) => {
    setSelectedApplicantsJob(job);
    setIsApplicantsModalOpen(true);
    setIsLoadingApplicants(true);

    // Initial match from preloaded applications
    const initialMatched = (applications || []).filter(
      (app) =>
        (app.jobId && String(app.jobId) === String(job.id)) ||
        (app.position?.toLowerCase().trim() === job.title?.toLowerCase().trim() &&
          app.company?.toLowerCase().trim() === job.company?.toLowerCase().trim())
    );
    setJobApplicants(initialMatched);

    try {
      const liveApplicants = await fetchJobApplicants(job.id);
      if (Array.isArray(liveApplicants) && liveApplicants.length > 0) {
        setJobApplicants(liveApplicants);
      } else if (initialMatched.length === 0 && Array.isArray(liveApplicants)) {
        setJobApplicants(liveApplicants);
      }
    } catch (err) {
      console.error("Failed to load applicants for job:", err);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesFilter = filter === "All" || j.status === filter;
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
              <span>Job Postings Moderation</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Supervise active job requisitions across all subscribed companies.
            </p>
          </div>

          {/* Status Filter Tabs (Segmented Control matching Image 2) */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 no-scrollbar">
            {(["All", "Active", "Pending", "Paused", "Expired", "Closed"] as const).map((f) => {
              const pendingCount = jobs.filter((j) => j.status === "Pending").length;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 flex items-center ${
                    filter === f
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{f}</span>
                  {f === "Pending" && pendingCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pending Approval Banner */}
        {jobs.filter((j) => j.status === "Pending").length > 0 && filter !== "Pending" && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>{jobs.filter((j) => j.status === "Pending").length} job posting(s)</strong> require Super Admin review and approval before becoming visible to job seekers.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFilter("Pending")}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shrink-0 cursor-pointer self-start sm:self-auto"
            >
              Review Pending Jobs
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mt-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search job title, company or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {/* Jobs Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto min-h-[320px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3 px-4">Job Title & Company</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Compensation</th>
                <th className="py-3 px-4">Applicants</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No job postings found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j, idx) => {
                  const matchedComp = companies?.find(
                    (c) =>
                      (j.companyId && (c.id === j.companyId || c.userId === j.companyId)) ||
                      (c.name && j.company && c.name.toLowerCase() === j.company.toLowerCase()) ||
                      (c.email && j.company && c.email.toLowerCase() === j.company.toLowerCase())
                  );
                  const displayCompany = matchedComp?.name || (j.company?.includes("@") ? (matchedComp?.name || j.company.split("@")[0]) : j.company);
                  const displayEmail = j.companyEmail || matchedComp?.email || (j.company?.includes("@") ? j.company : (j.postedBy?.includes("@") ? j.postedBy : ""));

                  return (
                    <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div
                          onClick={() => handleViewJob(j)}
                          className="flex flex-col gap-1 cursor-pointer group"
                          title="Click to view full job details"
                        >
                          {/* 1. Job Title */}
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">
                            {j.title}
                          </span>

                          {/* 2. Company Name */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{displayCompany}</span>
                          </div>

                          {/* 3. Under Company Name: Company Mail & Job Type */}
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {displayEmail ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium hover:text-slate-700 transition-colors">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{displayEmail}</span>
                              </span>
                            ) : null}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
                              <Briefcase className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                              <span>{j.type}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {j.location}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {j.salary}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenApplicants(j)}
                        className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 whitespace-nowrap ${
                          (j.applicantsCount ?? 0) > 0
                            ? "bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border-blue-200/80 hover:border-blue-300"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200/70"
                        }`}
                        title={`Click to view candidates who applied for "${j.title}"`}
                      >
                        <Users className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                        <span>{j.applicantsCount ?? 0} applied</span>
                        <ExternalLink className="w-2.5 h-2.5 text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
                      </button>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                          j.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : j.status === "Pending"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : j.status === "Paused"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : j.status === "Expired"
                            ? "bg-slate-100 text-slate-600 border-slate-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActionMenuJobId(actionMenuJobId === j.id ? null : j.id)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer border ${
                            actionMenuJobId === j.id
                              ? "bg-slate-200 text-slate-900 border-slate-300 shadow-inner"
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent hover:border-slate-200"
                          }`}
                          title="Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {actionMenuJobId === j.id && (
                          <div
                            className={`absolute right-0 ${
                              idx >= filteredJobs.length - 2 && filteredJobs.length >= 3
                                ? "bottom-full mb-1.5"
                                : "top-full mt-1.5"
                            } w-52 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-left animate-in fade-in zoom-in-95`}
                          >
                            {/* View Job Details */}
                            <button
                              type="button"
                              onClick={() => {
                                setActionMenuJobId(null);
                                handleViewJob(j);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 flex items-center gap-2.5 transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Details</span>
                            </button>

                            {/* View Applicants */}
                            <button
                              type="button"
                              onClick={() => {
                                setActionMenuJobId(null);
                                handleOpenApplicants(j);
                              }}
                              className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 flex items-center gap-2.5 transition cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Applicants ({j.applicantsCount ?? 0})</span>
                            </button>

                            <div className="h-px bg-slate-100 my-1" />

                            {/* Status Moderation Actions */}
                            {j.status === "Pending" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionMenuJobId(null);
                                    onToggleStatus(j.id, "Active");
                                  }}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Approve Job</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionMenuJobId(null);
                                    onToggleStatus(j.id, "Closed");
                                  }}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Reject Job</span>
                                </button>
                              </>
                            ) : j.status === "Active" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActionMenuJobId(null);
                                  onToggleStatus(j.id, "Closed");
                                }}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition cursor-pointer"
                              >
                                <Pause className="w-3.5 h-3.5 text-amber-600" />
                                <span>Close / Pause Job</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActionMenuJobId(null);
                                  onToggleStatus(j.id, "Active");
                                }}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 flex items-center gap-2.5 transition cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 text-blue-600" />
                                <span>Reactivate Job</span>
                              </button>
                            )}

                            <div className="h-px bg-slate-100 my-1" />

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                setActionMenuJobId(null);
                                if (!confirm(`Are you sure you want to delete job "${j.title}"?`)) return;
                                onDeleteJob(j.id);
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
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Details Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedJob(null);
        }}
        onToggleStatus={(id, newStatus) => {
          onToggleStatus(id, newStatus);
          setSelectedJob((prev) => (prev && prev.id === id ? { ...prev, status: newStatus } : prev));
        }}
        onDeleteJob={onDeleteJob}
        onOpenApplicants={handleOpenApplicants}
      />

      {/* Job Applicants Modal */}
      <JobApplicantsModal
        job={selectedApplicantsJob}
        isOpen={isApplicantsModalOpen}
        onClose={() => {
          setIsApplicantsModalOpen(false);
          setSelectedApplicantsJob(null);
        }}
        applicants={jobApplicants}
        isLoading={isLoadingApplicants}
        onNavigateToApplications={onNavigateToApplications}
      />
    </div>
  );
}
