import React, { useState, useEffect } from "react";
import { useNavigate, useParams, NavLink, Routes, Route } from "react-router-dom";
import "../../../styles/GrantDetails.css";
import GrantDetailsTracking from "./GrantDetailsTracking";
import GrantDetailsGifts from "./GrantDetailsGifts";
import GrantDetailsBio from "./GrantDetailsBio";
import GrantDetailsContacts from "./GrantDetailsContacts";
import GrantDetailsPledges from "./GrantDetailsPledges";
import GrantDetailsLinks from "./GrantDetailsLinks";
import GrantDetailsAddresses from "./GrantDetailsAddresses";
import GrantDetailsOther from "./GrantDetailsOther";

const GrantDetailsMain = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [grant, setGrant] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((response) => response.json())
      .then((data) => {
        const foundGrant = data.find((g) => g.id === parseInt(id));
        setGrant(foundGrant || null);
      })
      .catch((error) => console.error("Error loading grant details:", error));
  }, [id]);

  const handleFileChange = (event) => setSelectedFile(event.target.files[0]);

  const handleSendEmail = () => {
    const email = "example@domain.com";
    const subject = encodeURIComponent(`Regarding Grant ID: ${id}`);
    const body = encodeURIComponent("Hello,\n\nI am reaching out regarding the grant.");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  // Helper to calculate progress from tasks
  const calculateProgress = (tasksObj) => {
    const allTasks = Object.values(tasksObj).flat();
    if (allTasks.length === 0) return 0;
    const doneTasks = allTasks.filter((t) => t.status === "Done").length;
    return Math.round((doneTasks / allTasks.length) * 100);
  };

  if (!grant) return <p>Loading grant details...</p>;

  const MainTabContent = () => (
    <div className="grant-main-content">
      {/* Application Management */}
      <div className="section">
        <h3>Application Management</h3>
        <div className="field-group">
          <label>Application Status</label>
          <select value={grant.applicationStatus}>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
        <div className="field-group">
          <label>Application Type</label>
          <select value={grant.applicationType}>
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
          <input type="text" value={grant.lastUpdated} readOnly />
        </div>
        <div className="field-group">
          <label>Next Action Required</label>
          <input type="text" value={grant.nextAction} readOnly />
        </div>
      </div>

      {/* Donor Information */}
      <div className="section">
        <h3>Donor Information</h3>
        {Object.entries(grant.donorInfo).map(([key, value]) => (
          <div className="field-group" key={key}>
            <label>{key}</label>
            <input type="text" value={value} readOnly />
          </div>
        ))}
      </div>

      {/* Grant Details */}
      <div className="section">
        <h3>Grant Details</h3>
        {Object.entries(grant.grantDetails).map(([key, value]) => (
          <div className="field-group" key={key}>
            <label>{key}</label>
            {typeof value === "string" ? (
              <input type="text" value={value} readOnly />
            ) : (
              <select value={value}>
                {value.options && value.options.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            )}
          </div>
        ))}
      </div>

      {/* Financial Information */}
      <div className="section">
        <h3>Financial Information</h3>
        {Object.entries(grant.financialInfo).map(([key, value]) => (
          <div className="field-group" key={key}>
            <label>{key}</label>
            <input type="text" value={value} readOnly />
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="section">
        <h3>Timeline</h3>
        {Object.entries(grant.timeline).map(([key, value]) => (
          <div className="field-group" key={key}>
            <label>{key}</label>
            <input type="text" value={value} readOnly />
          </div>
        ))}
      </div>

      {/* Contact and Assignment */}
      <div className="section">
        <h3>Contact and Assignment</h3>
        {Object.entries(grant.contactAssignment).map(([key, value]) => (
          <div className="field-group" key={key}>
            <label>{key}</label>
            <input type="text" value={value} readOnly />
          </div>
        ))}
      </div>

      {/* Grant Purpose and Description */}
      <div className="section">
        <h3>Grant Purpose and Description</h3>
        {Object.entries(grant.purposeDescription).map(([key, value]) => (
          <div className="field-group" key={key}>
            <label>{key}</label>
            <textarea value={value} readOnly />
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="section">
        <h3>Additional Information</h3>
        {Object.entries(grant.additionalInfo).map(([key, value]) => (
          <div className="field-group" key={key}>
            <label>{key}</label>
            <textarea value={value} readOnly />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grant-details-container">
      <button className="back-button" onClick={() => navigate("/grants")}>
        ← Back to Grants
      </button>

      <div className="grant-info-bar"> 
        <div className="grant-left">
          <h2>{grant.organization} - {grant.title}</h2>
          <span className={`status ${grant.status.toLowerCase()}`}>{grant.status}</span>
        </div>
        <div className="grant-right">
          <p><strong>Amount:</strong> {grant.amount}</p>
          <p><strong>Progress:</strong> {calculateProgress(grant.tracking)}%</p>
          <p><strong>Deadline:</strong> {grant.deadline}</p>
        </div>
      </div>


      <div className="grant-actions">
        <label className="action-btn">
          Attach a File
          <input type="file" style={{ display: "none" }} onChange={handleFileChange} />
        </label>
        {selectedFile && <span className="file-name">{selectedFile.name}</span>}
        <button className="action-btn" onClick={handleSendEmail}>Send Email</button>
      </div>

      <div className="grant-nav-bar">
        {["", "gifts", "pledges", "contacts", "bio", "other", "links", "addresses", "tracking"].map((tab) => (
          <NavLink
            key={tab}
            to={tab === "" ? `/grants/${id}` : `/grants/${id}/${tab}`}
            className={({ isActive }) => isActive ? "active-tab" : ""}
          >
            {tab === "" ? "Main" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </NavLink>
        ))}
      </div>

      <Routes>
        <Route path="/" element={<MainTabContent />} />
        <Route path="gifts" element={<GrantDetailsGifts />} />
        <Route path="pledges" element={<GrantDetailsPledges />} />
        <Route path="contacts" element={<GrantDetailsContacts />} />
        <Route path="bio" element={<GrantDetailsBio />} />
        <Route path="other" element={<GrantDetailsOther />} />
        <Route path="links" element={<GrantDetailsLinks />} />
        <Route path="addresses" element={<GrantDetailsAddresses />} />
        <Route path="tracking" element={<GrantDetailsTracking />} />
      </Routes>
    </div>
  );
};

export default GrantDetailsMain;
