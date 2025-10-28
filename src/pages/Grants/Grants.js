import React, { useState, useEffect } from "react";
import "../../styles/Grants.css";
import { useNavigate } from "react-router-dom";

const Grants = () => {
  const [grants, setGrants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  // Load mock data
  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((response) => response.json())
      .then((data) => setGrants(data))
      .catch((error) => console.error("Error loading grants data:", error));
  }, []);

  const filteredGrants = grants.filter((grant) => {
    const matchesSearch = grant.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || grant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCardClick = (id) => {
    navigate(`/grants/${id}`);
  };

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
          <div
            key={grant.id}
            className="grant-card"
            onClick={() => handleCardClick(grant.id)}
            style={{ cursor: "pointer" }}
          >
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
