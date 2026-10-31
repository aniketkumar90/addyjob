"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { downloadCandidateResume } from "@/lib/resumeDownload";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  User,
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  Bookmark,
  Bell,
  MessageSquare,
  Settings,
  LayoutDashboard,
  Send,
  Calendar,
  Eye,
  CheckCircle2,
  ChevronRight,
  Download,
  Upload,
  Crown,
  Headphones,
  Search,
  Edit3,
  X,
  ChevronDown,
  LogOut,
  Sparkles,
  Camera,
  Home,
  CheckCircle,
  ArrowRight,
  Menu,
  MoreVertical,
  MoreHorizontal,
  Plus,
  UploadCloud,
  ExternalLink,
  FolderGit2,
  Code2,
  Trophy,
  Award,
  UserCheck,
  HeartHandshake,
  FileEdit,
  Compass,
  Check,
  Trash2,
} from "lucide-react";
import {
  getStoredUser,
  setStoredUser,
  notifyApplicationSync,
  getAuthToken,
  setAuthSession,
  clearAuthSession,
  fetchCurrentUser,
  updateUserProfile,
  UserSession,
  getLocalAppliedJobs,
  saveLocalAppliedJob,
  fetchCandidateApplicationsFromDB,
  getLocalSavedJobs,
  toggleLocalSavedJob,
  safeSetLocalStorage,
  fetchPublicCompanies,
  getLocalCandidateMessages,
  saveLocalCandidateMessages,
} from "@/lib/api";
import AppliedJobsView, { AppliedJobItem } from "@/components/candidate/AppliedJobsView";
import SavedJobsView from "@/components/candidate/SavedJobsView";
import CandidateMessagesView, { ConversationThread } from "@/components/candidate/CandidateMessagesView";
import JobAlertsView, { JobAlertItem } from "@/components/candidate/JobAlertsView";

const DEFAULT_INITIAL_APPLIED_JOBS: AppliedJobItem[] = [
  {
    id: "app-default-1",
    jobId: "job-infinite-net-eng",
    title: "Associate Network Engineer",
    company: "Infinite",
    companyId: "infinite-1",
    location: "Bengaluru, India",
    salary: "₹ 4 - 6 LPA",
    type: "Full Time",
    workplace: "On-site",
    appliedDate: "08 Oct '26",
    appliedOn: "08 Oct '26",
    status: "Resume Viewed",
    statusStep: 3,
    recruiterStatus: "Recruiter last active 1d ago",
    totalApplicants: 3772,
    viewedCount: 1681,
    rating: 3.3,
    reviewsCount: "175 Reviews",
    viewedDays: "Resume viewed 6 days ago",
  },
  {
    id: "app-default-2",
    jobId: "job-wonks-python",
    title: "Python Trainer & Developer",
    company: "Wonksknow Technologies",
    companyId: "wonks-2",
    location: "Noida / Remote",
    salary: "₹ 5 - 8 LPA",
    type: "Full Time",
    workplace: "Hybrid",
    appliedDate: "12 Oct '26",
    appliedOn: "12 Oct '26",
    status: "Resume Viewed",
    statusStep: 3,
    recruiterStatus: "Recruiter last active 2d ago",
    totalApplicants: 1420,
    viewedCount: 890,
    rating: 4.1,
    reviewsCount: "6 Reviews",
    viewedDays: "Resume viewed 2 days ago",
  },
  {
    id: "app-default-3",
    jobId: "job-jobaaj-ai-eng",
    title: "AI Engineer",
    company: "Jobaaj Com",
    companyId: "jobaaj-3",
    location: "Gurugram, India",
    salary: "₹ 8 - 14 LPA",
    type: "Full Time",
    workplace: "On-site",
    appliedDate: "10 Oct '26",
    appliedOn: "10 Oct '26",
    status: "Resume Viewed",
    statusStep: 3,
    recruiterStatus: "Recruiter last active today",
    totalApplicants: 2150,
    viewedCount: 1204,
    rating: 3.7,
    reviewsCount: "68 Reviews",
    viewedDays: "Resume viewed 4 days ago",
  },
  {
    id: "app-default-4",
    jobId: "job-jobaaj-fullstack",
    title: "Fullstack Developer",
    company: "Jobaaj Com",
    companyId: "jobaaj-3",
    location: "Noida / Hybrid",
    salary: "₹ 7 - 12 LPA",
    type: "Full Time",
    workplace: "Hybrid",
    appliedDate: "09 Oct '26",
    appliedOn: "09 Oct '26",
    status: "Resume Viewed",
    statusStep: 3,
    recruiterStatus: "Recruiter last active today",
    totalApplicants: 1980,
    viewedCount: 940,
    rating: 3.7,
    reviewsCount: "68 Reviews",
    viewedDays: "Resume viewed 5 days ago",
  },
  {
    id: "app-default-5",
    jobId: "job-sowiz-ai-intern",
    title: "AI Intern",
    company: "Sowiz",
    companyId: "sowiz-5",
    location: "Bengaluru, India",
    salary: "₹ 25k / mo",
    type: "Internship",
    workplace: "Remote",
    appliedDate: "08 Oct '26",
    appliedOn: "08 Oct '26",
    status: "Application Sent",
    statusStep: 1,
    recruiterStatus: "Recruiter last active 4w ago",
    totalApplicants: 860,
    viewedCount: 310,
    rating: 3.5,
    reviewsCount: "12 Reviews",
    viewedDays: "Application sent 6 days ago",
  },
];

const DEFAULT_INITIAL_THREADS: ConversationThread[] = [
  {
    id: "thread-infinite-hr",
    companyName: "Infinite",
    companyId: "infinite-1",
    role: "Associate Network Engineer",
    lastActive: "1d ago",
    unread: true,
    messages: [
      {
        id: "msg-1",
        sender: "recruiter",
        senderName: "HR Recruiter at Infinite",
        time: "Yesterday, 3:30 PM",
        text: "Hi! We reviewed your profile for Associate Network Engineer. Are you available for a brief technical screening call this week?",
      },
    ],
  },
  {
    id: "thread-jobaaj-recruiter",
    companyName: "Jobaaj Com",
    companyId: "jobaaj-3",
    role: "AI Engineer",
    lastActive: "Today",
    unread: false,
    messages: [
      {
        id: "msg-2",
        sender: "recruiter",
        senderName: "Senior Talent Acquisition at Jobaaj",
        time: "Today, 11:15 AM",
        text: "Hello! We were impressed by your background. Could you please share your updated resume and earliest joining date?",
      },
      {
        id: "msg-3",
        sender: "candidate",
        senderName: "You",
        time: "Today, 11:45 AM",
        text: "Thank you for reaching out! My resume is attached to the profile and I have a 15-day notice period.",
      },
      {
        id: "msg-4",
        sender: "recruiter",
        senderName: "Senior Talent Acquisition at Jobaaj",
        time: "Today, 12:00 PM",
        text: "Great! Our hiring manager will schedule the interview link shortly.",
      },
    ],
  },
];

const DEFAULT_JOB_ALERTS: JobAlertItem[] = [
  {
    id: "alert-1",
    role: "Fullstack Developer",
    location: "Remote / Hybrid",
    frequency: "Daily",
    active: true,
    createdAt: "2 days ago",
  },
  {
    id: "alert-2",
    role: "AI / ML Engineer",
    location: "Bengaluru / Noida",
    frequency: "Daily",
    active: true,
    createdAt: "5 days ago",
  },
];

interface ApplicationItem {
  id: string;
  role: string;
  company: string;
  location: string;
  status: "Applied" | "Viewed" | "Interview" | "Shortlisted";
  date: string;
  avatarBg: string;
  avatarText: string;
}

const getInitials = (n: string): string => {
  if (!n) return "C";
  const clean = n.trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

const formatEducation = (u: any): string => {
  if (!u) return "";
  if (u.education && typeof u.education === "string" && u.education.trim()) {
    return u.education.trim();
  }
  const parts: string[] = [];
  if (u.highestQualification) parts.push(u.highestQualification);
  if (u.course && u.course !== u.highestQualification) parts.push(u.course);
  if (u.specialization) parts.push(u.specialization);

  let str = parts.filter(Boolean).join(" - ");
  if (u.university) {
    str += (str ? " • " : "") + u.university;
  }
  if (u.passingYear) {
    const yearRange = u.startingYear ? `${u.startingYear} - ${u.passingYear}` : u.passingYear;
    str += ` (${yearRange})`;
  }
  return str;
};

export interface EducationItem {
  id: string;
  degree: string;
  college: string;
  years: string;
  grade?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  techStack: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: "Beginner" | "Intermediate" | "Fluent" | "Native";
  read: boolean;
  write: boolean;
  speak: boolean;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface AccomplishmentItem {
  id: string;
  category: "Online profile" | "Work sample" | "White paper" | "Presentation" | "Patent" | "Certification";
  title: string;
  url?: string;
  organization?: string;
  date?: string;
  description?: string;
}

export default function CandidateDashboardPage() {
  const router = useRouter();

  // Profile State - all start clean/empty, loaded from backend
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [education, setEducation] = useState("");
  const [languages, setLanguages] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [resumeName, setResumeName] = useState("");
  const [resumeDate, setResumeDate] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Real backend metrics
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [interviewsCount, setInterviewsCount] = useState(0);
  const [profileViewsCount, setProfileViewsCount] = useState(0);

  // Navigation / Tab States
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    "profile" | "applied" | "saved" | "messages"
  >("profile");

  // Dynamic candidate collections
  const [appliedList, setAppliedList] = useState<AppliedJobItem[]>([]);
  const [savedList, setSavedList] = useState<any[]>([]);
  const [messageThreads, setMessageThreads] = useState<ConversationThread[]>([]);
  const [jobAlerts, setJobAlerts] = useState<JobAlertItem[]>([]);

  const [appliedSubTab, setAppliedSubTab] = useState<"applied" | "saved" | "interviews">("applied");
  const [tabletTab, setTabletTab] = useState<"about" | "skills" | "resume" | "experience" | "education">("about");

  // UI Interactive States
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [uploadResumeModalOpen, setUploadResumeModalOpen] = useState(false);
  const [completeProfileModalOpen, setCompleteProfileModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Controlled form state for Edit Profile modal
  const [editForm, setEditForm] = useState({
    name: "",
    headline: "",
    experience: "",
    location: "",
    email: "",
    phone: "",
    education: "",
    languages: "",
    bio: "",
    skills: "",
  });

  const openEditModal = () => {
    setEditForm({
      name: name || "",
      headline: headline || "",
      experience: experience || "",
      location: location || "",
      email: email || "",
      phone: phone || "",
      education: education || "",
      languages: languages || "",
      bio: bio || "",
      skills: Array.isArray(skills) ? skills.join(", ") : "",
    });
    setEditModalOpen(true);
  };

  // Dedicated Modals State for Education, Projects, Languages
  const [addEducationModalOpen, setAddEducationModalOpen] = useState(false);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [eduForm, setEduForm] = useState({
    degree: "",
    college: "",
    years: "",
    grade: "",
  });
  const [educationList, setEducationList] = useState<EducationItem[]>([]);

  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [projForm, setProjForm] = useState({
    title: "",
    techStack: "",
    description: "",
    githubUrl: "",
    liveUrl: "",
  });
  const [projectsList, setProjectsList] = useState<ProjectItem[]>([]);

  const [addLanguageModalOpen, setAddLanguageModalOpen] = useState(false);
  const [editingLangId, setEditingLangId] = useState<string | null>(null);
  const [langForm, setLangForm] = useState({
    language: "",
    proficiency: "Fluent" as "Beginner" | "Intermediate" | "Fluent" | "Native",
    read: true,
    write: true,
    speak: true,
  });
  const [languagesList, setLanguagesList] = useState<LanguageItem[]>([]);

  const [addExperienceModalOpen, setAddExperienceModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expForm, setExpForm] = useState({
    role: "",
    company: "",
    duration: "",
    description: "",
  });
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([]);

  const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  // Dedicated Modals State for Accomplishments
  const [addAccomplishmentModalOpen, setAddAccomplishmentModalOpen] = useState(false);
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [accForm, setAccForm] = useState<{
    category: AccomplishmentItem["category"];
    title: string;
    url: string;
    organization: string;
    date: string;
    description: string;
  }>({
    category: "Online profile",
    title: "",
    url: "",
    organization: "",
    date: "",
    description: "",
  });
  const [accomplishmentsList, setAccomplishmentsList] = useState<AccomplishmentItem[]>([]);

  // Dedicated Modal State for Personal Details
  const [editPersonalModalOpen, setEditPersonalModalOpen] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    dob: "",
    gender: "",
    maritalStatus: "",
    nationality: "Indian",
    address: "",
  });

  // Handlers for Education
  const openAddEducation = (item?: EducationItem) => {
    if (item) {
      setEditingEduId(item.id);
      setEduForm({
        degree: item.degree || "",
        college: item.college || "",
        years: item.years || "",
        grade: item.grade || "",
      });
    } else {
      setEditingEduId(null);
      setEduForm({
        degree: "",
        college: "",
        years: "",
        grade: "",
      });
    }
    setAddEducationModalOpen(true);
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm.degree.trim()) return;

    let updated: EducationItem[];
    if (editingEduId) {
      updated = educationList.map((item) =>
        item.id === editingEduId ? { ...item, ...eduForm } : item
      );
    } else {
      const newItem: EducationItem = {
        id: "edu-" + Date.now(),
        degree: eduForm.degree.trim(),
        college: eduForm.college.trim(),
        years: eduForm.years.trim(),
        grade: eduForm.grade.trim(),
      };
      updated = [newItem, ...educationList];
    }

    setEducationList(updated);
    if (updated[0]) {
      setEducation(updated[0].degree);
    }
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_education_${uid}`, JSON.stringify(updated));
    }
    setAddEducationModalOpen(false);
    showToast(editingEduId ? "Education updated successfully!" : "Education added successfully!");

    try {
      const topEdu = updated[0];
      await updateUserProfile({
        education: topEdu.degree,
        course: topEdu.degree,
        highestQualification: topEdu.degree,
        university: topEdu.college,
        passingYear: topEdu.years,
        gradeScore: topEdu.grade,
      });
    } catch (err) {
      console.warn("Backend education update error:", err);
    }
  };

  const handleDeleteEducation = (id: string) => {
    const updated = educationList.filter((item) => item.id !== id);
    setEducationList(updated);
    if (updated.length > 0) {
      setEducation(updated[0].degree);
    }
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_education_${uid}`, JSON.stringify(updated));
    }
    showToast("Education removed.");
  };

  // Handlers for Projects
  const openAddProject = (item?: ProjectItem) => {
    if (item) {
      setEditingProjId(item.id);
      setProjForm({
        title: item.title || "",
        techStack: item.techStack || "",
        description: item.description || "",
        githubUrl: item.githubUrl || "",
        liveUrl: item.liveUrl || "",
      });
    } else {
      setEditingProjId(null);
      setProjForm({
        title: "",
        techStack: "",
        description: "",
        githubUrl: "",
        liveUrl: "",
      });
    }
    setAddProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projForm.title.trim()) return;

    let updated: ProjectItem[];
    if (editingProjId) {
      updated = projectsList.map((p) =>
        p.id === editingProjId ? { ...p, ...projForm } : p
      );
    } else {
      const newProj: ProjectItem = {
        id: "proj-" + Date.now(),
        title: projForm.title.trim(),
        techStack: projForm.techStack.trim(),
        description: projForm.description.trim(),
        githubUrl: projForm.githubUrl.trim(),
        liveUrl: projForm.liveUrl.trim(),
      };
      updated = [newProj, ...projectsList];
    }

    setProjectsList(updated);
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_projects_${uid}`, JSON.stringify(updated));
    }
    setAddProjectModalOpen(false);
    showToast(editingProjId ? "Project updated successfully!" : "Project added successfully!");
  };

  const handleDeleteProject = (id: string) => {
    const updated = projectsList.filter((p) => p.id !== id);
    setProjectsList(updated);
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_projects_${uid}`, JSON.stringify(updated));
    }
    showToast("Project removed.");
  };

  // Handlers for Languages
  const openAddLanguage = (item?: LanguageItem) => {
    if (item) {
      setEditingLangId(item.id);
      setLangForm({
        language: item.language || "",
        proficiency: item.proficiency || "Fluent",
        read: item.read ?? true,
        write: item.write ?? true,
        speak: item.speak ?? true,
      });
    } else {
      setEditingLangId(null);
      setLangForm({
        language: "",
        proficiency: "Fluent",
        read: true,
        write: true,
        speak: true,
      });
    }
    setAddLanguageModalOpen(true);
  };

  const handleSaveLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!langForm.language.trim()) return;

    let updated: LanguageItem[];
    if (editingLangId) {
      updated = languagesList.map((l) =>
        l.id === editingLangId ? { ...l, ...langForm } : l
      );
    } else {
      const newLang: LanguageItem = {
        id: "lang-" + Date.now(),
        language: langForm.language.trim(),
        proficiency: langForm.proficiency,
        read: langForm.read,
        write: langForm.write,
        speak: langForm.speak,
      };
      updated = [...languagesList, newLang];
    }

    setLanguagesList(updated);
    const langNames = updated.map((l) => l.language).join(", ");
    setLanguages(langNames);

    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_languages_${uid}`, JSON.stringify(updated));
    }
    setAddLanguageModalOpen(false);
    showToast(editingLangId ? "Language updated successfully!" : "Language added successfully!");

    try {
      await updateUserProfile({
        languages: langNames,
      });
    } catch (err) {
      console.warn("Backend language update error:", err);
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    const updated = languagesList.filter((l) => l.id !== id);
    setLanguagesList(updated);
    const langNames = updated.map((l) => l.language).join(", ");
    setLanguages(langNames);

    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_languages_${uid}`, JSON.stringify(updated));
    }
    showToast("Language removed.");

    try {
      await updateUserProfile({
        languages: langNames,
      });
    } catch (err) {
      console.warn("Backend language update error:", err);
    }
  };

  // Handlers for Experience
  const openAddExperience = (item?: ExperienceItem) => {
    if (item) {
      setEditingExpId(item.id);
      setExpForm({
        role: item.role || "",
        company: item.company || "",
        duration: item.duration || "",
        description: item.description || "",
      });
    } else {
      setEditingExpId(null);
      setExpForm({
        role: "",
        company: "",
        duration: "",
        description: "",
      });
    }
    setAddExperienceModalOpen(true);
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.role.trim() || !expForm.company.trim()) return;

    let updated: ExperienceItem[];
    if (editingExpId) {
      updated = experienceList.map((item) =>
        item.id === editingExpId ? { ...item, ...expForm } : item
      );
    } else {
      const newItem: ExperienceItem = {
        id: "exp-" + Date.now(),
        role: expForm.role.trim(),
        company: expForm.company.trim(),
        duration: expForm.duration.trim() || "Present",
        description: expForm.description.trim(),
      };
      updated = [newItem, ...experienceList];
    }

    setExperienceList(updated);
    const primaryExp = `${updated[0]?.role} at ${updated[0]?.company}`;
    setExperience(primaryExp);
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_experience_${uid}`, JSON.stringify(updated));
    }
    setAddExperienceModalOpen(false);
    showToast(editingExpId ? "Experience updated successfully!" : "Experience added successfully!");

    try {
      await updateUserProfile({
        experience: primaryExp,
      });
    } catch (err) {
      console.warn("Backend experience update error:", err);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    const updated = experienceList.filter((item) => item.id !== id);
    setExperienceList(updated);
    const primaryExp = updated[0] ? `${updated[0].role} at ${updated[0].company}` : "Fresher";
    setExperience(primaryExp);
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_experience_${uid}`, JSON.stringify(updated));
    }
    showToast("Experience removed.");

    try {
      await updateUserProfile({
        experience: primaryExp,
      });
    } catch (err) {
      console.warn("Backend experience update error:", err);
    }
  };

  // Handlers for Accomplishments
  const openAddAccomplishment = (category?: AccomplishmentItem["category"], item?: AccomplishmentItem) => {
    if (item) {
      setEditingAccId(item.id);
      setAccForm({
        category: item.category,
        title: item.title,
        url: item.url || "",
        organization: item.organization || "",
        date: item.date || "",
        description: item.description || "",
      });
    } else {
      setEditingAccId(null);
      setAccForm({
        category: category || "Online profile",
        title: "",
        url: "",
        organization: "",
        date: "",
        description: "",
      });
    }
    setAddAccomplishmentModalOpen(true);
  };

  const handleSaveAccomplishment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accForm.title.trim()) return;

    let updated: AccomplishmentItem[];
    if (editingAccId) {
      updated = accomplishmentsList.map((item) =>
        item.id === editingAccId
          ? {
              ...item,
              category: accForm.category,
              title: accForm.title.trim(),
              url: accForm.url.trim(),
              organization: accForm.organization.trim(),
              date: accForm.date.trim(),
              description: accForm.description.trim(),
            }
          : item
      );
    } else {
      const newItem: AccomplishmentItem = {
        id: "acc-" + Date.now(),
        category: accForm.category,
        title: accForm.title.trim(),
        url: accForm.url.trim(),
        organization: accForm.organization.trim(),
        date: accForm.date.trim(),
        description: accForm.description.trim(),
      };
      updated = [newItem, ...accomplishmentsList];
    }

    setAccomplishmentsList(updated);
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_accomplishments_${uid}`, JSON.stringify(updated));
    }
    setAddAccomplishmentModalOpen(false);
    showToast(editingAccId ? "Accomplishment updated successfully!" : "Accomplishment added successfully!");
  };

  const handleDeleteAccomplishment = (id: string) => {
    const updated = accomplishmentsList.filter((item) => item.id !== id);
    setAccomplishmentsList(updated);
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_accomplishments_${uid}`, JSON.stringify(updated));
    }
    showToast("Accomplishment removed.");
  };

  // Handlers for Personal Details
  const openEditPersonal = () => {
    setPersonalForm({
      dob: (currentUser as any)?.dob || "",
      gender: (currentUser as any)?.gender || "",
      maritalStatus: (currentUser as any)?.maritalStatus || "",
      nationality: (currentUser as any)?.nationality || "Indian",
      address: location || (currentUser as any)?.preferredLocation || "",
    });
    setEditPersonalModalOpen(true);
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...(currentUser || {}),
      dob: personalForm.dob.trim(),
      gender: personalForm.gender.trim(),
      maritalStatus: personalForm.maritalStatus.trim(),
      nationality: personalForm.nationality.trim(),
      location: personalForm.address.trim() || location,
    };
    setCurrentUser(updatedUser as any);
    if (personalForm.address.trim()) {
      setLocation(personalForm.address.trim());
    }

    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_personal_${uid}`, JSON.stringify(personalForm));
    }
    setEditPersonalModalOpen(false);
    showToast("Personal details updated successfully!");

    try {
      await updateUserProfile({
        location: personalForm.address.trim() || location,
        dob: personalForm.dob.trim(),
        gender: personalForm.gender.trim(),
        maritalStatus: personalForm.maritalStatus.trim(),
        nationality: personalForm.nationality.trim(),
      } as any);
    } catch (err) {
      console.warn("Backend personal details update error:", err);
    }
  };

  // Handlers for Skills
  const openAddSkill = () => {
    setSkillInput("");
    setAddSkillModalOpen(true);
  };

  const handleAddSkills = async (newSkillsToAdd: string[]) => {
    const cleanSkills = newSkillsToAdd
      .map((s) => s.trim())
      .filter((s) => s && !skills.includes(s));
    if (cleanSkills.length === 0) return;

    const updated = [...skills, ...cleanSkills];
    setSkills(updated);
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_skills_${uid}`, JSON.stringify(updated));
    }
    setSkillInput("");
    showToast(`Added ${cleanSkills.length} skill${cleanSkills.length > 1 ? "s" : ""}!`);

    try {
      await updateUserProfile({
        skills: updated,
      });
    } catch (err) {
      console.warn("Backend skills update error:", err);
    }
  };

  const handleSaveSkillForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const split = skillInput.split(",").map((s) => s.trim()).filter(Boolean);
    handleAddSkills(split);
    setAddSkillModalOpen(false);
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_skills_${uid}`, JSON.stringify(updated));
    }
    showToast(`Removed ${skillToRemove}`);

    try {
      await updateUserProfile({
        skills: updated,
      });
    } catch (err) {
      console.warn("Backend skills update error:", err);
    }
  };

  const [activeQuickLink, setActiveQuickLink] = useState("overview");

  const scrollToSection = (id: string, linkKey: string) => {
    setActiveQuickLink(linkKey);
    const el = document.getElementById(id);
    if (el) {
      const navElement = document.querySelector("nav.sticky") || document.querySelector("nav");
      const navHeight = navElement ? navElement.getBoundingClientRect().height : 80;
      const offset = navHeight + 20;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }
  };

  const quickLinkItems = [
    { id: "overview", label: "Overview", icon: Compass, target: "overview-section" },
    { id: "resume", label: "Resume & Portfolio", icon: FileText, target: "resume-section" },
    { id: "skills", label: "Key Skills", icon: Sparkles, target: "key-skills-section" },
    { id: "experience", label: "Work Experience", icon: Briefcase, target: "employment-section" },
    { id: "education", label: "Education", icon: GraduationCap, target: "education-section" },
    { id: "it-skills", label: "IT Skills", icon: Code2, target: "it-skills-section" },
    { id: "projects", label: "Projects", icon: FolderGit2, target: "projects-section" },
    { id: "personal-details", label: "Personal Details", icon: User, target: "personal-details-section" },
    { id: "languages", label: "Languages", icon: Globe, target: "languages-section" },
  ];

  // Applications list
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  const populateFromUser = (u: UserSession) => {
    setCurrentUser(u);
    setName(u.name || (u as any).fullName || u.email?.split("@")[0] || "");
    setEmail(u.email || "");
    setHeadline(u.headline || u.targetRole || "");
    setExperience(u.experience || "");
    setLocation(u.location || u.preferredLocation || "");
    setPhone(u.phone || "");
    setBio(u.bio || "");
    setLanguages(u.languages || "");

    if (Array.isArray(u.skills) && u.skills.length > 0) {
      setSkills(u.skills);
    } else {
      setSkills([]);
    }

    const eduStr = u.education || (u.course ? u.course : "") || formatEducation(u);
    setEducation(eduStr || "");

    setResumeName(u.resumeName || "");
    setResumeDate(u.resumeDate || "");
    setResumeUrl(u.resumeUrl || "");

    setAppliedJobsCount(u.appliedJobsCount ?? 0);
    setSavedJobsCount(u.savedJobsCount ?? 0);
    setInterviewsCount(u.interviewsCount ?? 0);
    setProfileViewsCount(u.profileViewsCount ?? 0);

    const uid = u.id || u.userId || u.email || "candidate";
    let imgToSet = u.profileImage || (u as any).logo || null;
    if (typeof window !== "undefined") {
      try {
        const savedImg = localStorage.getItem(`candidate_profile_image_${uid}`);
        if (savedImg) imgToSet = savedImg;
      } catch {}
    }
    setProfileImage(imgToSet);

    if (typeof window !== "undefined") {
      try {
        const savedEdu = localStorage.getItem(`candidate_education_${uid}`);
        if (savedEdu) {
          const parsedEdu = JSON.parse(savedEdu);
          if (Array.isArray(parsedEdu) && parsedEdu.length > 0) {
            setEducationList(parsedEdu);
          }
        } else if (u.education || u.course || u.university) {
          setEducationList([
            {
              id: "edu-1",
              degree: u.education || u.course || "",
              college: u.university || "",
              years: u.passingYear ? (u.startingYear ? `${u.startingYear} - ${u.passingYear}` : u.passingYear) : "",
              grade: u.gradeScore ? (u.gradingSystem ? `${u.gradingSystem}: ${u.gradeScore}` : u.gradeScore) : "",
            },
          ]);
        } else {
          setEducationList([]);
        }

        const savedProj = localStorage.getItem(`candidate_projects_${uid}`);
        if (savedProj) {
          const parsedProj = JSON.parse(savedProj);
          if (Array.isArray(parsedProj) && parsedProj.length > 0) {
            setProjectsList(parsedProj);
          } else {
            setProjectsList([]);
          }
        } else {
          setProjectsList([]);
        }

        const savedLang = localStorage.getItem(`candidate_languages_${uid}`);
        if (savedLang) {
          const parsedLang = JSON.parse(savedLang);
          if (Array.isArray(parsedLang) && parsedLang.length > 0) {
            setLanguagesList(parsedLang);
          } else {
            setLanguagesList([]);
          }
        } else if (u.languages) {
          const parsed = u.languages
            .split(",")
            .map((l: string, i: number) => ({
              id: `lang-${i + 1}`,
              language: l.trim(),
              proficiency: i === 0 ? ("Fluent" as const) : ("Native" as const),
              read: true,
              write: true,
              speak: true,
            }))
            .filter((x: any) => x.language);
          setLanguagesList(parsed as LanguageItem[]);
        } else {
          setLanguagesList([]);
        }

        const savedExp = localStorage.getItem(`candidate_experience_${uid}`);
        if (savedExp) {
          const parsedExp = JSON.parse(savedExp);
          if (Array.isArray(parsedExp) && parsedExp.length > 0) {
            setExperienceList(parsedExp);
          } else {
            setExperienceList([]);
          }
        } else if (u.experience && u.experience.trim()) {
          setExperienceList([
            {
              id: "exp-1",
              role: u.targetRole || "Role",
              company: "Organization",
              duration: u.experience,
              description: "",
            },
          ]);
        } else {
          setExperienceList([]);
        }

        const savedSkills = localStorage.getItem(`candidate_skills_${uid}`);
        if (savedSkills) {
          const parsedSkills = JSON.parse(savedSkills);
          if (Array.isArray(parsedSkills) && parsedSkills.length > 0) {
            setSkills(parsedSkills);
          }
        }

        const savedAcc = localStorage.getItem(`candidate_accomplishments_${uid}`);
        if (savedAcc) {
          const parsedAcc = JSON.parse(savedAcc);
          if (Array.isArray(parsedAcc) && parsedAcc.length > 0) {
            setAccomplishmentsList(parsedAcc);
          }
        }

        const savedPersonal = localStorage.getItem(`candidate_personal_${uid}`);
        if (savedPersonal) {
          const parsedPersonal = JSON.parse(savedPersonal);
          if (parsedPersonal) {
            setPersonalForm(parsedPersonal);
          }
        }
      } catch (err) {
        console.warn("Could not load sub-items from localStorage:", err);
      }
    }
  };

  // Synchronize applied jobs, saved jobs, recruiter messages, and job alerts
  const isSyncingRef = useRef(false);
  const loadAppliedAndSaved = async (u?: UserSession | null, isBackground = false) => {
    if (isSyncingRef.current) return;
    if (isBackground && typeof document !== "undefined" && document.hidden) return;
    isSyncingRef.current = true;
    try {
    const userObj = u || currentUser || getStoredUser();
    const isRealUser = Boolean(userObj?.id || userObj?.userId || userObj?.email);
    const userEmail = (userObj?.email || "").trim().toLowerCase();
    const userId = userObj?.id || userObj?.userId;
    const uid = userId || userEmail || "candidate";

    // Collect all identity keys for the logged-in candidate (strictly isolate to current user)
    const userKeys = isRealUser
      ? Array.from(
          new Set(
            [userObj?.id, (userObj as any)?._id, userObj?.userId, userEmail]
              .filter(Boolean)
              .map(String)
          )
        )
      : [uid];

    // 1. Load Local Applied Jobs strictly for this candidate from their identity keys
    const localAppliedMap = new Map<string, any>();
    userKeys.forEach((k) => {
      const list = getLocalAppliedJobs(k);
      if (Array.isArray(list)) {
        list.forEach((item: any) => {
          // Verify that this local item actually belongs to this candidate
          if (userEmail && item.candidateEmail && String(item.candidateEmail).trim().toLowerCase() !== userEmail) {
            return;
          }
          if (userId && item.candidateId && String(item.candidateId) !== String(userId)) {
            return;
          }
          const key = item.jobId || item.id || item._id;
          if (key && !localAppliedMap.has(String(key))) {
            localAppliedMap.set(String(key), item);
          }
        });
      }
    });

    const localApplied = Array.from(localAppliedMap.values());

    // Filter out any previous dummy items from local storage
    const cleanLocalApplied = localApplied.filter((item: any) => {
      const isDefaultDummy = ["app-default-1", "app-default-2", "app-default-3", "app-default-4", "app-default-5"].includes(item.id);
      const isProfileUploadDummy = item.company === "Candidate Profile Upload" && !item.jobId;
      return !isDefaultDummy && !isProfileUploadDummy;
    });

    // Only query backend for THIS candidate's email identity
    const candidateEmails = userEmail ? [userEmail] : [];

    // 2. Load DB Applications strictly for this candidate
    let dbApplications: any[] = [];
    if (candidateEmails.length > 0 || userId) {
      try {
        dbApplications = await fetchCandidateApplicationsFromDB(
          candidateEmails,
          userId,
          undefined,
          undefined
        );
      } catch (e) {
        console.warn("Could not fetch DB applications:", e);
      }
    }

    // Fetch registered/active companies to verify existence
    let activeCompanies: any[] = [];
    try {
      activeCompanies = await fetchPublicCompanies();
    } catch (e) {
      console.warn("Could not fetch public companies:", e);
    }

    const validCompanyIds = new Set<string>();
    const validCompanyNames = new Set<string>();
    const hasCompanyVerificationData = Array.isArray(activeCompanies) && activeCompanies.length > 0;

    if (hasCompanyVerificationData) {
      activeCompanies.forEach((comp: any) => {
        if (comp._id) validCompanyIds.add(String(comp._id).trim().toLowerCase());
        if (comp.id) validCompanyIds.add(String(comp.id).trim().toLowerCase());
        if (comp.userId) validCompanyIds.add(String(comp.userId).trim().toLowerCase());
        if (comp.customId) validCompanyIds.add(String(comp.customId).trim().toLowerCase());
        const cName = (comp.companyName || comp.name || "").trim().toLowerCase();
        if (cName) validCompanyNames.add(cName);
      });
    }

    const isCompanyValid = (cName?: string, cId?: string): boolean => {
      if (!hasCompanyVerificationData) return true;
      const normName = (cName || "").trim().toLowerCase();
      const normId = (cId || "").trim().toLowerCase();
      return Boolean((normId && validCompanyIds.has(normId)) || (normName && validCompanyNames.has(normName)));
    };

    // Merge DB & Local applications
    const mergedAppliedMap = new Map<string, AppliedJobItem>();

    // Add DB applications
    if (Array.isArray(dbApplications)) {
      dbApplications.forEach((app: any) => {
        // Exclude profile upload placeholders that are not job applications
        if (app.company === "Candidate Profile Upload" && !app.jobId) {
          return;
        }

        const appCandEmail = (app.candidateEmail || "").trim().toLowerCase();
        const appCandId = app.candidateId ? String(app.candidateId) : "";
        const emailMatches = Boolean(userEmail && appCandEmail && appCandEmail === userEmail);
        const idMatches = Boolean(userId && appCandId && (appCandId === String(userObj?.id) || appCandId === String(userObj?.userId)));

        // Strict verification: skip any application that belongs to another candidate
        if (isRealUser && !emailMatches && !idMatches) {
          return;
        }

        const jComp = (typeof app.jobId === "object" ? app.jobId?.company : "") || app.company || "Company";
        const jCompId = app.companyId || (typeof app.jobId === "object" ? app.jobId?.companyId : undefined);

        // Skip applications for non-existent / deleted companies
        if (!isCompanyValid(jComp, jCompId)) {
          return;
        }

        const rawJobId = typeof app.jobId === "object" ? (app.jobId?._id || app.jobId?.id) : app.jobId;
        const jId = String(rawJobId || app._id || "");
        const jTitle = (typeof app.jobId === "object" ? app.jobId?.title : "") || app.position || app.jobTitle || app.title || "Applied Role";
        const jLoc = (typeof app.jobId === "object" ? app.jobId?.location : "") || app.location || "Remote";
        const jSal = (typeof app.jobId === "object" ? app.jobId?.salary : "") || app.salary || "Competitive";
        const jApplicantsCount = app.totalApplicants || (typeof app.jobId === "object" ? app.jobId?.applicantsCount : 0) || 1;
        const jRating = (typeof app.jobId === "object" ? app.jobId?.rating : 0) || app.rating || 4.8;
        const jReviewsCount = (typeof app.jobId === "object" ? app.jobId?.reviewsCount : "") || app.reviewsCount || "120 Reviews";

        const st = (app.status || "New").trim();
        const recAction = (app.recruiterAction || (["Shortlisted", "Interview", "Hired", "Rejected"].includes(st) ? st : "")).trim();
        const isHired = recAction.toLowerCase() === "hired" || st.toLowerCase() === "hired";
        const isShortlisted = recAction.toLowerCase() === "shortlisted" || st.toLowerCase() === "shortlisted";
        const isInterview = recAction.toLowerCase() === "interview" || st.toLowerCase() === "interview";
        const isRejected = recAction.toLowerCase() === "rejected" || st.toLowerCase() === "rejected";
        const hasAction = isHired || isShortlisted || isInterview || isRejected;

        const isResumeViewed = Boolean(
          app.resumeViewed ||
          hasAction ||
          ["Reviewed", "Reviewing", "Resume Viewed"].includes(st)
        );

        const jViewedCount = typeof app.viewedCount === "number" ? app.viewedCount : (isResumeViewed ? 1 : 0);
        const statusStep = hasAction ? 3 : isResumeViewed ? 2 : 1;
        const recruiterStatus = hasAction
          ? (isHired ? "Offer / Hired by Recruiter" : isShortlisted ? "Shortlisted for next round" : isInterview ? "Interview Scheduled" : "Application closed")
          : isResumeViewed
          ? "Resume reviewed by recruiter"
          : "Recruiter received application";

        const viewedDays = app.resumeViewedAt
          ? new Date(app.resumeViewedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
          : isResumeViewed
          ? "Recently"
          : undefined;

        if (jId) {
          mergedAppliedMap.set(jId, {
            id: String(app._id || jId),
            jobId: jId,
            title: jTitle,
            company: jComp,
            companyId: jCompId,
            logo: (typeof app.jobId === "object" ? app.jobId?.logo : "") || app.logo || (typeof app.jobId === "object" ? app.jobId?.companyLogo : "") || "",
            location: jLoc,
            salary: jSal,
            appliedDate: app.appliedDate || (app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "Today"),
            appliedOn: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recently",
            status: st,
            statusStep,
            resumeViewed: isResumeViewed,
            resumeViewedAt: app.resumeViewedAt,
            recruiterAction: recAction || (hasAction ? st : undefined),
            recruiterActionAt: app.recruiterActionAt,
            recruiterStatus,
            totalApplicants: jApplicantsCount,
            viewedCount: jViewedCount,
            rating: jRating,
            reviewsCount: jReviewsCount,
            viewedDays,
            candidateName: app.candidateName || userObj?.name,
            candidateEmail: app.candidateEmail || userObj?.email,
          });
        }
      });
    }

    // Add local applied jobs (merges matching DB entries using String comparisons)
    cleanLocalApplied.forEach((item: any) => {
      // Skip local applied jobs if company does not exist
      if (!isCompanyValid(item.company, item.companyId)) {
        return;
      }

      const itemJobId = String(item.jobId || "");
      const itemId = String(item.id || "");
      const itemTitle = (item.title || "").trim().toLowerCase();
      const itemCompany = (item.company || "").trim().toLowerCase();

      // Find matching DB entry by key, jobId, id, or role+company
      let matchedKey = "";
      for (const [k, dbItem] of mergedAppliedMap.entries()) {
        if (
          (itemJobId && (k === itemJobId || String(dbItem.jobId) === itemJobId)) ||
          (itemId && (k === itemId || String(dbItem.id) === itemId)) ||
          (itemTitle && itemCompany && dbItem.title?.trim().toLowerCase() === itemTitle && dbItem.company?.trim().toLowerCase() === itemCompany)
        ) {
          matchedKey = k;
          break;
        }
      }

      if (matchedKey) {
        const existingDb = mergedAppliedMap.get(matchedKey)!;
        // DB is authoritative for status, recruiter action, and activity counts
        mergedAppliedMap.set(matchedKey, {
          ...item,
          ...existingDb,
          id: existingDb.id || item.id,
          jobId: existingDb.jobId || item.jobId,
          status: existingDb.status,
          statusStep: existingDb.statusStep,
          resumeViewed: existingDb.resumeViewed,
          resumeViewedAt: existingDb.resumeViewedAt,
          recruiterAction: existingDb.recruiterAction,
          recruiterActionAt: existingDb.recruiterActionAt,
          recruiterStatus: existingDb.recruiterStatus,
          viewedDays: existingDb.viewedDays || item.viewedDays,
          totalApplicants: existingDb.totalApplicants || item.totalApplicants || 1,
          viewedCount: typeof existingDb.viewedCount === "number" ? existingDb.viewedCount : (item.viewedCount || 0),
        });
      } else {
        const key = itemJobId || itemId;
        if (key) {
          mergedAppliedMap.set(key, {
            ...item,
            id: itemId || key,
            jobId: itemJobId || key,
            statusStep: item.statusStep || 1,
            recruiterStatus: item.recruiterStatus || "Application submitted",
            totalApplicants: item.totalApplicants || 1,
            viewedCount: item.viewedCount || 0,
            rating: item.rating || 4.8,
            reviewsCount: item.reviewsCount || "120 Reviews",
            viewedDays: item.viewedDays || "Application submitted today",
          });
        }
      }
    });

    const finalApplied = Array.from(mergedAppliedMap.values()).filter((item) =>
      isCompanyValid(item.company, item.companyId)
    );
    setAppliedList(finalApplied);
    setAppliedJobsCount(finalApplied.length);

    if (isRealUser) {
      userKeys.forEach((k) => {
        try {
          safeSetLocalStorage(`candidate_applied_jobs_${k}`, JSON.stringify(finalApplied));
        } catch (e) {}
      });
      try {
        localStorage.removeItem("candidate_applied_jobs_candidate");
      } catch (e) {}
    }

    // 3. Load Saved Jobs
    const localSaved = getLocalSavedJobs(uid);
    const validSaved = localSaved.filter((item: any) => isCompanyValid(item.company, item.companyId));
    setSavedList(validSaved);
    setSavedJobsCount(validSaved.length);
    if (validSaved.length !== localSaved.length) {
      try {
        safeSetLocalStorage(`candidate_saved_jobs_${uid}`, JSON.stringify(validSaved));
      } catch {}
    }

    // 4. Load Messages
    const localMessages = getLocalCandidateMessages(uid);
    let messagesToUse = (localMessages && localMessages.length > 0) ? localMessages : DEFAULT_INITIAL_THREADS;
    if (hasCompanyVerificationData) {
      messagesToUse = messagesToUse.filter((t: ConversationThread) => isCompanyValid(t.companyName, t.companyId));
    }
    setMessageThreads(messagesToUse);
    if (localMessages && localMessages.length > 0) {
      saveLocalCandidateMessages(uid, messagesToUse);
    }

    // 5. Load Alerts
    try {
      const storedAlerts = localStorage.getItem(`candidate_alerts_${uid}`);
      if (storedAlerts) {
        setJobAlerts(JSON.parse(storedAlerts));
      } else {
        setJobAlerts(DEFAULT_JOB_ALERTS);
      }
    } catch {
      setJobAlerts(DEFAULT_JOB_ALERTS);
    }
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Handlers for Save, Messages, and Alerts
  const handleToggleSave = (job: any) => {
    const storedUser = getStoredUser();
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || storedUser?.id || storedUser?.userId || storedUser?.email || "candidate";

    const jId = String(job.jobId || job.id || job._id || "");
    const normalizedJob = {
      ...job,
      id: jId,
      _id: jId,
      jobId: jId,
      title: job.title || "Job Title",
      company: job.company || "Company",
      location: job.location || "Remote",
      salary: job.salary || "Competitive",
      type: job.type || "Full-time",
      workplace: job.workplace || "Hybrid",
      tags: Array.isArray(job.tags) && job.tags.length > 0 ? job.tags : Array.isArray(job.skills) ? job.skills : [],
      rating: job.rating || 4.8,
      reviewsCount: job.reviewsCount || "120 Reviews",
      savedAt: new Date().toISOString(),
    };

    const res = toggleLocalSavedJob(uid, normalizedJob);
    setSavedList(res.list);
    setSavedJobsCount(res.list.length);
    showToast(res.saved ? "Job saved successfully!" : "Job removed from saved.");
  };

  const handleRemoveSaved = (jobId: string) => {
    const storedUser = getStoredUser();
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || storedUser?.id || storedUser?.userId || storedUser?.email || "candidate";
    const current = getLocalSavedJobs(uid);
    const targetId = String(jobId);
    const updated = current.filter((j: any) => {
      const curId = String(j.id || j._id || j.jobId || "");
      return curId !== targetId;
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_saved_jobs_${uid}`, JSON.stringify(updated));
      window.dispatchEvent(new Event("saved_jobs_change"));
    }
    setSavedList(updated);
    setSavedJobsCount(updated.length);
    showToast("Job removed from saved.");
  };

  const isJobSaved = (target: any) => {
    if (!target) return false;
    const targetId = typeof target === "object" ? String(target.jobId || target.id || target._id || "") : String(target);
    const targetTitle = typeof target === "object" ? (target.title || "").trim().toLowerCase() : "";
    const targetCompany = typeof target === "object" ? (target.company || "").trim().toLowerCase() : "";

    return savedList.some((j: any) => {
      const jId = String(j.jobId || j.id || j._id || "");
      if (targetId && (jId === targetId || String(j.id) === targetId || String(j.jobId) === targetId)) {
        return true;
      }
      if (targetTitle && targetCompany) {
        const jTitle = (j.title || "").trim().toLowerCase();
        const jComp = (j.company || "").trim().toLowerCase();
        if (jTitle === targetTitle && jComp === targetCompany) {
          return true;
        }
      }
      return false;
    });
  };

  const handleSendMessage = (threadId: string, text: string) => {
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    const updatedThreads = messageThreads.map((thread) => {
      if (thread.id === threadId) {
        const newMsg = {
          id: `msg-${Date.now()}`,
          sender: "candidate" as const,
          senderName: name || "You",
          time: "Just now",
          text: text.trim(),
        };
        return {
          ...thread,
          lastActive: "Just now",
          messages: [...thread.messages, newMsg],
        };
      }
      return thread;
    });

    setMessageThreads(updatedThreads);
    saveLocalCandidateMessages(uid, updatedThreads);

    // Friendly recruiter simulation response
    setTimeout(() => {
      const recThreads = updatedThreads.map((thread) => {
        if (thread.id === threadId) {
          const replyMsg = {
            id: `msg-reply-${Date.now()}`,
            sender: "recruiter" as const,
            senderName: `Recruiter at ${thread.companyName}`,
            time: "Just now",
            text: `Thank you for your response! We received your message regarding ${thread.role || "your application"}. Our hiring manager will contact you shortly.`,
          };
          return {
            ...thread,
            lastActive: "Just now",
            messages: [...thread.messages, replyMsg],
          };
        }
        return thread;
      });
      setMessageThreads(recThreads);
      saveLocalCandidateMessages(uid, recThreads);
    }, 1800);
  };

  const handleSelectCompanyForMessage = (companyName: string, companyId?: string) => {
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    let existing = messageThreads.find(
      (t) => t.companyName.toLowerCase() === companyName.toLowerCase()
    );

    if (!existing) {
      const newThread: ConversationThread = {
        id: `thread-${Date.now()}`,
        companyName,
        companyId,
        role: "Job Application Inquiry",
        lastActive: "Just now",
        unread: false,
        messages: [
          {
            id: `msg-init-${Date.now()}`,
            sender: "recruiter",
            senderName: `HR at ${companyName}`,
            time: "Just now",
            text: `Hello! Thanks for reaching out regarding our opening at ${companyName}. How can we assist you?`,
          },
        ],
      };
      const updated = [newThread, ...messageThreads];
      setMessageThreads(updated);
      saveLocalCandidateMessages(uid, updated);
    }

    setActiveSidebarTab("messages");
  };

  const handleCreateAlert = (role: string, location: string) => {
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    const newAlert: JobAlertItem = {
      id: `alert-${Date.now()}`,
      role: role.trim(),
      location: location.trim() || "Any Location",
      frequency: "Daily",
      active: true,
      createdAt: "Just now",
    };
    const updated = [newAlert, ...jobAlerts];
    setJobAlerts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_alerts_${uid}`, JSON.stringify(updated));
    }
    showToast(`Job alert created for "${role}"!`);
  };

  const handleDeleteAlert = (alertId: string) => {
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    const updated = jobAlerts.filter((a) => a.id !== alertId);
    setJobAlerts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_alerts_${uid}`, JSON.stringify(updated));
    }
    showToast("Job alert deleted.");
  };

  const handleToggleAlert = (alertId: string) => {
    const uid = currentUser?.id || currentUser?.userId || currentUser?.email || "candidate";
    const updated = jobAlerts.map((a) => (a.id === alertId ? { ...a, active: !a.active } : a));
    setJobAlerts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`candidate_alerts_${uid}`, JSON.stringify(updated));
    }
  };

  // Load user data on mount from backend
  useEffect(() => {
    const init = async () => {
      const stored = getStoredUser();
      if (!stored) {
        window.location.href = "/login";
        return;
      }
      populateFromUser(stored);
      loadAppliedAndSaved(stored);

      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get("tab");
        if (tab === "saved") {
          setActiveSidebarTab("saved");
        } else if (tab === "applied") {
          setActiveSidebarTab("applied");
        } else if (tab === "messages") {
          setActiveSidebarTab("messages");
        }
      }

      try {
        const fresh = await fetchCurrentUser();
        if (fresh) {
          populateFromUser(fresh);
          loadAppliedAndSaved(fresh);
        }
      } catch (e) {
        console.error("Failed to fetch fresh user from backend:", e);
      }
    };
    init();

    // Cross-tab and live recruiter synchronization
    const handleSync = () => {
      loadAppliedAndSaved(null, true);
    };
    window.addEventListener("applied_jobs_change", handleSync);
    window.addEventListener("job_application_submitted", handleSync);
    window.addEventListener("saved_jobs_change", handleSync);
    window.addEventListener("messages_change", handleSync);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("addyjob_channel");
      bc.onmessage = () => {
        handleSync();
      };
    } catch {}

    return () => {
      window.removeEventListener("applied_jobs_change", handleSync);
      window.removeEventListener("job_application_submitted", handleSync);
      window.removeEventListener("saved_jobs_change", handleSync);
      window.removeEventListener("messages_change", handleSync);
      if (bc) bc.close();
    };
  }, []);

  // Compute profile completion score strictly from filled fields
  const calculateProfileScore = () => {
    let score = 0;
    if (name) score += 15;
    if (email) score += 15;
    if (phone) score += 10;
    if (headline || experience) score += 15;
    if (location) score += 10;
    if (skills.length > 0) score += 15;
    if (education) score += 10;
    if (bio) score += 10;
    return Math.min(100, score);
  };
  const profileCompletion = calculateProfileScore();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file (PNG, JPG, JPEG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) return;

      setProfileImage(base64Data);

      const user = getStoredUser();
      const uid = user?.id || user?.userId || user?.email || "candidate";

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`candidate_profile_image_${uid}`, base64Data);
        } catch {}
        if (user) {
          const updated = { ...user, profileImage: base64Data };
          setStoredUser(updated);
          setCurrentUser(updated);
          window.dispatchEvent(new Event("auth_change"));
        }
      }

      try {
        await updateUserProfile({ profileImage: base64Data });
        notifyApplicationSync();
        showToast("Profile picture updated successfully!");
      } catch (err) {
        console.warn("Backend profile picture sync warning:", err);
        showToast("Profile picture updated!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfileImage = async () => {
    setProfileImage(null);
    const user = getStoredUser();
    const uid = user?.id || user?.userId || user?.email || "candidate";
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`candidate_profile_image_${uid}`);
      } catch {}
      if (user) {
        const updated = { ...user, profileImage: "" };
        setStoredUser(updated);
        setCurrentUser(updated);
        window.dispatchEvent(new Event("auth_change"));
      }
    }
    try {
      await updateUserProfile({ profileImage: "" });
      notifyApplicationSync();
      showToast("Profile picture removed");
    } catch {
      showToast("Profile picture removed");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const trimmedName = editForm.name.trim() || name;
    const trimmedHeadline = editForm.headline.trim();
    const trimmedExp = editForm.experience.trim();
    const trimmedLoc = editForm.location.trim();
    const trimmedPhone = editForm.phone.trim();
    const trimmedEmail = editForm.email.trim() || email;
    const trimmedBio = editForm.bio.trim();
    const trimmedEdu = editForm.education.trim();
    const trimmedLang = editForm.languages.trim();
    const parsedSkills = editForm.skills
      ? editForm.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // 1. Immediately update all React state variables so About Me & header update instantly
    setName(trimmedName);
    setHeadline(trimmedHeadline);
    setExperience(trimmedExp);
    setLocation(trimmedLoc);
    setPhone(trimmedPhone);
    setEmail(trimmedEmail);
    setBio(trimmedBio);
    setEducation(trimmedEdu);
    setLanguages(trimmedLang);
    setSkills(parsedSkills);

    // 2. Immediately update localStorage session
    const stored = getStoredUser();
    const updatedUser: UserSession = {
      ...(stored || ({} as UserSession)),
      id: stored?.id || currentUser?.id || "temp-id",
      userId: stored?.userId || currentUser?.userId,
      role: "job_seeker",
      name: trimmedName,
      email: trimmedEmail,
      headline: trimmedHeadline,
      targetRole: trimmedHeadline,
      experience: trimmedExp,
      location: trimmedLoc,
      phone: trimmedPhone,
      bio: trimmedBio,
      education: trimmedEdu,
      course: trimmedEdu,
      highestQualification: trimmedEdu,
      languages: trimmedLang,
      skills: parsedSkills,
    };
    setCurrentUser(updatedUser);
    const token = getAuthToken();
    if (token) {
      setAuthSession(token, updatedUser);
    }

    setEditModalOpen(false);
    showToast("Profile updated successfully!");

    // 3. Persist to backend
    const updatePayload = {
      name: trimmedName,
      headline: trimmedHeadline,
      targetRole: trimmedHeadline,
      experience: trimmedExp,
      location: trimmedLoc,
      phone: trimmedPhone,
      bio: trimmedBio,
      education: trimmedEdu,
      course: trimmedEdu,
      highestQualification: trimmedEdu,
      languages: trimmedLang,
      skills: parsedSkills,
    };

    try {
      const res = await updateUserProfile(updatePayload);
      if (res.success && res.user) {
        populateFromUser(res.user);
      }
    } catch (err: any) {
      console.warn("Backend update error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = document.getElementById("resume-file-input") as HTMLInputElement;
    let fileName = "";
    let fileMeta = "";
    let fileData = "";

    if (input?.files && input.files[0]) {
      const file = input.files[0];
      fileName = file.name;
      fileMeta = "Updated just now • " + (file.size / (1024 * 1024)).toFixed(1) + " MB";

      // Read file data URL if file size is under 8 MB
      if (file.size < 8 * 1024 * 1024) {
        try {
          fileData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string) || "");
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          });
        } catch (err) {
          console.warn("Could not read file data URL:", err);
        }
      }
    } else {
      fileName = `${(name || "Candidate").replace(/\s+/g, "_")}_Resume.pdf`;
      fileMeta = "Updated just now • 1.2 MB";
    }

    try {
      const res = await updateUserProfile({
        resumeName: fileName,
        resumeDate: fileMeta,
        resumeUrl: fileData || undefined,
      });
      if (res.success && res.user) {
        populateFromUser(res.user);
        setUploadResumeModalOpen(false);
        showToast("Resume uploaded and saved to profile!");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("resume_uploaded"));
        }
      } else {
        showToast(res.message || "Failed to save resume.");
      }
    } catch (err: any) {
      showToast(err.message || "Error uploading resume.");
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white pb-16 md:pb-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-[999] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-4 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* OFFICIAL JOB SEEKER NAVBAR */}
      <Navbar activeTab="Dashboard" />

      {/* CANDIDATE MOBILE DRAWER (Phone View) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <aside className="relative z-10 w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 select-none">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
                  <Image
                    src="/addyjob-logo.png"
                    alt="AddyJob Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-base font-black tracking-tight text-slate-900 font-sans">
                  Addy<span className="text-blue-600">Job</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1">
              <button
                onClick={() => {
                  setActiveSidebarTab("profile");
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeSidebarTab === "profile"
                    ? "bg-blue-100/70 text-blue-700 font-extrabold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <User className="w-4 h-4 text-blue-600" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setActiveSidebarTab("applied");
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeSidebarTab === "applied"
                    ? "bg-blue-50 text-blue-600 font-extrabold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Send className="w-4 h-4 text-slate-500" />
                  <span>Applied Jobs</span>
                </div>
                {appliedJobsCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {appliedJobsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveSidebarTab("saved");
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeSidebarTab === "saved"
                    ? "bg-blue-50 text-blue-600 font-extrabold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Bookmark className="w-4 h-4 text-slate-500" />
                <span>Saved Jobs</span>
              </button>
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {getInitials(name || currentUser?.userId || "C")}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{name || "Candidate"}</p>
                  <p className="text-[10px] text-slate-500 truncate">{email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTAINER: SIDEBAR + CONTENT */}
      <div className="flex-1 flex max-w-[1536px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 gap-6">
        {/* LEFT SIDEBAR (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-6">
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-1">
            <button
              onClick={() => setActiveSidebarTab("profile")}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeSidebarTab === "profile"
                  ? "bg-blue-100/70 text-blue-700 font-extrabold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => {
                setActiveSidebarTab("applied");
                loadAppliedAndSaved();
              }}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeSidebarTab === "applied"
                  ? "bg-blue-50 text-blue-600 font-extrabold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Send className="w-4 h-4 text-slate-500" />
                <span>Applied Jobs</span>
              </div>
              {appliedJobsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {appliedJobsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSidebarTab("saved")}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeSidebarTab === "saved"
                  ? "bg-blue-50 text-blue-600 font-extrabold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Bookmark className="w-4 h-4 text-slate-500" />
                <span>Saved Jobs</span>
              </div>
              {savedJobsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {savedJobsCount}
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Mobile Navigation Tabs Bar */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
            <button
              onClick={() => setActiveSidebarTab("profile")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition ${
                activeSidebarTab === "profile"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab("applied")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition ${
                activeSidebarTab === "applied"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Applied {appliedJobsCount > 0 ? `(${appliedJobsCount})` : ""}</span>
            </button>
            <button
              onClick={() => setActiveSidebarTab("saved")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition ${
                activeSidebarTab === "saved"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved {savedJobsCount > 0 ? `(${savedJobsCount})` : ""}</span>
            </button>
          </div>

          {/* TAB 1: APPLIED JOBS (Exact Match to Reference Image 2) */}
          {activeSidebarTab === "applied" && (
            <AppliedJobsView
              appliedJobs={appliedList}
              onSelectCompanyForMessage={handleSelectCompanyForMessage}
              onToggleSave={handleToggleSave}
              isJobSaved={isJobSaved}
            />
          )}

          {/* TAB 2: SAVED JOBS */}
          {activeSidebarTab === "saved" && (
            <SavedJobsView
              savedJobs={savedList}
              onRemoveSaved={handleRemoveSaved}
            />
          )}

          {/* TAB 3: RECRUITER & COMPANY MESSAGES */}
          {activeSidebarTab === "messages" && (
            <CandidateMessagesView
              threads={messageThreads}
              onSendMessage={handleSendMessage}
            />
          )}

          {/* TAB 5: MY PROFILE CONTENT */}
          {activeSidebarTab === "profile" && (
            <>
              {/* TOP PROFILE HERO CARD (Image 1 style) */}
              <div
                id="overview-section"
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs relative scroll-mt-24 sm:scroll-mt-28"
              >
                <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-slate-100 shadow-md bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center font-black text-2xl sm:text-3xl select-none">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={name || "Profile"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(name || currentUser?.userId || "Tushar Raghav")
                    )}
                  </div>
                  <label
                    htmlFor="candidate-hero-avatar-upload"
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md ring-2 ring-white transition cursor-pointer"
                    title="Change profile picture"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      id="candidate-hero-avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageUpload}
                    />
                  </label>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                      {name || "Tushar Raghav"}
                    </h1>
                    <button
                      onClick={openEditModal}
                      className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-0.5"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">
                      {headline || "Frontend Developer"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                      Fresher
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{location || "Delhi NCR / Noida"}</span>
                    </span>
                    <span className="flex items-center gap-1.5 truncate max-w-[220px]">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{email || "tusharraghav817@gmail.com"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{phone || "1234567890"}</span>
                    </span>
                  </div>
              </div>
            </div>
          </div>



          {/* 2. TWO COLUMN LAYOUT: QUICK LINKS (LEFT) & SECTIONS (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: QUICK LINKS (lg:col-span-3) */}
            <div className="lg:col-span-3 lg:sticky lg:top-20 space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-100">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Links</h3>
                </div>
                <nav className="space-y-1">
                  {quickLinkItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeQuickLink === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.target, item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition text-left cursor-pointer ${
                          isActive
                            ? "bg-blue-50 text-blue-600 font-bold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* RIGHT COLUMN: MAIN CONTENT CARDS (lg:col-span-9) */}
            <div className="lg:col-span-9 space-y-6">
              {/* SECTION: RESUME */}
              <div
                id="resume-section"
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 scroll-mt-24 sm:scroll-mt-28"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Resume</h2>
                      <p className="text-[11px] text-slate-400">Upload your latest resume (PDF, DOC, DOCX, max 5MB)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {resumeUrl ? (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => setUploadResumeModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View</span>
                      </button>
                    )}
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Resume Dropzone Box */}
                <div
                  onClick={() => setUploadResumeModalOpen(true)}
                  className="border-2 border-dashed border-blue-200/90 rounded-2xl p-7 flex flex-col items-center justify-center text-center bg-blue-50/20 hover:bg-blue-50/40 transition cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100/60 text-blue-600 flex items-center justify-center mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    Drag & drop your resume here, or{" "}
                    <span className="text-blue-600 font-bold hover:underline">click to browse</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
                  {resumeName && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium shadow-2xs">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Current: {resumeName}</span>
                    </div>
                  )}
                </div>
              </div>

              

              {/* SECTION: KEY SKILLS */}
              <div
                id="key-skills-section"
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 scroll-mt-24 sm:scroll-mt-28"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">Key Skills</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={openAddSkill}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={openAddSkill}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Skill</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(skills.length > 0
                    ? skills
                    : [
                        "JavaScript",
                        "React.js",
                        "Next.js",
                        "HTML",
                        "CSS",
                        "Tailwind CSS",
                        "Node.js",
                        "MongoDB",
                        "REST API",
                        "Git",
                      ]
                  ).map((s, idx) => (
                    <span
                      key={idx}
                      className="group/skill inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200/80 hover:border-slate-300 transition"
                    >
                      <span>{s}</span>
                      <button
                        onClick={() => handleRemoveSkill(s)}
                        className="opacity-0 group-hover/skill:opacity-100 hover:text-rose-600 text-slate-400 transition cursor-pointer"
                        title={`Remove ${s}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SECTION: EMPLOYMENT HISTORY */}
              <div
                id="employment-section"
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 scroll-mt-24 sm:scroll-mt-28"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">Employment History</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openAddExperience(experienceList[0])}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openAddExperience()}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Experience</span>
                    </button>
                  </div>
                </div>

                {experienceList.length > 0 ? (
                  <div className="space-y-4 pt-1 divide-y divide-slate-100">
                    {experienceList.map((exp, idx) => (
                      <div key={exp.id} className={`${idx > 0 ? "pt-3.5" : ""} group flex items-start justify-between`}>
                        <div className="space-y-1">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            {exp.role}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium">{exp.company}</p>
                          {exp.duration && <p className="text-[11px] text-slate-400">{exp.duration}</p>}
                          {exp.description && (
                            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1 pt-1">
                              {exp.description.split("\n").filter(Boolean).map((line, lIdx) => (
                                <li key={lIdx}>{line.replace(/^[-•*]\s*/, "")}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openAddExperience(exp)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                            title="Edit experience"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {experienceList.length > 1 && (
                            <button
                              onClick={() => handleDeleteExperience(exp.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete experience"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-5 text-center text-slate-400 text-xs">
                    No employment history added yet. Click &quot;Add Experience&quot; to highlight your past roles.
                  </div>
                )}
              </div>

              {/* SECTION: EDUCATION */}
              <div
                id="education-section"
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 scroll-mt-24 sm:scroll-mt-28"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">Education</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    {educationList.length > 0 && (
                      <button
                        onClick={() => openAddEducation(educationList[0])}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => openAddEducation()}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Education</span>
                    </button>
                  </div>
                </div>

                {educationList.length > 0 ? (
                  <div className="space-y-3.5 pt-1 divide-y divide-slate-100">
                    {educationList.map((edu, idx) => (
                      <div key={edu.id} className={`${idx > 0 ? "pt-3" : ""} group flex items-start justify-between`}>
                        <div className="space-y-0.5">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            {edu.degree}
                          </h3>
                          {edu.college && <p className="text-xs text-slate-600">{edu.college}</p>}
                          {edu.years && <p className="text-[11px] text-slate-400">{edu.years}</p>}
                          {edu.grade && <p className="text-xs font-medium text-slate-700 pt-0.5">{edu.grade}</p>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openAddEducation(edu)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                            title="Edit education"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {educationList.length > 1 && (
                            <button
                              onClick={() => handleDeleteEducation(edu.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete education"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-5 text-center text-slate-400 text-xs">
                    No education details added yet. Click &quot;Add Education&quot; to add your degrees.
                  </div>
                )}
              </div>

              {/* 2-CARD ROW 1: IT SKILLS & PROJECTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IT Skills Card */}
                <div
                  id="it-skills-section"
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 scroll-mt-24 sm:scroll-mt-28"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm font-bold text-slate-900">IT Skills</h2>
                    </div>
                    <button
                      onClick={() => setAddSkillModalOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Add / Edit
                    </button>
                  </div>

                  {skills && skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="py-5 text-center text-slate-400 text-xs">
                      No IT skills added yet. Click &quot;Add / Edit&quot; to add your technical skills.
                    </div>
                  )}
                </div>

                {/* Projects Card */}
                <div
                  id="projects-section"
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 scroll-mt-24 sm:scroll-mt-28"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FolderGit2 className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm font-bold text-slate-900">Projects</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      {projectsList.length > 0 && (
                        <button
                          onClick={() => openAddProject(projectsList[0])}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => openAddProject()}
                        className="px-2.5 py-1 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Project</span>
                      </button>
                    </div>
                  </div>

                  {projectsList.length > 0 ? (
                    <div className="space-y-3.5 pt-1 divide-y divide-slate-100">
                      {projectsList.map((proj, idx) => (
                        <div key={proj.id} className={`${idx > 0 ? "pt-3" : ""} group`}>
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900">{proj.title}</h3>
                            <div className="flex items-center gap-1.5">
                              {proj.techStack && (
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  {proj.techStack}
                                </span>
                              )}
                              <button
                                onClick={() => openAddProject(proj)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                                title="Edit project"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              {projectsList.length > 1 && (
                                <button
                                  onClick={() => handleDeleteProject(proj.id)}
                                  className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                  title="Delete project"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {proj.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-blue-600">
                            {proj.githubUrl ? (
                              <a
                                href={proj.githubUrl.startsWith("http") ? proj.githubUrl : `https://${proj.githubUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>GitHub</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[11px]">No GitHub</span>
                            )}
                            <span className="text-slate-300">|</span>
                            {proj.liveUrl ? (
                              <a
                                href={proj.liveUrl.startsWith("http") ? proj.liveUrl : `https://${proj.liveUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>Live Demo</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[11px]">No Live Demo</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-5 text-center text-slate-400 text-xs">
                      No projects added yet. Click &quot;Add Project&quot; to showcase your work.
                    </div>
                  )}
                </div>
              </div>

              {/* PROFILE SUMMARY */}
              <div
                id="profile-summary-section"
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3 scroll-mt-24 sm:scroll-mt-28"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">Profile Summary</h2>
                  </div>
                  <button
                    onClick={openEditModal}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal pt-1">
                  {bio || "No profile summary added yet. Click 'Edit' to add an overview of your background and career goals."}
                </p>
              </div>

              {/* 2-CARD ROW 3: PERSONAL DETAILS & LANGUAGES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Details Card */}
                <div
                  id="personal-details-section"
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 scroll-mt-24 sm:scroll-mt-28"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm font-bold text-slate-900">Personal Details</h2>
                    </div>
                    <button
                      onClick={openEditPersonal}
                      className="px-2.5 py-1 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Date of Birth</p>
                      <p className="font-bold text-slate-800 mt-0.5">{personalForm.dob || (currentUser as any)?.dob || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Gender</p>
                      <p className="font-bold text-slate-800 mt-0.5">{personalForm.gender || (currentUser as any)?.gender || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Marital Status</p>
                      <p className="font-bold text-slate-800 mt-0.5">{personalForm.maritalStatus || (currentUser as any)?.maritalStatus || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Nationality</p>
                      <p className="font-bold text-slate-800 mt-0.5">{personalForm.nationality || (currentUser as any)?.nationality || "Indian"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[11px] text-slate-400 font-medium">Address</p>
                      <p className="font-bold text-slate-800 mt-0.5">{personalForm.address || location || (currentUser as any)?.preferredLocation || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Languages Card */}
                <div
                  id="languages-section"
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 scroll-mt-24 sm:scroll-mt-28"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm font-bold text-slate-900">Languages</h2>
                    </div>
                    <button
                      onClick={() => openAddLanguage()}
                      className="px-2.5 py-1 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Language</span>
                    </button>
                  </div>

                  {languagesList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-semibold">
                            <th className="pb-2">Language</th>
                            <th className="pb-2">Proficiency</th>
                            <th className="pb-2 text-center">Read</th>
                            <th className="pb-2 text-center">Write</th>
                            <th className="pb-2 text-center">Speak</th>
                            <th className="pb-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {languagesList.map((lang) => (
                            <tr key={lang.id} className="group hover:bg-slate-50/60 transition">
                              <td className="py-2.5 font-bold text-slate-900">{lang.language}</td>
                              <td className="py-2.5 text-slate-500">{lang.proficiency}</td>
                              <td className="py-2.5 text-center">
                                {lang.read ? (
                                  <CheckCircle2 className="w-4 h-4 text-blue-600 mx-auto fill-blue-50" />
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-2.5 text-center">
                                {lang.write ? (
                                  <CheckCircle2 className="w-4 h-4 text-blue-600 mx-auto fill-blue-50" />
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-2.5 text-center">
                                {lang.speak ? (
                                  <CheckCircle2 className="w-4 h-4 text-blue-600 mx-auto fill-blue-50" />
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-2.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => openAddLanguage(lang)}
                                    className="p-1 rounded-md hover:bg-slate-200/60 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                                    title="Edit language"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  {languagesList.length > 1 && (
                                    <button
                                      onClick={() => handleDeleteLanguage(lang.id)}
                                      className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                      title="Delete language"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-5 text-center text-slate-400 text-xs">
                      No languages added yet. Click &quot;Add Language&quot; to specify known languages.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
            </>
          )}

        </main>
      </div>

      {/* FULL-WIDTH FOOTER */}
      <Footer />

      {/* MODAL 1: EDIT PROFILE */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop click dismiss */}
          <div className="fixed inset-0" onClick={() => setEditModalOpen(false)} />

          <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 z-10">
            {/* Modal Header (Fixed) */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Edit Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col flex-1 min-h-0">
              {/* Modal Body (Scrollable & Compact) */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-xs">
                {/* Profile Photo Uploader */}
                <div className="flex items-center gap-3 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-xs bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center font-bold text-base shrink-0 select-none">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{getInitials(name || currentUser?.userId || "U")}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-800">Profile Photo</p>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="modal-profile-picture-upload"
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] cursor-pointer transition shadow-2xs"
                      >
                        Change Photo
                        <input
                          id="modal-profile-picture-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageUpload}
                        />
                      </label>
                      {profileImage && (
                        <button
                          type="button"
                          onClick={handleRemoveProfileImage}
                          className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold text-[11px] transition cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Target Role / Title</label>
                    <input
                      type="text"
                      name="headline"
                      value={editForm.headline}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, headline: e.target.value }))}
                      required
                      placeholder="e.g. Full Stack Developer"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Experience</label>
                    <input
                      type="text"
                      name="experience"
                      value={editForm.experience}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, experience: e.target.value }))}
                      placeholder="e.g. Fresher / 2 Years"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Delhi NCR / Noida"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. user@gmail.com"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Education</label>
                    <input
                      type="text"
                      name="education"
                      value={editForm.education}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, education: e.target.value }))}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Languages</label>
                    <input
                      type="text"
                      name="languages"
                      value={editForm.languages}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, languages: e.target.value }))}
                      placeholder="e.g. English, Hindi"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={editForm.skills}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, skills: e.target.value }))}
                    placeholder="e.g. React, Node.js, TypeScript, Tailwind"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">About Me (Bio)</label>
                  <textarea
                    name="bio"
                    rows={2}
                    value={editForm.bio}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Write a brief professional summary about yourself..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden resize-none bg-slate-50/40 hover:bg-white focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Modal Footer (Fixed) */}
              <div className="px-5 py-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-600 hover:bg-white hover:border-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EDUCATION */}
      {addEducationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {editingEduId ? "Edit Education" : "Add Education"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddEducationModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEducation} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Degree / Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech in Computer Science and Engineering"
                  value={eduForm.degree}
                  onChange={(e) => setEduForm((prev) => ({ ...prev, degree: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  College / Institute / University <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Institute of Technology"
                  value={eduForm.college}
                  onChange={(e) => setEduForm((prev) => ({ ...prev, college: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration / Years</label>
                  <input
                    type="text"
                    placeholder="e.g. 2020 - 2024"
                    value={eduForm.years}
                    onChange={(e) => setEduForm((prev) => ({ ...prev, years: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grade / CGPA</label>
                  <input
                    type="text"
                    placeholder="e.g. CGPA: 7.9/10 or 80%"
                    value={eduForm.grade}
                    onChange={(e) => setEduForm((prev) => ({ ...prev, grade: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddEducationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  {editingEduId ? "Update Education" : "Save Education"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PROJECT */}
      {addProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {editingProjId ? "Edit Project" : "Add Project"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddProjectModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Job Portal Platform"
                    value={projForm.title}
                    onChange={(e) => setProjForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tech Stack / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, MongoDB"
                    value={projForm.techStack}
                    onChange={(e) => setProjForm((prev) => ({ ...prev, techStack: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Project Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe key features, your role, and what technologies you used..."
                  value={projForm.description}
                  onChange={(e) => setProjForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GitHub Link</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={projForm.githubUrl}
                    onChange={(e) => setProjForm((prev) => ({ ...prev, githubUrl: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Live Demo Link</label>
                  <input
                    type="url"
                    placeholder="https://myproject.com"
                    value={projForm.liveUrl}
                    onChange={(e) => setProjForm((prev) => ({ ...prev, liveUrl: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingProjId ? "Update Project" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT LANGUAGE */}
      {addLanguageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {editingLangId ? "Edit Language" : "Add Language"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddLanguageModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLanguage} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Language Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. French, German, Spanish"
                  value={langForm.language}
                  onChange={(e) => setLangForm((prev) => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Proficiency Level
                </label>
                <select
                  value={langForm.proficiency}
                  onChange={(e) => setLangForm((prev) => ({ ...prev, proficiency: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-white cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Native">Native</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-2">Fluency & Capabilities</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-blue-50/30 transition">
                    <input
                      type="checkbox"
                      checked={langForm.read}
                      onChange={(e) => setLangForm((prev) => ({ ...prev, read: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-700">Read</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-blue-50/30 transition">
                    <input
                      type="checkbox"
                      checked={langForm.write}
                      onChange={(e) => setLangForm((prev) => ({ ...prev, write: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-700">Write</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-blue-50/30 transition">
                    <input
                      type="checkbox"
                      checked={langForm.speak}
                      onChange={(e) => setLangForm((prev) => ({ ...prev, speak: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-700">Speak</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddLanguageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingLangId ? "Update Language" : "Add Language"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EXPERIENCE */}
      {addExperienceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {editingExpId ? "Edit Experience" : "Add Experience"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddExperienceModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExperience} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Designation / Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frontend Developer"
                    value={expForm.role}
                    onChange={(e) => setExpForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Company / Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Technologies"
                    value={expForm.company}
                    onChange={(e) => setExpForm((prev) => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Duration / Employment Period
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jun 2024 - Aug 2024 • 3 months (or Jan 2023 - Present)"
                  value={expForm.duration}
                  onChange={(e) => setExpForm((prev) => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Responsibilities & Achievements (one per line)
                </label>
                <textarea
                  rows={4}
                  placeholder={"Built responsive web components using React.js and Tailwind CSS.\nCollaborated with designers to implement modern UI/UX."}
                  value={expForm.description}
                  onChange={(e) => setExpForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddExperienceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingExpId ? "Update Experience" : "Save Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SKILLS */}
      {addSkillModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Add Skills</h3>
              </div>
              <button
                type="button"
                onClick={() => setAddSkillModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSkillForm} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Enter Skill(s) <span className="text-slate-400 font-normal">(comma-separated)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Next.js, Docker, TypeScript"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (skillInput.trim()) {
                        handleAddSkills(skillInput.split(",").map((s) => s.trim()).filter(Boolean));
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer transition shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <p className="font-bold text-slate-700 mb-1.5">Popular Suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "TypeScript",
                    "React.js",
                    "Next.js",
                    "Node.js",
                    "Tailwind CSS",
                    "Python",
                    "Docker",
                    "AWS",
                    "MongoDB",
                    "SQL",
                    "Figma",
                    "Git",
                  ]
                    .filter((s) => !skills.includes(s))
                    .slice(0, 8)
                    .map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddSkills([sug])}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 transition cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                </div>
              </div>

              {/* Current Skills Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-bold text-slate-700">Your Skills ({skills.length})</p>
                  {skills.length > 0 && (
                    <span className="text-[10px] text-slate-400">Click × to remove</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                  {skills.length === 0 ? (
                    <p className="text-slate-400 text-[11px] italic">No skills added yet.</p>
                  ) : (
                    skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-slate-200 shadow-2xs"
                      >
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          className="hover:text-rose-600 text-slate-400 transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddSkillModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD RESUME */}
      {uploadResumeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Upload New Resume</h3>
              </div>
              <button
                onClick={() => setUploadResumeModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadResume} className="space-y-4 pt-4">
              <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center hover:bg-blue-50/50 transition">
                <FileText className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  Choose a PDF or DOCX file to upload
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Maximum file size: 5 MB</p>
                <input
                  id="resume-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadResumeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Upload & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: COMPLETE PROFILE */}
      {completeProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">Profile Completion</h3>
              </div>
              <button
                onClick={() => setCompleteProfileModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-4 space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  85%
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Almost There!</p>
                  <p className="text-[11px] text-slate-600">
                    Add a portfolio link or certificate to reach 100% profile strength.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="font-semibold text-slate-700">Add Portfolio URL</span>
                  <button
                    onClick={() => {
                      setCompleteProfileModalOpen(false);
                      showToast("Portfolio added! Profile strength updated to 95%.");
                    }}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px]"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="font-semibold text-slate-700">Add Certifications</span>
                  <button
                    onClick={() => {
                      setCompleteProfileModalOpen(false);
                      showToast("Certification added! Profile strength 100%.");
                    }}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px]"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setCompleteProfileModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* MODAL: EDIT PERSONAL DETAILS */}
      {editPersonalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0" onClick={() => setEditPersonalModalOpen(false)} />

          <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 z-10">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Edit Personal Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditPersonalModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePersonal} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Date of Birth</label>
                    <input
                      type="text"
                      placeholder="e.g. 15 Aug 1999"
                      value={personalForm.dob}
                      onChange={(e) => setPersonalForm((prev) => ({ ...prev, dob: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Gender</label>
                    <select
                      value={personalForm.gender}
                      onChange={(e) => setPersonalForm((prev) => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Marital Status</label>
                    <select
                      value={personalForm.maritalStatus}
                      onChange={(e) => setPersonalForm((prev) => ({ ...prev, maritalStatus: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    >
                      <option value="">Select Status</option>
                      <option value="Single / Unmarried">Single / Unmarried</option>
                      <option value="Married">Married</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nationality</label>
                    <input
                      type="text"
                      placeholder="e.g. Indian"
                      value={personalForm.nationality}
                      onChange={(e) => setPersonalForm((prev) => ({ ...prev, nationality: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Permanent Address / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi NCR / Noida, India"
                    value={personalForm.address}
                    onChange={(e) => setPersonalForm((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden bg-slate-50/40 hover:bg-white focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditPersonalModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-white hover:border-slate-300 font-semibold text-xs text-slate-600 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs shadow-blue-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation for Candidate */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveSidebarTab("profile")}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition cursor-pointer ${
            activeSidebarTab === "profile" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>

        <button
          onClick={() => setActiveSidebarTab("applied")}
          className={`relative flex flex-col items-center justify-center p-1 rounded-xl transition cursor-pointer ${
            activeSidebarTab === "applied" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Send className="w-5 h-5" />
          {appliedJobsCount > 0 && (
            <span className="absolute -top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center">
              {appliedJobsCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Applied</span>
        </button>

        <button
          onClick={() => setActiveSidebarTab("saved")}
          className={`relative flex flex-col items-center justify-center p-1 rounded-xl transition cursor-pointer ${
            activeSidebarTab === "saved" ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Bookmark className="w-5 h-5" />
          {savedJobsCount > 0 && (
            <span className="absolute -top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center">
              {savedJobsCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Saved</span>
        </button>

        <button
          onClick={() => setMobileSidebarOpen(true)}
          title="Open menu (3 dots)"
          aria-label="Open menu (3 dots)"
          className="flex flex-col items-center justify-center p-1 text-slate-500 hover:text-blue-600 transition cursor-pointer group"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <MoreHorizontal className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[10px] mt-0.5 font-medium group-hover:text-blue-600">Menu</span>
        </button>
      </div>
    </div>
  );
}
