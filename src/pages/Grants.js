import React from "react";
import "../styles/Grants.css";

const Grants = () => {
  return (
    <div className="grants-container">
      <header className="grants-header">
        <h1>All Grants</h1>
        <p>Comprehensive view of all grant applications and their current status</p>
      </header>

      <div className="grant-grid">
        {/* Grant Card 1 */}
        <div className="grant-card">
          <h3>Education Innovation Fund</h3>
          <p className="organization">Future Learning Institute</p>
          <span className="status active">Active</span>
          <p className="description">
            Supporting innovative educational technologies and methodologies...
          </p>
          <div className="grant-info">
            <p><strong>Amount:</strong> $50,000</p>
            <p><strong>Category:</strong> Education</p>
          </div>
          <p className="location">📍 San Francisco, CA</p>
          <p className="deadline">🗓 Deadline: 2024-03-15</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "75%" }}></div>
          </div>
          <p className="progress-text">75%</p>
        </div>

        {/* Grant Card 2 */}
        <div className="grant-card">
          <h3>Community Development Grant</h3>
          <p className="organization">Horizon Outreach Foundation</p>
          <span className="status review">Under Review</span>
          <p className="description">
            Funding local community programs and neighborhood revitalization.
          </p>
          <div className="grant-info">
            <p><strong>Amount:</strong> $80,000</p>
            <p><strong>Category:</strong> Community</p>
          </div>
          <p className="location">📍 Chicago, IL</p>
          <p className="deadline">🗓 Deadline: 2024-04-01</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "50%" }}></div>
          </div>
          <p className="progress-text">50%</p>
        </div>

        {/* Grant Card 3 */}
        <div className="grant-card">
          <h3>Healthcare Access Initiative</h3>
          <p className="organization">Wellness First Foundation</p>
          <span className="status approved">Approved</span>
          <p className="description">
            Expanding healthcare access for underserved rural communities.
          </p>
          <div className="grant-info">
            <p><strong>Amount:</strong> $120,000</p>
            <p><strong>Category:</strong> Health</p>
          </div>
          <p className="location">📍 Atlanta, GA</p>
          <p className="deadline">🗓 Deadline: 2024-02-20</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "100%" }}></div>
          </div>
          <p className="progress-text">100%</p>
        </div>
      </div>
    </div>
  );
};

export default Grants;
