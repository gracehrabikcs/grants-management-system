import React, { useState } from "react";
import "../styles/Grants.css";

const grantData = [
  {
    id: 1,
    title: "Education Innovation Fund",
    organization: "Future Learning Institute",
    status: "Active",
    description: "Supporting innovative educational technologies and methodologies...",
    amount: "$50,000",
    category: "Education",
    location: "📍 San Francisco, CA",
    deadline: "🗓 Deadline: 2024-03-15",
    progress: 75,
  },
  {
    id: 2,
    title: "Community Development Grant",
    organization: "Horizon Outreach Foundation",
    status: "Under Review",
    description: "Funding local community programs and neighborhood revitalization.",
    amount: "$80,000",
    category: "Community",
    location: "📍 Chicago, IL",
    deadline: "🗓 Deadline: 2024-04-01",
    progress: 50,
  },
  {
    id: 3,
    title: "Healthcare Access Initiative",
    organization: "Wellness First Foundation",
    status: "Approved",
    description: "Expanding healthcare access for underserved rural communities.",
    amount: "$120,000",
    category: "Health",
    location: "📍 Atlanta, GA",
    deadline: "🗓 Deadline: 2024-02-20",
    progress: 100,
  },
];

const Grants = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredGrants = grantData.filter((grant) => {
    const matchesSearch = grant.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || grant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="grants-container">
      <header className="grants-header">
        <h1>All Grants</h1>
        <p>Comprehensive view of all grant applications and their current status</p>
      </header>

      {/* Search & Filter Section */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search grants..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="filter-buttons">
          {["All", "Active", "Under Review", "Approved"].map((status) => (
            <button
              key={status}
              className={`filter-btn ${statusFilter === status ? "active-filter" : ""}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grants Grid */}
      <div className="grant-grid">
        {filteredGrants.map((grant) => (
          <div key={grant.id} className="grant-card">
            <h3>{grant.title}</h3>
            <p className="organization">{grant.organization}</p>
            <span className={`status ${grant.status.toLowerCase().replace(" ", "")}`}>
              {grant.status}
            </span>
            <p className="description">{grant.description}</p>
            <div className="grant-info">
              <p><strong>Amount:</strong> {grant.amount}</p>
              <p><strong>Category:</strong> {grant.category}</p>
            </div>
            <p className="location">{grant.location}</p>
            <p className="deadline">{grant.deadline}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${grant.progress}%` }}></div>
            </div>
            <p className="progress-text">{grant.progress}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grants;
