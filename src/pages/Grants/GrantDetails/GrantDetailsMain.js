import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/GrantDetails.css";

const GrantDetailsMain = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);

  // Example static data for now
  const grant = {
    id,
    organization: "Future Learning Institute",
    title: "Education Innovation Fund",
    status: "Active",
    amount: "$50,000",
    progress: 75,
    deadline: "2024-03-15",
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSendEmail = () => {
    const email = "example@domain.com"; // placeholder
    const subject = encodeURIComponent("Regarding Grant ID: " + id);
    const body = encodeURIComponent("Hello,\n\nI am reaching out regarding the grant.");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };


  return (
    <div className="grant-details-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate("/grants")}>
        ← Back to Grants
      </button>

      {/* Top Info Bar */}
      <div className="grant-info-bar">
        <div className="grant-left">
          <h2>{grant.organization} - {grant.title}</h2>
          <span className={`status ${grant.status.toLowerCase()}`}>
            {grant.status}
          </span>
        </div>
        <div className="grant-right">
          <p><strong>Amount:</strong> {grant.amount}</p>
          <p><strong>Progress:</strong> {grant.progress}%</p>
          <p><strong>Deadline:</strong> {grant.deadline}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grant-actions">
        {/* Attach File */}
        <label className="action-btn">
          Attach a File
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </label>
        {selectedFile && <span className="file-name">{selectedFile.name}</span>}

        {/* Send Email */}
        <button className="action-btn" onClick={handleSendEmail}>
          Send Email
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="grant-tabs">
        {["Main", "Gifts", "Pledges", "Contacts", "Bio", "Other", "Links", "Addresses", "Accounts", "Tracking"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${tab === "Main" ? "active-tab" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      <div className="grant-main-content">

        {/* Application Management */}
        <div className="section">
          <h3>Application Management</h3>
          <div className="field-group">
            <label>Application Status</label>
            <select>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>
          <div className="field-group">
            <label>Application Type</label>
            <select>
              <option>Standard</option>
              <option>Emergency</option>
            </select>
          </div>
          <div className="field-group">
            <label>Submission Deadline</label>
            <input type="date" value={grant.deadline} readOnly />
          </div>
          <div className="field-group">
            <label>Last Updated</label>
            <input type="text" value="2025-10-19" readOnly />
          </div>
          <div className="field-group">
            <label>Next Action Required</label>
            <input type="text" value="Submit quarterly report" readOnly />
          </div>
        </div>

        {/* Donor Information */}
        <div className="section">
          <h3>Donor Information</h3>
          {["Donor ID", "First Name", "Last Name", "Organization", "Email", "Phone"].map((field) => (
            <div className="field-group" key={field}>
              <label>{field}</label>
              <input type="text" value={`Sample ${field}`} readOnly />
            </div>
          ))}
        </div>

        {/* Grant Details */}
        <div className="section">
          <h3>Grant Details</h3>
          <div className="field-group">
            <label>Grant ID</label>
            <input type="text" value={grant.id} readOnly />
          </div>
          <div className="field-group">
            <label>Grant Name</label>
            <input type="text" value={grant.title} readOnly />
          </div>
          <div className="field-group">
            <label>Status</label>
            <select>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="field-group">
            <label>Priority</label>
            <select>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        {/* Financial Information */}
        <div className="section">
          <h3>Financial Information</h3>
          {["Requested Amount", "Awarded Amount", "Disbursed Amount", "Remaining Balance"].map((field) => (
            <div className="field-group" key={field}>
              <label>{field}</label>
              <input type="text" value="$0.00" readOnly />
            </div>
          ))}
          <div className="field-group">
            <label>Currency</label>
            <select>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
          <div className="field-group">
            <label>Payment Schedule</label>
            <select>
              <option>Quarterly</option>
              <option>Monthly</option>
              <option>Annually</option>
            </select>
          </div>
        </div>

        {/* Timeline */}
        <div className="section">
          <h3>Timeline</h3>
          {["Application Date", "Approval Date", "Start Date", "End Date", "Next Deadline", "Duration (months)"].map((field) => (
            <div className="field-group" key={field}>
              <label>{field}</label>
              <input type="text" value="N/A" readOnly />
            </div>
          ))}
        </div>

        {/* Contact and Assignment */}
        <div className="section">
          <h3>Contact and Assignment</h3>
          {["Program Officer", "Officer Email", "Fiscal Sponsor", "Grant Manager"].map((field) => (
            <div className="field-group" key={field}>
              <label>{field}</label>
              <input type="text" value="N/A" readOnly />
            </div>
          ))}
        </div>

        {/* Grant Purpose and Description */}
        <div className="section">
          <h3>Grant Purpose and Description</h3>
          {["Grant Purpose", "Project Summary", "Project Objectives", "Expected Outcomes"].map((field) => (
            <div className="field-group" key={field}>
              <label>{field}</label>
              <textarea value="N/A" readOnly />
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="section">
          <h3>Additional Information</h3>
          {["Special Conditions", "Additional Notes"].map((field) => (
            <div className="field-group" key={field}>
              <label>{field}</label>
              <textarea value="N/A" readOnly />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GrantDetailsMain;
