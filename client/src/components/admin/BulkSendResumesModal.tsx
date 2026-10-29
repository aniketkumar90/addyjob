"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Send,
  Building2,
  Users,
  Search,
  CheckCircle2,
  Briefcase,
  Clock,
  Sparkles,
  FileText,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Check,
  Download,
  Eye,
  Crown,
  Loader2,
  Filter,
} from "lucide-react";
import { JobSeekerRecord, fetchAdminCompanies, sendBulkResumesToCompany } from "@/lib/api";
import { CompanyRecord } from "./CompaniesManager";

interface BulkSendResumesModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: JobSeekerRecord[];
  companies?: CompanyRecord[];
  activeFilterInfo?: {
    role?: string;
    experience?: string;
    skills?: string;
    search?: string;
  };
  onSuccess?: (sentCount: number, companyName: string) => void;
}

export default function BulkSendResumesModal({
  isOpen,
  onClose,
  candidates,
  companies: initialCompanies,
  activeFilterInfo,
  onSuccess,
}: BulkSendResumesModalProps) {
  // Steps: 1 = Choose Quantity/Range, 2 = Choose Company, 3 = Review & Submit
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Companies state
  const [companiesList, setCompaniesList] = useState<CompanyRecord[]>(initialCompanies || []);
  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecord | null>(null);

  // Range & Selection state
  const totalAvailable = candidates.length;
  const initialEnd = Math.min(10, totalAvailable);
  const [rangeStart, setRangeStart] = useState<number>(totalAvailable > 0 ? 1 : 0);
  const [rangeEnd, setRangeEnd] = useState<number>(initialEnd);
  const [startInput, setStartInput] = useState<string>("1");
  const [endInput, setEndInput] = useState<string>(String(initialEnd));
  const [quantityInput, setQuantityInput] = useState<string>(String(initialEnd));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Submitting & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [sentResult, setSentResult] = useState<{ count: number; companyName: string } | null>(null);

  // Fetch companies if not supplied
  useEffect(() => {
    if (isOpen) {
      if (!initialCompanies || initialCompanies.length === 0) {
        fetchAdminCompanies().then((comps) => {
          if (Array.isArray(comps)) setCompaniesList(comps);
        });
      } else {
        setCompaniesList(initialCompanies);
      }
    }
  }, [isOpen, initialCompanies]);

  // Refs to prevent unexpected resets on background re-renders / intervals
  const prevIsOpenRef = useRef(false);
  const candidatesInitializedRef = useRef(false);

  // Initialize selected candidates ONLY when modal opens, NOT on every re-render while open
  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      candidatesInitializedRef.current = false;
      return;
    }

    // Modal was freshly opened (isOpen transitioned from false to true)
    if (!prevIsOpenRef.current) {
      prevIsOpenRef.current = true;
      setStep(1);
      setSelectedCompany(null);
      setCompanySearch("");
      setErrorMessage("");
      setIsSuccess(false);
      setSentResult(null);

      if (candidates.length > 0) {
        candidatesInitializedRef.current = true;
        const end = Math.min(10, candidates.length);
        setRangeStart(1);
        setRangeEnd(end);
        setStartInput("1");
        setEndInput(String(end));
        setQuantityInput(String(end));
        const initialSlice = candidates.slice(0, end).map((c) => c.id);
        setSelectedIds(new Set(initialSlice));
      }
    } else if (!candidatesInitializedRef.current && candidates.length > 0) {
      // If candidates arrived right after modal was opened, set initial selection without resetting step
      candidatesInitializedRef.current = true;
      const end = Math.min(10, candidates.length);
      setRangeStart(1);
      setRangeEnd(end);
      setStartInput("1");
      setEndInput(String(end));
      setQuantityInput(String(end));
      const initialSlice = candidates.slice(0, end).map((c) => c.id);
      setSelectedIds(new Set(initialSlice));
    }
  }, [isOpen, candidates]);

  // Apply Range selection helper (e.g. 1-10, 15-20)
  const applyRange = (start: number, end: number) => {
    if (totalAvailable === 0) return;
    const s = Math.max(1, Math.min(start, totalAvailable));
    const e = Math.max(s, Math.min(end, totalAvailable));
    setRangeStart(s);
    setRangeEnd(e);
    setStartInput(String(s));
    setEndInput(String(e));
    setQuantityInput(String(e - s + 1));
    const slice = candidates.slice(s - 1, e).map((c) => c.id);
    setSelectedIds(new Set(slice));
  };

  const handleQuantityChange = (valStr: string) => {
    const cleaned = valStr.replace(/[^0-9]/g, "");
    setQuantityInput(cleaned);
    if (!cleaned) return;
    const qty = parseInt(cleaned, 10);
    if (!isNaN(qty) && qty > 0) {
      const e = Math.min(qty, totalAvailable);
      setRangeStart(1);
      setRangeEnd(e);
      setStartInput("1");
      setEndInput(String(e));
      const slice = candidates.slice(0, e).map((c) => c.id);
      setSelectedIds(new Set(slice));
    }
  };

  const handleStartChange = (valStr: string) => {
    const cleaned = valStr.replace(/[^0-9]/g, "");
    setStartInput(cleaned);
    if (!cleaned) return;
    const s = parseInt(cleaned, 10);
    if (!isNaN(s) && s > 0) {
      const validStart = Math.min(s, totalAvailable);
      const validEnd = Math.max(validStart, rangeEnd);
      setRangeStart(validStart);
      setRangeEnd(validEnd);
      setEndInput(String(validEnd));
      setQuantityInput(String(validEnd - validStart + 1));
      const slice = candidates.slice(validStart - 1, validEnd).map((c) => c.id);
      setSelectedIds(new Set(slice));
    }
  };

  const handleEndChange = (valStr: string) => {
    const cleaned = valStr.replace(/[^0-9]/g, "");
    setEndInput(cleaned);
    if (!cleaned) return;
    const e = parseInt(cleaned, 10);
    if (!isNaN(e) && e > 0) {
      const validEnd = Math.min(e, totalAvailable);
      const validStart = Math.min(rangeStart, validEnd);
      setRangeStart(validStart);
      setRangeEnd(validEnd);
      setStartInput(String(validStart));
      setQuantityInput(String(validEnd - validStart + 1));
      const slice = candidates.slice(validStart - 1, validEnd).map((c) => c.id);
      setSelectedIds(new Set(slice));
    }
  };

  const handleBlurNormalize = () => {
    if (totalAvailable === 0) return;
    const s = Math.max(1, Math.min(rangeStart, totalAvailable));
    const e = Math.max(s, Math.min(rangeEnd, totalAvailable));
    setRangeStart(s);
    setRangeEnd(e);
    setStartInput(String(s));
    setEndInput(String(e));
    setQuantityInput(String(selectedIds.size));
  };

  const stepQuantity = (delta: number) => {
    const current = selectedIds.size || 0;
    const next = Math.max(1, Math.min(current + delta, totalAvailable));
    applyRange(1, next);
  };

  // Toggle individual candidate checkbox
  const toggleCandidate = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
    setQuantityInput(String(next.size));
  };

  // Select all / deselect all in current candidate list
  const toggleSelectAll = () => {
    if (selectedIds.size === totalAvailable) {
      setSelectedIds(new Set());
      setQuantityInput("0");
    } else {
      setSelectedIds(new Set(candidates.map((c) => c.id)));
      setQuantityInput(String(totalAvailable));
      setRangeStart(1);
      setRangeEnd(totalAvailable);
      setStartInput("1");
      setEndInput(String(totalAvailable));
    }
  };

  // Filtered companies based on search (by name or ID)
  const filteredCompanies = useMemo(() => {
    const q = companySearch.toLowerCase().trim();
    if (!q) return companiesList;
    return companiesList.filter((comp) => {
      const name = (comp.name || "").toLowerCase();
      const id = (comp.userId || comp.id || "").toLowerCase();
      const email = (comp.email || "").toLowerCase();
      return name.includes(q) || id.includes(q) || email.includes(q);
    });
  }, [companiesList, companySearch]);

  // Selected candidates objects
  const selectedCandidatesList = useMemo(() => {
    return candidates.filter((c) => selectedIds.has(c.id));
  }, [candidates, selectedIds]);

  // Active role summary
  const effectiveRole = useMemo(() => {
    if (activeFilterInfo?.role && activeFilterInfo.role !== "ALL") {
      return activeFilterInfo.role;
    }
    const roles = Array.from(
      new Set(selectedCandidatesList.map((c) => c.targetRole || c.headline).filter(Boolean))
    );
    if (roles.length === 1) return roles[0];
    if (roles.length > 1) return `${roles[0]} & ${roles.length - 1} more roles`;
    return "All Filtered Positions";
  }, [activeFilterInfo, selectedCandidatesList]);

  // Effective skills summary across selected candidates / filter
  const effectiveSkills = useMemo(() => {
    if (activeFilterInfo?.skills && activeFilterInfo.skills !== "ALL") {
      return [activeFilterInfo.skills];
    }
    const skillSet = new Set<string>();
    selectedCandidatesList.forEach((c) => {
      if (Array.isArray(c.skills)) {
        c.skills.forEach((s) => s && s.trim() && skillSet.add(s.trim()));
      } else if (typeof (c as any).skills === "string" && (c as any).skills.trim()) {
        (c as any).skills.split(",").forEach((s: string) => s && s.trim() && skillSet.add(s.trim()));
      }
    });
    return Array.from(skillSet);
  }, [activeFilterInfo, selectedCandidatesList]);

  if (!isOpen) return null;

  // Handle final send submission
  const handleConfirmSend = async () => {
    if (!selectedCompany) {
      setErrorMessage("Please select a target company.");
      return;
    }

    if (selectedCandidatesList.length === 0) {
      setErrorMessage("Please select at least 1 candidate resume to send.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const companyTargetId = selectedCompany.id || (selectedCompany as any)._id || selectedCompany.userId || (selectedCompany as any).customId || "";
      if (!companyTargetId) {
        setErrorMessage("Please select a valid company.");
        setIsSubmitting(false);
        return;
      }
      const response = await sendBulkResumesToCompany(
        companyTargetId,
        selectedCandidatesList
      );

      if (response && response.success) {
        setIsSuccess(true);
        setSentResult({
          count: selectedCandidatesList.length,
          companyName: selectedCompany.name,
        });
        if (onSuccess) {
          onSuccess(selectedCandidatesList.length, selectedCompany.name);
        }
      } else {
        setErrorMessage(response?.message || "Failed to send resumes to company.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred while sending resumes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Send Resumes to Company</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  Step {step} of 3
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Deliver filtered candidate resumes directly into company's Purchased Resumes vault.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP PROGRESS WIZARD BAR */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setErrorMessage("");
                setStep(1);
              }}
              className={`flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                step === 1 ? "text-blue-600" : step > 1 ? "text-emerald-600 hover:text-emerald-700" : "text-slate-400"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 1
                    ? "bg-blue-600 text-white"
                    : step > 1
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > 1 ? "✓" : "1"}
              </span>
              <span>1. Quantity & Range</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={() => {
                if (selectedIds.size > 0) {
                  setErrorMessage("");
                  setStep(2);
                }
              }}
              className={`flex items-center gap-1.5 font-bold transition-all ${
                selectedIds.size > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-60"
              } ${
                step === 2 ? "text-blue-600" : step > 2 ? "text-emerald-600 hover:text-emerald-700" : "text-slate-400"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 2
                    ? "bg-blue-600 text-white"
                    : step > 2
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > 2 ? "✓" : "2"}
              </span>
              <span>2. Choose Company</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

            <button
              type="button"
              disabled={selectedIds.size === 0 || !selectedCompany}
              onClick={() => {
                if (selectedIds.size > 0 && selectedCompany) {
                  setErrorMessage("");
                  setStep(3);
                }
              }}
              className={`flex items-center gap-1.5 font-bold transition-all ${
                selectedIds.size > 0 && selectedCompany ? "cursor-pointer" : "cursor-not-allowed opacity-60"
              } ${
                step === 3 ? "text-blue-600" : "text-slate-400"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                3
              </span>
              <span>3. Review & Confirm</span>
            </button>
          </div>

          <span className="text-[11px] font-bold text-slate-500 shrink-0 hidden sm:inline-block">
            {selectedIds.size} Resumes Selected
          </span>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-xs">
          {/* SUCCESS SCREEN */}
          {isSuccess && sentResult ? (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  Resumes Delivered Successfully!
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto">
                  <strong className="text-emerald-700 font-bold">{sentResult.count} candidate resumes</strong> have been transferred directly into{" "}
                  <strong className="text-slate-900 font-bold">{sentResult.companyName}</strong>'s Purchased Resumes vault.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Recipient Company:</span>
                  <span className="font-bold text-slate-900">{sentResult.companyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Total Profiles Transferred:</span>
                  <span className="font-bold text-emerald-700">{sentResult.count} Verified Resumes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Access Permission:</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-800 font-bold text-[10px]">
                    Unlocked in Company Vault
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2.5 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ================= STEP 1: SELECT QUANTITY & RANGE ================= */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Active Filter Strip */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                          Current Filtered Talent Pool
                        </span>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                          <span>{totalAvailable} Matching Candidates</span>
                          {activeFilterInfo?.role && activeFilterInfo.role !== "ALL" && (
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[10px]">
                              Role: {activeFilterInfo.role}
                            </span>
                          )}
                          {activeFilterInfo?.experience && activeFilterInfo.experience !== "ALL" && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                              Exp: {activeFilterInfo.experience}
                            </span>
                          )}
                          {activeFilterInfo?.skills && activeFilterInfo.skills !== "ALL" && (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                              Skill: {activeFilterInfo.skills}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white border border-blue-200 text-blue-700 shadow-2xs">
                      {selectedIds.size} Selected to Send
                    </span>
                  </div>

                  {/* Range & Quantity Controls */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-bold text-slate-800 text-xs">
                        How many resumes do you want to send?
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Type an amount/count or pick a custom range below
                      </span>
                    </div>

                    {/* DIRECT AMOUNT / QUANTITY INPUT WITH STEPPER */}
                    <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                      <span className="text-xs font-bold text-slate-700">Amount / Quantity:</span>
                      <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl overflow-hidden shadow-2xs focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <button
                          type="button"
                          onClick={() => stepQuantity(-1)}
                          disabled={selectedIds.size <= 1}
                          className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 transition cursor-pointer text-base font-black border-r border-slate-200"
                          title="Decrease amount"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={quantityInput}
                          onChange={(e) => handleQuantityChange(e.target.value)}
                          onBlur={handleBlurNormalize}
                          className="w-16 px-2 py-1.5 text-center text-xs font-black text-slate-900 bg-transparent focus:outline-none"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => stepQuantity(1)}
                          disabled={selectedIds.size >= totalAvailable}
                          className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 transition cursor-pointer text-base font-black border-l border-slate-200"
                          title="Increase amount"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-slate-600 font-semibold">resumes to send</span>

                      <span className="text-[11px] text-slate-400 ml-auto font-medium">
                        (Selected: <strong className="text-blue-700 font-bold">{selectedIds.size}</strong> of {totalAvailable} candidates)
                      </span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">
                        Quick Range:
                      </span>
                      {((): { label: string; s: number; e: number }[] => {
                        const list: { label: string; s: number; e: number }[] = [];
                        const limits = [5, 10, 15, 20, 25, 50];
                        for (const lim of limits) {
                          if (totalAvailable > lim) {
                            list.push({ label: `1 - ${lim}`, s: 1, e: lim });
                          }
                        }
                        list.push({ label: `All (${totalAvailable})`, s: 1, e: totalAvailable });
                        return list;
                      })().map((preset) => {
                        const isActive =
                          rangeStart === preset.s &&
                          rangeEnd === preset.e &&
                          selectedIds.size === (preset.e - preset.s + 1);
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => applyRange(preset.s, preset.e)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              isActive
                                ? "bg-blue-600 text-white shadow-xs"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Range Inputs (1-10, 15-20, etc.) */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <span className="text-xs font-medium text-slate-600">Custom Range:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-xs">From #</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={startInput}
                          onChange={(e) => handleStartChange(e.target.value)}
                          onBlur={handleBlurNormalize}
                          className="w-16 px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-center focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-2xs text-slate-900"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-xs">to #</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={endInput}
                          onChange={(e) => handleEndChange(e.target.value)}
                          onBlur={handleBlurNormalize}
                          className="w-16 px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-center focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition shadow-2xs text-slate-900"
                        />
                      </div>

                      <span className="text-[11px] text-slate-400">
                        (out of {totalAvailable} total candidates)
                      </span>
                    </div>
                  </div>

                  {/* Candidate List with Checkbox Previews */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="font-bold text-slate-800 text-xs">
                        Review Candidates Being Sent ({selectedIds.size} selected)
                      </span>
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                      >
                        {selectedIds.size === totalAvailable ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 rounded-2xl border border-slate-200 p-2 bg-white">
                      {candidates.length === 0 ? (
                        <div className="py-8 text-center text-slate-400">
                          No candidates match current filter.
                        </div>
                      ) : (
                        candidates.map((c, idx) => {
                          const isChecked = selectedIds.has(c.id);
                          return (
                            <div
                              key={c.id}
                              onClick={() => toggleCandidate(c.id)}
                              className={`p-2.5 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer ${
                                isChecked
                                  ? "bg-blue-50/70 border border-blue-200/80"
                                  : "hover:bg-slate-50 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}} // handled by parent onClick
                                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />

                                <span className="text-[11px] font-mono text-slate-400 w-6">
                                  #{idx + 1}
                                </span>

                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[10px] shrink-0 ${
                                    c.avatarBg || "bg-blue-600"
                                  }`}
                                >
                                  {c.avatarLetter || "CD"}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 truncate text-xs">
                                      {c.name}
                                    </span>
                                    {c.userId && (
                                      <span className="text-[9px] px-1 rounded bg-slate-100 text-slate-500 font-mono">
                                        {c.userId}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate">
                                    {c.headline || c.targetRole || "Candidate"} •{" "}
                                    <span className="font-medium text-slate-600">
                                      {c.experience || "Fresher"}
                                    </span>
                                  </p>

                                  {/* Candidate Skills Pills */}
                                  {Array.isArray(c.skills) && c.skills.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1 mt-1">
                                      {c.skills.slice(0, 3).map((sk, skIdx) => (
                                        <span
                                          key={skIdx}
                                          className="px-1.5 py-0.5 rounded-md bg-purple-50 text-[#7C3AED] text-[9px] font-bold border border-purple-100"
                                        >
                                          {sk}
                                        </span>
                                      ))}
                                      {c.skills.length > 3 && (
                                        <span className="text-[9px] text-slate-400 font-semibold">
                                          +{c.skills.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {c.resumeName ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                                    <FileText className="w-3 h-3 text-emerald-600" />
                                    <span>PDF</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-medium">
                                    Profile CV
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 2: CHOOSE TARGET COMPANY ================= */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Select Recipient Company
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Search company by Name or ID. All registered companies are listed below in scrollable view.
                    </p>
                  </div>

                  {/* Company Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search company by name or ID (e.g. Google, CMP-101, tech@example.com)..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-800"
                      autoFocus
                    />
                    {companySearch && (
                      <button
                        type="button"
                        onClick={() => setCompanySearch("")}
                        className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Scrolling Company List */}
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 rounded-2xl border border-slate-200 p-2.5 bg-slate-50/50">
                    {filteredCompanies.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">No companies found</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Try searching with another company name or company ID.
                        </p>
                      </div>
                    ) : (
                      filteredCompanies.map((comp) => {
                        const isSelected =
                          selectedCompany?.id === comp.id ||
                          (comp.userId && selectedCompany?.userId === comp.userId);
                        return (
                          <div
                            key={comp.id}
                            onClick={() => setSelectedCompany(comp)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? "bg-white border-blue-500 ring-2 ring-blue-100 shadow-sm"
                                : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-xs ${
                                  comp.logoBg || "bg-indigo-600"
                                }`}
                              >
                                {comp.logoLetter || comp.name.slice(0, 2).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                    {comp.name}
                                  </h5>
                                  {(comp.userId || comp.id) && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                                      {comp.userId || comp.id}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {comp.email} • {comp.location || "India"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                <Crown className="w-3 h-3 text-amber-500" />
                                <span>{comp.plan || "Basic Plan"}</span>
                              </span>

                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Selected Company Preview Bar */}
                  {selectedCompany && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-700 font-medium">
                          Selected Recipient: <strong className="text-blue-900 font-bold">{selectedCompany.name}</strong> ({selectedCompany.userId || selectedCompany.id})
                        </span>
                      </div>
                      <span className="font-bold text-blue-700 text-[11px]">
                        Ready for review
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ================= STEP 3: REVIEW & CONFIRM DETAILS ================= */}
              {step === 3 && selectedCompany && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Review Transfer Details & Confirm
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify company details and candidate package before finalizing delivery.
                    </p>
                  </div>

                  {/* CARD 1: COMPANY BASIC DETAILS */}
                  <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Recipient Company Details
                      </h5>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Company Name</span>
                        <p className="font-bold text-slate-900 mt-0.5">{selectedCompany.name}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Company ID</span>
                        <p className="font-mono font-bold text-slate-800 mt-0.5">{selectedCompany.userId || selectedCompany.id}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Work Email</span>
                        <p className="font-bold text-slate-800 mt-0.5 truncate">{selectedCompany.email}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Location</span>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedCompany.location || "India"}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Industry</span>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedCompany.industry || "Technology & Software"}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Plan</span>
                        <p className="font-bold text-purple-700 mt-0.5 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                          <span>{selectedCompany.plan || "Basic Plan"}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: DELIVERY PACKAGE SUMMARY */}
                  <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                      <Send className="w-4 h-4 text-indigo-600" />
                      <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Resumes Package Summary
                      </h5>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-600 uppercase block">Resumes Count</span>
                        <p className="text-base font-black text-blue-900 mt-0.5">
                          {selectedCandidatesList.length} Profiles
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase block">Role / Domain</span>
                        <p className="text-xs font-black text-indigo-950 mt-0.5 truncate" title={effectiveRole}>
                          {effectiveRole}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                        <span className="text-[10px] font-bold text-amber-600 uppercase block">Selected Range</span>
                        <p className="text-xs font-black text-amber-900 mt-0.5">
                          #{rangeStart} to #{rangeEnd}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase block">Target Vault</span>
                        <p className="text-xs font-black text-emerald-900 mt-0.5">
                          Purchased Resumes
                        </p>
                      </div>

                      {/* Skills Included in Package */}
                      <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 col-span-2 sm:col-span-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                          Candidate Skills Included ({effectiveSkills.length}):
                        </span>
                        <div className="flex flex-wrap items-center gap-1">
                          {effectiveSkills.length > 0 ? (
                            <>
                              {effectiveSkills.slice(0, 8).map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-white text-[#7C3AED] text-[10px] font-bold border border-purple-200 shadow-2xs"
                                >
                                  {sk}
                                </span>
                              ))}
                              {effectiveSkills.length > 8 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold">
                                  +{effectiveSkills.length - 8} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              General candidate skillset
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: CANDIDATE NAMES SNIPPET */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Candidates Included in this Delivery ({selectedCandidatesList.length}):
                    </span>
                    <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 text-xs">
                      {selectedCandidatesList.map((c, i) => {
                        const cSkills = Array.isArray(c.skills) && c.skills.length > 0
                          ? c.skills
                          : typeof (c as any).skills === "string" && (c as any).skills.trim()
                          ? (c as any).skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                          : [];
                        return (
                          <div
                            key={c.id}
                            className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white border border-slate-200/60 text-[11px] gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-slate-400 shrink-0">#{i + 1}</span>
                              <span className="font-bold text-slate-800 shrink-0">{c.name}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 truncate">{c.headline || c.targetRole || "Candidate"}</span>
                              {cSkills.length > 0 && (
                                <div className="hidden sm:flex items-center gap-1 shrink-0">
                                  {cSkills.slice(0, 2).map((sk: string, sIdx: number) => (
                                    <span
                                      key={sIdx}
                                      className="px-1.5 py-0.2 rounded bg-purple-50 text-[#7C3AED] text-[9px] font-bold border border-purple-100"
                                    >
                                      {sk}
                                    </span>
                                  ))}
                                  {cSkills.length > 2 && (
                                    <span className="text-[9px] text-slate-400 font-medium">
                                      +{cSkills.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="text-slate-400 text-[10px] shrink-0">{c.experience || "Fresher"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        {!isSuccess && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200/80 shrink-0">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white transition cursor-pointer"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as any) : 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-white transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <div>
              {step === 1 && (
                <button
                  type="button"
                  disabled={selectedIds.size === 0}
                  onClick={() => {
                    if (selectedIds.size === 0) {
                      setErrorMessage("Please select at least 1 candidate.");
                      return;
                    }
                    setErrorMessage("");
                    setStep(2);
                  }}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    selectedIds.size > 0
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>Next: Choose Company ({selectedIds.size})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  disabled={!selectedCompany}
                  onClick={() => {
                    if (!selectedCompany) {
                      setErrorMessage("Please select a recipient company.");
                      return;
                    }
                    setErrorMessage("");
                    setStep(3);
                  }}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                    selectedCompany
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>Next: Review & Confirm</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  disabled={isSubmitting || selectedCandidatesList.length === 0}
                  onClick={handleConfirmSend}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Delivering Resumes...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        Confirm & Send {selectedCandidatesList.length} Resumes to {selectedCompany?.name}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
