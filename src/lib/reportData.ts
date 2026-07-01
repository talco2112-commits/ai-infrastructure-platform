export const PROJECT = {
  name: "Highway 20 – Northern Extension",
  nameHe: "כביש 20 – הרחבה צפונית",
  contract: 450,
  spent: 312.0,
  progress: 57,
  progressPlanned: 63,
  week: 89,
  totalWeeks: 156,
  contractor: "Kesem-Kvish Ltd.",
  owner: "Ministry of Transport",
  pm: "David Cohen, PE",
  startDate: "01 Jan 2025",
  completionDate: "31 Dec 2027",
  reportDate: "01 Jul 2026",
  reportRef: "HW20-WPR-W26-2026",
};

export const ZONE_PROGRESS = [
  { zone: "A",  desc: "km 0–3",    planned: 95, actual: 94, status: "On Track",           color: "#15803D" },
  { zone: "B",  desc: "km 3–7",    planned: 82, actual: 79, status: "Minor Delay",         color: "#B45309" },
  { zone: "C",  desc: "km 7–11",   planned: 71, actual: 65, status: "Delayed",             color: "#B45309" },
  { zone: "D",  desc: "km 11–15",  planned: 48, actual: 31, status: "Critical Delay",      color: "#B91C1C" },
  { zone: "E",  desc: "km 15–18",  planned: 35, actual: 38, status: "Ahead of Schedule",   color: "#15803D" },
  { zone: "IA", desc: "Interchange A", planned: 62, actual: 54, status: "Delayed",         color: "#B45309" },
];

export const BUDGET_SECTIONS = [
  { section: "Earthworks",               budget: 45,  spent: 44.2 },
  { section: "Drainage",                 budget: 38,  spent: 35.1 },
  { section: "Road Base & Sub-base",     budget: 62,  spent: 51.3 },
  { section: "Bridge 3",                 budget: 55,  spent: 31.2 },
  { section: "Bridge 6",                 budget: 48,  spent: 24.1 },
  { section: "Interchange A",            budget: 72,  spent: 32.4 },
  { section: "Paving",                   budget: 58,  spent: 22.6 },
  { section: "Utilities & Services",     budget: 41,  spent: 28.7 },
  { section: "Noise & Retaining Walls",  budget: 31,  spent: 19.5 },
];

export const OPEN_RFIS = [
  { id: "RFI-034", subject: "Electrical conduit routing – Bridge 3",       submitted: "15 Jun 2026", due: "22 Jun 2026", status: "OVERDUE", assignee: "ENG Team" },
  { id: "RFI-035", subject: "Utility conflict Zone D Chainage 14+320",     submitted: "18 Jun 2026", due: "25 Jun 2026", status: "OVERDUE", assignee: "ENG Team" },
  { id: "RFI-036", subject: "Abutment backfill specification – Bridge 6",  submitted: "19 Jun 2026", due: "26 Jun 2026", status: "OVERDUE", assignee: "Owner"    },
  { id: "RFI-037", subject: "Noise barrier foundation depth revision",      submitted: "22 Jun 2026", due: "29 Jun 2026", status: "Open",    assignee: "ENG Team" },
  { id: "RFI-038", subject: "Drainage pipe material substitution Zone C",  submitted: "24 Jun 2026", due: "01 Jul 2026", status: "Open",    assignee: "Owner"    },
  { id: "RFI-039", subject: "Traffic signal positioning Interchange A",    submitted: "25 Jun 2026", due: "02 Jul 2026", status: "Open",    assignee: "ENG Team" },
  { id: "RFI-040", subject: "Pavement marking specification Zones A–C",    submitted: "27 Jun 2026", due: "04 Jul 2026", status: "Open",    assignee: "ENG Team" },
  { id: "RFI-041", subject: "Guardrail height compliance Zone B",          submitted: "28 Jun 2026", due: "05 Jul 2026", status: "Open",    assignee: "Owner"    },
];

export const OPEN_NCRS = [
  { id: "NCR-019", zone: "Zone B",        issue: "Rebar spacing deviation – Slab S-14",          severity: "Minor",    status: "Closed", date: "02 Jun 2026" },
  { id: "NCR-020", zone: "Bridge 6",      issue: "Formwork misalignment – Pier 4",               severity: "Moderate", status: "Open",   date: "10 Jun 2026" },
  { id: "NCR-021", zone: "Zone D",        issue: "Concrete failure – Pile Cap P7",               severity: "Major",    status: "Open",   date: "18 Jun 2026" },
  { id: "NCR-022", zone: "Zone C",        issue: "Drainage pipe gradient non-compliance",        severity: "Minor",    status: "Open",   date: "20 Jun 2026" },
  { id: "NCR-023", zone: "Zone A",        issue: "Gravel gradation out of specification",        severity: "Minor",    status: "Open",   date: "23 Jun 2026" },
  { id: "NCR-024", zone: "Interchange A", issue: "Structural concrete cube test failure",        severity: "Moderate", status: "Open",   date: "25 Jun 2026" },
];

export const CHANGE_ORDERS = [
  { id: "CO-001", desc: "Additional noise barriers Zone B–C",                    value: 4.8, status: "Approved", date: "Mar 2026" },
  { id: "CO-002", desc: "Utility relocation Zone D (unforeseen ground conditions)", value: 2.2, status: "Approved", date: "Apr 2026" },
  { id: "CO-003", desc: "Bridge 3 foundation redesign – soil bearing capacity",  value: 3.1, status: "Pending",  date: "May 2026" },
  { id: "CO-004", desc: "Drainage upgrade Zone C – poor soil conditions",        value: 1.4, status: "Pending",  date: "Jun 2026" },
];

export const SAFETY = {
  ltiFreeDays: 142,
  ltisYTD: 0,
  nearMissesYTD: 12,
  firstAidYTD: 18,
  observationsYTD: 347,
  toolboxTalksYTD: 89,
  totalManhoursYTD: 1_820_000,
  workforce: 312,
};

export const INCIDENTS = [
  { date: "15 May 2026", type: "First Aid", zone: "Zone C",   desc: "Minor cut from rebar edge – treated on site",                      status: "Closed" },
  { date: "28 Apr 2026", type: "Near Miss", zone: "Bridge 3", desc: "Unsecured formwork board fell – no injury",                        status: "Closed" },
  { date: "12 Apr 2026", type: "Near Miss", zone: "Zone D",   desc: "Near strike by excavator – exclusion zone breach",                 status: "Closed" },
  { date: "03 Mar 2026", type: "First Aid", zone: "Zone A",   desc: "Eye irritation from dust – PPE compliance enforced",               status: "Closed" },
  { date: "19 Feb 2026", type: "Near Miss", zone: "Zone B",   desc: "Mobile crane slewing arc infringement – barrier installed",        status: "Closed" },
];

export const WBS = [
  { id: "1.1", activity: "Earthworks – Zones A–C",           planned: "Jan–Apr 2026", forecast: "Jan–May 2026",     float: -14, status: "Complete"    },
  { id: "1.2", activity: "Earthworks – Zones D–E",           planned: "Mar–Jul 2026", forecast: "Mar–Aug 2026",     float: -28, status: "In Progress" },
  { id: "2.1", activity: "Drainage – Zones A–C",             planned: "Mar–Jun 2026", forecast: "Mar–Jul 2026",     float: -18, status: "In Progress" },
  { id: "2.2", activity: "Drainage – Zone D",                planned: "May–Sep 2026", forecast: "Jul–Oct 2026",     float: -42, status: "Not Started" },
  { id: "3.1", activity: "Bridge 3 – Foundations",           planned: "Jan–Apr 2026", forecast: "Jan–Jun 2026",     float: -45, status: "In Progress" },
  { id: "3.2", activity: "Bridge 3 – Superstructure",        planned: "May–Sep 2026", forecast: "Jul–Nov 2026",     float: -60, status: "Not Started" },
  { id: "3.3", activity: "Bridge 6 – All Works",             planned: "Apr–Nov 2026", forecast: "Apr–Dec 2026",     float: -35, status: "In Progress" },
  { id: "4.1", activity: "Road Base – Zones A–B",            planned: "May–Jul 2026", forecast: "May–Jul 2026",     float:   0, status: "In Progress" },
  { id: "4.2", activity: "Road Base – Zones C–E",            planned: "Jul–Oct 2026", forecast: "Aug–Nov 2026",     float: -30, status: "Not Started" },
  { id: "5.1", activity: "Interchange A – Earthworks",       planned: "Feb–May 2026", forecast: "Feb–Jul 2026",     float: -55, status: "In Progress" },
  { id: "5.2", activity: "Interchange A – Structure",        planned: "Jun–Dec 2026", forecast: "Aug 2026–Feb 2027",float: -60, status: "Not Started" },
  { id: "6.1", activity: "Paving – Zones A–B",               planned: "Aug–Oct 2026", forecast: "Sep–Nov 2026",     float: -25, status: "Not Started" },
  { id: "6.2", activity: "Noise Barriers – Full Scope",      planned: "Jul–Nov 2026", forecast: "Aug–Dec 2026",     float: -30, status: "Not Started" },
  { id: "7.1", activity: "Utilities & Services – Zones A–C", planned: "Jan–Jun 2026", forecast: "Jan–Aug 2026",     float: -45, status: "In Progress" },
];

export const CASHFLOW = [
  { month: "Jan 2026", planned: 18.2, actual: 16.8 },
  { month: "Feb 2026", planned: 19.5, actual: 17.3 },
  { month: "Mar 2026", planned: 22.1, actual: 21.4 },
  { month: "Apr 2026", planned: 24.8, actual: 24.1 },
  { month: "May 2026", planned: 26.3, actual: 25.7 },
  { month: "Jun 2026", planned: 28.0, actual: 26.5 },
];

export const INVOICES = [
  { id: "INV-2026-045", contractor: "Steel Structures Ltd",  amount: 1.2, submitted: "20 Jun 2026", status: "In Review"  },
  { id: "INV-2026-046", contractor: "Kesem-Kvish Ltd.",      amount: 3.8, submitted: "22 Jun 2026", status: "In Review"  },
  { id: "INV-2026-047", contractor: "Drainage Experts Co.",  amount: 0.7, submitted: "24 Jun 2026", status: "In Review"  },
  { id: "INV-2026-048", contractor: "Ready Mix Concrete",    amount: 0.9, submitted: "25 Jun 2026", status: "Approved"   },
  { id: "INV-2026-049", contractor: "Equipment Hire Ltd",    amount: 0.4, submitted: "26 Jun 2026", status: "In Review"  },
];
