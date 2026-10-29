"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  ExternalLink,
  Calendar,
  Sparkles,
  Award,
  Globe,
  DollarSign,
  ChevronDown,
  Clock,
  RotateCcw,
  Filter,
  Check,
  Send,
} from "lucide-react";
import { JobSeekerRecord } from "@/lib/api";
import BulkSendResumesModal from "./BulkSendResumesModal";
import { downloadCandidateResume } from "@/lib/resumeDownload";
import { CompanyRecord } from "./CompaniesManager";

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  icon: React.ReactNode;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
}

// Custom dropdown that always opens downwards, displays 6 items at once, and scrolls the rest
function CustomSelect({
  icon,
  value,
  options,
  onChange,
  placeholder = "Select...",
  searchable = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase().trim();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, searchTerm]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSearchTerm("");
        }}
        className={`w-full flex items-center justify-between pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 border rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-left ${
          isOpen
            ? "border-blue-500 bg-white ring-2 ring-blue-100 shadow-xs"
            : value !== "ALL"
            ? "border-blue-300 bg-blue-50/40 text-blue-900"
            : "border-slate-200 text-slate-800"
        }`}
      >
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </span>
        <span className="truncate pr-2 block font-medium">
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 pointer-events-none ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu - Always opens downwards (top-full mt-1.5), shows ~6 items then scrolls */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 py-1 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {searchable && options.length > 7 && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500 text-slate-800 placeholder:text-slate-400 font-medium"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* List items: max-h-[220px] gives exactly 6 items, remainder scrolls */}
          <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-50 overscroll-contain">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 italic">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface JobSeekersManagerProps {
  jobSeekers: JobSeekerRecord[];
  companies?: CompanyRecord[];
  onDeleteJobSeeker: (id: string, name: string) => void;
  onRefresh?: () => void;
  onViewResume?: (candidate: JobSeekerRecord) => void;
}

export default function JobSeekersManager({
  jobSeekers,
  companies,
  onDeleteJobSeeker,
  onRefresh,
  onViewResume,
}: JobSeekersManagerProps) {
  const [filter, setFilter] = useState<"ALL" | "WITH_RESUME" | "NO_RESUME" | "FRESHER" | "EXPERIENCED">("ALL");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [experienceFilter, setExperienceFilter] = useState<string>("ALL");
  const [skillFilter, setSkillFilter] = useState<string>("ALL");
  const [selectedCandidate, setSelectedCandidate] = useState<JobSeekerRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Dynamic extraction of unique roles from candidates + standard industry roles
  const allRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    jobSeekers.forEach((c) => {
      if (c.targetRole && c.targetRole.trim()) rolesSet.add(c.targetRole.trim());
      if (c.headline && c.headline.trim() && c.headline.trim().length <= 35) {
        rolesSet.add(c.headline.trim());
      }
    });

    const standardRoles = [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Mobile App Developer",
      "UI/UX Designer",
      "Data Scientist / Analyst",
      "DevOps Engineer",
      "Quality Assurance (QA)",
      "Product Manager",
      "Human Resources (HR)",
      "Sales & Business Development",
    ];
    standardRoles.forEach((r) => rolesSet.add(r));
    return Array.from(rolesSet).sort((a, b) => a.localeCompare(b));
  }, [jobSeekers]);

  // Dynamic extraction of unique skills from candidates + standard tech skills
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    jobSeekers.forEach((c) => {
      (c.skills || []).forEach((s) => {
        if (s && s.trim()) skillsSet.add(s.trim());
      });
    });

    const standardSkills = [
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "JavaScript",
      "Python",
      "Java",
      "SQL",
      "MongoDB",
      "PostgreSQL",
      "Tailwind CSS",
      "HTML/CSS",
      "Figma",
      "AWS",
      "Docker",
      "Git",
    ];
    standardSkills.forEach((s) => skillsSet.add(s));
    return Array.from(skillsSet).sort((a, b) => a.localeCompare(b));
  }, [jobSeekers]);

  const roleOptions: DropdownOption[] = useMemo(
    () => [
      { value: "ALL", label: "All Roles / Positions" },
      ...allRoles.map((role) => ({ value: role, label: role })),
    ],
    [allRoles]
  );

  const experienceOptions: DropdownOption[] = useMemo(
    () => [
      { value: "ALL", label: "All Experience" },
      { value: "FRESHER", label: "Fresher (0 - 1 Year)" },
      { value: "1-2", label: "1 - 2 Years" },
      { value: "3-5", label: "3 - 5 Years" },
      { value: "5-8", label: "5 - 8 Years" },
      { value: "8+", label: "8+ Years" },
    ],
    []
  );

  const skillOptions: DropdownOption[] = useMemo(
    () => [
      { value: "ALL", label: "All Skills" },
      ...allSkills.map((sk) => ({ value: sk, label: sk })),
    ],
    [allSkills]
  );

  const getExpLabel = (val: string) => {
    switch (val) {
      case "FRESHER":
        return "Fresher (0 - 1 Yr)";
      case "1-2":
        return "1 - 2 Years";
      case "3-5":
        return "3 - 5 Years";
      case "5-8":
        return "5 - 8 Years";
      case "8+":
        return "8+ Years";
      default:
        return val;
    }
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    roleFilter !== "ALL" ||
    experienceFilter !== "ALL" ||
    skillFilter !== "ALL";

  const activeFiltersCount =
    (search.trim() ? 1 : 0) +
    (roleFilter !== "ALL" ? 1 : 0) +
    (experienceFilter !== "ALL" ? 1 : 0) +
    (skillFilter !== "ALL" ? 1 : 0) +
    (filter !== "ALL" ? 1 : 0);

  const resetAllFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setExperienceFilter("ALL");
    setSkillFilter("ALL");
    setFilter("ALL");
  };

  const filteredCandidates = useMemo(() => {
    return jobSeekers.filter((c) => {
      // 1. Status Filter Pills
      if (filter === "WITH_RESUME" && !c.resumeName) return false;
      if (filter === "NO_RESUME" && c.resumeName) return false;
      if (filter === "FRESHER") {
        const exp = (c.experience || "").toLowerCase();
        if (!exp.includes("fresher") && !exp.includes("0 year") && exp !== "0") return false;
      }
      if (filter === "EXPERIENCED") {
        const exp = (c.experience || "").toLowerCase();
        if (exp.includes("fresher") || exp.includes("0 year") || exp === "0" || !exp) return false;
      }

      // 2. Role Filter
      if (roleFilter !== "ALL") {
        const rLower = roleFilter.toLowerCase().trim();
        const targetRole = (c.targetRole || "").toLowerCase();
        const headline = (c.headline || "").toLowerCase();
        if (!targetRole.includes(rLower) && !headline.includes(rLower)) {
          return false;
        }
      }

      // 3. Experience Filter
      if (experienceFilter !== "ALL") {
        const exp = (c.experience || "").toLowerCase().trim();
        if (experienceFilter === "FRESHER") {
          const isFresher = exp.includes("fresher") || exp.includes("0 year") || exp === "0" || !exp;
          if (!isFresher) return false;
        } else if (experienceFilter === "1-2") {
          if (!exp.includes("1") && !exp.includes("2")) return false;
        } else if (experienceFilter === "3-5") {
          if (!exp.includes("3") && !exp.includes("4") && !exp.includes("5")) return false;
        } else if (experienceFilter === "5-8") {
          if (!exp.includes("5") && !exp.includes("6") && !exp.includes("7") && !exp.includes("8")) return false;
        } else if (experienceFilter === "8+") {
          if (
            !exp.includes("8") &&
            !exp.includes("9") &&
            !exp.includes("10") &&
            !exp.includes("lead") &&
            !exp.includes("principal") &&
            !exp.includes("senior")
          )
            return false;
        } else {
          if (!exp.includes(experienceFilter.toLowerCase())) return false;
        }
      }

      // 4. Skills Filter
      if (skillFilter !== "ALL") {
        const sLower = skillFilter.toLowerCase().trim();
        const hasSkill = (c.skills || []).some((s) => s.toLowerCase().includes(sLower));
        if (!hasSkill) return false;
      }

      // 5. Keyword Search query
      const q = search.toLowerCase().trim();
      if (!q) return true;

      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.headline && c.headline.toLowerCase().includes(q)) ||
        (c.targetRole && c.targetRole.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.university && c.university.toLowerCase().includes(q)) ||
        (c.course && c.course.toLowerCase().includes(q)) ||
        (c.skills && c.skills.some((s) => s.toLowerCase().includes(q))) ||
        (c.userId && c.userId.toLowerCase().includes(q))
      );
    });
  }, [jobSeekers, filter, roleFilter, experienceFilter, skillFilter, search]);

  const totalCount = jobSeekers.length;
  const withResumeCount = jobSeekers.filter((c) => Boolean(c.resumeName)).length;
  const fresherCount = jobSeekers.filter((c) => {
    const exp = (c.experience || "").toLowerCase();
    return exp.includes("fresher") || exp.includes("0 year") || exp === "0" || !exp;
  }).length;
  const experiencedCount = totalCount - fresherCount;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Job Seekers &amp; Candidates
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shrink-0">
                {hasActiveFilters || filter !== "ALL"
                  ? `${filteredCandidates.length} of ${totalCount} Shown`
                  : `${filteredCandidates.length} Registered`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Review registered candidates, filter by role, experience level, technical skills, and manage uploaded resumes.
            </p>
          </div>

          {/* Action Row: Filter Pills + Circular Send Resumes Button */}
          <div className="flex items-center gap-2 w-full lg:w-auto min-w-0">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto min-w-0 flex-1 lg:flex-initial bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 no-scrollbar">
              {[
                { id: "ALL", label: "All Candidates" },
                { id: "WITH_RESUME", label: "With Resume" },
                { id: "NO_RESUME", label: "No Resume" },
                { id: "FRESHER", label: "Freshers" },
                { id: "EXPERIENCED", label: "Experienced" },
              ].map((tab) => {
                const isActive = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id as any)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Circular Send Resumes Button on right side of filter */}
            <button
              type="button"
              onClick={() => setIsSendModalOpen(true)}
              className="w-9 h-9 min-w-9 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-110 active:scale-95 cursor-pointer shrink-0"
              title={`Send Candidate Resumes to Company ${filteredCandidates.length > 0 ? `(${filteredCandidates.length})` : ""}`}
              aria-label="Send Resumes to Company"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Candidates
            </span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{totalCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              Resumes Uploaded
            </span>
            <span className="text-xl font-black text-emerald-700 mt-0.5 block">{withResumeCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Freshers
            </span>
            <span className="text-xl font-black text-blue-700 mt-0.5 block">{fresherCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
              Experienced
            </span>
            <span className="text-xl font-black text-indigo-700 mt-0.5 block">{experiencedCount}</span>
          </div>
        </div>

        {/* Advanced Filters Bar (Search, Role, Experience, Skills) */}
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* 1. Search Query */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800 placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 transition cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 2. Role Filter */}
            <div className="lg:col-span-3">
              <CustomSelect
                icon={<Briefcase className="w-4 h-4" />}
                value={roleFilter}
                options={roleOptions}
                onChange={setRoleFilter}
                placeholder="All Roles / Positions"
                searchable={true}
              />
            </div>

            {/* 3. Experience Filter */}
            <div className="lg:col-span-2">
              <CustomSelect
                icon={<Clock className="w-4 h-4" />}
                value={experienceFilter}
                options={experienceOptions}
                onChange={setExperienceFilter}
                placeholder="All Experience"
                searchable={false}
              />
            </div>

            {/* 4. Skills Filter */}
            <div className="lg:col-span-3">
              <CustomSelect
                icon={<Sparkles className="w-4 h-4" />}
                value={skillFilter}
                options={skillOptions}
                onChange={setSkillFilter}
                placeholder="All Skills"
                searchable={true}
              />
            </div>
          </div>

          {/* Active Filter Badges & Reset Controls */}
          {(hasActiveFilters || filter !== "ALL") && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Active Filters:
                </span>

                {search.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                    <Search className="w-3 h-3 text-blue-500" />
                    <span>"{search.trim()}"</span>
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="hover:text-blue-900 ml-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {roleFilter !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
                    <Briefcase className="w-3 h-3 text-indigo-500" />
                    <span>Role: {roleFilter}</span>
                    <button
                      type="button"
                      onClick={() => setRoleFilter("ALL")}
                      className="hover:text-indigo-900 ml-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {experienceFilter !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>Exp: {getExpLabel(experienceFilter)}</span>
                    <button
                      type="button"
                      onClick={() => setExperienceFilter("ALL")}
                      className="hover:text-amber-900 ml-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {skillFilter !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>Skill: {skillFilter}</span>
                    <button
                      type="button"
                      onClick={() => setSkillFilter("ALL")}
                      className="hover:text-emerald-900 ml-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filter !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                    <span>Tab: {filter}</span>
                    <button
                      type="button"
                      onClick={() => setFilter("ALL")}
                      className="hover:text-slate-900 ml-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Candidates Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Target Role / Headline</th>
                <th className="py-3.5 px-4">Experience & Location</th>
                <th className="py-3.5 px-4">Skills</th>
                <th className="py-3.5 px-4">Resume Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">
                        No candidates match your filters
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        {hasActiveFilters || filter !== "ALL"
                          ? "Try clearing some search terms or adjusting the role, experience, or skill filters."
                          : "When candidates sign up on the platform, their details will appear here automatically."}
                      </p>
                      {(hasActiveFilters || filter !== "ALL") && (
                        <button
                          type="button"
                          onClick={resetAllFilters}
                          className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Clear All Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => {
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCandidate(c)}
                    >
                      {/* Candidate Avatar & Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs ${
                              c.avatarBg || "bg-blue-600"
                            }`}
                          >
                            {c.avatarLetter || "CD"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                                {c.name}
                              </span>
                              {c.userId && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-bold">
                                  {c.userId}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium whitespace-nowrap">
                                <span>•</span>
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{c.registeredOn || "Recent"}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {c.email}
                              </span>
                              {c.phone && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {c.phone}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Headline / Target Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">
                          {c.headline || c.targetRole || "Job Seeker"}
                        </span>
                      </td>

                      {/* Experience & Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                          <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                          {c.experience || "Fresher"}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {c.location || "India"}
                        </span>
                      </td>

                      {/* Skills */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.skills && c.skills.length > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCandidate(c);
                            }}
                            title={`Skills: ${c.skills.join(", ")} (Click to view candidate details)`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>
                              {c.skills.length} {c.skills.length === 1 ? "Skill" : "Skills"}
                            </span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            0 Skills
                          </span>
                        )}
                      </td>

                      {/* Resume Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.resumeName || c.resumeUrl ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCandidate(c);
                              }}
                              title={c.resumeName || "Click to view resume & details"}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Resume</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadCandidateResume(c);
                              }}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                              title="Download Resume"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            No Resume
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCandidate(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove candidate "${c.name}"?`)) {
                                onDeleteJobSeeker(c.id, c.name);
                              }
                            }}
                            className="w-8 h-8 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                            title="Delete candidate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* CANDIDATE DETAIL MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md ${
                    selectedCandidate.avatarBg || "bg-blue-600"
                  }`}
                >
                  {selectedCandidate.avatarLetter || "CD"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-white tracking-tight">
                      {selectedCandidate.name}
                    </h3>
                    {selectedCandidate.userId && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono border border-white/20">
                        {selectedCandidate.userId}
                      </span>
                    )}
                    {selectedCandidate.registeredOn && (
                      <span className="text-xs text-slate-300 flex items-center gap-1 font-medium ml-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                        <span>Registered: {selectedCandidate.registeredOn}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedCandidate.headline || selectedCandidate.targetRole || "Job Seeker"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Contact & Location Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                    <p className="text-xs font-bold text-slate-800 truncate">{selectedCandidate.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {selectedCandidate.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {selectedCandidate.location || "India"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Education Card */}
              <div className="p-4.5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Education & Qualification
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Highest Qualification</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedCandidate.highestQualification || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Course / Degree</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedCandidate.course || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Specialization</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedCandidate.specialization || "General"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">University / College</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedCandidate.university || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Passing Year</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedCandidate.passingYear || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Grade / Score</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {selectedCandidate.gradeScore ? `${selectedCandidate.gradeScore} (${selectedCandidate.gradingSystem || ""})` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills & Preferences */}
              <div className="p-4.5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Skills & Preferences
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">
                      Technical Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                        selectedCandidate.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">No skills listed</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Experience</span>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedCandidate.experience || "Fresher"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Expected Salary</span>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedCandidate.expectedSalary || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Languages</span>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedCandidate.languages || "English, Hindi"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume Card */}
              <div className="p-4.5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Uploaded Resume
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadCandidateResume(selectedCandidate)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                    title="Download Verified Resume PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Resume</span>
                  </button>
                </div>

                {selectedCandidate.resumeName || selectedCandidate.resumeUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 border border-rose-100">
                          PDF
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{selectedCandidate.resumeName || "Candidate_Resume.pdf"}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {selectedCandidate.resumeDate || "Uploaded recently"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PDF Preview if data exists */}
                    {selectedCandidate.resumeUrl && (
                      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                        <iframe
                          src={selectedCandidate.resumeUrl}
                          className="w-full h-[320px] rounded-2xl bg-white"
                          title="Candidate Resume Preview"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                    <p className="font-bold text-slate-600 text-xs">No resume uploaded yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Candidate has not uploaded their CV from their profile dashboard.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK SEND RESUMES MODAL */}
      <BulkSendResumesModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        candidates={filteredCandidates}
        companies={companies}
        activeFilterInfo={{
          role: roleFilter,
          experience: experienceFilter,
          skills: skillFilter,
          search,
        }}
        onSuccess={(count, compName) => {
          setToastMsg(`Successfully sent ${count} candidate resumes to ${compName}!`);
          setTimeout(() => setToastMsg(null), 4000);
          if (onRefresh) onRefresh();
        }}
      />

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
