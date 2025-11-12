import React, { useMemo, useState } from "react";
import "../../styles/ReportsPage.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ReportsPage() {
  // KPI mock data (swap with API later)
  const kpis = {
    totalGrants: 24,
    totalFunding: 1200000, // 1.2M
    successRate: 68, // %
    deltaGrants: +2,
    deltaFunding: +0.15, // +15%
    deltaSuccess: +0.05,  // +5%
  };

  // Filters (mock)
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("All");
  const [amountBand, setAmountBand] = useState("All");

  // Recent reports (mock)
  const [reports, setReports] = useState([
    { id: "r3", title: "Q4 2024 Grant Summary", date: "Dec 15, 2024" },
    { id: "r2", title: "Annual Performance Report", date: "Dec 10, 2024" },
    { id: "r1", title: "Grant Success Analysis", date: "Nov 28, 2024" },
  ]);

  
  const fundingText = useMemo(() => currency.format(kpis.totalFunding), [kpis.totalFunding]);

  function handleGenerate() {
    //POST filters to the server then add the returned report
    const ts = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const newReport = {
      id: "r" + (reports.length + 1),
      title: `Custom Report (${dateFrom || "Any"} - ${dateTo || "Any"}, ${status}, ${amountBand})`,
      date: ts,
    };
    setReports([newReport, ...reports]);
    alert("Report generation started (mock). Replace with API call.");
  }

  function handleDownload(rep) {
    // Replace with real file URL
    alert(`Downloading: ${rep.title} (mock)`);
  }

  return (
    <div className="content">
      <div className="gms-reports-wrap">
        <h1 className="gms-title">Reports &amp; Analytics</h1>
        <div className="gms-subtle gms-mb16">Generate reports and analyze grant performance</div>

        
        <div className="gms-grid-3">
          <Card>
            <CardHead>Total Grants</CardHead>
            <CardValue>{kpis.totalGrants}</CardValue>
            <CardDelta>+{kpis.deltaGrants} from last month</CardDelta>
          </Card>

          <Card>
            <CardHead>Total Funding</CardHead>
            <CardValue>{fundingText}</CardValue>
            <CardDelta>+{Math.round(kpis.deltaFunding * 100)}% from last month</CardDelta>
          </Card>

          <Card>
            <CardHead>Success Rate</CardHead>
            <CardValue>{kpis.successRate}%</CardValue>
            <CardDelta>+{Math.round(kpis.deltaSuccess * 100)}% from last month</CardDelta>
          </Card>
        </div>

        
        <div className="gms-card gms-mt16">
          <div className="gms-flex-between gms-mb12">
            <div>
              <div className="gms-head">Generate Custom Report</div>
              <div className="gms-subtle">Create detailed reports based on your specific requirements</div>
            </div>
            <button className="gms-btn primary" onClick={handleGenerate}>⬇ Generate Report</button>
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
                <div className="gms-report-title">{rep.title}</div>
                <div className="gms-subtle">Generated on {rep.date}</div>
                <div className="gms-spacer" />
                <button
                  className="gms-btn ghost"
                  onClick={() => handleDownload(rep)}
                  title="Download"
                >
                  ⬇
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
  return <div className="gms-delta">{children} </div>;
}

