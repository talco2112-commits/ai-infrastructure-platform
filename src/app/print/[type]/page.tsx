import { PrintTrigger, PrintButton } from "@/components/PrintTrigger";
import {
  PROJECT, ZONE_PROGRESS, BUDGET_SECTIONS, OPEN_RFIS, OPEN_NCRS,
  CHANGE_ORDERS, SAFETY, INCIDENTS, WBS, CASHFLOW, INVOICES,
} from "@/lib/reportData";

const PRINT_CSS = `
  @page { size: A4; margin: 18mm 20mm; }
  @media print {
    .no-print { display: none !important; }
    .page-break { break-after: page; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #E5E7EB; padding: 5px 9px; font-size: 9pt; vertical-align: top; }
  th { background: #F5EBE0 !important; font-weight: 700; color: #57534E; text-align: left; }
  tr:nth-child(even) td { background: #FAFAF9; }
  .section-title {
    font-size: 10pt; font-weight: 700; color: #8B5A2B;
    text-transform: uppercase; letter-spacing: 0.06em;
    margin: 20px 0 10px; padding-bottom: 5px;
    border-bottom: 1.5px solid #8B5A2B;
  }
  .kpi-grid { display: grid; gap: 10px; margin-bottom: 14px; }
  .kpi-card {
    border: 1px solid #EDE8DF; border-radius: 6px; padding: 11px 14px;
    background: #FAF8F5;
  }
  .kpi-label { font-size: 7.5pt; font-weight: 700; color: #A8A29E; text-transform: uppercase; letter-spacing: 0.08em; }
  .kpi-value { font-size: 18pt; font-weight: 700; margin: 2px 0 1px; }
  .kpi-sub   { font-size: 8pt; }
  .bar-bg    { background: #E5E7EB; height: 7px; border-radius: 4px; margin-top: 7px; }
  .bar-fill  { height: 7px; border-radius: 4px; }
  .badge {
    display: inline-block; padding: 2px 7px; border-radius: 4px;
    font-size: 7.5pt; font-weight: 700;
  }
  .badge-red   { background: #FEF2F2; color: #B91C1C; }
  .badge-amber { background: #FFFBEB; color: #B45309; }
  .badge-green { background: #F0FDF4; color: #15803D; }
  .badge-gray  { background: #F5F5F4; color: #57534E; }
  p.summary {
    font-size: 9.5pt; line-height: 1.55; color: #374151; margin: 0 0 14px;
  }
  .footer {
    margin-top: 28px; padding-top: 10px;
    border-top: 1px solid #E5E7EB;
    display: flex; justify-content: space-between;
    font-size: 7.5pt; color: #A8A29E;
  }
`;

function ReportHeader({ title, subtitle, ref: refNum }: { title: string; subtitle: string; ref: string }) {
  return (
    <div style={{ marginBottom: "22px", paddingBottom: "14px", borderBottom: "2.5px solid #8B5A2B" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "16pt", fontWeight: 800, color: "#8B5A2B", letterSpacing: "-0.02em" }}>InfrAI</div>
          <div style={{ fontSize: "7.5pt", color: "#A8A29E", marginTop: "1px" }}>Project Intelligence Platform</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "8.5pt", color: "#57534E" }}>Generated: {PROJECT.reportDate}</div>
          <div style={{ fontSize: "8.5pt", color: "#A8A29E" }}>Ref: {refNum}</div>
          <div style={{ fontSize: "8.5pt", color: "#A8A29E" }}>CONFIDENTIAL</div>
        </div>
      </div>
      <div style={{ marginTop: "14px" }}>
        <div style={{ fontSize: "8pt", fontWeight: 700, color: "#A8A29E", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          {PROJECT.name}
        </div>
        <div style={{ fontSize: "17pt", fontWeight: 800, color: "#1C1917", margin: "4px 0 3px", lineHeight: 1.15 }}>
          {title}
        </div>
        <div style={{ fontSize: "9pt", color: "#57534E" }}>{subtitle}</div>
      </div>
    </div>
  );
}

function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="bar-bg">
      <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function ReportFooter({ title }: { title: string }) {
  return (
    <div className="footer">
      <span>{PROJECT.name} · {title}</span>
      <span>Generated: {PROJECT.reportDate} · InfrAI Platform · CONFIDENTIAL</span>
    </div>
  );
}

// ─── Weekly Progress Report ────────────────────────────────────────────────
function WeeklyProgressReport() {
  const openNCRs = OPEN_NCRS.filter(n => n.status === "Open");
  const overdueRFIs = OPEN_RFIS.filter(r => r.status === "OVERDUE");

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "10pt", color: "#1C1917", padding: "0 0 24px" }}>
      <ReportHeader
        title="Weekly Progress Report – Week 26"
        subtitle={`Period: 23–27 June 2026  ·  Contractor: ${PROJECT.contractor}  ·  PM: ${PROJECT.pm}`}
        ref="HW20-WPR-W26-2026"
      />

      {/* 1. Executive Summary */}
      <div className="section-title">1. Executive Summary</div>
      <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className="kpi-card">
          <div className="kpi-label">Overall Progress</div>
          <div className="kpi-value" style={{ color: "#B91C1C" }}>57%</div>
          <div className="kpi-sub" style={{ color: "#B91C1C" }}>Planned: 63% (−6%)</div>
          <ProgressBar value={57} color="#8B5A2B" />
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Budget Utilised</div>
          <div className="kpi-value" style={{ color: "#1C1917" }}>₪312M</div>
          <div className="kpi-sub" style={{ color: "#57534E" }}>of ₪450M contract (69.3%)</div>
          <ProgressBar value={69.3} color="#8B5A2B" />
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Safety – LTI Free</div>
          <div className="kpi-value" style={{ color: "#15803D" }}>142</div>
          <div className="kpi-sub" style={{ color: "#15803D" }}>Days without LTI · {SAFETY.workforce} workers</div>
          <div className="kpi-sub" style={{ color: "#57534E", marginTop: "2px" }}>1.82M manhours YTD</div>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
        <div className="kpi-card">
          <div className="kpi-label">Open RFIs</div>
          <div className="kpi-value" style={{ color: overdueRFIs.length > 0 ? "#B91C1C" : "#1C1917", fontSize: "16pt" }}>{OPEN_RFIS.length}</div>
          <div className="kpi-sub" style={{ color: "#B91C1C" }}>{overdueRFIs.length} overdue</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Open NCRs</div>
          <div className="kpi-value" style={{ color: "#B45309", fontSize: "16pt" }}>{openNCRs.length}</div>
          <div className="kpi-sub" style={{ color: "#B45309" }}>1 major severity</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Week</div>
          <div className="kpi-value" style={{ color: "#1C1917", fontSize: "16pt" }}>89/156</div>
          <div className="kpi-sub" style={{ color: "#57534E" }}>57% time elapsed</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pending Approvals</div>
          <div className="kpi-value" style={{ color: "#B45309", fontSize: "16pt" }}>₪4.2M</div>
          <div className="kpi-sub" style={{ color: "#B45309" }}>7 items awaiting sign-off</div>
        </div>
      </div>

      <p className="summary">
        The project is tracking at <strong>57% overall completion</strong> against a planned 63%, a 6-percentage-point
        schedule deficit at the end of Week 89. Primary drivers of delay are the utility relocation works in Zone D
        (14-day slippage) and the ongoing structural assessment following NCR-021 (Pile Cap P7 concrete failure). Budget
        utilisation at 69.3% remains broadly in line with programme. Three RFIs are overdue, blocking piling operations in Zone D.
      </p>

      {/* 2. Zone Progress */}
      <div className="section-title">2. Zone Progress</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "12%" }}>Zone</th>
            <th style={{ width: "16%" }}>Description</th>
            <th style={{ width: "14%" }}>Planned %</th>
            <th style={{ width: "14%" }}>Actual %</th>
            <th style={{ width: "10%" }}>Variance</th>
            <th style={{ width: "20%" }}>Status</th>
            <th style={{ width: "14%" }}>Progress Visual</th>
          </tr>
        </thead>
        <tbody>
          {ZONE_PROGRESS.map(z => (
            <tr key={z.zone}>
              <td><strong>Zone {z.zone}</strong></td>
              <td>{z.desc}</td>
              <td>{z.planned}%</td>
              <td style={{ fontWeight: 700 }}>{z.actual}%</td>
              <td style={{ color: z.actual >= z.planned ? "#15803D" : "#B91C1C", fontWeight: 700 }}>
                {z.actual >= z.planned ? "+" : ""}{z.actual - z.planned}%
              </td>
              <td>
                <span className={`badge ${z.status === "Critical Delay" ? "badge-red" : z.status === "On Track" || z.status === "Ahead of Schedule" ? "badge-green" : "badge-amber"}`}>
                  {z.status}
                </span>
              </td>
              <td>
                <ProgressBar value={z.actual} color={z.color} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 3. Budget by Section */}
      <div className="section-title" style={{ marginTop: "18px" }}>3. Budget Status</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "35%" }}>Section</th>
            <th style={{ width: "16%" }}>Budget (₪M)</th>
            <th style={{ width: "16%" }}>Spent (₪M)</th>
            <th style={{ width: "16%" }}>Remaining (₪M)</th>
            <th style={{ width: "10%" }}>% Spent</th>
            <th style={{ width: "7%" }}>Bar</th>
          </tr>
        </thead>
        <tbody>
          {BUDGET_SECTIONS.map(b => {
            const pct = Math.round(b.spent / b.budget * 100);
            return (
              <tr key={b.section}>
                <td>{b.section}</td>
                <td>₪{b.budget}M</td>
                <td>₪{b.spent}M</td>
                <td>₪{(b.budget - b.spent).toFixed(1)}M</td>
                <td style={{ fontWeight: 700, color: pct >= 90 ? "#B91C1C" : "#1C1917" }}>{pct}%</td>
                <td><ProgressBar value={pct} color={pct >= 90 ? "#B91C1C" : "#8B5A2B"} /></td>
              </tr>
            );
          })}
          <tr style={{ fontWeight: 700, background: "#F5EBE0" }}>
            <td><strong>TOTAL</strong></td>
            <td><strong>₪450M</strong></td>
            <td><strong>₪312.0M</strong></td>
            <td><strong>₪138.0M</strong></td>
            <td><strong>69.3%</strong></td>
            <td><ProgressBar value={69} color="#8B5A2B" /></td>
          </tr>
        </tbody>
      </table>

      {/* 4. Open RFIs */}
      <div className="section-title" style={{ marginTop: "18px" }}>4. Open RFIs</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "10%" }}>RFI No.</th>
            <th style={{ width: "42%" }}>Subject</th>
            <th style={{ width: "13%" }}>Submitted</th>
            <th style={{ width: "12%" }}>Due Date</th>
            <th style={{ width: "11%" }}>Status</th>
            <th style={{ width: "12%" }}>Assignee</th>
          </tr>
        </thead>
        <tbody>
          {OPEN_RFIS.map(r => (
            <tr key={r.id}>
              <td style={{ fontWeight: 700 }}>{r.id}</td>
              <td>{r.subject}</td>
              <td>{r.submitted}</td>
              <td style={{ color: r.status === "OVERDUE" ? "#B91C1C" : "#1C1917" }}>{r.due}</td>
              <td>
                <span className={`badge ${r.status === "OVERDUE" ? "badge-red" : "badge-amber"}`}>{r.status}</span>
              </td>
              <td>{r.assignee}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 5. Open NCRs */}
      <div className="section-title" style={{ marginTop: "18px" }}>5. Quality – Non-Conformance Reports</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "11%" }}>NCR No.</th>
            <th style={{ width: "16%" }}>Zone</th>
            <th style={{ width: "43%" }}>Issue</th>
            <th style={{ width: "13%" }}>Severity</th>
            <th style={{ width: "10%" }}>Status</th>
            <th style={{ width: "7%" }}>Raised</th>
          </tr>
        </thead>
        <tbody>
          {OPEN_NCRS.map(n => (
            <tr key={n.id}>
              <td style={{ fontWeight: 700 }}>{n.id}</td>
              <td>{n.zone}</td>
              <td>{n.issue}</td>
              <td>
                <span className={`badge ${n.severity === "Major" ? "badge-red" : n.severity === "Moderate" ? "badge-amber" : "badge-gray"}`}>
                  {n.severity}
                </span>
              </td>
              <td>
                <span className={`badge ${n.status === "Closed" ? "badge-green" : "badge-amber"}`}>{n.status}</span>
              </td>
              <td>{n.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 6. Key Issues */}
      <div className="section-title" style={{ marginTop: "18px" }}>6. Key Issues &amp; Risks This Week</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "8%" }}>Priority</th>
            <th style={{ width: "60%" }}>Issue / Risk</th>
            <th style={{ width: "15%" }}>Impact</th>
            <th style={{ width: "17%" }}>Action Required</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span className="badge badge-red">CRITICAL</span></td>
            <td>Utility relocation Zone D – 14 days behind schedule, blocking critical path piling works</td>
            <td>+14 days overall delay risk</td>
            <td>Escalation to Owner required immediately</td>
          </tr>
          <tr>
            <td><span className="badge badge-red">HIGH</span></td>
            <td>NCR-021: Concrete failure at Pile Cap P7 – structural assessment underway, works suspended</td>
            <td>Programme risk, cost impact TBC</td>
            <td>Structural assessment report due 08 Jul 2026</td>
          </tr>
          <tr>
            <td><span className="badge badge-red">HIGH</span></td>
            <td>3 RFIs overdue (RFI-034, 035, 036) – blocking Zone D piling and Bridge 6 works</td>
            <td>Productivity loss ~15%</td>
            <td>Response required within 48 hours</td>
          </tr>
          <tr>
            <td><span className="badge badge-amber">MEDIUM</span></td>
            <td>CO-003 (₪3.1M) Bridge 3 foundation redesign exceeding contractual review period</td>
            <td>Contractual notice obligation</td>
            <td>Notice issued to Owner; resolution by 15 Jul 2026</td>
          </tr>
        </tbody>
      </table>

      <ReportFooter title="Weekly Progress Report – W26" />
    </div>
  );
}

// ─── Financial Report ─────────────────────────────────────────────────────
function FinancialReport() {
  const totalBudget = BUDGET_SECTIONS.reduce((s, b) => s + b.budget, 0);
  const totalSpent  = BUDGET_SECTIONS.reduce((s, b) => s + b.spent,  0);
  const approvedCOs = CHANGE_ORDERS.filter(c => c.status === "Approved").reduce((s, c) => s + c.value, 0);
  const pendingCOs  = CHANGE_ORDERS.filter(c => c.status === "Pending").reduce((s, c) => s + c.value, 0);
  const totalInvPending = INVOICES.filter(i => i.status !== "Approved").reduce((s, i) => s + i.amount, 0);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "10pt", color: "#1C1917", padding: "0 0 24px" }}>
      <ReportHeader
        title="Financial Report – June 2026"
        subtitle={`Period: June 2026  ·  Contract Value: ₪450M  ·  ${PROJECT.contractor}`}
        ref="HW20-FIN-JUN2026"
      />

      <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
        <div className="kpi-card">
          <div className="kpi-label">Contract Value</div>
          <div className="kpi-value" style={{ color: "#1C1917" }}>₪450M</div>
          <div className="kpi-sub" style={{ color: "#57534E" }}>Original contract</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Spent to Date</div>
          <div className="kpi-value" style={{ color: "#8B5A2B" }}>₪{totalSpent}M</div>
          <div className="kpi-sub" style={{ color: "#57534E" }}>{Math.round(totalSpent / totalBudget * 100)}% of contract</div>
          <ProgressBar value={Math.round(totalSpent / totalBudget * 100)} color="#8B5A2B" />
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Approved Change Orders</div>
          <div className="kpi-value" style={{ color: "#1C1917" }}>₪{approvedCOs}M</div>
          <div className="kpi-sub" style={{ color: "#57534E" }}>2 COs approved</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pending COs</div>
          <div className="kpi-value" style={{ color: "#B45309" }}>₪{pendingCOs}M</div>
          <div className="kpi-sub" style={{ color: "#B45309" }}>2 COs under review</div>
        </div>
      </div>

      <div className="section-title">1. Budget vs Actual by Section</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "32%" }}>Section</th>
            <th style={{ width: "14%" }}>Budget (₪M)</th>
            <th style={{ width: "14%" }}>Spent (₪M)</th>
            <th style={{ width: "15%" }}>Remaining (₪M)</th>
            <th style={{ width: "10%" }}>% Used</th>
            <th style={{ width: "15%" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {BUDGET_SECTIONS.map(b => {
            const pct = Math.round(b.spent / b.budget * 100);
            const status = pct >= 95 ? "Nearly Exhausted" : pct >= 75 ? "On Track" : "Under Budget";
            return (
              <tr key={b.section}>
                <td>{b.section}</td>
                <td>₪{b.budget.toFixed(1)}M</td>
                <td>₪{b.spent.toFixed(1)}M</td>
                <td>₪{(b.budget - b.spent).toFixed(1)}M</td>
                <td style={{ fontWeight: 700, color: pct >= 95 ? "#B91C1C" : "#1C1917" }}>{pct}%</td>
                <td><span className={`badge ${pct >= 95 ? "badge-red" : pct >= 75 ? "badge-amber" : "badge-green"}`}>{status}</span></td>
              </tr>
            );
          })}
          <tr style={{ fontWeight: 700 }}>
            <td><strong>TOTAL</strong></td>
            <td><strong>₪450M</strong></td>
            <td><strong>₪312.0M</strong></td>
            <td><strong>₪138.0M</strong></td>
            <td><strong>69.3%</strong></td>
            <td><span className="badge badge-green">On Track</span></td>
          </tr>
        </tbody>
      </table>

      <div className="section-title" style={{ marginTop: "18px" }}>2. Change Order Register</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "10%" }}>CO No.</th>
            <th style={{ width: "52%" }}>Description</th>
            <th style={{ width: "14%" }}>Value (₪M)</th>
            <th style={{ width: "13%" }}>Status</th>
            <th style={{ width: "11%" }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {CHANGE_ORDERS.map(c => (
            <tr key={c.id}>
              <td style={{ fontWeight: 700 }}>{c.id}</td>
              <td>{c.desc}</td>
              <td>₪{c.value.toFixed(1)}M</td>
              <td><span className={`badge ${c.status === "Approved" ? "badge-green" : "badge-amber"}`}>{c.status}</span></td>
              <td>{c.date}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} style={{ fontWeight: 700, textAlign: "right" }}>Total Approved:</td>
            <td style={{ fontWeight: 700 }}>₪{approvedCOs.toFixed(1)}M</td>
            <td /><td />
          </tr>
          <tr>
            <td colSpan={2} style={{ fontWeight: 700, textAlign: "right" }}>Total Pending:</td>
            <td style={{ fontWeight: 700, color: "#B45309" }}>₪{pendingCOs.toFixed(1)}M</td>
            <td /><td />
          </tr>
        </tbody>
      </table>

      <div className="section-title" style={{ marginTop: "18px" }}>3. Monthly Cash Flow (YTD)</div>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Planned (₪M)</th>
            <th>Actual (₪M)</th>
            <th>Variance (₪M)</th>
            <th>Cumulative Planned</th>
            <th>Cumulative Actual</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            let cumPlanned = 0, cumActual = 0;
            return CASHFLOW.map(m => {
              cumPlanned += m.planned;
              cumActual  += m.actual;
              const v = m.actual - m.planned;
              return (
                <tr key={m.month}>
                  <td>{m.month}</td>
                  <td>₪{m.planned.toFixed(1)}M</td>
                  <td>₪{m.actual.toFixed(1)}M</td>
                  <td style={{ color: v >= 0 ? "#15803D" : "#B91C1C", fontWeight: 700 }}>
                    {v >= 0 ? "+" : ""}₪{v.toFixed(1)}M
                  </td>
                  <td>₪{cumPlanned.toFixed(1)}M</td>
                  <td>₪{cumActual.toFixed(1)}M</td>
                </tr>
              );
            });
          })()}
        </tbody>
      </table>

      <div className="section-title" style={{ marginTop: "18px" }}>4. Pending Invoices</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "18%" }}>Invoice No.</th>
            <th style={{ width: "30%" }}>Contractor</th>
            <th style={{ width: "14%" }}>Amount (₪M)</th>
            <th style={{ width: "16%" }}>Date Submitted</th>
            <th style={{ width: "12%" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {INVOICES.map(i => (
            <tr key={i.id}>
              <td style={{ fontWeight: 700 }}>{i.id}</td>
              <td>{i.contractor}</td>
              <td>₪{i.amount.toFixed(1)}M</td>
              <td>{i.submitted}</td>
              <td><span className={`badge ${i.status === "Approved" ? "badge-green" : "badge-amber"}`}>{i.status}</span></td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} style={{ fontWeight: 700, textAlign: "right" }}>Total Pending Payment:</td>
            <td style={{ fontWeight: 700, color: "#B45309" }}>₪{totalInvPending.toFixed(1)}M</td>
            <td /><td />
          </tr>
        </tbody>
      </table>

      <ReportFooter title="Financial Report – June 2026" />
    </div>
  );
}

// ─── Safety Report ────────────────────────────────────────────────────────
function SafetyReport() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "10pt", color: "#1C1917", padding: "0 0 24px" }}>
      <ReportHeader
        title="Safety & HSE Report – June 2026"
        subtitle={`Period: June 2026 (Month-to-Date)  ·  Workforce: ${SAFETY.workforce} workers  ·  PM: ${PROJECT.pm}`}
        ref="HW20-HSE-JUN2026"
      />

      <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
        <div className="kpi-card">
          <div className="kpi-label">LTI-Free Days</div>
          <div className="kpi-value" style={{ color: "#15803D" }}>{SAFETY.ltiFreeDays}</div>
          <div className="kpi-sub" style={{ color: "#15803D" }}>Zero LTIs on project</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Manhours YTD</div>
          <div className="kpi-value" style={{ color: "#1C1917" }}>1.82M</div>
          <div className="kpi-sub" style={{ color: "#57534E" }}>1,820,000 hours worked</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Near Misses YTD</div>
          <div className="kpi-value" style={{ color: "#B45309" }}>{SAFETY.nearMissesYTD}</div>
          <div className="kpi-sub" style={{ color: "#57534E" }}>All closed &amp; actioned</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Observations YTD</div>
          <div className="kpi-value" style={{ color: "#1C1917" }}>{SAFETY.observationsYTD}</div>
          <div className="kpi-sub" style={{ color: "#15803D" }}>Target: &gt;200 ✓</div>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
        <div className="kpi-card">
          <div className="kpi-label">LTIs YTD</div>
          <div className="kpi-value" style={{ color: "#15803D" }}>0</div>
          <div className="kpi-sub" style={{ color: "#15803D" }}>Target: 0 ✓</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">First Aid Cases YTD</div>
          <div className="kpi-value" style={{ color: "#1C1917" }}>{SAFETY.firstAidYTD}</div>
          <div className="kpi-sub" style={{ color: "#15803D" }}>All treated on site</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Toolbox Talks YTD</div>
          <div className="kpi-value" style={{ color: "#1C1917" }}>{SAFETY.toolboxTalksYTD}</div>
          <div className="kpi-sub" style={{ color: "#15803D" }}>Target: &gt;80 ✓</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Workforce</div>
          <div className="kpi-value" style={{ color: "#1C1917" }}>{SAFETY.workforce}</div>
          <div className="kpi-sub" style={{ color: "#57534E" }}>Current site headcount</div>
        </div>
      </div>

      <p className="summary">
        Safety performance on Highway 20 remains <strong>exemplary</strong> with {SAFETY.ltiFreeDays} consecutive LTI-free days
        as at {PROJECT.reportDate}. The project has accumulated 1,820,000 manhours without a lost-time injury. All {SAFETY.nearMissesYTD} near
        misses reported YTD have been investigated, root-caused, and remediated. The site safety culture is evidenced by
        {SAFETY.observationsYTD} proactive safety observations submitted by the workforce.
      </p>

      <div className="section-title">1. Safety KPI Dashboard</div>
      <table>
        <thead>
          <tr>
            <th>KPI</th>
            <th>YTD Value</th>
            <th>Monthly Target</th>
            <th>Annual Target</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Lost Time Injuries (LTI)</td><td>0</td><td>0</td><td>0</td><td><span className="badge badge-green">PASS</span></td></tr>
          <tr><td>LTI Frequency Rate (LTIFR)</td><td>0.00</td><td>&lt;0.50</td><td>&lt;0.50</td><td><span className="badge badge-green">PASS</span></td></tr>
          <tr><td>LTI-Free Days</td><td>{SAFETY.ltiFreeDays}</td><td>&gt;100</td><td>&gt;200</td><td><span className="badge badge-green">PASS</span></td></tr>
          <tr><td>Near Miss Reports</td><td>{SAFETY.nearMissesYTD}</td><td>&lt;5/month</td><td>&lt;20</td><td><span className="badge badge-green">PASS</span></td></tr>
          <tr><td>First Aid Cases</td><td>{SAFETY.firstAidYTD}</td><td>&lt;5/month</td><td>&lt;30</td><td><span className="badge badge-green">PASS</span></td></tr>
          <tr><td>Safety Observations Submitted</td><td>{SAFETY.observationsYTD}</td><td>&gt;25/month</td><td>&gt;200</td><td><span className="badge badge-green">PASS</span></td></tr>
          <tr><td>Toolbox Talks Conducted</td><td>{SAFETY.toolboxTalksYTD}</td><td>&gt;6/month</td><td>&gt;80</td><td><span className="badge badge-green">PASS</span></td></tr>
          <tr><td>Total Manhours Worked YTD</td><td>1,820,000</td><td>–</td><td>–</td><td><span className="badge badge-gray">INFO</span></td></tr>
        </tbody>
      </table>

      <div className="section-title" style={{ marginTop: "18px" }}>2. Incident &amp; Near Miss Log (YTD)</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "13%" }}>Date</th>
            <th style={{ width: "12%" }}>Type</th>
            <th style={{ width: "12%" }}>Zone</th>
            <th style={{ width: "48%" }}>Description</th>
            <th style={{ width: "15%" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {INCIDENTS.map((inc, i) => (
            <tr key={i}>
              <td>{inc.date}</td>
              <td><span className={`badge ${inc.type === "Near Miss" ? "badge-amber" : "badge-gray"}`}>{inc.type}</span></td>
              <td>{inc.zone}</td>
              <td>{inc.desc}</td>
              <td><span className="badge badge-green">{inc.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-title" style={{ marginTop: "18px" }}>3. Upcoming Safety Actions</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "15%" }}>Action No.</th>
            <th style={{ width: "45%" }}>Action Required</th>
            <th style={{ width: "15%" }}>Owner</th>
            <th style={{ width: "13%" }}>Due Date</th>
            <th style={{ width: "12%" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>SA-2026-014</td><td>Crane exclusion zone markings upgrade – Zone B</td><td>Site Manager</td><td>04 Jul 2026</td><td><span className="badge badge-amber">Open</span></td></tr>
          <tr><td>SA-2026-015</td><td>Review and update emergency evacuation plan (annual)</td><td>HSE Officer</td><td>07 Jul 2026</td><td><span className="badge badge-amber">Open</span></td></tr>
          <tr><td>SA-2026-016</td><td>Confined space entry re-training – drainage crew Zone C</td><td>Training Dept</td><td>08 Jul 2026</td><td><span className="badge badge-amber">Open</span></td></tr>
          <tr><td>SA-2026-017</td><td>Fall protection netting inspection – Bridge 3 deck works</td><td>HSE Officer</td><td>10 Jul 2026</td><td><span className="badge badge-amber">Open</span></td></tr>
        </tbody>
      </table>

      <ReportFooter title="Safety & HSE Report – June 2026" />
    </div>
  );
}

// ─── Schedule Analysis ────────────────────────────────────────────────────
function ScheduleReport() {
  const critical = WBS.filter(w => w.float <= -45).sort((a, b) => a.float - b.float);
  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "10pt", color: "#1C1917", padding: "0 0 24px" }}>
      <ReportHeader
        title="Schedule Analysis Report – Week 26"
        subtitle={`Period: Q2 2026 · Week 89/156 · Overall Progress: 57% (Planned: 63%)`}
        ref="HW20-SCH-W26-2026"
      />

      <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
        <div className="kpi-card">
          <div className="kpi-label">Overall Progress</div>
          <div className="kpi-value" style={{ color: "#B91C1C" }}>57%</div>
          <div className="kpi-sub" style={{ color: "#B91C1C" }}>vs planned 63%</div>
          <ProgressBar value={57} color="#B91C1C" />
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Time Elapsed</div>
          <div className="kpi-value" style={{ color: "#1C1917" }}>57%</div>
          <div className="kpi-sub" style={{ color: "#57534E" }}>Week 89 of 156</div>
          <ProgressBar value={57} color="#8B5A2B" />
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Activities Delayed</div>
          <div className="kpi-value" style={{ color: "#B45309" }}>{WBS.filter(w => w.float < 0).length}</div>
          <div className="kpi-sub" style={{ color: "#B45309" }}>of {WBS.length} total activities</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Critical Activities</div>
          <div className="kpi-value" style={{ color: "#B91C1C" }}>{critical.length}</div>
          <div className="kpi-sub" style={{ color: "#B91C1C" }}>&gt;45 days negative float</div>
        </div>
      </div>

      <div className="section-title">1. Zone Progress Summary</div>
      <table>
        <thead>
          <tr>
            <th>Zone</th>
            <th>Description</th>
            <th>Planned %</th>
            <th>Actual %</th>
            <th>Variance</th>
            <th>Status</th>
            <th>Visual</th>
          </tr>
        </thead>
        <tbody>
          {ZONE_PROGRESS.map(z => (
            <tr key={z.zone}>
              <td><strong>Zone {z.zone}</strong></td>
              <td>{z.desc}</td>
              <td>{z.planned}%</td>
              <td style={{ fontWeight: 700 }}>{z.actual}%</td>
              <td style={{ color: z.actual >= z.planned ? "#15803D" : "#B91C1C", fontWeight: 700 }}>
                {z.actual >= z.planned ? "+" : ""}{z.actual - z.planned}%
              </td>
              <td>
                <span className={`badge ${z.status === "Critical Delay" ? "badge-red" : z.status.includes("Ahead") ? "badge-green" : z.status === "On Track" ? "badge-green" : "badge-amber"}`}>
                  {z.status}
                </span>
              </td>
              <td><ProgressBar value={z.actual} color={z.color} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-title" style={{ marginTop: "18px" }}>2. WBS Schedule Status</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "8%" }}>WBS</th>
            <th style={{ width: "38%" }}>Activity</th>
            <th style={{ width: "17%" }}>Planned Duration</th>
            <th style={{ width: "19%" }}>Forecast Completion</th>
            <th style={{ width: "10%" }}>Float (Days)</th>
            <th style={{ width: "8%" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {WBS.map(w => (
            <tr key={w.id}>
              <td style={{ fontWeight: 700 }}>{w.id}</td>
              <td>{w.activity}</td>
              <td>{w.planned}</td>
              <td style={{ color: w.float < -30 ? "#B91C1C" : "#1C1917" }}>{w.forecast}</td>
              <td style={{ fontWeight: 700, color: w.float <= -45 ? "#B91C1C" : w.float < 0 ? "#B45309" : "#15803D" }}>
                {w.float}
              </td>
              <td>
                <span className={`badge ${w.status === "Complete" ? "badge-green" : w.status === "Not Started" ? "badge-gray" : "badge-amber"}`}>
                  {w.status === "In Progress" ? "Active" : w.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {critical.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: "18px" }}>3. Critical Path – Activities Requiring Immediate Attention</div>
          <table>
            <thead>
              <tr>
                <th>WBS</th>
                <th>Activity</th>
                <th>Float (Days)</th>
                <th>Risk Level</th>
                <th>Recovery Action</th>
              </tr>
            </thead>
            <tbody>
              {critical.map(w => (
                <tr key={w.id}>
                  <td style={{ fontWeight: 700 }}>{w.id}</td>
                  <td>{w.activity}</td>
                  <td style={{ fontWeight: 700, color: "#B91C1C" }}>{w.float}</td>
                  <td><span className="badge badge-red">CRITICAL</span></td>
                  <td>Accelerate resources; review sub-programme</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <ReportFooter title="Schedule Analysis Report – W26" />
    </div>
  );
}

// ─── Monthly Owner Report ─────────────────────────────────────────────────
function MonthlyOwnerReport() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "10pt", color: "#1C1917", padding: "0 0 24px" }}>
      <ReportHeader
        title="Monthly Owner Report – June 2026"
        subtitle={`Reporting Period: 01–30 June 2026  ·  Submitted to: ${PROJECT.owner}  ·  PM: ${PROJECT.pm}`}
        ref="HW20-MOR-JUN2026"
      />

      <p className="summary">
        This report presents the monthly status of the <strong>Highway 20 – Northern Extension</strong> project
        for the period ending 30 June 2026. The project is at Week 89 of 156 (57% time elapsed), with overall
        physical completion at 57% against a planned 63%. While budget performance is satisfactory at 69.3%
        utilisation, the schedule deficit in Zone D requires escalation and proactive recovery measures.
      </p>

      <div className="section-title">1. Project Key Performance Indicators</div>
      <div className="kpi-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div className="kpi-card">
          <div className="kpi-label">Schedule Performance</div>
          <div className="kpi-value" style={{ color: "#B91C1C" }}>57% / 63%</div>
          <div className="kpi-sub" style={{ color: "#B91C1C" }}>Actual / Planned · −6%</div>
          <ProgressBar value={57} color="#B91C1C" />
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Financial Performance</div>
          <div className="kpi-value" style={{ color: "#8B5A2B" }}>₪312M / ₪450M</div>
          <div className="kpi-sub" style={{ color: "#57534E" }}>69.3% utilised · On track</div>
          <ProgressBar value={69} color="#8B5A2B" />
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Safety</div>
          <div className="kpi-value" style={{ color: "#15803D" }}>142 Days</div>
          <div className="kpi-sub" style={{ color: "#15803D" }}>LTI-free · Zero LTIs YTD</div>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: "14px" }}>2. Zone Progress</div>
      <table>
        <thead>
          <tr>
            <th>Zone</th>
            <th>Planned %</th>
            <th>Actual %</th>
            <th>Variance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {ZONE_PROGRESS.map(z => (
            <tr key={z.zone}>
              <td><strong>Zone {z.zone}</strong> ({z.desc})</td>
              <td>{z.planned}%</td>
              <td style={{ fontWeight: 700 }}>{z.actual}%</td>
              <td style={{ color: z.actual >= z.planned ? "#15803D" : "#B91C1C", fontWeight: 700 }}>
                {z.actual >= z.planned ? "+" : ""}{z.actual - z.planned}%
              </td>
              <td><span className={`badge ${z.status === "Critical Delay" ? "badge-red" : z.status === "On Track" || z.status.includes("Ahead") ? "badge-green" : "badge-amber"}`}>{z.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-title" style={{ marginTop: "14px" }}>3. Budget Summary</div>
      <table>
        <thead>
          <tr>
            <th>Section</th>
            <th>Budget (₪M)</th>
            <th>Spent (₪M)</th>
            <th>% Used</th>
          </tr>
        </thead>
        <tbody>
          {BUDGET_SECTIONS.map(b => {
            const pct = Math.round(b.spent / b.budget * 100);
            return (
              <tr key={b.section}>
                <td>{b.section}</td>
                <td>₪{b.budget}M</td>
                <td>₪{b.spent}M</td>
                <td style={{ fontWeight: 700, color: pct >= 95 ? "#B91C1C" : "#1C1917" }}>{pct}%</td>
              </tr>
            );
          })}
          <tr style={{ fontWeight: 700 }}>
            <td>TOTAL</td><td>₪450M</td><td>₪312.0M</td><td>69.3%</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
        <div>
          <div className="section-title" style={{ marginTop: 0 }}>4. Open RFIs (Summary)</div>
          <table>
            <thead><tr><th>RFI</th><th>Status</th><th>Due</th></tr></thead>
            <tbody>
              {OPEN_RFIS.slice(0, 5).map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>{r.id}</td>
                  <td><span className={`badge ${r.status === "OVERDUE" ? "badge-red" : "badge-amber"}`}>{r.status}</span></td>
                  <td style={{ fontSize: "8.5pt" }}>{r.due}</td>
                </tr>
              ))}
              {OPEN_RFIS.length > 5 && <tr><td colSpan={3} style={{ color: "#A8A29E", fontStyle: "italic" }}>+ {OPEN_RFIS.length - 5} more open RFIs</td></tr>}
            </tbody>
          </table>
        </div>
        <div>
          <div className="section-title" style={{ marginTop: 0 }}>5. Safety Summary</div>
          <table>
            <thead><tr><th>KPI</th><th>Value</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>LTI-Free Days</td><td><strong>{SAFETY.ltiFreeDays}</strong></td><td><span className="badge badge-green">PASS</span></td></tr>
              <tr><td>LTIs YTD</td><td>0</td><td><span className="badge badge-green">PASS</span></td></tr>
              <tr><td>Near Misses</td><td>{SAFETY.nearMissesYTD}</td><td><span className="badge badge-green">PASS</span></td></tr>
              <tr><td>Observations</td><td>{SAFETY.observationsYTD}</td><td><span className="badge badge-green">PASS</span></td></tr>
              <tr><td>Workforce</td><td>{SAFETY.workforce}</td><td><span className="badge badge-gray">INFO</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: "14px" }}>6. Change Orders</div>
      <table>
        <thead>
          <tr>
            <th>CO No.</th>
            <th>Description</th>
            <th>Value (₪M)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {CHANGE_ORDERS.map(c => (
            <tr key={c.id}>
              <td style={{ fontWeight: 700 }}>{c.id}</td>
              <td>{c.desc}</td>
              <td>₪{c.value.toFixed(1)}M</td>
              <td><span className={`badge ${c.status === "Approved" ? "badge-green" : "badge-amber"}`}>{c.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <ReportFooter title="Monthly Owner Report – June 2026" />
    </div>
  );
}

// ─── Payment Certificate ──────────────────────────────────────────────────
function PaymentCertificate() {
  const certNo = 14;
  const grossTotal = 312.0;
  const prevCert   = 285.5;
  const thisCert   = grossTotal - prevCert;
  const retention  = thisCert * 0.05;
  const netPayment = thisCert - retention;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: "10pt", color: "#1C1917", padding: "0 0 24px" }}>
      <ReportHeader
        title={`Payment Certificate No. ${certNo}`}
        subtitle={`Period: June 2026  ·  Contractor: ${PROJECT.contractor}  ·  Contract No: HW20/2024/01`}
        ref={`HW20-PC-${certNo}-JUN2026`}
      />

      {/* Certificate Summary Box */}
      <div style={{ border: "2px solid #8B5A2B", borderRadius: "8px", padding: "16px", marginBottom: "20px", background: "#FAF8F5" }}>
        <div style={{ fontSize: "10pt", fontWeight: 700, color: "#8B5A2B", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Certificate Summary
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "8pt", color: "#A8A29E", fontWeight: 700, textTransform: "uppercase" }}>Gross Value to Date</div>
            <div style={{ fontSize: "14pt", fontWeight: 700, marginTop: "4px" }}>₪{grossTotal.toFixed(2)}M</div>
          </div>
          <div>
            <div style={{ fontSize: "8pt", color: "#A8A29E", fontWeight: 700, textTransform: "uppercase" }}>Previously Certified</div>
            <div style={{ fontSize: "14pt", fontWeight: 700, marginTop: "4px" }}>₪{prevCert.toFixed(2)}M</div>
          </div>
          <div>
            <div style={{ fontSize: "8pt", color: "#A8A29E", fontWeight: 700, textTransform: "uppercase" }}>This Certificate</div>
            <div style={{ fontSize: "14pt", fontWeight: 700, marginTop: "4px" }}>₪{thisCert.toFixed(2)}M</div>
          </div>
          <div>
            <div style={{ fontSize: "8pt", color: "#A8A29E", fontWeight: 700, textTransform: "uppercase" }}>Less Retention (5%)</div>
            <div style={{ fontSize: "14pt", fontWeight: 700, marginTop: "4px", color: "#B91C1C" }}>−₪{retention.toFixed(2)}M</div>
          </div>
          <div style={{ gridColumn: "span 2", background: "#F5EBE0", borderRadius: "6px", padding: "12px" }}>
            <div style={{ fontSize: "8pt", color: "#8B5A2B", fontWeight: 700, textTransform: "uppercase" }}>NET AMOUNT DUE THIS CERTIFICATE</div>
            <div style={{ fontSize: "18pt", fontWeight: 800, color: "#8B5A2B", marginTop: "4px" }}>₪{netPayment.toFixed(2)}M</div>
            <div style={{ fontSize: "8pt", color: "#57534E", marginTop: "2px" }}>Payment due: 30 days from certification</div>
          </div>
        </div>
      </div>

      <div className="section-title">Breakdown of Certified Works by Section</div>
      <table>
        <thead>
          <tr>
            <th style={{ width: "30%" }}>Section</th>
            <th style={{ width: "14%" }}>Contract Value (₪M)</th>
            <th style={{ width: "10%" }}>% Complete</th>
            <th style={{ width: "14%" }}>Gross to Date (₪M)</th>
            <th style={{ width: "16%" }}>Prev. Certified (₪M)</th>
            <th style={{ width: "16%" }}>This Cert. (₪M)</th>
          </tr>
        </thead>
        <tbody>
          {BUDGET_SECTIONS.map(b => {
            const pct    = Math.round(b.spent / b.budget * 100);
            const gross  = b.spent;
            const prev   = parseFloat((b.spent * 0.92).toFixed(2));
            const cert   = parseFloat((gross - prev).toFixed(2));
            return (
              <tr key={b.section}>
                <td>{b.section}</td>
                <td>₪{b.budget.toFixed(1)}M</td>
                <td style={{ fontWeight: 700 }}>{pct}%</td>
                <td>₪{gross.toFixed(2)}M</td>
                <td>₪{prev.toFixed(2)}M</td>
                <td style={{ fontWeight: 700 }}>₪{cert.toFixed(2)}M</td>
              </tr>
            );
          })}
          <tr style={{ fontWeight: 700, background: "#F5EBE0" }}>
            <td><strong>TOTAL</strong></td>
            <td><strong>₪450.0M</strong></td>
            <td><strong>69.3%</strong></td>
            <td><strong>₪{grossTotal.toFixed(2)}M</strong></td>
            <td><strong>₪{prevCert.toFixed(2)}M</strong></td>
            <td><strong>₪{thisCert.toFixed(2)}M</strong></td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #EDE8DF", borderRadius: "6px", background: "#FAF8F5" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "9pt", fontWeight: 700, marginBottom: "8px", color: "#57534E" }}>CERTIFIED BY (Engineer)</div>
            <div style={{ borderBottom: "1px solid #9CA3AF", height: "36px", marginBottom: "4px" }} />
            <div style={{ fontSize: "8pt", color: "#A8A29E" }}>Name / Signature / Date</div>
          </div>
          <div>
            <div style={{ fontSize: "9pt", fontWeight: 700, marginBottom: "8px", color: "#57534E" }}>APPROVED BY (Owner)</div>
            <div style={{ borderBottom: "1px solid #9CA3AF", height: "36px", marginBottom: "4px" }} />
            <div style={{ fontSize: "8pt", color: "#A8A29E" }}>Name / Signature / Date</div>
          </div>
        </div>
      </div>

      <ReportFooter title={`Payment Certificate No. ${certNo}`} />
    </div>
  );
}

const REPORT_TITLES: Record<string, string> = {
  "weekly-progress":   "Weekly Progress Report – W26",
  "monthly-owner":     "Monthly Owner Report – June 2026",
  "safety-report":     "Safety & HSE Report – June 2026",
  "financial-report":  "Financial Report – June 2026",
  "schedule-analysis": "Schedule Analysis – Week 26",
  "payment-cert":      "Payment Certificate No. 14",
};

export default async function PrintPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const title = REPORT_TITLES[type] ?? "Report";

  const content = (() => {
    switch (type) {
      case "weekly-progress":   return <WeeklyProgressReport />;
      case "financial-report":  return <FinancialReport />;
      case "safety-report":     return <SafetyReport />;
      case "schedule-analysis": return <ScheduleReport />;
      case "monthly-owner":     return <MonthlyOwnerReport />;
      case "payment-cert":      return <PaymentCertificate />;
      default:                  return <WeeklyProgressReport />;
    }
  })();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <PrintTrigger />
      <PrintButton label="Print / Save as PDF" title={`${PROJECT.name} · ${title}`} />
      <div style={{ maxWidth: "794px", margin: "0 auto", padding: "28px 24px 40px", background: "#fff" }}>
        {content}
      </div>
    </>
  );
}
