"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  Search,
  Filter,
  User,
  Building2,
  Briefcase,
  FileText,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Upload,
  Layers,
  Sparkles,
  Download,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { ApplicationItem } from "./RecentApplications";
import UploadResumeModal from "./UploadResumeModal";
import ResumeDetailModal from "./ResumeDetailModal";

interface ApplicationsManagerProps {
  applications: ApplicationItem[];
  onUpdateStatus?: (id: string, status: ApplicationItem["status"]) => void;
  companies?: Array<{ id: string; name: string }>;
  onAddApplication?: (newApp: ApplicationItem) => void;
  activeView?: string;
}

export default function ApplicationsManager({
  applications,
  onUpdateStatus,
  companies = [],
  onAddApplication,
  activeView = "resumes",
}: ApplicationsManagerProps) {
  const [filter, setFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [domainFilter, setDomainFilter] = useState<string>("All");
  const [experienceFilter, setExperienceFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  
  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<ApplicationItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Extract unique domains from applications
  const uniqueDomains = Array.from(
    new Set(
      applications
        .map((a) => a.domain)
        .filter(Boolean) as string[]
    )
  );

  const filteredApps = applications.filter((app) => {
    // 1. Status Filter
    const matchesFilter =
      filter === "All" ||
      filter.toUpperCase() === "ALL" ||
      app.status.toLowerCase() === filter.toLowerCase() ||
      (filter.toLowerCase() === "applied" && app.status.toLowerCase() === "new") ||
      (filter.toLowerCase() === "reviewing" && app.status.toLowerCase() === "reviewed");

    // 2. Source Filter (All / Profile Resume / Application Resume)
    const matchesSource =
      sourceFilter === "All" ||
      (sourceFilter === "profile" && app.isProfileResume) ||
      (sourceFilter === "application" && (app.isApplicationResume || !app.isProfileResume));

    // 3. Domain Filter
    const matchesDomain =
      domainFilter === "All" ||
      (app.domain && app.domain.toLowerCase().includes(domainFilter.toLowerCase())) ||
      (app.position && app.position.toLowerCase().includes(domainFilter.toLowerCase()));

    // 4. Experience Filter
    const matchesExperience =
      experienceFilter === "All" ||
      (app.experience && app.experience.toLowerCase().includes(experienceFilter.toLowerCase()));

    // 5. Search Filter
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.candidateName.toLowerCase().includes(q) ||
      app.position.toLowerCase().includes(q) ||
      app.company.toLowerCase().includes(q) ||
      (app.domain && app.domain.toLowerCase().includes(q)) ||
      (app.experience && app.experience.toLowerCase().includes(q)) ||
      (app.candidateEmail && app.candidateEmail.toLowerCase().includes(q));

    return matchesFilter && matchesSource && matchesDomain && matchesExperience && matchesSearch;
  });

  const handleOpenDetail = (app: ApplicationItem) => {
    setSelectedCandidate(app);
    setIsDetailModalOpen(true);
  };

  const isResumeView = activeView === "resumes";

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Candidate Resumes &amp; Database
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shrink-0">
                {filteredApps.length} Resumes
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Browse candidate profile resumes and job application resumes, filter by domain &amp; experience, and view/download verified PDF resumes.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto min-w-0">
            {/* Status Filter Tabs (Pill wrapper) */}
            <div className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1 lg:flex-initial bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 no-scrollbar">
              {["ALL", "Applied", "Reviewing", "Shortlisted", "Interview", "Hired", "Rejected"].map(
                (f) => {
                  const isActive =
                    (f === "ALL" && (filter === "All" || filter.toUpperCase() === "ALL")) ||
                    filter.toUpperCase() === f.toUpperCase() ||
                    (f === "Applied" && filter === "New") ||
                    (f === "Reviewing" && filter === "Reviewed");

                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {f}
                    </button>
                  );
                }
              )}
            </div>

            {/* Circular Upload Resume / CV Button on right side of filter */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              title="Upload Candidate Resume / CV"
              aria-label="Upload Candidate Resume / CV"
              className="w-9 h-9 min-w-9 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-blue-500/25 transition-all hover:scale-110 active:scale-95 cursor-pointer shrink-0"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, domain, position, company or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800"
            />
          </div>

          {/* Resume Source Filter Dropdown */}
          <div className="md:col-span-3 relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full pl-8.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-semibold text-slate-700 cursor-pointer appearance-none truncate"
            >
              <option value="All">All Resume Sources (Profile & Applied)</option>
              <option value="profile">Profile Resumes (Job Seeker Profile)</option>
              <option value="application">Job Application Resumes (Company Applied)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Domain Filter Dropdown */}
          <div className="md:col-span-3 relative">
            <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="w-full pl-8.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-semibold text-slate-700 cursor-pointer appearance-none truncate"
            >
              <option value="All">All Domains</option>
              <option value="Full Stack">Full Stack Development</option>
              <option value="Frontend">Frontend Development</option>
              <option value="Backend">Backend Development</option>
              <option value="Mobile">Mobile App Development</option>
              <option value="Data Science">Data Science & AI/ML</option>
              <option value="DevOps">Cloud & DevOps</option>
              <option value="UI/UX">UI/UX Design</option>
              <option value="QA">Quality Assurance</option>
              {uniqueDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Experience Filter Dropdown */}
          <div className="md:col-span-2 relative">
            <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full pl-8.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-semibold text-slate-700 cursor-pointer appearance-none truncate"
            >
              <option value="All">All Exp</option>
              <option value="Fresher">0 - 1 Yr</option>
              <option value="1 - 2">1 - 2 Yrs</option>
              <option value="3 - 5">3 - 5 Yrs</option>
              <option value="5 - 8">5 - 8 Yrs</option>
              <option value="8+">8+ Yrs</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Applications & Resumes Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* DESKTOP TABLE VIEW: Visible on md+ screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Resume Type & Source</th>
                <th className="py-3.5 px-4">Domain & Experience</th>
                <th className="py-3.5 px-4">Applied Role / Profile</th>
                <th className="py-3.5 px-4">Resume</th>
                <th className="py-3.5 px-4 text-right">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">
                        No candidate resumes match this filter.
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Try adjusting your search query, domain or experience filters, or upload a new candidate resume.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload First Resume</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((item) => {
                  const hasPdf = Boolean(item.pdfData || item.resumeUrl);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(item)}
                    >
                      {/* Candidate Name & Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-[11px] shrink-0 shadow-xs ${
                              item.avatarBg || "bg-blue-600"
                            }`}
                          >
                            {item.avatarLetter || "CD"}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 leading-tight block hover:text-blue-600 transition">
                              {item.candidateName}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {item.candidateEmail || `${item.candidateName.toLowerCase().replace(/\s+/g, "")}@example.com`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Resume Type & Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.isProfileResume ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 max-w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Profile Resume
                            </span>
                            <span className="text-[10px] text-slate-400 pl-0.5">Job Seeker Profile Data</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 max-w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              Applied Resume
                            </span>
                            <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1 pl-0.5">
                              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                              {item.company}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Domain & Experience */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/70 max-w-fit">
                            <Layers className="w-3 h-3 text-slate-500 shrink-0" />
                            {item.domain || "Full Stack Dev"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.experience || "1 - 2 Years"}
                          </span>
                        </div>
                      </td>

                      {/* Applied Role / Profile Position */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">
                            {item.position}
                          </span>
                          {item.isProfileResume ? (
                            <span className="text-[10px] text-slate-400">Profile Role</span>
                          ) : (
                            <span className="text-[10px] text-indigo-600 font-medium">Applied Post</span>
                          )}
                        </div>
                      </td>

                      {/* Resume Button */}
                      <td
                        className="py-3.5 px-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95 ${
                            hasPdf
                              ? item.isProfileResume
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                              : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                          title="Open Candidate Resume"
                        >
                          <FileText
                            className={`w-3.5 h-3.5 ${
                              hasPdf
                                ? item.isProfileResume
                                  ? "text-emerald-600"
                                  : "text-rose-600"
                                : "text-blue-600"
                            }`}
                          />
                          <span>{item.isProfileResume ? "Profile CV" : "Applied CV"}</span>
                          {hasPdf && (
                            <span
                              className={`text-[10px] px-1 py-0.2 rounded font-semibold ${
                                item.isProfileResume
                                  ? "bg-emerald-200/60 text-emerald-800"
                                  : "bg-rose-200/60 text-rose-800"
                              }`}
                            >
                              PDF
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Current Status */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                            item.status === "Shortlisted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.status === "New"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : item.status === "Reviewed"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : item.status === "Hired"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS VIEW: 100% width, ZERO horizontal scrolling (Hidden on Desktop) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredApps.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-700 text-sm">
                No candidate resumes match this filter.
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Try adjusting your search query, domain or experience filters, or upload a new candidate resume.
              </p>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload First Resume</span>
              </button>
            </div>
          ) : (
            filteredApps.map((item) => {
              const hasPdf = Boolean(item.pdfData || item.resumeUrl);

              return (
                <div
                  key={`mob-app-${item.id}`}
                  className="p-4 space-y-3 bg-white"
                >
                  {/* Top: Avatar + Candidate Name & Email + Status Pill */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs ${
                          item.avatarBg || "bg-blue-600"
                        }`}
                      >
                        {item.avatarLetter || "CD"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">
                          {item.candidateName}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.candidateEmail || `${item.candidateName.toLowerCase().replace(/\s+/g, "")}@example.com`}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === "Shortlisted"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.status === "New"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.status === "Reviewed"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : item.status === "Hired"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Badges: Role, Domain, Experience & Type */}
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800">
                      <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{item.position}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                      <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{item.domain || "Full Stack Dev"}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{item.experience || "Fresher"}</span>
                    </span>

                    {item.isProfileResume ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Profile CV
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.company}
                      </span>
                    )}
                  </div>

                  {/* Actions: View / Open Resume */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(item)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 ${
                        hasPdf
                          ? item.isProfileResume
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{item.isProfileResume ? "View Profile CV" : "View Applied CV"}</span>
                      {hasPdf && (
                        <span className="text-[10px] px-1 py-0.2 rounded font-semibold bg-white/80">
                          PDF
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Upload Resume Modal */}
      <UploadResumeModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        companies={companies}
        onSuccess={(newApp) => {
          if (onAddApplication) {
            onAddApplication(newApp);
          }
          setSelectedCandidate(newApp);
          setIsDetailModalOpen(true);
        }}
      />

      {/* Resume Detail & PDF Preview Modal (Super Admin View - Non-editable Audit) */}
      <ResumeDetailModal
        application={selectedCandidate}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCandidate(null);
        }}
      />
    </div>
  );
}
