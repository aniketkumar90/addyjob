"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Bell,
  Menu,
  X,
  CheckCircle,
  User,
  Briefcase,
  Bookmark,
  LogOut,
  ShieldCheck,
  Home,
  MoreVertical,
  Send,
  Eye,
  Star,
  Calendar,
  Award,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  getStoredUser,
  clearAuthSession,
  UserSession,
  fetchCandidateApplicationsFromDB,
  getLocalAppliedJobs,
} from "@/lib/api";

interface NotificationItem {
  id: string;
  type: "resume_viewed" | "shortlisted" | "interview" | "hired" | "rejected" | "applied";
  title: string;
  message: string;
  company: string;
  position: string;
  time: string;
  timestamp: number;
  read: boolean;
}

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface NavbarProps {
  activeTab?: string;
  actionButtonText?: string;
  actionButtonHref?: string;
  onSelectCandidateTab?: (tab: "profile" | "applied" | "saved") => void;
  activeCandidateTab?: "profile" | "applied" | "saved" | "messages";
  appliedCount?: number;
  savedCount?: number;
}

export default function Navbar({
  activeTab,
  actionButtonText,
  actionButtonHref,
  onSelectCandidateTab,
  activeCandidateTab = "profile",
  appliedCount = 0,
  savedCount = 0,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [mounted, setMounted] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close notifications/profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    if (notificationsOpen || profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsOpen, profileOpen]);

  // Load candidate notifications based on real application events
  const loadNotifications = async () => {
    const user = getStoredUser();
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const uid = user.id || user.userId || user.email || "candidate";
    const readMapKey = `candidate_notifications_read_${uid}`;
    let readMap: Record<string, boolean> = {};
    try {
      readMap = JSON.parse(localStorage.getItem(readMapKey) || "{}");
    } catch {}

    const localJobs = getLocalAppliedJobs(uid);
    let dbJobs: any[] = [];
    try {
      dbJobs = await fetchCandidateApplicationsFromDB(user.email, uid);
    } catch {}

    const candEmail = (user.email || "").trim().toLowerCase();
    const candId = String(user.id || user.userId || "");
    const allApps = [...dbJobs, ...localJobs];
    const map = new Map<string, any>();
    allApps.forEach((app) => {
      const appEmail = (app.candidateEmail || "").trim().toLowerCase();
      const appCandId = app.candidateId ? String(app.candidateId) : "";
      if (candEmail && appEmail && appEmail !== candEmail) {
        return;
      }
      if (candId && appCandId && appCandId !== candId) {
        return;
      }
      const key = String(app.id || app._id || app.jobId || "");
      if (key && !map.has(key)) {
        map.set(key, app);
      }
    });

    const items: NotificationItem[] = [];

    map.forEach((app, key) => {
      const company = app.company || app.companyName || "Employer";
      const position = app.position || app.jobTitle || app.title || "Job Application";
      const status = (app.status || "").trim();
      const recruiterAction = (app.recruiterAction || "").trim();
      const isHired = recruiterAction.toLowerCase() === "hired" || status.toLowerCase() === "hired";
      const isShortlisted = recruiterAction.toLowerCase() === "shortlisted" || status.toLowerCase() === "shortlisted";
      const isInterview = recruiterAction.toLowerCase() === "interview" || status.toLowerCase() === "interview";
      const isRejected = recruiterAction.toLowerCase() === "rejected" || status.toLowerCase() === "rejected";
      const hasAction = isHired || isShortlisted || isInterview || isRejected;
      const isResumeViewed = Boolean(
        app.resumeViewed ||
        (app.statusStep && app.statusStep >= 2) ||
        hasAction ||
        ["Reviewed", "Reviewing", "Resume Viewed"].includes(status)
      );

      // Event: Recruiter Decisions
      if (isHired) {
        const notifId = `hired_${key}`;
        items.push({
          id: notifId,
          type: "hired",
          title: "Offer / Hired! 🎉",
          message: `Congratulations! ${company} marked you as Hired for ${position}.`,
          company,
          position,
          time: app.updatedAt ? new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
          timestamp: app.updatedAt ? new Date(app.updatedAt).getTime() : Date.now() - 1000,
          read: Boolean(readMap[notifId]),
        });
      } else if (isInterview) {
        const notifId = `interview_${key}`;
        items.push({
          id: notifId,
          type: "interview",
          title: "Interview Scheduled! 🎯",
          message: `${company} invited you for an interview for ${position}.`,
          company,
          position,
          time: app.updatedAt ? new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
          timestamp: app.updatedAt ? new Date(app.updatedAt).getTime() : Date.now() - 2000,
          read: Boolean(readMap[notifId]),
        });
      } else if (isShortlisted) {
        const notifId = `shortlisted_${key}`;
        items.push({
          id: notifId,
          type: "shortlisted",
          title: "Application Shortlisted! ⭐",
          message: `${company} shortlisted your profile for ${position}.`,
          company,
          position,
          time: app.updatedAt ? new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
          timestamp: app.updatedAt ? new Date(app.updatedAt).getTime() : Date.now() - 3000,
          read: Boolean(readMap[notifId]),
        });
      } else if (isRejected) {
        const notifId = `rejected_${key}`;
        items.push({
          id: notifId,
          type: "rejected",
          title: "Application Status Update",
          message: `${company} updated your application status for ${position}.`,
          company,
          position,
          time: app.updatedAt ? new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
          timestamp: app.updatedAt ? new Date(app.updatedAt).getTime() : Date.now() - 4000,
          read: Boolean(readMap[notifId]),
        });
      }

      // Event: Recruiter Viewed Resume
      if (isResumeViewed) {
        const notifId = `viewed_${key}`;
        items.push({
          id: notifId,
          type: "resume_viewed",
          title: "Resume Viewed! 👁️",
          message: `${company} viewed and reviewed your resume for ${position}.`,
          company,
          position,
          time: app.resumeViewedAt ? new Date(app.resumeViewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
          timestamp: app.resumeViewedAt ? new Date(app.resumeViewedAt).getTime() : Date.now() - 5000,
          read: Boolean(readMap[notifId]),
        });
      }

      // Event: Application Submitted
      const notifId = `applied_${key}`;
      items.push({
        id: notifId,
        type: "applied",
        title: "Application Submitted",
        message: `Your application for ${position} was sent to ${company}.`,
        company,
        position,
        time: app.appliedDate || (app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "Applied"),
        timestamp: app.appliedAt ? new Date(app.appliedAt).getTime() : Date.now() - 86400000,
        read: Boolean(readMap[notifId]),
      });
    });

    items.sort((a, b) => b.timestamp - a.timestamp);
    setNotifications(items);
    setUnreadCount(items.filter((i) => !i.read).length);
  };

  const markAllAsRead = () => {
    const user = getStoredUser();
    const uid = user?.id || user?.userId || user?.email || "candidate";
    const readMap: Record<string, boolean> = {};
    notifications.forEach((n) => {
      readMap[n.id] = true;
    });
    try {
      localStorage.setItem(`candidate_notifications_read_${uid}`, JSON.stringify(readMap));
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markAsRead = (id: string) => {
    // Check if item is already read to prevent duplicate decrement
    const target = notifications.find((n) => n.id === id);
    if (!target || target.read) {
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    const user = getStoredUser();
    const uid = user?.id || user?.userId || user?.email || "candidate";
    const readMapKey = `candidate_notifications_read_${uid}`;
    try {
      const readMap = JSON.parse(localStorage.getItem(readMapKey) || "{}");
      readMap[id] = true;
      localStorage.setItem(readMapKey, JSON.stringify(readMap));
      if (uid !== "candidate") {
        const fallbackMap = JSON.parse(localStorage.getItem("candidate_notifications_read_candidate") || "{}");
        fallbackMap[id] = true;
        localStorage.setItem("candidate_notifications_read_candidate", JSON.stringify(fallbackMap));
      }
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    const u = getStoredUser();
    setCurrentUser(u);
    loadNotifications();

    const handleAuth = () => {
      setCurrentUser(getStoredUser());
      loadNotifications();
    };

    const handleSync = () => {
      loadNotifications();
    };

    window.addEventListener("auth_change", handleAuth);
    window.addEventListener("storage", handleAuth);
    window.addEventListener("focus", handleAuth);
    window.addEventListener("applied_jobs_change", handleSync);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("addyjob_channel");
      bc.onmessage = () => {
        handleSync();
      };
    } catch {}

    return () => {
      window.removeEventListener("auth_change", handleAuth);
      window.removeEventListener("storage", handleAuth);
      window.removeEventListener("focus", handleAuth);
      window.removeEventListener("applied_jobs_change", handleSync);
      if (bc) bc.close();
    };
  }, []);

  useEffect(() => {
    setCurrentUser(getStoredUser());
    loadNotifications();
  }, [pathname]);

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(navSearchQuery.trim())}`);
    } else {
      router.push("/jobs");
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setProfileOpen(false);
    setMobileMenuOpen(false);
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Jobs", href: "/jobs" },
    { name: "Companies", href: "/companies" },
    { name: "Resources", href: "/resources" },
    { name: "About", href: "/about" },
  ];

  const getIsActive = (href: string, name: string) => {
    if (activeTab) return activeTab.toLowerCase() === name.toLowerCase();
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4 lg:gap-8">
          {/* Logo Left */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
              {/* AddyJob Logo */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-xl overflow-hidden shadow-xs shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center bg-black">
                <Image
                  src="/addyjob-logo.png"
                  alt="AddyJob Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 font-sans whitespace-nowrap">
                Addy<span className="text-blue-600">Job</span>
              </span>
            </Link>
          </div>

          {/* Desktop & Tablet Navigation Links */}
          <div className="hidden md:flex items-center gap-3 lg:gap-8 xl:gap-10 shrink-0">
            {navLinks.map((link) => {
              const isActive = getIsActive(link.href, link.name);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative py-2 text-xs md:text-[13px] lg:text-[15px] font-medium transition-colors group whitespace-nowrap shrink-0"
                >
                  <span
                    className={`whitespace-nowrap ${
                      isActive
                        ? "text-blue-600 font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {link.name}
                  </span>
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full mx-auto w-full transition-all" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons & Profile */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3 lg:gap-4 relative shrink-0">
            {/* Working Search Bar */}
            <form onSubmit={handleNavSearch} className="relative flex items-center">
              <div className="relative flex items-center group">
                <Search className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search jobs, skills..."
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  className="w-36 sm:w-44 md:w-52 lg:w-64 pl-9 pr-7 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-200/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
                />
                {navSearchQuery ? (
                  <button
                    type="button"
                    onClick={() => setNavSearchQuery("")}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    aria-label="Submit Search"
                    className="absolute right-2 text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </form>

            {/* When Logged In: Show Bell, Profile Avatar with Dropdown, and Dashboard Button */}
            {mounted && currentUser ? (
              <>
                {/* Backdrop for click outside dismiss */}
                {notificationsOpen && (
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setNotificationsOpen(false)}
                  />
                )}

                {/* Notification Bell with Badge */}
                <div ref={notificationsRef} className="relative shrink-0">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setProfileOpen(false);
                    }}
                    aria-label="Notifications"
                    className="relative p-1.5 lg:p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer shrink-0"
                  >
                    <Bell className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 lg:top-1.5 lg:right-1.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] lg:text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs select-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover / Sidebar Panel */}
                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in zoom-in-95 max-h-[80vh] flex flex-col">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">Notifications</span>
                          {unreadCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                              {unreadCount} new
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                              All caught up
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={() => setNotificationsOpen(false)}
                            className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="py-2 overflow-y-auto space-y-2 flex-1 no-scrollbar divide-y divide-slate-50">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(n.id);
                                setNotificationsOpen(false);
                                router.push("/candidate/dashboard?tab=applied");
                              }}
                              className={`p-3 rounded-2xl flex items-start gap-3 transition-all cursor-pointer border select-none ${
                                !n.read
                                  ? "bg-blue-50/70 hover:bg-blue-50 border-blue-100 shadow-2xs"
                                  : "bg-white hover:bg-slate-50 border-slate-100/80"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  n.type === "hired"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : n.type === "interview"
                                    ? "bg-indigo-100 text-indigo-700"
                                    : n.type === "shortlisted"
                                    ? "bg-amber-100 text-amber-700"
                                    : n.type === "resume_viewed"
                                    ? "bg-blue-100 text-blue-700"
                                    : n.type === "rejected"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {n.type === "hired" ? (
                                  <Award className="w-4 h-4" />
                                ) : n.type === "interview" ? (
                                  <Calendar className="w-4 h-4" />
                                ) : n.type === "shortlisted" ? (
                                  <Star className="w-4 h-4 fill-amber-500" />
                                ) : n.type === "resume_viewed" ? (
                                  <Eye className="w-4 h-4" />
                                ) : n.type === "rejected" ? (
                                  <AlertCircle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {!n.read && (
                                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Unread" />
                                    )}
                                    <p className={`text-xs truncate ${!n.read ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                                      {n.title}
                                    </p>
                                  </div>
                                  <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                              <Bell className="w-5 h-5 stroke-[1.5]" />
                            </div>
                            <p className="text-xs font-bold text-slate-800">No notifications yet</p>
                            <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                              When companies view your resume or update your applications, alerts will appear here.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 shrink-0 text-center">
                        <Link
                          href="/candidate/dashboard"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 block py-1"
                        >
                          View All Applications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Backdrop for profile menu click outside dismiss */}
                {profileOpen && (
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setProfileOpen(false)}
                  />
                )}

                {/* Profile Avatar & Dropdown */}
                <div ref={profileRef} className="relative pl-0.5 lg:pl-1 shrink-0">
                  <button
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      setNotificationsOpen(false);
                    }}
                    title={currentUser.name || "My Profile"}
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden ring-2 ring-slate-200/90 shadow-xs hover:ring-blue-500 transition-all cursor-pointer flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs lg:text-sm hover:scale-105 shrink-0 select-none"
                  >
                    {currentUser.profileImage ? (
                      <img
                        src={currentUser.profileImage}
                        alt={currentUser.name || "User Profile"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs uppercase bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white select-none">
                        {getInitials(currentUser.name || currentUser.email || "U")}
                      </div>
                    )}
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {currentUser.name || "My Account"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {currentUser.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                          {currentUser.role === "job_seeker"
                            ? "Candidate"
                            : currentUser.role === "company"
                            ? "Company"
                            : "Super Admin"}
                        </span>
                      </div>
                      <div className="py-1">
                        {currentUser.role === "company" ? (
                          <Link
                            href="/company/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                          >
                            <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>Employer Dashboard</span>
                          </Link>
                        ) : currentUser.role === "admin" ? (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50/70 hover:bg-blue-100 transition"
                          >
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>Super Admin Portal</span>
                          </Link>
                        ) : (
                          <Link
                            href="/candidate/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                          >
                            <User className="w-4 h-4 text-blue-500 shrink-0" />
                            <span>Candidate Profile / Dashboard</span>
                          </Link>
                        )}
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard Button: ONLY shown for Company and Super Admin */}
                {currentUser.role === "company" ? (
                  <Link
                    href="/company/dashboard"
                    className="flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] whitespace-nowrap shrink-0"
                  >
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Company Dashboard</span>
                  </Link>
                ) : currentUser.role === "admin" ? (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] whitespace-nowrap shrink-0"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Admin Dashboard</span>
                  </Link>
                ) : null}
              </>
            ) : (
              /* When Logged Out: Show ONLY Sign In & Action buttons */
              <div className="flex items-center gap-1.5 lg:gap-2.5 shrink-0">
                <Link
                  href="/login"
                  className="px-2.5 lg:px-3.5 py-1.5 lg:py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                >
                  Sign In
                </Link>
                <Link
                  href={actionButtonHref || "/signup"}
                  className="flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] whitespace-nowrap shrink-0"
                >
                  <span className="whitespace-nowrap">{actionButtonText || "Create Account"}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right: Bell (when logged in) + Universal 3-Lines (Hamburger) Menu */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
            {mounted && currentUser && (
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setMobileMenuOpen(false);
                }}
                aria-label="Notifications"
                className="relative p-2 text-slate-700 hover:text-blue-600 rounded-full transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5 stroke-[2]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs select-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Universal 3-Lines Menu Icon */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setNotificationsOpen(false);
              }}
              aria-label="Toggle navigation menu (3 lines)"
              className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[2]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[2]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer (Combines Image 1 & Image 2 elements, excludes Home & Jobs since they are in bottom bar) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Search Bar (Image 1) */}
          <form
            onSubmit={(e) => {
              handleNavSearch(e);
              setMobileMenuOpen(false);
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white"
            />
          </form>

          {/* Candidate-specific Items (From Image 2: My Profile, Applied Jobs, Saved Jobs) */}
          {mounted && currentUser && currentUser.role === "job_seeker" && (
            <div className="space-y-1 pb-2 border-b border-slate-100">
              <p className="px-3 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Candidate Management
              </p>
              {/* My Profile */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onSelectCandidateTab) {
                    onSelectCandidateTab("profile");
                  } else {
                    router.push("/candidate/dashboard");
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeCandidateTab === "profile" && pathname === "/candidate/dashboard"
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>My Profile</span>
                </div>
              </button>

              {/* Applied Jobs */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onSelectCandidateTab) {
                    onSelectCandidateTab("applied");
                  } else {
                    router.push("/candidate/dashboard?tab=applied");
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeCandidateTab === "applied" && pathname === "/candidate/dashboard"
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-slate-500" />
                  <span>Applied Jobs</span>
                </div>
                {appliedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                    {appliedCount}
                  </span>
                )}
              </button>

              {/* Saved Jobs */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onSelectCandidateTab) {
                    onSelectCandidateTab("saved");
                  } else {
                    router.push("/candidate/dashboard?tab=saved");
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeCandidateTab === "saved" && pathname === "/candidate/dashboard"
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-slate-500" />
                  <span>Saved Jobs</span>
                </div>
                {savedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                    {savedCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* General navigation links (From Image 1: Companies, Resources, About - Home & Jobs removed) */}
          <div className="flex flex-col space-y-1">
            {navLinks
              .filter((link) => link.name !== "Home" && link.name !== "Jobs")
              .map((link) => {
                const isActive = getIsActive(link.href, link.name);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </Link>
                );
              })}
          </div>

          {mounted && currentUser ? (
            /* Mobile Signed In Details - Log Out Only */
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 stroke-[2]" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            /* Mobile Signed Out Details */
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
                >
                  Sign In
                </Link>
                <Link
                  href={actionButtonHref || "/signup"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2.5 px-3 bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  {actionButtonText || "Create Account"}
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>

    {/* Mobile Notification Popover / Dropdown (Positioned at Top under Navbar) */}
    {notificationsOpen && (
      <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-start pt-14 pb-6 px-3 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className="absolute inset-0"
          onClick={() => setNotificationsOpen(false)}
        />
        <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-sm ml-auto p-4 flex flex-col max-h-[78vh] animate-in slide-in-from-top-3 duration-200 z-10">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification items list */}
          <div className="py-2 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-50">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(n.id);
                  }}
                  className={`p-3 rounded-2xl flex items-start gap-3 transition-all cursor-pointer border select-none active:scale-[0.99] ${
                    !n.read
                      ? "bg-blue-50/70 hover:bg-blue-50 border-blue-100 shadow-2xs"
                      : "bg-white hover:bg-slate-50 border-slate-100/80"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type === "hired"
                        ? "bg-emerald-100 text-emerald-700"
                        : n.type === "interview"
                        ? "bg-indigo-100 text-indigo-700"
                        : n.type === "shortlisted"
                        ? "bg-amber-100 text-amber-700"
                        : n.type === "resume_viewed"
                        ? "bg-blue-100 text-blue-700"
                        : n.type === "rejected"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {n.type === "hired" ? (
                      <Award className="w-4 h-4" />
                    ) : n.type === "interview" ? (
                      <Calendar className="w-4 h-4" />
                    ) : n.type === "shortlisted" ? (
                      <Star className="w-4 h-4 fill-amber-500" />
                    ) : n.type === "resume_viewed" ? (
                      <Eye className="w-4 h-4" />
                    ) : n.type === "rejected" ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Unread" />
                        )}
                        <p className={`text-xs truncate ${!n.read ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                          {n.title}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="text-sm font-bold text-slate-800">No notifications yet</p>
                <p className="text-xs text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                  When companies view your resume or update your applications, alerts will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 shrink-0 text-center">
            <Link
              href="/candidate/dashboard"
              onClick={() => setNotificationsOpen(false)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 block py-1.5"
            >
              View All Applications →
            </Link>
          </div>
        </div>
      </div>
    )}

    {/* Mobile Bottom Navigation Bar (Fixed at bottom on all mobile screens, except Candidate Dashboard which handles tabs interactively) */}
    {pathname !== "/candidate/dashboard" && (
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-4px_25px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[54px] rounded-xl transition-all ${
              pathname === "/"
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800 font-medium"
            }`}
          >
            <Home className={`w-5 h-5 transition-transform ${pathname === "/" ? "fill-blue-600/20 stroke-[2.2]" : "stroke-[1.8]"}`} />
            <span className="text-[11px] mt-1 tracking-tight">Home</span>
          </Link>

          {/* 2. Jobs */}
          <Link
            href="/jobs"
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[54px] rounded-xl transition-all ${
              pathname.startsWith("/jobs") && !pathname.includes("saved")
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800 font-medium"
            }`}
          >
            <Briefcase className={`w-5 h-5 transition-transform ${pathname.startsWith("/jobs") && !pathname.includes("saved") ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
            <span className="text-[11px] mt-1 tracking-tight">Jobs</span>
          </Link>

          {/* 3. Saved */}
          <Link
            href={currentUser ? "/candidate/dashboard?tab=saved" : "/jobs?filter=saved"}
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[54px] rounded-xl transition-all ${
              pathname.includes("saved") || (pathname === "/jobs" && (typeof window !== "undefined" && window.location.search.includes("saved")))
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800 font-medium"
            }`}
          >
            <Bookmark className={`w-5 h-5 transition-transform ${pathname.includes("saved") || (pathname === "/jobs" && (typeof window !== "undefined" && window.location.search.includes("saved"))) ? "fill-blue-600/20 stroke-[2.2]" : "stroke-[1.8]"}`} />
            <span className="text-[11px] mt-1 tracking-tight">Saved</span>
          </Link>

          {/* 4. Profile */}
          <Link
            href={
              currentUser
                ? currentUser.role === "company"
                  ? "/company/dashboard"
                  : currentUser.role === "admin"
                  ? "/admin"
                  : "/candidate/dashboard"
                : "/login"
            }
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[54px] rounded-xl transition-all cursor-pointer ${
              pathname.startsWith("/candidate") || pathname.startsWith("/company") || pathname.startsWith("/admin")
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800 font-medium"
            }`}
          >
            <User className={`w-5 h-5 transition-transform ${pathname.startsWith("/candidate") || pathname.startsWith("/company") ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
            <span className="text-[11px] mt-1 tracking-tight">Profile</span>
          </Link>
        </div>
      </nav>
    )}
  </>
  );
}
