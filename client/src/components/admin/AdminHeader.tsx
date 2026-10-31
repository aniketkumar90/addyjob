"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  ExternalLink,
  Settings,
  LogOut,
  Building2,
  UserCheck,
  X,
  CheckCheck,
} from "lucide-react";
import {
  clearAuthSession,
  fetchAdminNotifications,
  AdminNotificationItem,
} from "@/lib/api";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectTab?: (tab: any) => void;
}

function formatRelativeTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return "Recently";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  if (diffMs <= 0) return "Just now";

  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return "Just now";

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function AdminHeader({
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  onSelectTab,
}: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Initialize read IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_read_notification_ids");
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };

  const loadNotifications = async () => {
    try {
      const items = await fetchAdminNotifications();
      if (Array.isArray(items)) {
        setNotifications(items);
      }
    } catch (err) {
      console.warn("Could not load real admin notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    window.addEventListener("companies_updated", handleUpdate);
    window.addEventListener("plans_updated", handleUpdate);

    return () => {
      window.removeEventListener("companies_updated", handleUpdate);
      window.removeEventListener("plans_updated", handleUpdate);
    };
  }, []);

  // Dismiss dropdown when clicking anywhere outside
  useEffect(() => {
    if (!showNotifications) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotifications]);

  // Dismiss profile dropdown on outside click
  useEffect(() => {
    if (!showProfileMenu) return;

    const handleProfileOutsideClick = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleProfileOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleProfileOutsideClick);
    };
  }, [showProfileMenu]);

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem("admin_read_notification_ids", JSON.stringify(allIds));
    } catch {}
  };

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem("admin_read_notification_ids", JSON.stringify(updated));
      } catch {}
    }
  };

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Sidebar Toggle & Global Search */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-2xl min-w-0">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation sidebar"
            title="Open Menu"
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar (Desktop / Tablet view) */}
          <div className="hidden sm:block relative w-full max-w-xs sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </div>

        {/* Right: Mobile Search Toggle Button, Notification & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-4 relative shrink-0">
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            aria-label="Toggle search bar"
            title="Search"
            className={`sm:hidden p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
              isMobileSearchOpen || searchQuery
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50 border-slate-200"
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

        {/* Notifications Dropdown */}
        <div ref={notificationRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            aria-label="Notifications"
            className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed inset-x-3 top-16 max-w-sm mx-auto sm:max-w-none sm:mx-0 sm:inset-x-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-92 bg-white rounded-2xl shadow-2xl sm:shadow-xl border border-slate-200/80 sm:border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  {unreadCount > 0 ? (
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      All caught up
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center text-slate-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Company registrations and candidate signups will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const isCompany = item.type === "company_registered" || item.iconType === "company";
                    const Icon = isCompany ? Building2 : UserCheck;
                    const colorClass = isCompany
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-blue-600 bg-blue-50";
                    const isUnread = !readIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          markAsRead(item.id);
                          setShowNotifications(false);
                          if (onSelectTab && item.targetTab) {
                            onSelectTab(item.targetTab);
                          }
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                          isUnread ? "bg-blue-50/20" : ""
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {item.title}
                            </p>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Unread" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                            {item.desc}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Profile */}
        <div ref={profileMenuRef} className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-slate-200">
              <Image
                src="/avatar.jpg"
                alt="Super Admin"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-slate-800 block leading-tight">
                Super Admin
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Super Administrator</p>
                <p className="text-[11px] text-slate-500">admin@addyjob.com</p>
              </div>
              <div className="py-1">
                <Link
                  href="/"
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>Public Job Portal</span>
                </Link>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>System Settings</span>
                </button>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Mobile Search Bar Dropdown (Opens right below the navbar) */}
      {isMobileSearchOpen && (
        <div className="sm:hidden px-3.5 pb-3 pt-1 border-t border-slate-100 bg-white/95 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="relative w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies, jobs, resumes..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
