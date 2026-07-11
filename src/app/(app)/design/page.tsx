"use client";

import { useState, useEffect, useMemo } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDisciplines } from "@/contexts/DisciplineContext";
import { DisciplineManagerModal } from "@/components/DisciplineManagerModal";
import {
  Bell, Search, AlertTriangle, Plus, Trash2, History, X,
  FileText, Ruler, Link2, Clock, CheckCircle2, XCircle,
  Folder, FolderOpen, ChevronRight, ChevronLeft, Settings2,
} from "lucide-react";
import { QuickAddModal } from "@/components/QuickAddModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0", copperMid: "#B5855A",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
  track: "#E7E0D8",
};

type TabId = "submittals" | "register" | "workflow";

const TRANSLATIONS = {
  en: {
    title: "Design Management",
    searchPlaceholder: "Search...",
    tabs: { submittals: "Submittals", register: "Drawing Register", workflow: "Approval Workflow" },
    newSubmittal: "New Submittal",
    newDrawing: "New Drawing",
    aiAlertLabel: "AI Design Coordination Alert",
    aiAlertText: "Conflicting pile cap dimensions detected between SUB-009 (structural rebar schedule) and HW20-ST-DWG-068-002 (pier details Rev.B). Pier P7 cap dimensions differ by 150mm on the east face. Coordination meeting required before concrete pour scheduled for 08 Jul.",
    docControlAlertLabel: "Document Control Alert",
    docControlAlertText: "3 drawings superseded in the last 7 days have active submittals referencing them. Review SUB-009, SUB-011, SUB-014 before next design coordination meeting.",
    statsLabels: ["Total Submittals", "Approved", "Under Review", "Rejected / Resubmit", "Pending"],
    colNum: "#",
    colTitle: "Submittal Title",
    colDiscipline: "Discipline",
    colRev: "Rev.",
    colSubmitted: "Submitted",
    colDue: "Due Date",
    colDaysLeft: "Days Left",
    colStatus: "Status",
    overdue: (d: number) => `${d}d overdue`,
    dueToday: "Due today",
    daysLeft: (d: number) => `${d}d left`,
    noSubmittals: "No submittals yet",
    deleteSubmittalMsg: (t: string) => `Delete submittal "${t}"? This cannot be undone.`,
    // Drawing Register
    registerStatsLabels: ["Total Drawings", "Issued for Construction", "In Review / Approval", "Superseded"],
    registerRoot: "All Disciplines",
    fldStage: "Design Stage",
    colDwg: "Drawing No. / Title",
    colSheetScale: "Sheet / Scale",
    colFormat: "Format",
    colIssueDate: "Issue Date",
    colLinked: "Linked Submittal",
    noDrawings: "No drawings registered yet",
    historyTooltip: "Revision history",
    deleteDrawingMsg: (t: string) => `Delete drawing "${t}" from the register? This cannot be undone.`,
    statusLabels: {
      IFC: "Issued for Construction", IFA: "Issued for Approval", IFR: "Issued for Review",
      DRAFT: "Draft", "AS-BUILT": "As-Built", SUPERSEDED: "Superseded", VOID: "Void",
    } as Record<string, string>,
    // Revision history modal
    revHistTitle: "Revision History",
    revHistSub: "Full document control trail — CAD standard revision log",
    colRevCol: "Rev",
    colDate: "Date",
    colDesc: "Description of Change",
    colBy: "Issued By",
    colChecked: "Checked",
    colApproved: "Approved",
    close: "Close",
    // Add drawing modal
    addDrawingTitle: "New Drawing",
    fldTitle: "Drawing Title",
    fldDiscipline: "Discipline",
    fldSheet: "Sheet Size",
    fldScale: "Scale",
    fldFormat: "CAD Format",
    fldStatus: "Initial Status",
    // Workflow
    workflowSub: "Submittal approval pipeline — document control status flow",
    workflowCols: { PENDING: "Pending Submission", "UNDER REVIEW": "Under Review", REJECTED: "Rejected / Resubmit", APPROVED: "Approved" },
  },
  he: {
    title: "ניהול תכנון",
    searchPlaceholder: "חיפוש...",
    tabs: { submittals: "הגשות", register: "רשימת תכניות", workflow: "תהליך אישורים" },
    newSubmittal: "הגשה חדשה",
    newDrawing: "תכנית חדשה",
    aiAlertLabel: "התראת תיאום AI",
    aiAlertText: "אי-התאמה בממדי כובע הקלונסאות בין SUB-009 (לוח ברזל מבני) ל-HW20-ST-DWG-068-002 (פרטי עמוד Rev.B). ממדי כובע העמוד P7 שונים ב-150 מ״מ בפאה המזרחית. נדרשת ישיבת תיאום לפני יציקת בטון המתוכננת ל-08 ביולי.",
    docControlAlertLabel: "התראת בקרת מסמכים",
    docControlAlertText: "3 תכניות שבוטלו ב-7 הימים האחרונים מוזכרות בהגשות פעילות. בדוק SUB-009, SUB-011, SUB-014 לפני ישיבת תיאום התכנון הבאה.",
    statsLabels: ["סה״כ הגשות", "מאושר", "בבדיקה", "נדחה / הגשה חוזרת", "ממתין"],
    colNum: "#",
    colTitle: "כותרת ההגשה",
    colDiscipline: "תחום",
    colRev: "גרסה",
    colSubmitted: "הוגש",
    colDue: "תאריך יעד",
    colDaysLeft: "ימים נותרים",
    colStatus: "סטטוס",
    overdue: (d: number) => `${d}י באיחור`,
    dueToday: "יעד היום",
    daysLeft: (d: number) => `${d}י נותרו`,
    noSubmittals: "אין הגשות עדיין",
    deleteSubmittalMsg: (t: string) => `למחוק את ההגשה "${t}"? לא ניתן לשחזר פעולה זו.`,
    // Drawing Register
    registerStatsLabels: ["סה״כ תכניות", "הופץ לביצוע", "בבדיקה / אישור", "בוטל"],
    registerRoot: "כל התחומים",
    fldStage: "שלב תכנון",
    colDwg: "מס׳ תכנית / כותרת",
    colSheetScale: "גיליון / קנ״מ",
    colFormat: "פורמט",
    colIssueDate: "תאריך הפצה",
    colLinked: "הגשה מקושרת",
    noDrawings: "אין תכניות רשומות עדיין",
    historyTooltip: "היסטוריית גרסאות",
    deleteDrawingMsg: (t: string) => `למחוק את התכנית "${t}" מהרשימה? לא ניתן לשחזר פעולה זו.`,
    statusLabels: {
      IFC: "הופץ לביצוע", IFA: "הופץ לאישור", IFR: "הופץ לבדיקה",
      DRAFT: "טיוטה", "AS-BUILT": "עדות בנוי", SUPERSEDED: "בוטל", VOID: "מבוטל",
    } as Record<string, string>,
    // Revision history modal
    revHistTitle: "היסטוריית גרסאות",
    revHistSub: "מסלול בקרת מסמכים מלא — יומן גרסאות בתקן CAD",
    colRevCol: "גרסה",
    colDate: "תאריך",
    colDesc: "תיאור השינוי",
    colBy: "הופץ ע״י",
    colChecked: "נבדק",
    colApproved: "אושר",
    close: "סגור",
    // Add drawing modal
    addDrawingTitle: "תכנית חדשה",
    fldTitle: "כותרת התכנית",
    fldDiscipline: "תחום",
    fldSheet: "גודל גיליון",
    fldScale: "קנה מידה",
    fldFormat: "פורמט CAD",
    fldStatus: "סטטוס ראשוני",
    // Workflow
    workflowSub: "תהליך אישור הגשות — מפת מצב בקרת מסמכים",
    workflowCols: { PENDING: "ממתין להגשה", "UNDER REVIEW": "בבדיקה", REJECTED: "נדחה / הגשה חוזרת", APPROVED: "מאושר" },
  },
};

type SubStatus = "APPROVED" | "UNDER REVIEW" | "REJECTED" | "RESUBMIT" | "PENDING";

const DEMO_SUBMITTALS: {
  num: string; title: string; discipline: string; rev: string;
  submitted: string; due: string; daysRemaining: number; status: SubStatus;
}[] = [
  { num: "SUB-001", title: "Bridge 68 – Bearing Pad Shop Drawings",               discipline: "Structural", rev: "Rev.B", submitted: "02 Mar 2026", due: "23 Mar 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-002", title: "Pile Drilling Equipment & Methodology",                discipline: "Civil",      rev: "Rev.A", submitted: "15 Mar 2026", due: "05 Apr 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-003", title: "Concrete Mix Design – fc'30MPa",                       discipline: "Structural", rev: "Rev.C", submitted: "20 Mar 2026", due: "10 Apr 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-004", title: "Structural Steel Fabrication Drawings – Bridge 68",    discipline: "Structural", rev: "Rev.A", submitted: "01 Apr 2026", due: "22 Apr 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-005", title: "Geotextile & Filter Fabric Specification",             discipline: "Civil",      rev: "Rev.B", submitted: "10 Apr 2026", due: "01 May 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-006", title: "Traffic Signal Equipment – Phase 1",                   discipline: "Traffic",    rev: "Rev.A", submitted: "05 May 2026", due: "26 May 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-007", title: "Expansion Joint – Bridge 68 Type EJ-300",             discipline: "Structural", rev: "Rev.A", submitted: "12 May 2026", due: "02 Jun 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-008", title: "Retaining Wall Block System – Manufacturer Data",      discipline: "Structural", rev: "Rev.A", submitted: "18 May 2026", due: "08 Jun 2026", daysRemaining: 0,   status: "APPROVED"      },
  { num: "SUB-009", title: "Pile Cap Rebar Schedule – Piers P5–P10",              discipline: "Structural", rev: "Rev.B", submitted: "02 Jun 2026", due: "16 Jun 2026", daysRemaining: -13, status: "UNDER REVIEW"  },
  { num: "SUB-010", title: "Asphalt Mix Design – Wearing Course",                  discipline: "Civil",      rev: "Rev.A", submitted: "05 Jun 2026", due: "19 Jun 2026", daysRemaining: -10, status: "UNDER REVIEW"  },
  { num: "SUB-011", title: "Drainage Pipe – HDPE Class SN8 Technical Data",       discipline: "Civil",      rev: "Rev.A", submitted: "08 Jun 2026", due: "22 Jun 2026", daysRemaining: -7,  status: "UNDER REVIEW"  },
  { num: "SUB-012", title: "Electrical Conduit – Galvanized Steel Shop Drawings",  discipline: "MEP",        rev: "Rev.A", submitted: "10 Jun 2026", due: "24 Jun 2026", daysRemaining: -5,  status: "UNDER REVIEW"  },
  { num: "SUB-013", title: "Bridge Deck Formwork – Falsework Design",              discipline: "Structural", rev: "Rev.A", submitted: "14 Jun 2026", due: "28 Jun 2026", daysRemaining: -1,  status: "REJECTED"      },
  { num: "SUB-014", title: "Guardrail System – TL-4 Crash Test Data",             discipline: "Civil",      rev: "Rev.A", submitted: "18 Jun 2026", due: "02 Jul 2026", daysRemaining: 3,   status: "RESUBMIT"      },
  { num: "SUB-015", title: "Lighting Pole Foundation Design",                      discipline: "MEP",        rev: "Rev.A", submitted: "22 Jun 2026", due: "06 Jul 2026", daysRemaining: 7,   status: "PENDING"       },
];

const statusStyle: Record<SubStatus, { bg: string; color: string }> = {
  "APPROVED":     { bg: P.goodBg,   color: P.good   },
  "UNDER REVIEW": { bg: P.warnBg,   color: P.warn   },
  "REJECTED":     { bg: P.dangerBg, color: P.danger },
  "RESUBMIT":     { bg: "#FEF3C7",  color: "#92400E" },
  "PENDING":      { bg: "#F5F5F4",  color: "#78716C" },
};

// ── Drawing Register — CAD standard document control ──────────────────────

type DwgStatus = "IFC" | "IFA" | "IFR" | "DRAFT" | "AS-BUILT" | "SUPERSEDED" | "VOID";
// Discipline codes now come from the shared DisciplineContext (see useDisciplines()) —
// kept as a plain string here since the list is user-extensible.
type Discipline = string;
type Stage = "PD" | "DD" | "CD";

interface RevisionEntry {
  rev: string; date: string;
  desc: string; descHe: string;
  by: string; checkedBy?: string; approvedBy?: string;
}
interface Drawing {
  dwgNo: string;
  title: string; titleHe: string;
  discipline: Discipline;
  stage: Stage;
  sheet: string; scale: string; format: string;
  currentRev: string;
  status: DwgStatus;
  issueDate: string;
  linkedSubmittal?: string;
  revisions: RevisionEntry[];
}

const STAGES: { code: Stage; en: string; he: string }[] = [
  { code: "PD", en: "Preliminary Design",     he: "תכנון ראשוני" },
  { code: "DD", en: "Detailed Design",        he: "תכנון מפורט" },
  { code: "CD", en: "Construction Documents", he: "תכניות לביצוע" },
];

const dwgStatusStyle: Record<DwgStatus, { bg: string; color: string }> = {
  IFC:        { bg: P.goodBg,   color: P.good   },
  IFA:        { bg: P.warnBg,   color: P.warn   },
  IFR:        { bg: "#EFF6FF",  color: "#1D4ED8" },
  DRAFT:      { bg: "#F5F5F4",  color: "#78716C" },
  "AS-BUILT": { bg: "#EEF2FF",  color: "#4F46E5" },
  SUPERSEDED: { bg: P.dangerBg, color: P.danger },
  VOID:       { bg: "#F5F5F4",  color: "#A8A29E" },
};

const DEMO_DRAWINGS: Drawing[] = [
  // ── Survey (SU) ──
  { dwgNo: "HW20-SU-DWG-000-001", title: "Topographic Survey – Full Alignment", titleHe: "מדידה טופוגרפית – יישור מלא",
    discipline: "SU", stage: "PD", sheet: "A0", scale: "1:1000", format: "DWG", currentRev: "B", status: "IFC",
    issueDate: "05 Jan 2026",
    revisions: [
      { rev: "A", date: "10 Dec 2025", desc: "Initial field survey", descHe: "מדידת שטח ראשונית", by: "Surv. Peretz" },
      { rev: "B", date: "05 Jan 2026", desc: "Verified control points, issued for design use", descHe: "אימות נקודות בקרה, הופץ לשימוש התכנון", by: "Surv. Peretz", checkedBy: "Eng. Mizrahi" },
    ] },
  { dwgNo: "HW20-SU-DWG-000-002", title: "Control Point Network", titleHe: "רשת נקודות בקרה",
    discipline: "SU", stage: "PD", sheet: "A1", scale: "1:2000", format: "PDF", currentRev: "A", status: "IFC",
    issueDate: "10 Dec 2025",
    revisions: [
      { rev: "A", date: "10 Dec 2025", desc: "Initial issue", descHe: "הפצה ראשונית", by: "Surv. Peretz" },
    ] },

  // ── Geotechnical (GT) ──
  { dwgNo: "HW20-GT-DWG-010-003", title: "Geotechnical Boring Layout", titleHe: "פריסת קידוחי קרקע",
    discipline: "GT", stage: "PD", sheet: "A1", scale: "1:500", format: "PDF", currentRev: "A", status: "IFC",
    issueDate: "01 May 2026",
    revisions: [
      { rev: "A", date: "01 May 2026", desc: "Final boring layout, all locations verified", descHe: "פריסת קידוחים סופית, כל המיקומים אומתו", by: "Eng. Abramov", checkedBy: "Eng. Mizrahi", approvedBy: "Eng. Cohen" },
    ] },
  { dwgNo: "HW20-GT-DWG-010-004", title: "Soil Profile & Bearing Capacity – Bridge 68", titleHe: "פרופיל קרקע וכושר נשיאה – גשר 68",
    discipline: "GT", stage: "DD", sheet: "A1", scale: "NTS", format: "PDF", currentRev: "B", status: "IFC",
    issueDate: "18 Feb 2026",
    revisions: [
      { rev: "A", date: "20 Jan 2026", desc: "Initial soil profile", descHe: "פרופיל קרקע ראשוני", by: "Eng. Abramov" },
      { rev: "B", date: "18 Feb 2026", desc: "Updated bearing capacity values used for pier foundation design", descHe: "עדכון ערכי כושר נשיאה לתכנון יסודות עמודים", by: "Eng. Abramov", checkedBy: "Eng. Shapira" },
    ] },

  // ── Highways / Roadworks (HW) ──
  { dwgNo: "HW20-HW-DWG-020-011", title: "Horizontal Alignment – Section A", titleHe: "יישור אופקי – קטע A",
    discipline: "HW", stage: "CD", sheet: "A0", scale: "1:500", format: "DWG", currentRev: "D", status: "IFC",
    issueDate: "10 Jun 2026",
    revisions: [
      { rev: "A", date: "20 Dec 2025", desc: "Initial issue", descHe: "הפצה ראשונית", by: "Eng. Mizrahi" },
      { rev: "B", date: "18 Feb 2026", desc: "Chainage adjustment Ch.1+200–1+450", descHe: "התאמת קילומטראז׳ Ch.1+200–1+450", by: "Eng. Mizrahi" },
      { rev: "C", date: "30 Apr 2026", desc: "Curve radius revision per traffic safety review", descHe: "עדכון רדיוס עקומה לפי בדיקת בטיחות תנועה", by: "Eng. Mizrahi", checkedBy: "Eng. Levi" },
      { rev: "D", date: "10 Jun 2026", desc: "Final alignment issued for construction", descHe: "יישור סופי הופץ לביצוע", by: "Eng. Mizrahi", checkedBy: "Eng. Levi", approvedBy: "Eng. Cohen" },
    ] },
  { dwgNo: "HW20-HW-DWG-020-012", title: "Vertical Alignment – Section A", titleHe: "יישור אנכי – קטע A",
    discipline: "HW", stage: "CD", sheet: "A0", scale: "1:500/50", format: "DWG", currentRev: "C", status: "IFC",
    issueDate: "10 Jun 2026",
    revisions: [
      { rev: "A", date: "20 Dec 2025", desc: "Initial issue", descHe: "הפצה ראשונית", by: "Eng. Mizrahi" },
      { rev: "B", date: "18 Feb 2026", desc: "Gradient adjustment at Bridge 68 approach", descHe: "התאמת שיפוע בגישה לגשר 68", by: "Eng. Mizrahi" },
      { rev: "C", date: "10 Jun 2026", desc: "Final profile issued for construction", descHe: "פרופיל סופי הופץ לביצוע", by: "Eng. Mizrahi", checkedBy: "Eng. Levi", approvedBy: "Eng. Cohen" },
    ] },
  { dwgNo: "HW20-HW-DWG-020-021", title: "Horizontal Alignment – Section B", titleHe: "יישור אופקי – קטע B",
    discipline: "HW", stage: "DD", sheet: "A0", scale: "1:500", format: "DWG", currentRev: "B", status: "SUPERSEDED",
    issueDate: "08 Jun 2026",
    revisions: [
      { rev: "A", date: "05 Jan 2026", desc: "Initial issue", descHe: "הפצה ראשונית", by: "Eng. Levi" },
      { rev: "B", date: "08 Jun 2026", desc: "Superseded pending utility relocation redesign in Zone D", descHe: "בוטל בהמתנה לתכנון מחדש של העברת תשתיות באזור D", by: "Eng. Levi" },
    ] },
  { dwgNo: "HW20-HW-DWG-020-022", title: "Vertical Alignment – Section B", titleHe: "יישור אנכי – קטע B",
    discipline: "HW", stage: "DD", sheet: "A0", scale: "1:500/50", format: "DWG", currentRev: "A", status: "SUPERSEDED",
    issueDate: "20 May 2026",
    revisions: [
      { rev: "A", date: "20 May 2026", desc: "Superseded pending Section B realignment", descHe: "בוטל בהמתנה ליישור מחדש של קטע B", by: "Eng. Levi" },
    ] },
  { dwgNo: "HW20-HW-DWG-020-001", title: "Typical Cross Section – Main Carriageway", titleHe: "חתך רוחב טיפוסי – מסלול ראשי",
    discipline: "HW", stage: "PD", sheet: "A1", scale: "1:50", format: "DWG", currentRev: "A", status: "IFC",
    issueDate: "15 Nov 2025",
    revisions: [
      { rev: "A", date: "15 Nov 2025", desc: "Initial concept cross section, approved for detailed design basis", descHe: "חתך רוחב ראשוני, אושר כבסיס לתכנון מפורט", by: "Eng. Mizrahi", approvedBy: "Eng. Cohen" },
    ] },

  // ── Structural (ST) ──
  { dwgNo: "HW20-ST-DWG-068-001", title: "Bridge 68 – General Arrangement", titleHe: "גשר 68 – תרשים כללי",
    discipline: "ST", stage: "CD", sheet: "A1", scale: "1:100", format: "DWG", currentRev: "C", status: "IFC",
    issueDate: "14 Jun 2026",
    revisions: [
      { rev: "A", date: "10 Feb 2026", desc: "Initial issue", descHe: "הפצה ראשונית", by: "Eng. Shapira" },
      { rev: "B", date: "22 Apr 2026", desc: "Updated pier spacing per geotechnical report HW20-GT-DWG-010-004", descHe: "עדכון מרווחי עמודים לפי דו״ח גיאוטכני HW20-GT-DWG-010-004", by: "Eng. Shapira", checkedBy: "Eng. Cohen" },
      { rev: "C", date: "14 Jun 2026", desc: "Revised bearing layout per SUB-001 approval", descHe: "עדכון פריסת משענות לפי אישור SUB-001", by: "Eng. Shapira", checkedBy: "Eng. Cohen", approvedBy: "Eng. Mizrahi" },
    ] },
  { dwgNo: "HW20-ST-DWG-068-002", title: "Bridge 68 – Pier Details", titleHe: "גשר 68 – פרטי עמוד",
    discipline: "ST", stage: "CD", sheet: "A1", scale: "1:50", format: "DWG", currentRev: "B", status: "IFA",
    issueDate: "12 Jun 2026", linkedSubmittal: "SUB-009",
    revisions: [
      { rev: "A", date: "05 Apr 2026", desc: "Initial issue", descHe: "הפצה ראשונית", by: "Eng. Shapira" },
      { rev: "B", date: "12 Jun 2026", desc: "Pier P7 cap dimension update — conflict flagged against SUB-009 rebar schedule", descHe: "עדכון ממדי כובע עמוד P7 — זוהתה אי-התאמה מול לוח הברזל SUB-009", by: "Eng. Shapira", checkedBy: "Eng. Cohen" },
    ] },
  { dwgNo: "HW20-ST-DWG-RW-001", title: "Retaining Wall Type A – Details", titleHe: "קיר תומך סוג A – פרטים",
    discipline: "ST", stage: "CD", sheet: "A1", scale: "1:25", format: "DWG", currentRev: "B", status: "IFC",
    issueDate: "02 Jun 2026",
    revisions: [
      { rev: "A", date: "10 Apr 2026", desc: "Initial issue", descHe: "הפצה ראשונית", by: "Eng. Shapira" },
      { rev: "B", date: "02 Jun 2026", desc: "Reinforcement detail update per SUB-008 manufacturer data", descHe: "עדכון פרטי זיון לפי נתוני יצרן SUB-008", by: "Eng. Shapira", checkedBy: "Eng. Cohen", approvedBy: "Eng. Mizrahi" },
    ] },
  { dwgNo: "HW20-ST-DWG-068-003", title: "Bridge 68 – Abutment Details", titleHe: "גשר 68 – פרטי כתפי גשר",
    discipline: "ST", stage: "CD", sheet: "A1", scale: "1:50", format: "DWG", currentRev: "B", status: "IFC",
    issueDate: "15 May 2026", linkedSubmittal: "SUB-007",
    revisions: [
      { rev: "A", date: "02 Mar 2026", desc: "Initial issue", descHe: "הפצה ראשונית", by: "Eng. Shapira" },
      { rev: "B", date: "15 May 2026", desc: "Bearing schedule coordinated with SUB-007", descHe: "תיאום לוח משענות מול SUB-007", by: "Eng. Shapira", checkedBy: "Eng. Cohen", approvedBy: "Eng. Mizrahi" },
    ] },
  { dwgNo: "HW20-ST-DWG-068-004", title: "Bridge 68 – Deck Reinforcement", titleHe: "גשר 68 – זיון סיפון",
    discipline: "ST", stage: "CD", sheet: "A1", scale: "1:50", format: "DWG", currentRev: "A", status: "DRAFT",
    issueDate: "20 Jun 2026", linkedSubmittal: "SUB-013",
    revisions: [
      { rev: "A", date: "20 Jun 2026", desc: "Draft — pending falsework design coordination (SUB-013)", descHe: "טיוטה — בהמתנה לתיאום תכנון פיגומים (SUB-013)", by: "Eng. Shapira" },
    ] },
  { dwgNo: "HW20-ST-DWG-068-000", title: "Bridge 68 – Foundation As-Built", titleHe: "גשר 68 – עדות בנוי יסודות",
    discipline: "ST", stage: "CD", sheet: "A1", scale: "1:100", format: "PDF", currentRev: "A", status: "AS-BUILT",
    issueDate: "01 Mar 2026",
    revisions: [
      { rev: "A", date: "01 Mar 2026", desc: "As-built record following foundation completion", descHe: "עדות בנוי לאחר השלמת יסודות", by: "Eng. Shapira", checkedBy: "Eng. Cohen", approvedBy: "Eng. Mizrahi" },
    ] },
  { dwgNo: "HW20-ST-DWG-068-005", title: "Bridge 68 – Preliminary Structural Concept", titleHe: "גשר 68 – קונספט מבני ראשוני",
    discipline: "ST", stage: "PD", sheet: "A1", scale: "1:200", format: "PDF", currentRev: "A", status: "IFC",
    issueDate: "20 Oct 2025",
    revisions: [
      { rev: "A", date: "20 Oct 2025", desc: "Preliminary span arrangement concept, approved as design basis", descHe: "קונספט פריסת מוטות ראשוני, אושר כבסיס לתכנון", by: "Eng. Shapira", approvedBy: "Eng. Mizrahi" },
    ] },

  // ── Drainage & Hydrology (DR) ──
  { dwgNo: "HW20-DR-DWG-030-005", title: "Drainage Layout – Zone A", titleHe: "פריסת ניקוז – אזור A",
    discipline: "DR", stage: "DD", sheet: "A1", scale: "1:200", format: "DWG", currentRev: "A", status: "SUPERSEDED",
    issueDate: "05 Jun 2026",
    revisions: [
      { rev: "A", date: "05 Jun 2026", desc: "Superseded — pipe invert levels under RFI-043 review", descHe: "בוטל — מפלסי צנרת בבדיקה תחת בקשת מידע RFI-043", by: "Eng. Ben-David" },
    ] },
  { dwgNo: "HW20-DR-DWG-030-001", title: "Hydrology Study – Catchment Areas", titleHe: "מחקר הידרולוגי – אגני ניקוז",
    discipline: "DR", stage: "PD", sheet: "A1", scale: "1:1000", format: "PDF", currentRev: "A", status: "IFC",
    issueDate: "12 Nov 2025",
    revisions: [
      { rev: "A", date: "12 Nov 2025", desc: "Initial catchment analysis, approved for drainage design", descHe: "ניתוח אגני ניקוז ראשוני, אושר לתכנון ניקוז", by: "Eng. Ben-David", approvedBy: "Eng. Mizrahi" },
    ] },
  { dwgNo: "HW20-DR-DWG-030-003", title: "Culvert C-14 – Design Details", titleHe: "תעלת מעבר C-14 – פרטי תכנון",
    discipline: "DR", stage: "DD", sheet: "A1", scale: "1:50", format: "DWG", currentRev: "A", status: "IFR",
    issueDate: "22 Jun 2026",
    revisions: [
      { rev: "A", date: "22 Jun 2026", desc: "Initial issue for review", descHe: "הפצה ראשונית לבדיקה", by: "Eng. Ben-David" },
    ] },

  // ── Architectural (AR) ──
  { dwgNo: "HW20-AR-DWG-070-001", title: "Toll Plaza Building – Floor Plans", titleHe: "מבנה מתחם אגרה – תוכניות קומה",
    discipline: "AR", stage: "DD", sheet: "A1", scale: "1:100", format: "DWG", currentRev: "A", status: "IFA",
    issueDate: "30 May 2026",
    revisions: [
      { rev: "A", date: "30 May 2026", desc: "Initial issue for approval", descHe: "הפצה ראשונית לאישור", by: "Arch. Golan" },
    ] },
  { dwgNo: "HW20-AR-DWG-070-002", title: "Maintenance Facility – Elevations", titleHe: "מבנה אחזקה – חזיתות",
    discipline: "AR", stage: "PD", sheet: "A1", scale: "1:100", format: "PDF", currentRev: "A", status: "DRAFT",
    issueDate: "18 Jun 2026",
    revisions: [
      { rev: "A", date: "18 Jun 2026", desc: "Draft concept elevations", descHe: "חזיתות קונספט טיוטה", by: "Arch. Golan" },
    ] },

  // ── Mechanical (ME) ──
  { dwgNo: "HW20-ME-DWG-055-001", title: "Drainage Pump Station – Mechanical Layout", titleHe: "תחנת שאיבה לניקוז – פריסה מכנית",
    discipline: "ME", stage: "DD", sheet: "A1", scale: "1:50", format: "DWG", currentRev: "A", status: "IFR",
    issueDate: "24 Jun 2026",
    revisions: [
      { rev: "A", date: "24 Jun 2026", desc: "Initial issue for review", descHe: "הפצה ראשונית לבדיקה", by: "Eng. Katz" },
    ] },

  // ── Electrical (EL) ──
  { dwgNo: "HW20-EL-DWG-050-001", title: "Electrical Conduit Routing Plan", titleHe: "תוכנית ניתוב צנרת חשמל",
    discipline: "EL", stage: "DD", sheet: "A1", scale: "1:100", format: "DWG", currentRev: "A", status: "IFA",
    issueDate: "28 May 2026", linkedSubmittal: "SUB-012",
    revisions: [
      { rev: "A", date: "28 May 2026", desc: "Initial issue — routing through bridge deck under review", descHe: "הפצה ראשונית — ניתוב דרך סיפון הגשר בבדיקה", by: "Eng. Cohen" },
    ] },
  { dwgNo: "HW20-EL-DWG-050-002", title: "Roadway Lighting Layout – Section A", titleHe: "פריסת תאורת כביש – קטע A",
    discipline: "EL", stage: "CD", sheet: "A1", scale: "1:250", format: "DWG", currentRev: "B", status: "IFC",
    issueDate: "20 Jun 2026",
    revisions: [
      { rev: "A", date: "01 May 2026", desc: "Initial issue", descHe: "הפצה ראשונית", by: "Eng. Cohen" },
      { rev: "B", date: "20 Jun 2026", desc: "Pole spacing finalized, issued for construction", descHe: "מרווחי עמודים סופיים, הופץ לביצוע", by: "Eng. Cohen", checkedBy: "Eng. Mizrahi", approvedBy: "Eng. Cohen" },
    ] },

  // ── Traffic & ITS (TR) ──
  { dwgNo: "HW20-TR-DWG-060-001", title: "Traffic Signal Layout – Phase 1", titleHe: "פריסת רמזורים – שלב 1",
    discipline: "TR", stage: "DD", sheet: "A1", scale: "1:250", format: "DWG", currentRev: "A", status: "IFR",
    issueDate: "25 May 2026", linkedSubmittal: "SUB-006",
    revisions: [
      { rev: "A", date: "25 May 2026", desc: "Initial issue for review", descHe: "הפצה ראשונית לבדיקה", by: "Eng. Cohen" },
    ] },
  { dwgNo: "HW20-TR-DWG-060-002", title: "Signage & Line Marking Plan", titleHe: "תוכנית שילוט וסימון קווים",
    discipline: "TR", stage: "PD", sheet: "A1", scale: "1:500", format: "PDF", currentRev: "A", status: "IFC",
    issueDate: "05 Dec 2025",
    revisions: [
      { rev: "A", date: "05 Dec 2025", desc: "Initial concept, approved as design basis", descHe: "קונספט ראשוני, אושר כבסיס לתכנון", by: "Eng. Cohen", approvedBy: "Eng. Mizrahi" },
    ] },

  // ── Landscape & Environmental (LA) ──
  { dwgNo: "HW20-LA-DWG-080-001", title: "Landscape Planting Plan – Zone A", titleHe: "תוכנית נטיעות – אזור A",
    discipline: "LA", stage: "PD", sheet: "A1", scale: "1:500", format: "PDF", currentRev: "A", status: "DRAFT",
    issueDate: "15 Jun 2026",
    revisions: [
      { rev: "A", date: "15 Jun 2026", desc: "Draft planting concept", descHe: "קונספט נטיעות טיוטה", by: "LArch. Tamir" },
    ] },
  { dwgNo: "HW20-LA-DWG-080-002", title: "Noise Barrier – Elevation & Planting", titleHe: "מחסום רעש – חזית ונטיעות",
    discipline: "LA", stage: "DD", sheet: "A1", scale: "1:100", format: "DWG", currentRev: "A", status: "IFA",
    issueDate: "27 Jun 2026",
    revisions: [
      { rev: "A", date: "27 Jun 2026", desc: "Initial issue for approval", descHe: "הפצה ראשונית לאישור", by: "LArch. Tamir" },
    ] },

  // ── Water & Sewage (WS) ──
  { dwgNo: "HW20-WS-DWG-091-001", title: "Water Main Relocation Plan", titleHe: "תוכנית העתקת קו מים ראשי",
    discipline: "WS", stage: "CD", sheet: "A1", scale: "1:200", format: "DWG", currentRev: "A", status: "IFC",
    issueDate: "18 May 2026",
    revisions: [
      { rev: "A", date: "18 May 2026", desc: "Coordinated with local water authority, issued for construction", descHe: "תואם מול תאגיד המים, הופץ לביצוע", by: "Eng. Ben-David", checkedBy: "Eng. Mizrahi", approvedBy: "Eng. Cohen" },
    ] },
  { dwgNo: "HW20-WS-DWG-091-002", title: "Sewage Pipeline Layout – Section A", titleHe: "תוכנית קו ביוב – קטע A",
    discipline: "WS", stage: "DD", sheet: "A1", scale: "1:200", format: "DWG", currentRev: "A", status: "IFR",
    issueDate: "01 Jul 2026",
    revisions: [
      { rev: "A", date: "01 Jul 2026", desc: "Initial issue for review — coordinated with drainage layout HW20-DR-DWG-030-005", descHe: "הפצה ראשונית לבדיקה — תואם מול תוכנית ניקוז HW20-DR-DWG-030-005", by: "Eng. Ben-David" },
    ] },

  // ── Utilities (UT) ──
  { dwgNo: "HW20-UT-DWG-090-001", title: "Gas Line Crossing – Detail", titleHe: "חציית קו גז – פרט",
    discipline: "UT", stage: "DD", sheet: "A2", scale: "1:50", format: "DWG", currentRev: "A", status: "IFR",
    issueDate: "29 Jun 2026",
    revisions: [
      { rev: "A", date: "29 Jun 2026", desc: "Initial issue for review", descHe: "הפצה ראשונית לבדיקה", by: "Eng. Ben-David" },
    ] },
];

export default function DesignPage() {
  const { active } = useProjects();
  const isDemo = active.id === "highway-20";

  const { lang, isHe } = useLanguage();
  const T = TRANSLATIONS[lang];
  const { disciplines, styleFor } = useDisciplines();

  const [tab, setTab] = useState<TabId>("submittals");
  const [search, setSearch] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showDisciplineMgr, setShowDisciplineMgr] = useState(false);

  // Submittals
  const [submittals, setSubmittals] = useState(isDemo ? DEMO_SUBMITTALS : []);
  const [showModal, setShowModal] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  useEffect(() => { setSubmittals(isDemo ? DEMO_SUBMITTALS : []); }, [isDemo]);

  // Drawing Register
  const [drawings, setDrawings] = useState<Drawing[]>(isDemo ? DEMO_DRAWINGS : []);
  const [showDwgModal, setShowDwgModal] = useState(false);
  const [deleteDwgIdx, setDeleteDwgIdx] = useState<number | null>(null);
  const [historyDwgIdx, setHistoryDwgIdx] = useState<number | null>(null);
  useEffect(() => { setDrawings(isDemo ? DEMO_DRAWINGS : []); }, [isDemo]);

  useEffect(() => { setSearch(""); setSelectedDiscipline(null); setSelectedStage(null); }, [tab]);

  function confirmDelete() {
    if (deleteIdx === null) return;
    setSubmittals(prev => prev.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
  }
  function confirmDeleteDwg() {
    if (deleteDwgIdx === null) return;
    setDrawings(prev => prev.filter((_, i) => i !== deleteDwgIdx));
    setDeleteDwgIdx(null);
  }

  const statsValues = isDemo ? [38, 14, 17, 4, 3] : [
    submittals.length,
    submittals.filter(s => s.status === "APPROVED").length,
    submittals.filter(s => s.status === "UNDER REVIEW").length,
    submittals.filter(s => s.status === "REJECTED" || s.status === "RESUBMIT").length,
    submittals.filter(s => s.status === "PENDING").length,
  ];

  const registerStatsValues = [
    drawings.length,
    drawings.filter(d => d.status === "IFC" || d.status === "AS-BUILT").length,
    drawings.filter(d => d.status === "IFA" || d.status === "IFR" || d.status === "DRAFT").length,
    drawings.filter(d => d.status === "SUPERSEDED" || d.status === "VOID").length,
  ];

  function addSubmittal(values: Record<string, string>) {
    const num = `SUB-${String(submittals.length + 1).padStart(3, "0")}`;
    setSubmittals(prev => [{
      num,
      title: values.title || "",
      discipline: values.discipline || "Civil",
      rev: "Rev.A",
      submitted: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      due: values.due ? new Date(values.due).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "",
      daysRemaining: values.due ? Math.round((new Date(values.due).getTime() - Date.now()) / 86400000) : 21,
      status: "PENDING" as SubStatus,
    }, ...prev]);
    setShowModal(false);
  }

  function addDrawing(values: Record<string, string>) {
    const discipline = (values.discipline || selectedDiscipline || "CIV") as Discipline;
    const stage = (values.stage || selectedStage || "PD") as Stage;
    const seq = drawings.filter(d => d.discipline === discipline).length + 1;
    const dwgNo = `HW20-${discipline}-DWG-${String(seq).padStart(3, "0")}`;
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const status = (values.status || "DRAFT") as DwgStatus;
    setDrawings(prev => [{
      dwgNo,
      title: values.title || "",
      titleHe: values.title || "",
      discipline,
      stage,
      sheet: values.sheet || "A1",
      scale: values.scale || "NTS",
      format: values.format || "DWG",
      currentRev: "A",
      status,
      issueDate: today,
      revisions: [{
        rev: "A", date: today,
        desc: "Initial issue", descHe: "הפצה ראשונית",
        by: "David Cohen",
      }],
    }, ...prev]);
    setShowDwgModal(false);
  }

  const filteredSubmittals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return submittals;
    return submittals.filter(s => s.num.toLowerCase().includes(q) || s.title.toLowerCase().includes(q));
  }, [submittals, search]);

  const disciplineCounts = useMemo(() => {
    const map = new Map<Discipline, number>();
    for (const d of drawings) map.set(d.discipline, (map.get(d.discipline) ?? 0) + 1);
    return map;
  }, [drawings]);

  const stageCounts = useMemo(() => {
    const map = new Map<Stage, number>();
    if (!selectedDiscipline) return map;
    for (const d of drawings) {
      if (d.discipline !== selectedDiscipline) continue;
      map.set(d.stage, (map.get(d.stage) ?? 0) + 1);
    }
    return map;
  }, [drawings, selectedDiscipline]);

  const filteredDrawings = useMemo(() => {
    if (!selectedDiscipline || !selectedStage) return [];
    const q = search.trim().toLowerCase();
    return drawings.filter(d => {
      if (d.discipline !== selectedDiscipline || d.stage !== selectedStage) return false;
      const label = isHe ? d.titleHe : d.title;
      return !q || d.dwgNo.toLowerCase().includes(q) || label.toLowerCase().includes(q);
    });
  }, [drawings, search, selectedDiscipline, selectedStage, isHe]);

  const historyDwg = historyDwgIdx !== null ? drawings[historyDwgIdx] : null;

  const workflowGroups: { key: string; items: typeof submittals; icon: typeof Clock; color: string }[] = [
    { key: "PENDING", items: submittals.filter(s => s.status === "PENDING"), icon: Clock, color: "#78716C" },
    { key: "UNDER REVIEW", items: submittals.filter(s => s.status === "UNDER REVIEW"), icon: FileText, color: P.warn },
    { key: "REJECTED", items: submittals.filter(s => s.status === "REJECTED" || s.status === "RESUBMIT"), icon: XCircle, color: P.danger },
    { key: "APPROVED", items: submittals.filter(s => s.status === "APPROVED"), icon: CheckCircle2, color: P.good },
  ];

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px]"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: P.text3 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={T.searchPlaceholder}
              className="bg-transparent outline-none w-40"
              style={{ color: P.text1 }} />
          </div>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">

        {/* Stats row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {(tab === "register" ? T.registerStatsLabels : T.statsLabels).map((label, idx) => {
            const values = tab === "register" ? registerStatsValues : statsValues;
            if (tab === "register" && idx === 4) return null;
            const colors = tab === "register" ? [P.copper, P.good, P.warn, P.danger] : [P.copper, P.good, P.warn, P.danger, "#78716C"];
            return (
              <div key={label} className="rounded-2xl p-4 text-center"
                style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
                <p className="text-[28px] font-bold" style={{ color: colors[idx] }}>{values[idx]}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: P.text3 }}>{label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4">
          {(Object.keys(T.tabs) as TabId[]).map(tabId => (
            <button key={tabId} onClick={() => setTab(tabId)}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors"
              style={{
                background: tab === tabId ? P.copper : P.bg,
                color: tab === tabId ? "#fff" : P.text2,
                border: `1px solid ${tab === tabId ? P.copper : P.border}`,
              }}>
              {T.tabs[tabId]}
            </button>
          ))}
          <div className="flex-1" />
          {tab === "submittals" && (
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold text-white"
              style={{ background: P.copper }}>
              <Plus className="w-3 h-3" /> {T.newSubmittal}
            </button>
          )}
          {tab === "register" && (
            <button onClick={() => setShowDwgModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold text-white"
              style={{ background: P.copper }}>
              <Plus className="w-3 h-3" /> {T.newDrawing}
            </button>
          )}
        </div>

        {/* AI Insight */}
        {isDemo && tab === "submittals" && (
          <div className="flex items-start gap-3 p-4 rounded-2xl mb-4"
            style={{ background: P.dangerBg, border: `1px solid #FECACA` }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEE2E2" }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.danger }} />
            </div>
            <div>
              <p className="text-[12px] font-bold mb-0.5" style={{ color: P.danger }}>{T.aiAlertLabel}</p>
              <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.aiAlertText}</p>
            </div>
          </div>
        )}
        {isDemo && tab === "register" && (
          <div className="flex items-start gap-3 p-4 rounded-2xl mb-4"
            style={{ background: P.dangerBg, border: `1px solid #FECACA` }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEE2E2" }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.danger }} />
            </div>
            <div>
              <p className="text-[12px] font-bold mb-0.5" style={{ color: P.danger }}>{T.docControlAlertLabel}</p>
              <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.docControlAlertText}</p>
            </div>
          </div>
        )}

        {/* ═══ Submittals Tab ═══ */}
        {tab === "submittals" && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <table className="w-full text-[12.5px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colNum, T.colTitle, T.colDiscipline, T.colRev, T.colSubmitted, T.colDue, T.colDaysLeft, T.colStatus, ""].map(h => (
                    <th key={h} className="px-4 py-3 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubmittals.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-[13px]" style={{ color: P.text3 }}>
                    {T.noSubmittals}
                  </td></tr>
                )}
                {filteredSubmittals.map((s) => {
                  const i = submittals.indexOf(s);
                  return (
                  <tr key={s.num} className="transition-colors hover:bg-[#F5F2EF]"
                    style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-4 py-3 font-mono text-[11px] font-bold" style={{ color: P.copper }}>{s.num}</td>
                    <td className="px-4 py-3 font-medium max-w-[280px]" style={{ color: P.text1 }}>{s.title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                        style={{
                          background: s.discipline === "Structural" ? "#EDE9FE" : s.discipline === "Civil" ? "#E0F2FE" : s.discipline === "MEP" ? "#E0FFFE" : "#ECFDF5",
                          color: s.discipline === "Structural" ? "#7C3AED" : s.discipline === "Civil" ? "#0369A1" : s.discipline === "MEP" ? "#0891B2" : "#047857",
                        }}>
                        {s.discipline}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]" style={{ color: P.text3 }}>{s.rev}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text2 }}>{s.submitted}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text2 }}>{s.due}</td>
                    <td className="px-4 py-3">
                      {s.daysRemaining < 0
                        ? <span className="font-bold text-[12px]" style={{ color: P.danger }}>{T.overdue(Math.abs(s.daysRemaining))}</span>
                        : s.daysRemaining === 0
                        ? <span className="font-bold text-[12px]" style={{ color: P.warn }}>{T.dueToday}</span>
                        : <span className="font-medium text-[12px]" style={{ color: P.good }}>{T.daysLeft(s.daysRemaining)}</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ background: statusStyle[s.status].bg, color: statusStyle[s.status].color }}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteIdx(i)} className="p-1 rounded-lg transition-colors hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" style={{ color: P.danger }} />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ═══ Drawing Register Tab ═══ */}
        {tab === "register" && (
          <>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 mb-4 text-[12.5px] font-semibold flex-wrap">
              <button onClick={() => { setSelectedDiscipline(null); setSelectedStage(null); }}
                className="transition-colors"
                style={{ color: !selectedDiscipline ? P.text1 : P.copper }}>
                {T.registerRoot}
              </button>
              {selectedDiscipline && (
                <>
                  {isHe ? <ChevronLeft className="w-3.5 h-3.5" style={{ color: P.text3 }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: P.text3 }} />}
                  <button onClick={() => setSelectedStage(null)} className="transition-colors"
                    style={{ color: !selectedStage ? P.text1 : P.copper }}>
                    {isHe ? disciplines.find(x => x.code === selectedDiscipline)?.he : disciplines.find(x => x.code === selectedDiscipline)?.en}
                  </button>
                </>
              )}
              {selectedDiscipline && selectedStage && (
                <>
                  {isHe ? <ChevronLeft className="w-3.5 h-3.5" style={{ color: P.text3 }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: P.text3 }} />}
                  <span style={{ color: P.text1 }}>
                    {selectedStage} — {isHe ? STAGES.find(x => x.code === selectedStage)?.he : STAGES.find(x => x.code === selectedStage)?.en}
                  </span>
                </>
              )}
            </div>

            {/* Level 1: Discipline folders */}
            {!selectedDiscipline && (
              <>
              <div className="flex justify-end mb-3">
                <button onClick={() => setShowDisciplineMgr(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                  style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text2 }}>
                  <Settings2 className="w-3.5 h-3.5" /> {isHe ? "ניהול תחומים" : "Manage Disciplines"}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {disciplines.map(({ code, en, he }) => {
                  const dStyle = styleFor(code);
                  const count = disciplineCounts.get(code) ?? 0;
                  return (
                    <button key={code} onClick={() => setSelectedDiscipline(code)}
                      className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                      style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = P.copperMid; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: dStyle.bg }}>
                        <Folder className="w-5 h-5" style={{ color: dStyle.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold truncate" style={{ color: P.text1 }}>{isHe ? he : en}</p>
                        <p className="text-[11px] font-mono font-bold mt-0.5" style={{ color: dStyle.color }}>{code}</p>
                      </div>
                      <span className="text-[13px] font-bold shrink-0" style={{ color: P.text3 }}>{count}</span>
                    </button>
                  );
                })}
              </div>
              </>
            )}

            {/* Level 2: Stage folders (PD / DD / CD) */}
            {selectedDiscipline && !selectedStage && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {STAGES.map(({ code, en, he }) => {
                  const count = stageCounts.get(code) ?? 0;
                  return (
                    <button key={code} onClick={() => setSelectedStage(code)}
                      className="flex flex-col items-start gap-2 p-5 rounded-2xl text-left transition-all"
                      style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = P.copperMid; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: P.copperLight }}>
                        <FolderOpen className="w-5 h-5" style={{ color: P.copper }} />
                      </div>
                      <p className="text-[15px] font-mono font-bold" style={{ color: P.copper }}>{code}</p>
                      <p className="text-[13px] font-semibold" style={{ color: P.text1 }}>{isHe ? he : en}</p>
                      <p className="text-[12px] font-medium" style={{ color: P.text3 }}>{count} {isHe ? "תכניות" : "drawings"}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Level 3: Drawings table */}
            {selectedDiscipline && selectedStage && (
              <div className="rounded-2xl overflow-hidden"
                style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                      {[T.colDwg, T.colSheetScale, T.colRev, T.colStatus, T.colIssueDate, T.colFormat, T.colLinked, ""].map(h => (
                        <th key={h} className="px-4 py-3 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrawings.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-10 text-center text-[13px]" style={{ color: P.text3 }}>
                        {T.noDrawings}
                      </td></tr>
                    )}
                    {filteredDrawings.map((d) => {
                      const i = drawings.indexOf(d);
                      const sStyle = dwgStatusStyle[d.status];
                      return (
                        <tr key={d.dwgNo} className="transition-colors hover:bg-[#F5F2EF]"
                          style={{ borderBottom: `1px solid ${P.border}` }}>
                          <td className="px-4 py-3 max-w-[320px]">
                            <p className="font-mono text-[11px] font-bold" style={{ color: P.copper }}>{d.dwgNo}</p>
                            <p className="font-medium mt-0.5" style={{ color: P.text1 }}>{isHe ? d.titleHe : d.title}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text2 }}>
                            <div className="flex items-center gap-1.5">
                              <Ruler className="w-3 h-3 shrink-0" style={{ color: P.text3 }} />
                              {d.sheet} · {d.scale}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] font-bold" style={{ color: P.text2 }}>Rev.{d.currentRev}</td>
                          <td className="px-4 py-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ background: sStyle.bg, color: sStyle.color }}>
                              {d.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text2 }}>{d.issueDate}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold font-mono" style={{ background: P.bg, color: P.text3 }}>
                              {d.format}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {d.linkedSubmittal && (
                              <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: P.copperMid }}>
                                <Link2 className="w-3 h-3 shrink-0" />{d.linkedSubmittal}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setHistoryDwgIdx(i)} title={T.historyTooltip}
                                className="p-1 rounded-lg transition-colors hover:bg-black/5">
                                <History className="w-3.5 h-3.5" style={{ color: P.text2 }} />
                              </button>
                              <button onClick={() => setDeleteDwgIdx(i)} className="p-1 rounded-lg transition-colors hover:bg-red-50">
                                <Trash2 className="w-3.5 h-3.5" style={{ color: P.danger }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ═══ Approval Workflow Tab ═══ */}
        {tab === "workflow" && (
          <div>
            <p className="text-[12.5px] mb-4" style={{ color: P.text3 }}>{T.workflowSub}</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {workflowGroups.map(({ key, items, icon: Icon, color }) => (
                <div key={key} className="rounded-2xl overflow-hidden"
                  style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
                  <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${P.border}`, background: P.bg }}>
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                    <p className="text-[12px] font-bold flex-1" style={{ color: P.text1 }}>{T.workflowCols[key as keyof typeof T.workflowCols]}</p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{items.length}</span>
                  </div>
                  <div className="p-2.5 space-y-2 min-h-[120px]">
                    {items.length === 0 && (
                      <p className="text-[11.5px] text-center py-6" style={{ color: P.text3 }}>—</p>
                    )}
                    {items.map(s => (
                      <div key={s.num} className="p-3 rounded-xl" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                        <p className="font-mono text-[10.5px] font-bold" style={{ color: P.copper }}>{s.num}</p>
                        <p className="text-[12px] font-medium mt-0.5 leading-snug" style={{ color: P.text1 }}>{s.title}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] font-semibold" style={{ color: P.text3 }}>{s.discipline}</span>
                          <span className="text-[10px] font-medium" style={{ color: P.text3 }}>{s.due}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Delete submittal confirm */}
      {deleteIdx !== null && (
        <ConfirmDialog
          isHe={isHe}
          message={T.deleteSubmittalMsg(submittals[deleteIdx]?.title ?? "")}
          messageHe={T.deleteSubmittalMsg(submittals[deleteIdx]?.title ?? "")}
          onCancel={() => setDeleteIdx(null)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Delete drawing confirm */}
      {deleteDwgIdx !== null && (
        <ConfirmDialog
          isHe={isHe}
          message={T.deleteDrawingMsg(drawings[deleteDwgIdx]?.title ?? "")}
          messageHe={T.deleteDrawingMsg(drawings[deleteDwgIdx]?.titleHe ?? "")}
          onCancel={() => setDeleteDwgIdx(null)}
          onConfirm={confirmDeleteDwg}
        />
      )}

      {/* New submittal modal */}
      {showModal && (
        <QuickAddModal
          isHe={isHe}
          title="New Submittal" titleHe="הגשה חדשה"
          onClose={() => setShowModal(false)}
          onSave={addSubmittal}
          fields={[
            { key: "title", label: "Submittal Title", labelHe: "כותרת ההגשה", type: "text", required: true },
            { key: "discipline", label: "Discipline", labelHe: "תחום", type: "select", options: [
              { value: "Structural", label: "Structural", labelHe: "קונסטרוקציה" },
              { value: "Civil", label: "Civil", labelHe: "אזרחית" },
              { value: "MEP", label: "MEP", labelHe: "מ.מ.ח" },
              { value: "Traffic", label: "Traffic", labelHe: "תנועה" },
            ]},
            { key: "due", label: "Due Date", labelHe: "תאריך יעד", type: "date" },
          ]}
        />
      )}

      {/* New drawing modal */}
      {showDwgModal && (
        <QuickAddModal
          isHe={isHe}
          title={T.addDrawingTitle} titleHe={T.addDrawingTitle}
          onClose={() => setShowDwgModal(false)}
          onSave={addDrawing}
          fields={[
            { key: "title", label: T.fldTitle, labelHe: T.fldTitle, type: "text", required: true },
            { key: "discipline", label: T.fldDiscipline, labelHe: T.fldDiscipline, type: "select",
              options: disciplines.map(d => ({ value: d.code, label: `${d.code} — ${d.en}`, labelHe: `${d.code} — ${d.he}` })) },
            { key: "stage", label: T.fldStage, labelHe: T.fldStage, type: "select",
              options: STAGES.map(s => ({ value: s.code, label: `${s.code} — ${s.en}`, labelHe: `${s.code} — ${s.he}` })) },
            { key: "sheet", label: T.fldSheet, labelHe: T.fldSheet, type: "select", options: [
              { value: "A0", label: "A0", labelHe: "A0" },
              { value: "A1", label: "A1", labelHe: "A1" },
              { value: "A2", label: "A2", labelHe: "A2" },
              { value: "A3", label: "A3", labelHe: "A3" },
            ]},
            { key: "scale", label: T.fldScale, labelHe: T.fldScale, type: "text", placeholder: "1:100", placeholderHe: "1:100" },
            { key: "format", label: T.fldFormat, labelHe: T.fldFormat, type: "select", options: [
              { value: "DWG", label: "DWG", labelHe: "DWG" },
              { value: "DXF", label: "DXF", labelHe: "DXF" },
              { value: "RVT", label: "RVT", labelHe: "RVT" },
              { value: "PDF", label: "PDF", labelHe: "PDF" },
            ]},
            { key: "status", label: T.fldStatus, labelHe: T.fldStatus, type: "select", options: [
              { value: "DRAFT", label: "Draft", labelHe: "טיוטה" },
              { value: "IFR", label: "Issued for Review", labelHe: "הופץ לבדיקה" },
              { value: "IFA", label: "Issued for Approval", labelHe: "הופץ לאישור" },
              { value: "IFC", label: "Issued for Construction", labelHe: "הופץ לביצוע" },
            ]},
          ]}
        />
      )}

      {/* Revision history modal */}
      {historyDwg && (
        <div onClick={e => { if (e.target === e.currentTarget) setHistoryDwgIdx(null); }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(28,25,23,0.5)" }}>
          <div className="w-full max-w-2xl rounded-3xl overflow-hidden" style={{ background: P.card }}>
            <div className="flex items-start justify-between px-6 py-4" style={{ borderBottom: `1px solid ${P.border}` }}>
              <div>
                <h2 className="text-[16px] font-bold" style={{ color: P.text1 }}>{T.revHistTitle}</h2>
                <p className="text-[12px] mt-0.5" style={{ color: P.text3 }}>{T.revHistSub}</p>
                <p className="font-mono text-[11px] font-bold mt-1.5" style={{ color: P.copper }}>{historyDwg.dwgNo}</p>
                <p className="text-[13px] font-medium" style={{ color: P.text2 }}>{isHe ? historyDwg.titleHe : historyDwg.title}</p>
              </div>
              <button onClick={() => setHistoryDwgIdx(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 shrink-0">
                <X className="w-4 h-4" style={{ color: P.text2 }} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                    {[T.colRevCol, T.colDate, T.colDesc, T.colBy, T.colChecked, T.colApproved].map(h => (
                      <th key={h} className="px-2 py-2 text-start font-bold" style={{ color: P.text3 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyDwg.revisions.map((r, ri) => (
                    <tr key={ri} style={{ borderBottom: `1px solid ${P.border}` }}>
                      <td className="px-2 py-3 font-mono font-bold align-top" style={{ color: r.rev === historyDwg.currentRev ? P.copper : P.text2 }}>
                        Rev.{r.rev}{r.rev === historyDwg.currentRev && (
                          <span className="ms-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: P.goodBg, color: P.good }}>
                            {isHe ? "נוכחי" : "Current"}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap align-top" style={{ color: P.text2 }}>{r.date}</td>
                      <td className="px-2 py-3 align-top max-w-[220px]" style={{ color: P.text1 }}>{isHe ? r.descHe : r.desc}</td>
                      <td className="px-2 py-3 whitespace-nowrap align-top" style={{ color: P.text2 }}>{r.by}</td>
                      <td className="px-2 py-3 whitespace-nowrap align-top" style={{ color: P.text3 }}>{r.checkedBy ?? "—"}</td>
                      <td className="px-2 py-3 whitespace-nowrap align-top" style={{ color: P.text3 }}>{r.approvedBy ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setHistoryDwgIdx(null)}
                className="w-full py-2.5 rounded-xl text-[13px] font-bold"
                style={{ background: P.bg, color: P.text2 }}>
                {T.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDisciplineMgr && (
        <DisciplineManagerModal isHe={isHe} onClose={() => setShowDisciplineMgr(false)} />
      )}

    </div>
  );
}
