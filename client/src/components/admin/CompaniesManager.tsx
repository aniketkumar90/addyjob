"use client";

import React, { useState } from "react";
import {
  Building2,
  Check,
  X,
  Search,
  Eye,
  Mail,
  MapPin,
  Phone,
  Globe,
  Briefcase,
  Users,
  FileText,
  Shield,
  ExternalLink,
  KeyRound,
  AlertTriangle,
  Send,
} from "lucide-react";

import CompanySubAdminView from "./CompanySubAdminView";
import CompanyPermissionsModal from "./CompanyPermissionsModal";
import { JobPosting } from "./JobsModerator";
import { ApplicationItem } from "./RecentApplications";
import { CompanyPermissions } from "@/lib/api";

export interface CompanyRecord {
  id: string;
  name: string;
  email: string;
  location: string;
  plan: string;
  status: "Approved" | "Pending" | "Rejected";
  submittedOn: string;
  logoBg: string;
  logoLetter: string;
  phone?: string;
  gstNumber?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  userId?: string;
  activeJobs?: number;
  permissions?: CompanyPermissions;
  rejectionReason?: string;
  aboutCompany?: string;
  tagline?: string;
  bio?: string;
  culture?: string[];
  perks?: string[];
  logo?: string;
  profileImage?: string;
  bannerImage?: string;
}

interface CompaniesManagerProps {
  companies: CompanyRecord[];
  jobs?: JobPosting[];
  applications?: ApplicationItem[];
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string, reason?: string) => void;
  onUpdateCompany?: (updatedCompany: CompanyRecord) => void;
}

export default function CompaniesManager({
  companies,
  jobs = [],
  applications = [],
  onApprove,
  onReject,
  onUpdateCompany,
}: CompaniesManagerProps) {
  const [filter, setFilter] = useState<"ALL" | "Pending" | "Approved" | "Rejected">("ALL");
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecord | null>(null);
  const [permissionsModalCompany, setPermissionsModalCompany] = useState<CompanyRecord | null>(null);
  const [rejectionModalCompany, setRejectionModalCompany] = useState<CompanyRecord | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState("");
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const filteredCompanies = companies.filter((c) => {
    const matchesFilter = filter === "ALL" || c.status === filter;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      (c.userId && c.userId.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const pendingCount = companies.filter((c) => c.status === "Pending").length;

  const isRevoking = rejectionModalCompany?.status === "Approved";

  const rejectionModalNode = rejectionModalCompany && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => {
        if (!isSubmittingReject) {
          setRejectionModalCompany(null);
          setRejectionReasonText("");
        }
      }}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Modal Header */}
        <div className="bg-gradient-to-r from-rose-50 via-red-50 to-rose-100/50 p-3.5 sm:p-4 border-b border-rose-100 flex items-start gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-200/60 px-2 py-0.5 rounded-full shrink-0">
                {isRevoking ? "Action: Revoke" : "Action: Rejection"}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!isSubmittingReject) {
                    setRejectionModalCompany(null);
                    setRejectionReasonText("");
                  }
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-white/60 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5 truncate">
              {isRevoking ? "Revoke Company Verification" : "Reject Company Verification"}
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-tight">
              {isRevoking
                ? `Revoking verification for ${rejectionModalCompany.name}. Reason will be sent via email.`
                : `Explain the reason for rejecting ${rejectionModalCompany.name}. Sent via email and shown on dashboard.`}
            </p>
          </div>
        </div>

        {/* Scrollable Compact Modal Body */}
        <div className="p-3.5 sm:p-4 space-y-3 text-xs overflow-y-auto flex-1 scrollbar-thin">
          {/* Recipient Details Pill */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
            <span className="text-slate-500 font-semibold">Recipient:</span>
            <span className="font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">{rejectionModalCompany.name}</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[160px] sm:max-w-none">
              <Mail className="w-2.5 h-2.5 text-rose-500 shrink-0" />
              <span className="truncate">{rejectionModalCompany.email}</span>
            </span>
            {rejectionModalCompany.userId && (
              <>
                <span className="text-slate-300 hidden xs:inline">•</span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-200/70 px-1 py-0.2 rounded hidden xs:inline">
                  {rejectionModalCompany.userId}
                </span>
              </>
            )}
          </div>

          {/* Quick Preset Reason Chips */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Quick Reason Presets (Click to insert)
            </label>
            <div className="flex flex-wrap gap-1">
              {[
                "Invalid or unverifiable GSTIN number",
                "Missing or inaccessible official company website",
                "Incomplete company profile & contact details",
                "Unverifiable business location / registered address",
                "Duplicate company account / suspicious application",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRejectionReasonText(preset)}
                  className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 text-slate-700 text-[10px] sm:text-[11px] font-medium transition cursor-pointer text-left leading-snug"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Textarea */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isRevoking ? "Revocation Reason / Message" : "Rejection Reason / Message"} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Enter detailed reason (e.g. Your GSTIN could not be verified with govt portal. Please provide valid business registration)..."
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              className="w-full p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-hidden resize-none leading-relaxed"
            />
          </div>

          {/* Notice Banner */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-2 text-[10px] sm:text-[11px] leading-snug">
            <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Official notification will be emailed to <strong className="font-semibold">{rejectionModalCompany.email}</strong> and reflected in red on company dashboard.
            </span>
          </div>
        </div>

        {/* Modal Footer (Responsive & Compact) */}
        <div className="p-3 sm:p-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            disabled={isSubmittingReject}
            onClick={() => {
              setRejectionModalCompany(null);
              setRejectionReasonText("");
            }}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50 text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmittingReject || !rejectionReasonText.trim()}
            onClick={async () => {
              if (!rejectionReasonText.trim()) return;
              setIsSubmittingReject(true);
              try {
                await onReject(
                  rejectionModalCompany.id,
                  rejectionModalCompany.name,
                  rejectionReasonText.trim()
                );
                if (selectedCompany && selectedCompany.id === rejectionModalCompany.id) {
                  const updated = {
                    ...selectedCompany,
                    status: "Rejected" as const,
                    rejectionReason: rejectionReasonText.trim(),
                  };
                  setSelectedCompany(updated);
                  if (onUpdateCompany) onUpdateCompany(updated);
                }
                setRejectionModalCompany(null);
                setRejectionReasonText("");
              } finally {
                setIsSubmittingReject(false);
              }
            }}
            className="flex-1 sm:flex-initial px-4 py-1.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/25 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingReject ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{isRevoking ? "Revoke Access" : "Send Rejection"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Render Sub-Super Admin Company Portal if a company is selected
  if (selectedCompany) {
    return (
      <>
        <CompanySubAdminView
          company={selectedCompany}
          allJobs={jobs}
          allApplications={applications}
          onBack={() => setSelectedCompany(null)}
          onApprove={(id, name) => {
            onApprove(id, name);
            if (selectedCompany && selectedCompany.id === id) {
              const updated = {
                ...selectedCompany,
                status: "Approved" as const,
                rejectionReason: "",
              };
              setSelectedCompany(updated);
              if (onUpdateCompany) onUpdateCompany(updated);
            }
          }}
          onReject={(id, name) => {
            const comp = companies.find((c) => c.id === id) || selectedCompany;
            setRejectionModalCompany(comp);
            setRejectionReasonText(comp.rejectionReason || "");
          }}
          onOpenPermissions={() => setPermissionsModalCompany(selectedCompany)}
        />
        {permissionsModalCompany && (
          <CompanyPermissionsModal
            isOpen={Boolean(permissionsModalCompany)}
            company={permissionsModalCompany}
            onClose={() => setPermissionsModalCompany(null)}
            onPermissionsUpdated={(newPermissions) => {
              const updated = {
                ...permissionsModalCompany,
                permissions: newPermissions,
              };
              if (selectedCompany && selectedCompany.id === permissionsModalCompany.id) {
                setSelectedCompany(updated);
              }
              if (onUpdateCompany) {
                onUpdateCompany(updated);
              }
            }}
          />
        )}
        {rejectionModalNode}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls (Styled exactly like Image 1) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Company Management
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Review company verification requests, plans, and job posting permissions.
            </p>
          </div>

          {/* Status Filter Tabs (Pill wrapper matching Image 1) */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 no-scrollbar">
            {(["ALL", "Pending", "Approved", "Rejected"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  filter === tab
                    ? "bg-white text-[#7C3AED] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab}</span>
                {tab === "Pending" && pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company name, email or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
          />
        </div>
      </div>

      {/* Companies List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        {/* DESKTOP TABLE VIEW: Visible on md+ screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Active Plan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Company Info</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No companies found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        {c.logo || c.profileImage ? (
                          <img
                            src={c.logo || c.profileImage}
                            alt={c.name}
                            className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs ${c.logoBg}`}
                          >
                            {c.logoLetter}
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 leading-tight">
                              {c.name}
                            </span>
                            {c.userId && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                                {c.userId}
                              </span>
                            )}
                          </div>
                          {c.email && (
                            <span className="text-xs text-slate-500 flex items-center gap-1 font-normal">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{c.email}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {c.location}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border whitespace-nowrap ${
                          (c.plan || "").toLowerCase().includes("enterprise") || (c.plan || "").toLowerCase().includes("scale")
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : (c.plan || "").toLowerCase().includes("pro")
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {c.plan || "Basic Plan"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                          c.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : c.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* View Details & Manual Permissions Action Buttons */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCompany(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#7C3AED] bg-[#EDE9FE] hover:bg-[#DDD6FE] active:scale-95 rounded-xl transition cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPermissionsModalCompany(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 active:scale-95 rounded-xl transition cursor-pointer shadow-xs"
                          title="Manage company permissions manually"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Permissions</span>
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {c.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onApprove(c.id, c.name)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setRejectionModalCompany(c);
                              setRejectionReasonText(c.rejectionReason || "");
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {c.status === "Approved" ? (
                            <button
                              onClick={() => {
                                setRejectionModalCompany(c);
                                setRejectionReasonText(c.rejectionReason || "");
                              }}
                              className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                            >
                              Revoke Access
                            </button>
                          ) : (
                            <button
                              onClick={() => onApprove(c.id, c.name)}
                              className="text-xs text-emerald-600 hover:underline font-medium cursor-pointer"
                            >
                              Re-approve
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS VIEW: 100% width, ZERO horizontal scrolling (Hidden on Desktop) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredCompanies.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700 text-sm">No companies found</p>
              <p className="text-xs text-slate-400 mt-1">
                No companies match your search or filter criteria.
              </p>
            </div>
          ) : (
            filteredCompanies.map((c) => (
              <div key={`mob-comp-${c.id}`} className="p-4 space-y-3 bg-white">
                {/* Header: Logo + Company Name & Code + Status */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {c.logo || c.profileImage ? (
                      <img
                        src={c.logo || c.profileImage}
                        alt={c.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs ${c.logoBg}`}
                      >
                        {c.logoLetter}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">
                          {c.name}
                        </h4>
                        {c.userId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono shrink-0">
                            {c.userId}
                          </span>
                        )}
                      </div>
                      {c.email && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 truncate mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      c.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : c.status === "Pending"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Details Badges: Location & Plan */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.location || "Location not specified"}</span>
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                      (c.plan || "").toLowerCase().includes("enterprise") || (c.plan || "").toLowerCase().includes("scale")
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : (c.plan || "").toLowerCase().includes("pro")
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {c.plan || "Basic Plan"}
                  </span>
                </div>

                {/* Action Buttons (All 3 in ONE LINE for Approved / Rejected) */}
                {c.status !== "Pending" ? (
                  <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedCompany(c)}
                      className="w-full py-2 px-1 text-[10.5px] font-bold text-[#7C3AED] bg-[#EDE9FE] hover:bg-[#DDD6FE] active:scale-[0.98] rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap"
                      title="View Company Details"
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>View Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPermissionsModalCompany(c)}
                      className="w-full py-2 px-1 text-[10.5px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 active:scale-[0.98] rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap"
                      title="Manage Company Permissions"
                    >
                      <KeyRound className="w-3.5 h-3.5 shrink-0" />
                      <span>Permissions</span>
                    </button>

                    {c.status === "Approved" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setRejectionModalCompany(c);
                          setRejectionReasonText(c.rejectionReason || "");
                        }}
                        className="w-full py-2 px-1 text-[10.5px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-[0.98] rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap"
                        title="Revoke Company Access"
                      >
                        <X className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        <span>Revoke Access</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onApprove(c.id, c.name)}
                        className="w-full py-2 px-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 active:scale-[0.98] rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap"
                        title="Re-approve Company"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        <span>Re-approve</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCompany(c)}
                        className="w-full py-2 px-2 text-xs font-bold text-[#7C3AED] bg-[#EDE9FE] hover:bg-[#DDD6FE] active:scale-[0.98] rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPermissionsModalCompany(c)}
                        className="w-full py-2 px-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 active:scale-[0.98] rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Permissions</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onApprove(c.id, c.name)}
                        className="w-full py-2 px-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectionModalCompany(c);
                          setRejectionReasonText(c.rejectionReason || "");
                        }}
                        className="w-full py-2 px-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 active:scale-[0.98] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {permissionsModalCompany && (
        <CompanyPermissionsModal
          isOpen={Boolean(permissionsModalCompany)}
          company={permissionsModalCompany}
          onClose={() => setPermissionsModalCompany(null)}
          onPermissionsUpdated={(newPermissions) => {
            if (onUpdateCompany) {
              onUpdateCompany({
                ...permissionsModalCompany,
                permissions: newPermissions,
              });
            }
          }}
        />
      )}

      {/* Rejection Reason & Email Notification Modal */}
      {rejectionModalNode}
    </div>
  );
}
