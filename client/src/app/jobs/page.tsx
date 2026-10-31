"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  fetchPublicJobs,
  getStoredUser,
  getLocalSavedJobs,
  toggleLocalSavedJob,
  getLocalAppliedJobs,
  fetchCandidateApplicationsFromDB,
} from "@/lib/api";
import { jobsList } from "@/data/jobsData";
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  Bookmark,
  Clock,
  Sparkles,
  Building2,
  ShieldCheck,
  Users,
  ArrowUpRight,
  ChevronDown,
  Check,
  CheckCircle2,
} from "lucide-react";

function JobsContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get("q") || "";
  const initialLocation = searchParams?.get("location") || "";
  const initialType = searchParams?.get("type") || "All";
  const initialFilter = searchParams?.get("filter") || "";

  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [selectedJobType, setSelectedJobType] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});
  const [appliedJobsMap, setAppliedJobsMap] = useState<Record<string, boolean>>({});
  const [onlySaved, setOnlySaved] = useState(initialFilter === "saved");

  useEffect(() => {
    let isMounted = true;

    const syncSavedMap = () => {
      const storedUser = getStoredUser();
      const uid = storedUser?.id || storedUser?.userId || storedUser?.email || "candidate";
      const saved = getLocalSavedJobs(uid);
      const map: Record<string, boolean> = {};
      saved.forEach((s: any) => {
        const id = s.id || s._id || s.jobId;
        if (id) map[id] = true;
      });
      setSavedJobs(map);
    };

    const syncAppliedMap = () => {
      const storedUser = getStoredUser();
      const uid = storedUser?.id || storedUser?.userId || storedUser?.email || "candidate";
      const applied = getLocalAppliedJobs(uid);
      const map: Record<string, boolean> = {};
      applied.forEach((a: any) => {
        const id = a.jobId || a.id || a._id;
        if (id) {
          map[String(id)] = true;
        }
        if (a.title && a.company) {
          map[`${String(a.title).toLowerCase().trim()}:::${String(a.company).toLowerCase().trim()}`] = true;
        }
      });
      setAppliedJobsMap(map);

      if (storedUser?.email || storedUser?.id) {
        fetchCandidateApplicationsFromDB(storedUser.email, storedUser.id, storedUser.phone)
          .then((dbApps) => {
            if (!isMounted || !Array.isArray(dbApps)) return;
            setAppliedJobsMap((prev) => {
              const nextMap = { ...prev };
              dbApps.forEach((a: any) => {
                const jId = (a.jobId && typeof a.jobId === "object") ? (a.jobId._id || a.jobId.id) : a.jobId;
                if (jId) nextMap[String(jId)] = true;
                if (a.position && a.company) {
                  nextMap[`${String(a.position).toLowerCase().trim()}:::${String(a.company).toLowerCase().trim()}`] = true;
                }
              });
              return nextMap;
            });
          })
          .catch(() => {});
      }
    };

    syncSavedMap();
    syncAppliedMap();

    const loadJobs = () => {
      fetchPublicJobs()
        .then((data) => {
          if (isMounted) {
            let combined = Array.isArray(data) && data.length > 0 ? data : jobsList;
            const storedUser = getStoredUser();
            const uid = storedUser?.id || storedUser?.userId || storedUser?.email || "candidate";
            const saved = getLocalSavedJobs(uid);
            const existingIds = new Set(combined.map((j: any) => String(j.id || j._id || j.jobId)));
            saved.forEach((s: any) => {
              const sId = String(s.id || s._id || s.jobId);
              if (sId && !existingIds.has(sId)) {
                combined = [s, ...combined];
                existingIds.add(sId);
              }
            });
            // Job seekers only see Active jobs approved by Super Admin
            const activeOnly = combined.filter((j: any) => !j.status || j.status === "Active");
            setJobs(activeOnly);
          }
        })
        .catch((err) => {
          console.error("Error fetching public jobs:", err);
          if (isMounted) setJobs(jobsList);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    };

    loadJobs();

    const handleAppliedSync = () => {
      syncAppliedMap();
    };

    const handleSavedSync = () => {
      syncSavedMap();
    };

    const handleJobChange = () => {
      loadJobs();
    };

    window.addEventListener("job_created", handleJobChange);
    window.addEventListener("job_updated", handleJobChange);
    window.addEventListener("applied_jobs_change", handleAppliedSync);
    window.addEventListener("job_application_submitted", handleAppliedSync);
    window.addEventListener("saved_jobs_change", handleSavedSync);

    return () => {
      isMounted = false;
      window.removeEventListener("job_created", handleJobChange);
      window.removeEventListener("job_updated", handleJobChange);
      window.removeEventListener("applied_jobs_change", handleAppliedSync);
      window.removeEventListener("job_application_submitted", handleAppliedSync);
      window.removeEventListener("saved_jobs_change", handleSavedSync);
    };
  }, []);

  const [jobTypeDropdownOpen, setJobTypeDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const jobTypeRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const jobTypes = [
    "All",
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Remote",
  ];

  const popularLocations = [
    "All Locations",
    "Bengaluru",
    "Remote",
    "Delhi NCR",
    "Mumbai",
    "Hyderabad",
    "Pune",
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (jobTypeRef.current && !jobTypeRef.current.contains(event.target as Node)) {
        setJobTypeDropdownOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchParams) {
      const q = searchParams.get("q");
      const loc = searchParams.get("location");
      const typ = searchParams.get("type");
      const filter = searchParams.get("filter");
      if (q !== null) setSearchQuery(q);
      if (loc !== null) setLocationQuery(loc);
      if (typ !== null) setSelectedJobType(typ);
      if (filter === "saved") {
        setOnlySaved(true);
      } else if (filter) {
        setOnlySaved(false);
      }
    }
  }, [searchParams]);

  const categories = ["ALL", "Engineering", "Design", "Marketing", "Product", "Finance", "HR"];

  const filteredJobs = jobs.filter((job) => {
    const jId = String(job.id || job._id || job.jobId || "");
    if (onlySaved && !savedJobs[jId]) {
      return false;
    }
    const jobCat = job.department || job.category || "";
    const matchesCategory =
      selectedCategory.toUpperCase() === "ALL" || jobCat.toLowerCase() === selectedCategory.toLowerCase();
    const tags = Array.isArray(job.tags) && job.tags.length > 0 ? job.tags : Array.isArray(job.skills) ? job.skills : [];
    const matchesSearch =
      !searchQuery ||
      (job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.company && job.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const loc = job.location || "";
    const wp = job.workplace || "";
    const matchesLocation =
      !locationQuery ||
      locationQuery.toLowerCase() === "all locations" ||
      loc.toLowerCase().includes(locationQuery.toLowerCase()) ||
      wp.toLowerCase().includes(locationQuery.toLowerCase());
    const typ = job.type || "";
    const matchesType =
      selectedJobType === "All" ||
      typ.toLowerCase() === selectedJobType.toLowerCase() ||
      wp.toLowerCase() === selectedJobType.toLowerCase();

    return matchesCategory && matchesSearch && matchesLocation && matchesType;
  });

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const storedUser = getStoredUser();
    const uid = storedUser?.id || storedUser?.userId || storedUser?.email || "candidate";
    const targetJob = jobs.find((j) => String(j.id || j._id || j.jobId) === String(id));
    if (targetJob) {
      const res = toggleLocalSavedJob(uid, targetJob);
      setSavedJobs((prev) => ({ ...prev, [id]: res.saved }));
    } else {
      setSavedJobs((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar activeTab="Jobs" />

      {/* Hero Banner Section */}
      <section className="relative z-30 bg-gradient-to-b from-[#F5F8FF] via-[#EDF3FE] to-[#F8FAFC] pt-4 pb-8 sm:pt-8 sm:pb-12 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ================= 1. MOBILE HERO DESIGN (Matching User Reference Exactly) ================= */}
          <div className="block lg:hidden">
            {/* Top Row: Left Content + Right Curved Office Frame */}
            <div className="flex items-start justify-between gap-2 pt-1 pb-3">
              {/* Left Column: Badge, Title & Subtitle */}
              <div className="flex-1 pr-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EBF3FE] text-[#1D68FE] border border-blue-200/70 mb-2 shadow-2xs">
                  <Sparkles className="w-3 h-3 fill-[#1D68FE]/20 text-[#1D68FE]" />
                  <span>10,000+ Opportunities</span>
                </div>

                {/* Headline */}
                <h1 className="text-[1.95rem] xs:text-3xl sm:text-4xl font-black text-[#0B1528] tracking-tight leading-[1.12]">
                  Find Your <br />
                  <span className="relative inline-block text-[#1D68FE]">
                    Dream Job
                    {/* Wavy Underline */}
                    <svg
                      className="absolute left-0 -bottom-1.5 w-full h-2.5 text-[#1D68FE] overflow-visible"
                      viewBox="0 0 160 10"
                      fill="none"
                    >
                      <path
                        d="M2 6 C 25 1, 50 9, 75 5 C 100 1, 125 9, 155 5"
                        stroke="#1D68FE"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed mt-2.5 max-w-[195px] xs:max-w-[220px]">
                  Explore top companies and get hired for a better tomorrow.
                </p>
              </div>

              {/* Right Column: Office Graphic with Floating Pills */}
              <div className="relative w-[138px] xs:w-[155px] sm:w-[175px] h-[178px] xs:h-[195px] sm:h-[215px] shrink-0">
                {/* Curved Office Container */}
                <div className="w-full h-full rounded-3xl overflow-hidden relative shadow-md border border-white/80">
                  <Image
                    src="/jobs-hero-office.jpg"
                    alt="Corporate office"
                    fill
                    priority
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />

                  {/* Frosted "Better Careers Brighter Futures" Card */}
                  <div className="absolute top-2 right-1.5 z-10 bg-white/75 backdrop-blur-md rounded-2xl p-2 shadow-sm border border-white/60 text-right select-none pointer-events-none">
                    <span
                      style={{ fontFamily: "var(--font-caveat), cursive" }}
                      className="block text-xs xs:text-sm font-bold text-slate-800 leading-tight"
                    >
                      Better
                    </span>
                    <span
                      style={{ fontFamily: "var(--font-caveat), cursive" }}
                      className="block text-xs xs:text-sm font-bold text-slate-800 leading-tight"
                    >
                      Careers
                    </span>
                    <span
                      style={{ fontFamily: "var(--font-caveat), cursive" }}
                      className="block text-xs xs:text-sm font-bold text-slate-800 leading-tight"
                    >
                      Brighter
                    </span>
                    <span
                      style={{ fontFamily: "var(--font-caveat), cursive" }}
                      className="block text-xs xs:text-sm font-bold text-slate-800 leading-tight"
                    >
                      Futures
                    </span>
                    {/* Arrow doodle */}
                    <svg className="w-3.5 h-3.5 ml-auto text-slate-600 mt-0.5" viewBox="0 0 20 20" fill="none">
                      <path d="M5 4 C 12 3, 16 8, 13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M10 12 L 13 15 L 15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Floating Google Pill */}
                <div className="absolute left-[-22px] xs:left-[-18px] bottom-10 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-100/90 whitespace-nowrap">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="text-[10px] font-bold text-slate-800">Software Engineer</span>
                </div>

                {/* Floating Spotify Pill */}
                <div className="absolute left-[-16px] xs:left-[-12px] bottom-2 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-100/90 whitespace-nowrap">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#1DB954] text-white flex items-center justify-center p-0.5 shrink-0">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">Product Designer</span>
                </div>
              </div>
            </div>

            {/* Mobile Search Card Container (Matches Screenshot Layout) */}
            <div className="mt-2.5 bg-white rounded-3xl p-3 border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] relative z-40">
              {/* Row 1: Search Input */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-slate-200/90 bg-white">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, company, or keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
              </div>

              {/* Row 2: Location + Job Type + Search Button */}
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mt-2.5">
                {/* Location Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                    className="w-full h-11 px-3 rounded-2xl border border-slate-200/90 bg-white flex items-center justify-between gap-1 text-left cursor-pointer hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {locationQuery || "Location"}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        locationDropdownOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>

                  {locationDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-52 max-h-72 overflow-y-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-100 p-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5">
                        Select Location
                      </div>
                      {popularLocations.map((loc) => {
                        const isSelected =
                          loc === "All Locations"
                            ? !locationQuery
                            : locationQuery.toLowerCase() === loc.toLowerCase();
                        return (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => {
                              setLocationQuery(loc === "All Locations" ? "" : loc);
                              setLocationDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 text-blue-600 font-bold"
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{loc}</span>
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 stroke-[2.5] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Job Type Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setJobTypeDropdownOpen(!jobTypeDropdownOpen)}
                    className="w-full h-11 px-3 rounded-2xl border border-slate-200/90 bg-white flex items-center justify-between gap-1 text-left cursor-pointer hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {selectedJobType === "All" ? "Job Type" : selectedJobType}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        jobTypeDropdownOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>

                  {jobTypeDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 max-h-72 overflow-y-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-100 p-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5">
                        Select Job Type
                      </div>
                      {jobTypes.map((type) => {
                        const isSelected = selectedJobType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setSelectedJobType(type);
                              setJobTypeDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 text-blue-600 font-bold"
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <span>{type === "All" ? "All Types" : type}</span>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 stroke-[2.5]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Blue Search Button */}
                <button
                  type="button"
                  className="w-11 h-11 rounded-2xl bg-[#1D68FE] hover:bg-blue-600 active:scale-95 text-white flex items-center justify-center transition shadow-sm cursor-pointer shrink-0"
                >
                  <Search className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* ================= 2. DESKTOP HERO DESIGN ================= */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-12 gap-6 items-center">
              {/* Left Column: Headline, Subtitle, 3 Feature Pills */}
              <div className="col-span-6 space-y-5 text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#EBF3FE] text-[#1D68FE] border border-blue-200/70 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 fill-[#1D68FE]/20 text-[#1D68FE]" />
                  <span>10,000+ Opportunities</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-[#0B1528] tracking-tight leading-[1.12]">
                  Find Your <br />
                  <span className="relative inline-block text-[#1D68FE]">
                    Dream Job
                    {/* Wavy Underline */}
                    <svg
                      className="absolute left-0 -bottom-2 w-full h-3 text-[#1D68FE] overflow-visible"
                      viewBox="0 0 180 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 7 C 30 1, 55 12, 85 6 C 115 1, 140 11, 175 6"
                        stroke="#1D68FE"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-slate-500 text-sm sm:text-base font-normal leading-relaxed max-w-md pt-1">
                  Explore top companies and get hired for a better tomorrow.
                </p>

                {/* 3 Feature Pills */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#1D68FE] flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Top Companies
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Verified Jobs
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs">
                    <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Quick Apply
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Office Backdrop with 3 Floating Cards */}
              <div className="col-span-6 relative w-full h-[380px] lg:h-[420px] rounded-3xl overflow-hidden shadow-lg border border-slate-200/80">
                <Image
                  src="/jobs-hero-office.jpg"
                  alt="Modern corporate office"
                  fill
                  priority
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/35 via-slate-900/15 to-transparent pointer-events-none" />

                {/* Top-Right Handwritten Callout */}
                <div className="absolute top-4 right-4 z-20 pointer-events-none select-none text-right">
                  <span
                    style={{ fontFamily: "var(--font-caveat), cursive" }}
                    className="block text-2xl sm:text-3xl font-bold text-slate-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] leading-none"
                  >
                    Better
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-caveat), cursive" }}
                    className="block text-2xl sm:text-3xl font-bold text-slate-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] leading-none"
                  >
                    Careers
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-caveat), cursive" }}
                    className="block text-2xl sm:text-3xl font-bold text-slate-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] leading-none"
                  >
                    Brighter
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-caveat), cursive" }}
                    className="block text-2xl sm:text-3xl font-bold text-slate-800 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] leading-none"
                  >
                    Futures
                  </span>
                  <svg className="w-10 h-10 ml-auto text-slate-700 drop-shadow-sm" viewBox="0 0 40 40" fill="none">
                    <path d="M10 8 C25 6, 32 16, 26 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M20 25 L 26 30 L 30 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Floating Job Card 1: Google */}
                <div className="absolute left-6 top-6 z-10 w-[250px] bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/70 flex items-center justify-between gap-3 hover:-translate-y-1 transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center p-2 shrink-0">
                      <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">Software Engineer</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Google</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        <span>Remote</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1D68FE] flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Floating Job Card 2: Spotify */}
                <div className="absolute right-8 top-36 z-10 w-[250px] bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/70 flex items-center justify-between gap-3 hover:-translate-y-1 transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1DB954] text-white flex items-center justify-center p-2 shrink-0 shadow-xs">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">Product Designer</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Spotify</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        <span>Bangalore</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1D68FE] flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Floating Job Card 3: Amazon */}
                <div className="absolute left-12 bottom-5 z-10 w-[250px] bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/70 flex items-center justify-between gap-3 hover:-translate-y-1 transition-transform">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center p-1 shrink-0">
                      <span className="text-xl font-black text-slate-900">a</span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">Data Analyst</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Amazon</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        <span>Hybrid</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1D68FE] flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Horizontal Search Bar */}
            <div className="mt-10 bg-white rounded-full p-2.5 shadow-[0_12px_40px_rgba(15,23,42,0.06)] border border-slate-200/90 flex items-center gap-2 max-w-6xl mx-auto relative z-40">
              {/* Field 1: Job Title */}
              <div className="flex items-center gap-3 px-4 py-2 flex-1">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Job Title / Keyword (e.g. Frontend Developer, Product Manager...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm text-slate-800 placeholder:text-slate-400 font-medium bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="w-px h-8 bg-slate-200 shrink-0" />

              {/* Field 2: Location */}
              <div ref={locationRef} className="relative flex items-center gap-3 px-4 py-2 w-64">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Location (e.g. Bengaluru, Remote...)"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onFocus={() => setLocationDropdownOpen(true)}
                    className="w-full text-sm text-slate-800 placeholder:text-slate-400 font-medium bg-transparent focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      locationDropdownOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {locationDropdownOpen && (
                  <div className="absolute left-2 top-full mt-2 w-60 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-100 p-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5">
                      Popular Locations
                    </div>
                    {popularLocations.map((loc) => {
                      const isSelected =
                        loc === "All Locations"
                          ? !locationQuery
                          : locationQuery.toLowerCase() === loc.toLowerCase();
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setLocationQuery(loc === "All Locations" ? "" : loc);
                            setLocationDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 text-blue-600 font-bold"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{loc}</span>
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="w-px h-8 bg-slate-200 shrink-0" />

              {/* Field 3: Job Type Dropdown */}
              <div ref={jobTypeRef} className="relative px-4 py-1.5 w-52">
                <button
                  type="button"
                  onClick={() => setJobTypeDropdownOpen(!jobTypeDropdownOpen)}
                  className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group py-1"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Briefcase className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-blue-600 transition-colors" />
                    <div className="truncate">
                      <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-none mb-1">
                        Job Type
                      </span>
                      <span className="block text-sm font-bold text-slate-800 truncate">
                        {selectedJobType === "All" ? "All Types" : selectedJobType}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      jobTypeDropdownOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {jobTypeDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-100 p-1.5 z-[100] animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5">
                      Select Job Type
                    </div>
                    {jobTypes.map((type) => {
                      const isSelected = selectedJobType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setSelectedJobType(type);
                            setJobTypeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition text-left cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 text-blue-600 font-bold"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span>{type === "All" ? "All Types" : type}</span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Search Jobs Button */}
              <button
                type="button"
                className="px-7 py-3.5 rounded-full bg-[#1D68FE] hover:bg-blue-600 active:scale-98 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Search Jobs</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Main Jobs Listing */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full relative z-10">
        {/* Category Filter Pills (Segmented Control matching Image 2) */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
            {categories.map((cat) => {
              const isActive = selectedCategory.toUpperCase() === cat.toUpperCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredJobs.length}</span> positions available
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs animate-pulse space-y-4"
              >
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/80 shadow-xs max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              {onlySaved ? <Bookmark className="w-8 h-8 text-blue-600" /> : <Briefcase className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {onlySaved ? "No Saved Jobs Yet" : "No Jobs Found"}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {onlySaved
                ? "You haven't bookmarked any jobs yet. Browse openings and tap the bookmark icon on any job to save it for quick access."
                : "No matching jobs were found in the database. Try adjusting your search keywords or clear your filters."}
            </p>
            {onlySaved && (
              <button
                type="button"
                onClick={() => setOnlySaved(false)}
                className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
              >
                <span>Browse All Jobs</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Jobs List Grid */
          <div>
            {onlySaved && (
              <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200/70 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
                    <Bookmark className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Your Saved Jobs</h3>
                    <p className="text-xs text-slate-500">
                      Showing {filteredJobs.length} bookmarked position{filteredJobs.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOnlySaved(false)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-blue-200 hover:border-blue-300 transition cursor-pointer shadow-2xs"
                >
                  View All Jobs
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJobs.map((job) => {
            const jId = job.id || job._id;
            const isSaved = !!savedJobs[jId];
            const isApplied = !!appliedJobsMap[String(jId)] || !!appliedJobsMap[`${String(job.title || "").toLowerCase().trim()}:::${String(job.company || "").toLowerCase().trim()}`];
            const jTags = Array.isArray(job.tags) && job.tags.length > 0 ? job.tags : Array.isArray(job.skills) ? job.skills : [];
            const jPosted = job.postedOn || job.posted || "Recently";
            const jWorkplace = job.workplace || "Remote";

            return (
              <Link
                key={jId}
                href={`/jobs/${jId}`}
                className="group block bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-blue-300 hover:shadow-[0_12px_30px_rgba(37,99,235,0.08)] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100 overflow-hidden shadow-2xs">
                        {job.logo || job.companyLogo ? (
                          <img
                            src={job.logo || job.companyLogo}
                            alt={job.company}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          (job.company || "C").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition flex items-center gap-1.5 truncate">
                          <span>{job.title}</span>
                        </h3>
                        <p className="text-sm font-semibold text-blue-600 mt-0.5 truncate">
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isApplied && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                          <span>Applied</span>
                        </span>
                      )}
                      <button
                        onClick={(e) => toggleSave(e, jId)}
                        aria-label="Save Job"
                        title={isSaved ? "Saved" : "Save Job"}
                        className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                          isSaved
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                        }`}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            isSaved ? "fill-blue-600 text-blue-600" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Location & Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location || "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {job.type} • {jWorkplace}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {jPosted}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <JobsContent />
    </Suspense>
  );
}
