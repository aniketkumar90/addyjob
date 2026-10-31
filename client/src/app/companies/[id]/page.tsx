"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchPublicCompanyById } from "@/lib/api";
import { companiesList, Company } from "@/data/companiesData";
import { jobsList, JobDetail } from "@/data/jobsData";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Calendar,
  Globe,
  Star,
  ShieldCheck,
  Search,
  Briefcase,
  ExternalLink,
  Layers,
  Sparkles,
  Sprout,
  Boxes,
  Triangle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Gift,
  HeartHandshake,
  Share2,
  UserPlus,
  Check,
  Award,
  ThumbsUp,
  FileText,
  Phone,
} from "lucide-react";

function CompanyDetailPageContent() {
  const params = useParams();
  const companyId = params?.id as string;

  const [company, setCompany] = useState<any>(null);
  const [allCompanyJobs, setAllCompanyJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [workplaceFilter, setWorkplaceFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"jobs" | "about" | "culture">("jobs");

  useEffect(() => {
    let isMounted = true;
    if (companyId) {
      setIsLoading(true);
      fetchPublicCompanyById(companyId)
        .then((data) => {
          if (!isMounted) return;
          let comp = data && data.company ? { ...data.company } : null;

          if (comp) {
            setCompany(comp);
            if (Array.isArray(data?.jobs)) {
              setAllCompanyJobs(data.jobs);
            }
          } else {
            const fallbackCompany =
              companiesList.find(
                (c) =>
                  c.id === companyId ||
                  c.name.toLowerCase().replace(/\s+/g, "-") === companyId?.toLowerCase()
              ) || companiesList[0];
            setCompany(fallbackCompany);
            const fallbackJobs = jobsList.filter(
              (j) =>
                j.company.toLowerCase().includes(fallbackCompany.name.toLowerCase()) ||
                fallbackCompany.name.toLowerCase().includes(j.company.toLowerCase())
            );
            setAllCompanyJobs(fallbackJobs);
          }
        })
        .catch((err) => {
          console.error("Error fetching company details:", err);
          if (isMounted) {
            const fallbackCompany =
              companiesList.find(
                (c) =>
                  c.id === companyId ||
                  c.name.toLowerCase().replace(/\s+/g, "-") === companyId?.toLowerCase()
              ) || companiesList[0];
            setCompany(fallbackCompany);
          }
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    const handleSync = () => {
      fetchPublicCompanyById(companyId)
        .then((data) => {
          if (!isMounted) return;
          const comp = data && data.company ? { ...data.company } : null;
          if (comp) {
            setCompany(comp);
            if (Array.isArray(data?.jobs)) {
              setAllCompanyJobs(data.jobs);
            }
          }
        })
        .catch(() => {});
    };

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("addyjob_channel");
      bc.onmessage = () => {
        handleSync();
      };
    } catch {}

    window.addEventListener("company_profile_updated", handleSync);
    window.addEventListener("job_created", handleSync);
    window.addEventListener("job_updated", handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener("company_profile_updated", handleSync);
      window.removeEventListener("job_created", handleSync);
      window.removeEventListener("job_updated", handleSync);
      if (bc) bc.close();
    };
  }, [companyId]);

  const filteredJobs = allCompanyJobs.filter((job) => {
    const titleMatch = (job.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const tags = Array.isArray(job.tags) ? job.tags : Array.isArray(job.skills) ? job.skills : [];
    const tagsMatch = tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const locMatch = (job.location || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = !searchTerm || titleMatch || tagsMatch || locMatch;

    const wp = job.workplace || "Remote";
    const matchesWorkplace =
      workplaceFilter.toUpperCase() === "ALL" ||
      wp.toLowerCase() === workplaceFilter.toLowerCase();

    return matchesSearch && matchesWorkplace;
  });

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      alert("Company profile link copied to clipboard!");
    }
  };

  const scrollToSection = (id: string, tab: "jobs" | "about" | "culture") => {
    setActiveTab(tab);
    const element = document.getElementById(id);
    if (element) {
      const navElement = document.querySelector("nav.sticky") || document.querySelector("nav");
      const navHeight = navElement ? navElement.getBoundingClientRect().height : 80;
      const offset = navHeight + 20;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
        <Navbar activeTab="Companies" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 rounded w-48 mb-8" />
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-200" />
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
        <Navbar activeTab="Companies" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full text-center">
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-slate-800">Company Not Found</h2>
            <p className="text-sm text-slate-500 mt-2">
              The company profile you are looking for does not exist or has been removed.
            </p>
            <Link
              href="/companies"
              className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
            >
              Browse All Companies
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const hasCulture = Array.isArray(company.culture) && company.culture.length > 0;
  const hasPerks = Array.isArray(company.perks) && company.perks.length > 0;
  const showCultureSection = hasCulture || hasPerks;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar activeTab="Companies" />

      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Companies</span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Companies</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">{company.name}</span>
          </div>
        </div>
      </div>

      {/* ================= REAL CORPORATE HEADER (LinkedIn / Glassdoor Style) ================= */}
      <section className="bg-white border-b border-slate-200/80 shadow-xs">
        {/* Sleek Brand Cover Banner (Displays uploaded bannerImage or graceful gradient) */}
        <div
          className="relative w-full h-44 sm:h-64 md:h-72 bg-slate-900 overflow-hidden"
          style={
            company.bannerImage
              ? {
                  backgroundImage: `url(${company.bannerImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!company.bannerImage && (
            <div className={`absolute inset-0 bg-gradient-to-r ${company.bannerGradient || "from-slate-900 via-indigo-950 to-slate-900"}`} />
          )}
          {/* Subtle geometric dot pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:20px_20px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Right Real Verification Pill */}
          <div className="absolute top-4 right-4 sm:right-8 flex items-center gap-2">
            {company.status === "Approved" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Employer</span>
              </span>
            ) : company.status === "Rejected" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-rose-500/30 text-rose-300 text-xs font-semibold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Verification Rejected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Verification</span>
              </span>
            )}
          </div>
        </div>

        {/* Profile Details Container (Details positioned below the banner) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          {/* Top Row: Avatar overlapping the banner edge + Action Buttons on the right */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-3 relative z-10">
            {/* High-fidelity Company Avatar Badge */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-4 border-white shadow-xl p-2 flex items-center justify-center shrink-0 overflow-hidden">
              {company.logo || company.profileImage ? (
                <img
                  src={company.logo || company.profileImage}
                  alt={company.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div
                  className={`w-full h-full rounded-xl ${company.iconBg} border border-slate-200/80 flex flex-col items-center justify-center shadow-xs select-none`}
                >
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                    {company.initials}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-slate-500 uppercase mt-0.5">
                    {company.name.split(" ")[1] || "CORP"}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2.5 self-start sm:self-end shrink-0 pt-1 sm:pt-0">

              {/* Visit Website */}
              <a
                href={`https://${company.website}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                title="Share Company Profile"
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 transition shadow-xs cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Company Details (100% Below the Banner on White Background) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {company.name}
              </h1>
              {company.status === "Approved" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
                  <span>Verified</span>
                </span>
              )}
              {company.industry && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                  {company.industry}
                </span>
              )}
            </div>

            {/* Company Tagline */}
            {company.tagline && (
              <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-3xl leading-relaxed">
                {company.tagline}
              </p>
            )}

            {/* Meta details strip with dot separators */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
              {company.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.location}</span>
                </span>
              )}
              {company.location && company.size && <span className="text-slate-300">•</span>}
              {company.size && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.size}</span>
                </span>
              )}
              {company.companyType && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>{company.companyType}</span>
                </>
              )}
              {company.founded && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Founded {company.founded}</span>
                  </span>
                </>
              )}
              {company.gstNumber && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50/80 border border-blue-200/60 text-blue-700 font-semibold">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>GST: {company.gstNumber}</span>
                  </span>
                </>
              )}
              {company.phone && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{company.phone}</span>
                  </span>
                </>
              )}
            </div>
          </div>



          {/* Section Navigation Tabs (Segmented Control matching Image 2) */}
          <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => scrollToSection("jobs-section", "jobs")}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 font-bold ${
                  activeTab === "jobs"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Open Jobs ({allCompanyJobs.length})
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("about-section", "about")}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 font-bold ${
                  activeTab === "about"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                About {company.name}
              </button>
              {showCultureSection && (
                <button
                  type="button"
                  onClick={() => scrollToSection("culture-section", "culture")}
                  className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 font-bold ${
                    activeTab === "culture"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Culture &amp; Benefits
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* Company Jobs Section (Primary Focal Area) */}
        <section id="jobs-section" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1 border border-blue-100">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{allCompanyJobs.length} Active Openings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Current Openings at {company.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Explore available roles. Click on any job post to review responsibilities, package, and apply directly.
              </p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder={`Search jobs at ${company.name} by title or skill...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm focus:outline-none placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Workplace Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
              {["ALL", "Remote", "Hybrid", "On-site"].map((tab) => {
                const isActive = workplaceFilter.toUpperCase() === tab.toUpperCase();
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setWorkplaceFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-white text-[#7C3AED] shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jobs List Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredJobs.map((job) => {
                const jId = job.id || job._id;
                const jCategory = job.department || job.category || "General";
                const jWorkplace = job.workplace || "Remote";
                const jTags = Array.isArray(job.tags) && job.tags.length > 0 ? job.tags : Array.isArray(job.skills) ? job.skills : [];
                const jPosted = job.postedOn || job.posted || "Recently";

                return (
                  <Link
                    key={jId}
                    href={`/jobs/${jId}`}
                    className="group bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-blue-400 hover:shadow-[0_12px_32px_rgba(37,99,235,0.08)] transition-all duration-200 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Top Row: Category & Workplace badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {jCategory}
                        </span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
                            jWorkplace === "Remote"
                              ? "bg-purple-50 text-purple-700 border border-purple-100"
                              : jWorkplace === "Hybrid"
                              ? "bg-sky-50 text-sky-700 border border-sky-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {jWorkplace}
                        </span>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {job.title}
                      </h3>

                      {/* Salary & Meta Row */}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-slate-700">
                        <span className="text-slate-900 font-extrabold text-sm sm:text-base text-blue-600">
                          {job.salary || "Competitive"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {job.experience || "2 - 5 yrs"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location || "Remote"}
                        </span>
                      </div>

                      {/* Skills Tags */}
                      {jTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {jTags.slice(0, 4).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Bottom CTA */}
                    <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Posted {jPosted}
                      </span>

                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all">
                        <span>View Details & Apply</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Open Positions Match Your Search</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching with different keywords or clear your workplace filter to view all available roles at {company.name}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setWorkplaceFilter("All");
                }}
                className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* About Company Card */}
        <section id="about-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>About {company.name}</span>
            </h2>
            {company.status === "Approved" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Business</span>
              </span>
            ) : null}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {company.about || company.aboutCompany || `${company.name} has not added a detailed description yet.`}
          </p>

          {/* Corporate Registration & Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">GST Number (GSTIN)</span>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-mono font-bold text-xs sm:text-sm text-slate-900">
                  {company.gstNumber || "Not Provided"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Official Contact Phone</span>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  {company.phone || "Not Disclosed"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Corporate Headquarters</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {company.location || "India"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Company Size</span>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  {company.size || "1-10 employees"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Incorporation Year</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  {company.founded ? `Founded ${company.founded}` : "Established Organization"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Official Website</span>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" />
                {company.website ? (
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-xs sm:text-sm text-blue-600 hover:underline truncate"
                  >
                    {company.website}
                  </a>
                ) : (
                  <span className="font-medium text-xs sm:text-sm text-slate-500">
                    Not Disclosed
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Culture & Perks */}
        {showCultureSection && (
          <section
            id="culture-section"
            className={`grid grid-cols-1 ${
              hasCulture && hasPerks ? "md:grid-cols-2" : "max-w-3xl"
            } gap-6 scroll-mt-24`}
          >
            {/* Culture & Values */}
            {hasCulture && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-blue-600" />
                  <span>Work Culture &amp; Values</span>
                </h3>
                <ul className="space-y-2.5">
                  {company.culture.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Perks & Benefits */}
            {hasPerks && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-emerald-600" />
                  <span>Employee Perks &amp; Benefits</span>
                </h3>
                <ul className="space-y-2.5">
                  {company.perks.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CompanyDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-sm font-semibold text-slate-500">
          Loading company details...
        </div>
      }
    >
      <CompanyDetailPageContent />
    </React.Suspense>
  );
}
