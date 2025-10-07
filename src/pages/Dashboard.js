import React from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import GrantTable from "../components/GrantTable";
import "../styles/Dashboard.css";

const Dashboard = () => (
  <div className="dashboard">
    <h1>Grant Dashboard</h1>
    <p>Manage and track your organization’s grants and funding applications</p>

    <div className="stat-grid">
      <StatCard title="Total Grants" value="124" change="+12% from last month" />
      <StatCard title="Active Applications" value="48" change="+8% from last month" />
      <StatCard title="Total Funding" value="$2,450,000" change="+15% from last month" />
      <StatCard title="Success Rate" value="68%" change="+5% from last month" />
    </div>

    <GrantTable />
  </div>
);

export default Dashboard;