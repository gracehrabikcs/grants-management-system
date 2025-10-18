import React from "react";
import StatCard from "../components/StatCard";
import GrantTable from "../components/GrantTable";

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ display: "flex", gap: "20px", marginTop: 12 }}>
        <StatCard title="Total Grants" value="15" />
        <StatCard title="Pending Reviews" value="4" />
        <StatCard title="Approved" value="8" />
      </div>

      <h3 style={{ marginTop: "30px" }}>Grant Overview</h3>
      <GrantTable />
    </div>
  );
}

export default Dashboard;
