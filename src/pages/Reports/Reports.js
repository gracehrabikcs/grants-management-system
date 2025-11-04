import React, { useEffect, useMemo, useState } from "react";
import "../../styles/ReportsPage.css";

const REPORTS_KEY = "gms_reports_list";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ReportsPage() {
  const kpis = {
    totalGrants: 24,
    totalFunding: 1200000,
    successRate: 68,
    deltaGrants: +2,
    deltaFunding: +0.15,
    deltaSuccess: +0.05,
  };

  // filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("All");
  const [amountBand, setAmountBand] = useState("All");
  const [reportName, setReportName] = useState("");

  // 👇 THIS is the key part: load from localStorage right inside useState
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem(REPORTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    // first time: seed
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

  // persist on change
  useEffect(() => {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }, [reports]);

  const fundingText = useMemo(
    () => currency.format(kpis.totalFunding),
    [kpis.totalFunding]
  );

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
        dateFrom: dateFrom || "Any",
        dateTo: dateTo || "Any",
        status,
        amountBand,
      },
    };

    setReports((prev) => [newReport, ...prev]);
    setReportName("");
  }

  function handleDownload(rep) {
    const rows = [
      ["Report Name", rep.name || rep.title],
      ["Title", rep.title],
      ["Generated on", rep.date],
      ["Date From", rep.filters?.dateFrom || ""],
      ["Date To", rep.filters?.dateTo || ""],
      ["Status", rep.filters?.status || ""],
      ["Amount Band", rep.filters?.amountBand || ""],
    ];
    const csv = rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTitle = (rep.name || rep.title)
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    a.download = safeTitle + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }

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

        <div className="gms-grid-3">
          <Card>
            <CardHead>Total Grants</CardHead>
            <CardValue>{kpis.totalGrants}</CardValue>
            <CardDelta>+{kpis.deltaGrants} from last month</CardDelta>
          </Card>
          <Card>
            <CardHead>Total Funding</CardHead>
            <CardValue>{fundingText}</CardValue>
            <CardDelta>
              +{Math.round(kpis.deltaFunding * 100)}% from last month
            </CardDelta>
          </Card>
          <Card>
            <CardHead>Success Rate</CardHead>
            <CardValue>{kpis.successRate}%</CardValue>
            <CardDelta>
              +{Math.round(kpis.deltaSuccess * 100)}% from last month
            </CardDelta>
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
            <button className="gms-btn primary" onClick={handleGenerate}>
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
            <div className="gms-filter">
              <div className="gms-filter-label">Date Range</div>
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
                <option>Pending</option>
                <option>Rejected</option>
              </select>
            </div>

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
          <div className="gms-subtle gms-mb12">Your recently generated reports</div>

          <ul className="gms-report-list">
            {reports.map((rep) => (
              <li key={rep.id} className="gms-report-row">
                <div>
                  <div className="gms-report-title">{rep.title}</div>
                  <div className="gms-subtle">Generated on {rep.date}</div>
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

function escapeCsv(val) {
  const v = String(val ?? "");
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}





