import React, { useEffect, useMemo, useState } from "react";
import "../../styles/ReportsPage.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import * as XLSX from "xlsx";

const REPORTS_KEY = "gms_reports_list";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// ---- helper: convert Firestore Timestamp or string to Date ----
function asDate(value) {
  if (!value) return null;
  // Firestore Timestamp has a toDate() method
  if (value.toDate && typeof value.toDate === "function") {
    return value.toDate();
  }
  return new Date(value);
}

// ---- helper: apply filters to a grant list ----
// ---- helper: apply filters to a grant list ----
function applyFilters(allGrants, filters) {
  const {
    dateFrom,
    dateTo,
    status,
    amountBand,
    dateField = "application", // "application" | "report"
  } = filters;

  const fromDate = dateFrom ? new Date(dateFrom) : null;
  const toDate = dateTo ? new Date(dateTo) : null;

  if (toDate) {
    // include whole "to" day
    toDate.setHours(23, 59, 59, 999);
  }

  const statusFilter = (status || "").trim().toLowerCase();

  return allGrants.filter((g) => {
    // which date field should drive the filter?
    let rawDate;
    if (dateField === "report") {
      // primary: report deadline
      rawDate = g.reportDeadline ?? g.deadline ?? g.applicationDate;
    } else {
      // primary: application date
      rawDate = g.applicationDate ?? g.reportDeadline ?? g.deadline;
    }
    const grantDate = asDate(rawDate);

    // date filter
    if (fromDate && grantDate && grantDate < fromDate) return false;
    if (toDate && grantDate && grantDate > toDate) return false;

    // status filter
    if (statusFilter && statusFilter !== "all") {
      const gStatusNorm = (g.status || "").trim().toLowerCase();
      if (gStatusNorm !== statusFilter) return false;
    }

    // amount band filter – based on totalPledges
    const amt = Number(g.totalPledges ?? g.amount ?? 0) || 0;
    switch (amountBand) {
      case "Under $25k":
        if (!(amt < 25000)) return false;
        break;
      case "$25k–$100k":
        if (!(amt >= 25000 && amt <= 100000)) return false;
        break;
      case "$100k–$250k":
        if (!(amt > 100000 && amt <= 250000)) return false;
        break;
      case "$250k+":
        if (!(amt > 250000)) return false;
        break;
      default:
      // All – no amount filter
    }

    return true;
  });
}



// ---- CSV helper ----
function escapeCsv(val) {
  const v = String(val ?? "");
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function computeProgressFromSections(sectionsArray) {
  if (!sectionsArray || sectionsArray.length === 0) return 0;

  let totalTasks = 0;
  let completedValue = 0;
  const statusWeight = { "To Do": 0, "In Progress": 0.5, Done: 1 };

  sectionsArray.forEach((section) => {
    (section.tasks || []).forEach((task) => {
      totalTasks += 1;
      const s = task["Task Status"] || task.TaskStatus || task.status || "";
      completedValue += statusWeight[s] || 0;
    });
  });

  if (totalTasks === 0) return 0;
  return Math.round((completedValue / totalTasks) * 100);
}

export default function ReportsPage() {
  // ------- Grants from Firestore -------
  const [grants, setGrants] = useState([]);
  const [grantsLoading, setGrantsLoading] = useState(true);
  const [grantsError, setGrantsError] = useState("");
  const [dateField, setDateField] = useState("application"); // "application" | "report"

  useEffect(() => {
    async function loadGrants() {
      setGrantsLoading(true);
      setGrantsError("");

      try {
        const snap = await getDocs(collection(db, "grants"));
        const rows = [];

// loop each grant doc
for (const d of snap.docs) {
  const data = d.data();

  // 🔹 Application Date (same as before)
  const applicationDate =
    data.Main?.["Application Management"]?.["Application Date"] ||
    data.applicationDate ||
    null;

  // 🔹 Report Deadline – this is what we were missing
  const reportDeadline =
    data.Main?.["Application Management"]?.["reportDeadline"] ||
    data.reportDeadline ||
    data.deadline ||
    data.Deadline ||
    null;

  // ---- sum pledges for this grant ----
  let totalPledges = 0;
  try {
    const pledgesSnap = await getDocs(
      collection(db, "grants", d.id, "pledges")
    );
    pledgesSnap.forEach((p) => {
      const amt = p.data()?.amount;
      if (typeof amt === "number") totalPledges += amt;
      else if (!isNaN(Number(amt))) totalPledges += Number(amt);
    });
  } catch (e) {
    console.error("Error loading pledges for grant", d.id, e);
  }

  // normalize amount + status
  const amount =
    typeof data.amount === "number"
      ? data.amount
      : Number(data.amount) || 0;

  const status =
    data.status ||
    data.Status ||
    data.Main?.["Application Management"]?.["Application Status"] ||
    "Unknown";

  // -------- load tracking sections + tasks to compute progress --------
  const sections = [];
  try {
    const sectionsSnap = await getDocs(
      collection(db, "grants", d.id, "trackingSections")
    );

    for (const sDoc of sectionsSnap.docs) {
      const sData = { id: sDoc.id, ...sDoc.data() };
      const tasks = [];

      try {
        const tasksSnap = await getDocs(
          collection(
            db,
            "grants",
            d.id,
            "trackingSections",
            sDoc.id,
            "trackingTasks"
          )
        );
        tasksSnap.forEach((t) =>
          tasks.push({ id: t.id, ...t.data() })
        );
      } catch (e) {
        // ignore task loading errors for now
      }

      sections.push({ ...sData, tasks });
    }
  } catch (e) {
    // ignore section loading errors for now
  }

  const progress = computeProgressFromSections(sections);

  rows.push({
    id: d.id,
    ...data,
    amount,
    totalPledges,
    status,
    applicationDate,          // ✅ now stored
    reportDeadline,           // ✅ now stored
    deadline: reportDeadline, // keep "deadline" alias for CSV, etc.
    progress,
  });
}


        setGrants(rows);
      } catch (err) {
        console.error("Error loading grants for reports:", err);
        setGrantsError("Could not load grants.");
      } finally {
        setGrantsLoading(false);
      }
    }

    loadGrants();
  }, []);



  // ------- Filters -------
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("All");
  const [amountBand, setAmountBand] = useState("All");
  const [reportName, setReportName] = useState("");

  // ------- Saved Reports (localStorage) -------
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem(REPORTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    // initial seed
    return [
      {
        id: "r3",
        title: "Q4 2024 Grant Summary",
        date: "Dec 15, 2024",
        filters: {},
      },
      {
        id: "r2",
        title: "Annual Performance Report",
        date: "Dec 10, 2024",
        filters: {},
      },
      {
        id: "r1",
        title: "Grant Success Analysis",
        date: "Nov 28, 2024",
        filters: {},
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }, [reports]);

  // ------- Filtered grants (drive KPIs) -------
  const filteredGrants = useMemo(
    () =>
      applyFilters(grants, {
        dateFrom,
        dateTo,
        status,
        amountBand,
        dateField,
      }),
    [grants, dateFrom, dateTo, status, amountBand, dateField]
  );

const totalGrants = filteredGrants.length;
const totalFunding = filteredGrants.reduce(
  (sum, g) => sum + (Number(g.totalPledges ?? g.amount) || 0),
  0
);

// sum of all progress percentages (0–100) across filtered grants
const totalProgress = filteredGrants.reduce(
  (sum, g) => sum + (Number(g.progress) || 0),
  0
);

// average progress across all filtered grants
const successRate = totalGrants
  ? Math.round(totalProgress / totalGrants)
  : 0;


  const kpis = {
    totalGrants,
    totalFunding,
    successRate,
    deltaGrants: 0,
    deltaFunding: 0,
    deltaSuccess: 0,
  };

  const fundingText = useMemo(
    () => currency.format(kpis.totalFunding || 0),
    [kpis.totalFunding]
  );

  // ------- Generate a "saved report" definition -------
  function handleGenerate() {
    const ts = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const title =
      reportName.trim() ||
      `Custom Report (${dateFrom || "Any"} - ${dateTo || "Any"}, ${status}, ${amountBand})`;

    const newReport = {
      id: "r" + (reports.length + 1),
      name: reportName.trim(),
      title,
      date: ts,
      filters: {
        dateFrom: dateFrom || "",
        dateTo: dateTo || "",
        status,
        amountBand,
        dateField,
      },
    };

    setReports((prev) => [newReport, ...prev]);
    setReportName("");
  }

  // ------- Download CSV (opens in Excel) -------
function handleDownload(rep) {
  const filtersFromReport = {
    dateFrom: rep.filters?.dateFrom || "",
    dateTo: rep.filters?.dateTo || "",
    status: rep.filters?.status || "All",
    amountBand: rep.filters?.amountBand || "All",
    dateField: rep.filters?.dateField || "application",
  };

  const grantsForReport = applyFilters(grants, filtersFromReport);

  // ---- Summary stats ----
  const totalGrants = grantsForReport.length;
  const totalPledgedNumber = grantsForReport.reduce(
    (sum, g) => sum + (Number(g.totalPledges) || 0),
    0
  );
  const avgProgress =
    totalGrants === 0
      ? 0
      : Math.round(
          grantsForReport.reduce((sum, g) => sum + (g.progress || 0), 0) /
            totalGrants
        );

  const money = (n) => currency.format(Number(n) || 0);
  const dateFmt = (d) =>
    d ? asDate(d).toISOString().split("T")[0] : ""; // yyyy-mm-dd
  const percent = (n) => `${Number(n || 0)}%`;

  // ===============================
  // Sheet 1: Summary
  // ===============================
  const summaryAoA = [
    ["Report Name", rep.name || rep.title],
    ["Title", rep.title],
    ["Generated on", rep.date],
    [
      "Filter Type",
      filtersFromReport.dateField === "report"
        ? "Report Deadline"
        : "Application Date",
    ],
    ["Date From", filtersFromReport.dateFrom || "Any"],
    ["Date To", filtersFromReport.dateTo || "Any"],
    ["Status", filtersFromReport.status || "All"],
    ["Amount Band", filtersFromReport.amountBand || "All"],
    [],
    ["Summary"],
    ["Total Grants", totalGrants],
    ["Total Pledged", money(totalPledgedNumber)],
    ["Average Progress", percent(avgProgress)],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryAoA);
  summarySheet["!cols"] = [{ wch: 25 }, { wch: 35 }];

  // ===============================
  // Sheet 2: Grants
  // ===============================
  const grantsSheetAoA = [
    [
      "Grant Name",
      "Organization",
      "Status",
      "Total Pledged",
      "Application Date",
      "Report Deadline",
      "Progress %",
      "Fiscal Year",
      "Grant ID",
    ],
    ...grantsForReport.map((g) => [
      g.title || g.name || "",
      g.Organization || "",
      g.status || "",
      money(g.totalPledges),
      dateFmt(g.applicationDate),
      dateFmt(g.reportDeadline),
      percent(g.progress),
      g.fiscalYear || "",
      g.id || "",
    ]),
  ];

  const grantsSheet = XLSX.utils.aoa_to_sheet(grantsSheetAoA);
  grantsSheet["!cols"] = [
    { wch: 30 }, // Grant Name
    { wch: 28 }, // Organization
    { wch: 12 }, // Status
    { wch: 18 }, // Total Pledged
    { wch: 15 }, // Application Date
    { wch: 15 }, // Report Deadline
    { wch: 12 }, // Progress %
    { wch: 12 }, // Fiscal Year
    { wch: 10 }, // Grant ID
  ];

  // ===============================
  // Build workbook
  // ===============================
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(wb, grantsSheet, "Grants");

  const safeTitle = (rep.name || rep.title || "report")
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  XLSX.writeFile(wb, safeTitle + ".xlsx");
}



  // ------- Delete saved report -------


  function handleDeleteReport(id) {
    const rep = reports.find((r) => r.id === id);
    if (!rep) return;
    if (!window.confirm(`Delete report "${rep.title}"?`)) return;
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="content">
      <div className="gms-reports-wrap">
        <h1 className="gms-title">Reports &amp; Analytics</h1>
        <div className="gms-subtle gms-mb16">
          Generate reports and analyze grant performance
        </div>

        {grantsError && (
          <div className="gms-subtle gms-red gms-mb8">
            {grantsError}
          </div>
        )}

        <div className="gms-grid-3">
          <Card>
              <CardHead>Total Grants</CardHead>
              <CardValue>{grantsLoading ? "…" : kpis.totalGrants}</CardValue>
          </Card>

          <Card>
  <CardHead>Total Funding</CardHead>
  <CardValue>
    {grantsLoading ? "…" : fundingText}
  </CardValue>
</Card>

<Card>
  <CardHead>Success Rate</CardHead>
  <CardValue>
    {grantsLoading ? "…" : `${kpis.successRate}%`}
  </CardValue>
</Card>

        </div>

        <div className="gms-card gms-mt16">
          <div className="gms-flex-between gms-mb12">
            <div>
              <div className="gms-head">Generate Custom Report</div>
              <div className="gms-subtle">
                Create detailed reports based on your specific requirements
              </div>
            </div>
            <button
              className="gms-btn primary"
              onClick={handleGenerate}
              disabled={grantsLoading}
            >
              ↓ Generate Report
            </button>
          </div>

          <div className="gms-filter gms-mb12">
            <div className="gms-filter-label">Report Name</div>
            <input
              type="text"
              className="gms-input"
              placeholder="Enter report name..."
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>

<div className="gms-filter-row">

  {/* DATE RANGE COLUMN */}
  <div className="gms-filter">
    <div className="gms-filter-label-row">
      <div className="gms-filter-label">Date Range</div>

      <div className="gms-date-mode">
        <label style={{ marginRight: "1rem", fontSize: "0.85rem" }}>
          <input
            type="radio"
            name="dateField"
            value="application"
            checked={dateField === "application"}
            onChange={() => setDateField("application")}
            style={{ marginRight: "0.25rem" }}
          />
          Application Date
        </label>
        <label style={{ fontSize: "0.85rem" }}>
          <input
            type="radio"
            name="dateField"
            value="report"
            checked={dateField === "report"}
            onChange={() => setDateField("report")}
            style={{ marginRight: "0.25rem" }}
          />
          Report Deadline
        </label>
      </div>
    </div>

    <div className="gms-date-row">
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        className="gms-input"
      />
      <span className="gms-date-sep">–</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        className="gms-input"
      />
    </div>
  </div>

  {/* STATUS COLUMN */}
  <div className="gms-filter">
    <div className="gms-filter-label">Filter by Status</div>
    <select
      className="gms-input"
      value={status}
      onChange={(e) => setStatus(e.target.value)}
    >
      <option>All</option>
      <option>Active</option>
      <option>Under Review</option>
      <option>Approved</option>
    </select>
  </div>

  {/* AMOUNT COLUMN */}
  <div className="gms-filter">
    <div className="gms-filter-label">Filter by Amount</div>
    <select
      className="gms-input"
      value={amountBand}
      onChange={(e) => setAmountBand(e.target.value)}
    >
      <option>All</option>
      <option>Under $25k</option>
      <option>$25k–$100k</option>
      <option>$100k–$250k</option>
      <option>$250k+</option>
    </select>
  </div>

</div>

        </div>

        <div className="gms-card gms-mt16">
          <div className="gms-head gms-mb8">Recent Reports</div>
          <div className="gms-subtle gms-mb12">
            Your recently generated reports
          </div>

          <ul className="gms-report-list">
            {reports.map((rep) => (
              <li key={rep.id} className="gms-report-row">
                <div>
                  <div className="gms-report-title">{rep.title}</div>
                  <div className="gms-subtle">
                    Generated on {rep.date}
                  </div>
                </div>
                <div className="gms-spacer" />
                <button
                  className="gms-btn ghost"
                  onClick={() => handleDownload(rep)}
                  title="Download"
                >
                  ⬇
                </button>
                <button
                  className="gms-btn ghost"
                  onClick={() => handleDeleteReport(rep.id)}
                  title="Delete report"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Card({ children }) {
  return <div className="gms-card gms-kpi">{children}</div>;
}
function CardHead({ children }) {
  return <div className="gms-subtle">{children}</div>;
}
function CardValue({ children }) {
  return <div className="gms-kpi-value">{children}</div>;
}
function CardDelta({ children }) {
  return <div className="gms-delta">{children}</div>;
}







