"use client";

import React, { useState, useEffect, useRef } from "react";
import { downloadCandidateResume } from "@/lib/resumeDownload";
import {
  X,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  Layers,
  Clock,
  Download,
  ExternalLink,
  Tag,
  CheckCircle2,
  Shield,
  Eye,
  Printer,
  Copy,
  Check,
  Sparkles,
  GraduationCap,
  Globe,
  Award,
  Share2,
  MapPin,
  ShieldCheck,
  Maximize2,
  ChevronDown,
} from "lucide-react";
import { ApplicationItem } from "./RecentApplications";
import { fetchAdminApplicationResume } from "@/lib/api";

interface ResumeDetailModalProps {
  application: ApplicationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: ApplicationItem["status"]) => void;
}

const RESUME_STATUS_OPTIONS = [
  {
    value: "New",
    label: "Status: Applied",
    dotColor: "bg-blue-500",
    badgeBg: "bg-blue-50/80",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200/80",
    hoverBg: "hover:bg-blue-50/70",
  },
  {
    value: "Reviewed",
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
    value: "Interview",
    label: "Status: Interview",
    dotColor: "bg-purple-500",
    badgeBg: "bg-purple-50/80",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200/80",
    hoverBg: "hover:bg-purple-50/70",
  },
  {
    value: "Hired",
    label: "Status: Hired",
    dotColor: "bg-emerald-500",
    badgeBg: "bg-emerald-50/80",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200/80",
    hoverBg: "hover:bg-emerald-50/70",
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

function ResumeStatusDropdown({
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
    RESUME_STATUS_OPTIONS.find((opt) => {
      const cur = (currentStatus || "").toLowerCase();
      const val = opt.value.toLowerCase();
      if (cur === val) return true;
      if (cur === "applied" && val === "new") return true;
      if (cur === "reviewing" && val === "reviewed") return true;
      return false;
    }) || RESUME_STATUS_OPTIONS[0];

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
        <div className="absolute left-0 sm:left-auto sm:right-0 bottom-full mb-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
            Update Status
          </div>
          <div className="space-y-0.5 mt-0.5">
            {RESUME_STATUS_OPTIONS.map((opt) => {
              const isSelected =
                opt.value.toLowerCase() === (currentStatus || "").toLowerCase() ||
                ((currentStatus || "").toLowerCase() === "applied" && opt.value === "New") ||
                ((currentStatus || "").toLowerCase() === "reviewing" && opt.value === "Reviewed");
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

export default function ResumeDetailModal({
  application,
  isOpen,
  onClose,
  onUpdateStatus,
}: ResumeDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"document" | "profile">("profile");
  const [loadedPdf, setLoadedPdf] = useState<string>("");
  const [loadingPdf, setLoadingPdf] = useState<boolean>(false);

  const initialPdf = application?.pdfData || application?.resumeUrl || "";
  const pdfSource = loadedPdf || initialPdf || "";
  const hasPdf = Boolean(application?.hasPdf || initialPdf || loadedPdf);

  useEffect(() => {
    if (!isOpen || !application) return;

    if (initialPdf) {
      setLoadedPdf(initialPdf);
      setActiveTab("document");
      return;
    }

    if (application.hasPdf || application.fileName) {
      setLoadingPdf(true);
      fetchAdminApplicationResume(application.id)
        .then((res) => {
          if (res?.success && (res.pdfData || res.resumeUrl)) {
            setLoadedPdf(res.pdfData || res.resumeUrl || "");
            setActiveTab("document");
          } else {
            setActiveTab("profile");
          }
        })
        .catch(() => setActiveTab("profile"))
        .finally(() => setLoadingPdf(false));
    } else {
      setActiveTab("profile");
    }
  }, [isOpen, application?.id, initialPdf]);

  if (!isOpen || !application) return null;

  const candidateName = application.candidateName || "Candidate";
  const position = application.position || "Applicant";
  const company = application.company || "Company";
  const email = application.candidateEmail || "";
  const phone = application.candidatePhone || "";
  const experience = application.experience || "1-3 Years";
  const domain = application.domain || position;
  const appliedDate = application.appliedOn || "Recently";
  const skills =
    application.skills && application.skills.length > 0
      ? application.skills
      : ["Problem Solving", "Team Collaboration", "Domain Proficiency", "Communication"];
  const education =
    application.education ||
    application.highestQualification ||
    application.course ||
    "Bachelor of Technology / Graduate";
  const university = application.university || "Accredited University / Institute";
  const passingYear = application.passingYear || "Graduated";
  const bio =
    application.bio ||
    `Motivated and detail-oriented professional with specialized focus in ${domain}. Demonstrated capability in applying hands-on industry practices, proactive problem-solving, and cross-functional team delivery for high-impact organizational outcomes.`;

  const handleCopySummary = () => {
    const textToCopy = `Candidate: ${candidateName}\nPosition: ${position} (${company})\nEmail: ${email}\nPhone: ${phone}\nExperience: ${experience}\nSkills: ${skills.join(
      ", "
    )}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Specific CSS to ensure clean 1-page paper resume output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-digital-resume, #printable-digital-resume * {
            visibility: visible !important;
          }
          #printable-digital-resume {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 24px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shrink-0">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md shrink-0 ${
                  application.avatarBg || "bg-blue-600"
                }`}
              >
                {application.avatarLetter || candidateName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {candidateName}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      application.status === "Shortlisted"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : application.status === "New"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        : application.status === "Reviewed"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : application.status === "Hired"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    }`}
                  >
                    {application.status}
                  </span>
                  {application.isProfileResume ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <User className="w-2.5 h-2.5" />
                      Job Seeker Profile Resume
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5" />
                      Job Application Resume
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-white">{position}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Building2 className="w-3 h-3" />
                    {application.isProfileResume ? "Direct Profile Data" : company}
                  </span>
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {/* Print / Save PDF Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                title="Print or Save Resume as PDF"
              >
                <Printer className="w-3.5 h-3.5 text-blue-300" />
                <span className="hidden sm:inline">Print / Save PDF</span>
              </button>

              {/* Direct PDF Download if attached */}
              <button
                type="button"
                onClick={() => downloadCandidateResume(application)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                title="Download Candidate Resume PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>

              {/* Copy Summary */}
              <button
                type="button"
                onClick={handleCopySummary}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Copy candidate details"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                type="button"
                aria-label="Close modal"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader View Toggle Pills (If PDF is attached, allow switching between Original PDF and Digital Profile Resume) */}
          <div className="px-6 py-2.5 bg-slate-100/90 border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {hasPdf && (
                <button
                  type="button"
                  onClick={() => setActiveTab("document")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "document"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Attached PDF Document</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "profile"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Digital Resume</span>
                {!hasPdf && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 font-bold ml-1">
                    Verified
                  </span>
                )}
              </button>
            </div>

            <span className="text-[11px] font-medium text-slate-500 hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>AddyJob Verified Credentials</span>
            </span>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F8FAFC]">
            {/* VIEW 1: RAW ATTACHED PDF VIEW */}
            {activeTab === "document" && hasPdf ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {application.fileName || `${candidateName}_Resume.pdf`}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const win = window.open();
                        if (win) {
                          win.document.write(
                            `<iframe src="${pdfSource}" style="width:100%; height:100%; border:none;"></iframe>`
                          );
                        }
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Fullscreen</span>
                    </button>
                  </div>
                </div>

                <div className="w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-inner min-h-[540px] flex items-center justify-center">
                  {loadingPdf ? (
                    <div className="flex flex-col items-center gap-3 text-white">
                      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-semibold text-slate-300">Loading verified resume document...</p>
                    </div>
                  ) : (
                    <iframe
                      src={pdfSource}
                      className="w-full h-[540px] rounded-2xl bg-white border-0"
                      title={`${candidateName} Resume Document`}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* VIEW 2: INTERACTIVE DIGITAL RESUME (ALWAYS AVAILABLE FOR ALL CANDIDATES) */
              <div
                id="printable-digital-resume"
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 text-slate-800 max-w-3xl mx-auto"
              >
                {/* Resume Header Section */}
                <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {candidateName}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified Profile
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-indigo-600">
                      {application.headline || position}
                    </p>

                    <p className="text-xs text-slate-500">
                      Applied for:{" "}
                      <strong className="text-slate-800 font-semibold">{position}</strong> at{" "}
                      <strong className="text-slate-800 font-semibold">{company}</strong>
                    </p>
                  </div>

                  {/* Candidate Reference Badge */}
                  <div className="text-right sm:text-right text-xs space-y-1">
                    <span className="inline-block px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                      ID: ADY-{application.id.slice(-6).toUpperCase()}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Applied on {appliedDate}
                    </p>
                  </div>
                </div>

                {/* Contact Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2 hover:text-blue-600 transition truncate"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{email}</span>
                    </a>
                  )}

                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="flex items-center gap-2 hover:text-blue-600 transition truncate"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{phone}</span>
                    </a>
                  )}

                  <div className="flex items-center gap-2 text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">
                      {application.location || "Delhi NCR / India"}
                    </span>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Professional Profile &amp; Summary</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {bio}
                  </p>
                </div>

                {/* Core Competencies & Skills */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>Skills &amp; Core Competencies</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-indigo-800 text-xs font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Employment / Application History */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Work Experience &amp; Candidacy History</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {position}
                        </h4>
                        <p className="text-xs text-indigo-600 font-semibold">
                          {company}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        Experience Level:{" "}
                        <span className="text-slate-800">{experience}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      Active candidate applicant evaluated for organizational fit, technical
                      competency, and project alignment. Current status:{" "}
                      <strong className="text-slate-900">{application.status}</strong>.
                    </p>
                  </div>
                </div>

                {/* Education & Qualifications */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Education &amp; Qualifications</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-900">{education}</h4>
                      <p className="text-xs text-slate-500">{university}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                      Batch: {passingYear}
                    </span>
                  </div>
                </div>

                {/* Languages & Additional Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Languages
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {application.languages || "English, Hindi"}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Target Domain
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {domain}
                    </span>
                  </div>
                </div>

                {/* Official Verification Seal Footnote */}
                <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      Generated &amp; Authenticated via AddyJob Talent Recruitment Network
                    </span>
                  </div>
                  <span>Confidential Recruiter Document</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            {onUpdateStatus ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Update Status:</span>
                <ResumeStatusDropdown
                  currentStatus={application.status}
                  onSelect={(newStatus) =>
                    onUpdateStatus(application.id, newStatus as ApplicationItem["status"])
                  }
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Super Admin Candidate View (Audit &amp; Monitoring)</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Resume</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
