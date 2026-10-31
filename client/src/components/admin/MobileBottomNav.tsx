"use client";

import React from "react";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileText,
} from "lucide-react";
import { AdminTab } from "./AdminSidebar";

interface MobileBottomNavProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onOpenSidebar?: () => void;
  pendingCount: number;
}

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  onOpenSidebar,
  pendingCount,
}: MobileBottomNavProps) {
  const items = [
    {
      id: "dashboard" as AdminTab,
      label: "Home",
      icon: LayoutDashboard,
    },
    {
      id: "companies" as AdminTab,
      label: "Companies",
      icon: Building2,
      badge: pendingCount,
    },
    {
      id: "jobs" as AdminTab,
      label: "Jobs",
      icon: Briefcase,
    },
    {
      id: "resumes" as AdminTab,
      label: "Resumes",
      icon: FileText,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center p-1 rounded-xl transition-colors cursor-pointer ${
              isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 ${
                isActive ? "font-bold text-blue-600" : "font-medium"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
