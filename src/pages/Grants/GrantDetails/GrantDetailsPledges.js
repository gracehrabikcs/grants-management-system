import React, { useEffect, useState } from "react";
import "../../../styles/GrantDetailsPledges.css";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const GrantDetailsPledges = () => {
  const [grantDetails, setGrantDetails] = useState([]);

  // load JSON from public/data
  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((res) => res.json())
      .then((data) => setGrantDetails(data))
      .catch((err) => console.error("Error loading grant data:", err));
  }, []);

  // later you can get this from the route
  const currentGrantId = 1;
  const grant = grantDetails.find((g) => g.id === currentGrantId);

  // pledges for this grant
  const pledgeRows = grant?.pledges || [];

  // build monthly series from the pledge dates
  const monthNames = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const monthBuckets = {};

  pledgeRows.forEach((p) => {
    if (!p.pledgedDate) return;
    const d = new Date(p.pledgedDate);
    if (isNaN(d)) return;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthBuckets[key]) {
      monthBuckets[key] = {
        pledged: 0,
        received: 0,
        monthLabel: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      };
    }
    monthBuckets[key].pledged += p.amount || 0;
    monthBuckets[key].received += p.received || 0;
  });

  const monthlySeries = Object.entries(monthBuckets)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([, v]) => ({
      month: v.monthLabel,
      pledged: v.pledged,
      received: v.received,
    }));

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const sum = (arr, key) => arr.reduce((a, x) => a + (x[key] || 0), 0);

  const totalPledged = sum(pledgeRows, "amount");
  const totalReceived = sum(pledgeRows, "received");
  const outstanding = totalPledged - totalReceived;
  const fulfillment = totalPledged
    ? Math.round((totalReceived / totalPledged) * 100)
    : 0;

  const donutData = [
    { name: "Received", value: totalReceived },
    { name: "Outstanding", value: outstanding },
  ];
  const donutColors = ["#22c55e", "#ef4444"];

  return (
    <div className="content">
      <div className="gms-wrap">
        {/* KPI Row */}
        <div className="gms-grid gms-grid-4">
          <KpiCard
            title="Total Pledged"
            subtitle={`From ${pledgeRows.length} pledges`}
          >
            <div className="gms-kpi">{currency.format(totalPledged || 0)}</div>
          </KpiCard>

          <KpiCard
            title="Total Received"
            subtitle={
              totalPledged
                ? `${Math.round(
                    (totalReceived / totalPledged) * 100
                  )}% of total pledged`
                : "—"
            }
          >
            <div className="gms-kpi gms-green">
              {currency.format(totalReceived || 0)}
            </div>
          </KpiCard>

          <KpiCard
            title="Outstanding"
            subtitle={
              totalPledged
                ? `${
                    100 - Math.round((totalReceived / totalPledged) * 100)
                  }% remaining`
                : "—"
            }
          >
            <div className="gms-kpi gms-red">
              {currency.format(outstanding || 0)}
            </div>
          </KpiCard>

          <KpiCard title="Fulfillment Rate">
            <div className="gms-kpi">{fulfillment}%</div>
            <div className="gms-bar">
              <div
                className="gms-bar-fill"
                style={{ width: `${fulfillment}%` }}
              />
            </div>
          </KpiCard>
        </div>

        {/* Charts */}
        <div className="gms-grid gms-grid-2">
          <Panel
            title="Pledge Status Distribution"
            subtitle="Breakdown of received vs outstanding amounts"
          >
            <div className="gms-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                  >
                    {donutData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={donutColors[i % donutColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => currency.format(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            title="Monthly Pledge Activity"
            subtitle="Pledged vs received amounts by month"
          >
            <div className="gms-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => currency.format(v)} />
                  <Bar dataKey="pledged" name="Pledged" fill="#3b82f6" />
                  <Bar dataKey="received" name="Received" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* Table */}
        <Panel
          title="Individual Pledge Records"
          subtitle="Detailed view of all pledges and payment tracking"
        >
          <div className="gms-table-wrap">
            <table className="gms-table">
              <thead>
                <tr>
                  <th>Pledge ID</th>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Pledged Date</th>
                  <th>Schedule</th>
                  <th>Received</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {pledgeRows.map((row) => {
                  const rowOutstanding =
                    (row.amount || 0) - (row.received || 0);
                  return (
                    <tr key={row.id}>
                      <td className="gms-strong">{row.id}</td>
                      <td>{row.donor}</td>
                      <td>{currency.format(row.amount || 0)}</td>
                      <td>{row.pledgedDate}</td>
                      <td>{row.schedule}</td>
                      <td className="gms-green">
                        {currency.format(row.received || 0)}
                      </td>
                      <td className={rowOutstanding > 0 ? "gms-red" : ""}>
                        {currency.format(rowOutstanding)}
                      </td>
                    </tr>
                  );
                })}
                {pledgeRows.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No pledges for this grant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// helper components
function KpiCard({ title, subtitle, children }) {
  return (
    <div className="gms-card">
      <div className="gms-subtle">{title}</div>
      <div className="gms-stack">{children}</div>
      {subtitle && <div className="gms-micro">{subtitle}</div>}
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="gms-card">
      <div className="gms-head">{title}</div>
      {subtitle && (
        <div className="gms-subtle" style={{ marginBottom: 8 }}>
          {subtitle}
        </div>
      )}
      {children}
    </div>
  );
}

export default GrantDetailsPledges;






