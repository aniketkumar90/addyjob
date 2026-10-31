"use client";

import React from "react";
import {
  Building2,
  Briefcase,
  FileText,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";
import { AdminTab } from "./AdminSidebar";

export interface MetricStats {
  totalCompanies?: number;
  approvedCompanies?: number;
  pendingCompanies?: number;
  totalJobs?: number;
  activeJobs?: number;
  expiredJobs?: number;
  totalApplications?: number;
  totalRevenue?: string;
}

interface MetricCardsProps {
  onSelectTab: (tab: AdminTab) => void;
  pendingCount: number;
  stats?: MetricStats | null;
}

export default function MetricCards({ onSelectTab, pendingCount, stats }: MetricCardsProps) {
  const totalComp = stats?.totalCompanies ?? 0;
  const approvedComp = stats?.approvedCompanies ?? 0;
  const pendComp = stats?.pendingCompanies ?? pendingCount ?? 0;

  const totalJobs = stats?.totalJobs ?? 0;
  const activeJobs = stats?.activeJobs ?? 0;
  const expiredJobs = stats?.expiredJobs ?? 0;

  const totalApps = stats?.totalApplications ?? 0;
  const revenue = stats?.totalRevenue ?? "₹ 0";

  const cards = [
    {
      id: "companies" as AdminTab,
      title: "Total Companies",
      value: totalComp.toLocaleString("en-IN"),
      subtext: `${approvedComp} approved • ${pendComp} pending`,
      actionLabel: "Manage",
      icon: Building2,
      iconBg: "bg-purple-100 text-purple-600",
      accentBorder: "hover:border-purple-200",
    },
    {
      id: "jobs" as AdminTab,
      title: "Total Job Postings",
      value: totalJobs.toLocaleString("en-IN"),
      subtext: `Active: ${activeJobs} • Expired: ${expiredJobs}`,
      actionLabel: "View All",
      icon: Briefcase,
      iconBg: "bg-rose-100 text-rose-500",
      accentBorder: "hover:border-rose-200",
    },
    {
      id: "resumes" as AdminTab,
      title: "Candidate Resumes",
      value: totalApps.toLocaleString("en-IN"),
      subtext: `Profile & Applied Resumes`,
      actionLabel: "View All",
      icon: FileText,
      iconBg: "bg-blue-100 text-blue-600",
      accentBorder: "hover:border-blue-200",
    },
    {
      id: "payments" as AdminTab,
      title: "Total Revenue",
      value: revenue,
      subtext: "Subscription & billing",
      actionLabel: "View Analytics",
      icon: CreditCard,
      iconBg: "bg-emerald-100 text-emerald-600",
      accentBorder: "hover:border-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all group flex flex-col justify-between ${card.accentBorder}`}
          >
            <div>
              {/* Top Row: Icon + Title */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${card.iconBg} transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 leading-tight">
                  {card.title}
                </span>
              </div>

              {/* Value */}
              <div className="mt-2.5 sm:mt-4 flex items-baseline gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
                  {card.value}
                </h3>
                {(card as any).change && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                    {(card as any).change}
                  </span>
                )}
              </div>

              {/* Subtext */}
              <p className="mt-1 text-[10px] sm:text-xs text-slate-400 font-medium line-clamp-1">
                {card.subtext}
              </p>
            </div>

            {/* Bottom Link Action */}
            <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onSelectTab(card.id)}
                className="text-[11px] sm:text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer flex items-center gap-1 group-hover:gap-1.5 duration-200"
              >
                <span>{card.actionLabel}</span>
                <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
