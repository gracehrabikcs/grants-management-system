import React from "react";
import "../../../styles/GrantDetailsPledges.css";

import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const pledgeRows = [
  { id: "PLD-001", donor: "John Smith Foundation", amount: 15000, pledgedDate: "2024-01-15", schedule: "Annual",     received: 15000 },
  { id: "PLD-002", donor: "Tech Innovation Corp",  amount: 25000, pledgedDate: "2024-02-01", schedule: "Quarterly",  received: 12500 },
  { id: "PLD-003", donor: "Education Trust",       amount: 10000, pledgedDate: "2024-03-10", schedule: "Semi-Annual",received: 5000  },
  { id: "PLD-004", donor: "Community Bank",        amount: 8000,  pledgedDate: "2024-01-20", schedule: "One-time",   received: 0     },
];

const monthlySeries = [
  { month: "Jan", pledged: 14000, received: 9000 },
  { month: "Feb", pledged: 16000, received: 13000 },
  { month: "Mar", pledged: 9000,  received: 4500 },
  { month: "Apr", pledged: 7000,  received: 0    },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const sum = (arr, key) => arr.reduce((a, x) => a + (x[key] || 0), 0);
const totalPledged  = sum(pledgeRows, "amount");
const totalReceived = sum(pledgeRows, "received");
const outstanding   = totalPledged - totalReceived;
const fulfillment   = totalPledged ? Math.round((totalReceived / totalPledged) * 100) : 0;

const donutData   = [{ name: "Received", value: totalReceived }, { name: "Outstanding", value: outstanding }];
const donutColors = ["#22c55e", "#ef4444"]; 

const GrantDetailsPledges = () => {
  return (
    <div className="content"> 
      <div className="gms-wrap">
        {/* KPI Row */}
        <div className="gms-grid gms-grid-4">
          <KpiCard title="Total Pledged" subtitle={`From ${pledgeRows.length} pledges`}>
            <div className="gms-kpi">{currency.format(totalPledged)}</div>
          </KpiCard>
          <KpiCard title="Total Received" subtitle={`${Math.round((totalReceived / totalPledged) * 100)}% of total pledged`}>
            <div className="gms-kpi gms-green">{currency.format(totalReceived)}</div>
          </KpiCard>
          <KpiCard title="Outstanding" subtitle={`${100 - Math.round((totalReceived / totalPledged) * 100)}% remaining`}>
            <div className="gms-kpi gms-red">{currency.format(outstanding)}</div>
          </KpiCard>
          <KpiCard title="Fulfillment Rate">
            <div className="gms-kpi">{fulfillment}%</div>
            <div className="gms-bar"><div className="gms-bar-fill" style={{ width: `${fulfillment}%` }} /></div>
          </KpiCard>
        </div>

        
        <div className="gms-grid gms-grid-2">
          <Panel title="Pledge Status Distribution" subtitle="Breakdown of received vs outstanding amounts">
            <div className="gms-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                    {donutData.map((_, i) => <Cell key={i} fill={donutColors[i % donutColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => currency.format(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Monthly Pledge Activity" subtitle="Pledged vs received amounts by month">
            <div className="gms-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => currency.format(v)} />
                  <Bar dataKey="pledged" name="Pledged" />
                  <Bar dataKey="received" name="Received" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

      
        <Panel title="Individual Pledge Records" subtitle="Detailed view of all pledges and payment tracking">
          <div className="gms-table-wrap">
            <table className="gms-table">
              <thead>
                <tr>
                  <th>Pledge ID</th><th>Donor</th><th>Amount</th><th>Pledged Date</th>
                  <th>Schedule</th><th>Received</th><th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {pledgeRows.map((row) => {
                  const rowOutstanding = (row.amount || 0) - (row.received || 0);
                  return (
                    <tr key={row.id}>
                      <td className="gms-strong">{row.id}</td>
                      <td>{row.donor}</td>
                      <td>{currency.format(row.amount)}</td>
                      <td>{row.pledgedDate}</td>
                      <td>{row.schedule}</td>
                      <td className="gms-green">{currency.format(row.received)}</td>
                      <td className={rowOutstanding > 0 ? "gms-red" : ""}>{currency.format(rowOutstanding)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

       
        <Panel title="Supporting Information" subtitle="Additional details and notes about pledges">
          <Info title="Payment Terms">
            All pledges are subject to standard payment terms. Quarterly payments are due on the first day of each quarter.
            Annual payments are due on the anniversary of the pledge date.
          </Info>
          <Info title="Follow-up Schedule">
            Automated reminders are sent 30 days before due dates. Personal follow-up calls are scheduled for overdues &gt; 14 days.
          </Info>
          <Info title="Recognition Program">
            Donors with fulfilled pledges over $10,000 are eligible for our annual recognition event and newsletter feature.
          </Info>
        </Panel>
      </div>
    </div>
  );
};


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
      {subtitle && <div className="gms-subtle" style={{ marginBottom: 8 }}>{subtitle}</div>}
      {children}
    </div>
  );
}
function Info({ title, children }) {
  return (
    <div className="gms-info">
      <div className="gms-info-title">{title}</div>
      <div className="gms-info-text">{children}</div>
    </div>
  );
}

export default GrantDetailsPledges;



