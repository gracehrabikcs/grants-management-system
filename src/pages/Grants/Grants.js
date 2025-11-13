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

  // Helper to calculate progress based on tasks
  const calculateProgress = (tracking) => {
    if (!tracking) return 0;
    const allTasks = Object.values(tracking).flat();
    if (allTasks.length === 0) return 0;
    const doneTasks = allTasks.filter((task) => task.status === "Done").length;
    return Math.round((doneTasks / allTasks.length) * 100);
  };

  const filteredGrants = grants.filter((grant) => {
    const matchesSearch =
      grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.organization.toLowerCase().includes(searchTerm.toLowerCase());
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
        {filteredGrants.map((grant) => {
          const progress = calculateProgress(grant.tracking);

          return (
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
              </div>
              <p className="location">{grant.location}</p>
              <p className="deadline"><strong>Deadline:</strong> {grant.deadline}</p>

              {/* Progress Bar */}
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="progress-text">{progress}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Grants;
