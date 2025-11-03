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

// =======================
// Separated MainTabContent
// =======================
const MainTabContent = ({ grant, setGrant }) => (
  <div className="grant-main-content">
    {/* Application Management */}
    <div className="section">
      <h3>Application Management</h3>
      <div className="field-group">
        <label>Application Status</label>
        <select
          value={grant.applicationStatus}
          onChange={(e) => setGrant({ ...grant, applicationStatus: e.target.value })}
        >
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>

      <div className="field-group">
        <label>Application Type</label>
        <select
          value={grant.applicationType}
          onChange={(e) => setGrant({ ...grant, applicationType: e.target.value })}
        >
          <option>Standard</option>
          <option>Emergency</option>
        </select>
      </div>

      <div className="field-group">
        <label>Submission Deadline</label>
        <input
          type="date"
          value={grant.deadline}
          onChange={(e) => setGrant({ ...grant, deadline: e.target.value })}
        />
      </div>

      <div className="field-group">
        <label>Last Updated</label>
        <input
          type="text"
          value={grant.lastUpdated}
          onChange={(e) => setGrant({ ...grant, lastUpdated: e.target.value })}
        />
      </div>

      <div className="field-group">
        <label>Next Action Required</label>
        <input
          type="text"
          value={grant.nextAction}
          onChange={(e) => setGrant({ ...grant, nextAction: e.target.value })}
        />
      </div>
    </div>

    {/* Donor Information */}
    <div className="section">
      <h3>Donor Information</h3>
      {Object.entries(grant.donorInfo).map(([key, value]) => (
        <div className="field-group" key={key}>
          <label>{key}</label>
          <input
            type="text"
            value={value}
            onChange={(e) =>
              setGrant({
                ...grant,
                donorInfo: { ...grant.donorInfo, [key]: e.target.value },
              })
            }
          />
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
            <input
              type="text"
              value={value}
              onChange={(e) =>
                setGrant({
                  ...grant,
                  grantDetails: { ...grant.grantDetails, [key]: e.target.value },
                })
              }
            />
          ) : (
            <select
              value={value.selected || ""}
              onChange={(e) =>
                setGrant({
                  ...grant,
                  grantDetails: {
                    ...grant.grantDetails,
                    [key]: { ...value, selected: e.target.value },
                  },
                })
              }
            >
              {value.options &&
                value.options.map((opt) => <option key={opt}>{opt}</option>)}
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
          <input
            type="text"
            value={value}
            onChange={(e) =>
              setGrant({
                ...grant,
                financialInfo: { ...grant.financialInfo, [key]: e.target.value },
              })
            }
          />
        </div>
      ))}
    </div>

    {/* Timeline */}
    <div className="section">
      <h3>Timeline</h3>
      {Object.entries(grant.timeline).map(([key, value]) => (
        <div className="field-group" key={key}>
          <label>{key}</label>
          <input
            type="text"
            value={value}
            onChange={(e) =>
              setGrant({
                ...grant,
                timeline: { ...grant.timeline, [key]: e.target.value },
              })
            }
          />
        </div>
      ))}
    </div>

    {/* Contact and Assignment */}
    <div className="section">
      <h3>Contact and Assignment</h3>
      {Object.entries(grant.contactAssignment).map(([key, value]) => (
        <div className="field-group" key={key}>
          <label>{key}</label>
          <input
            type="text"
            value={value}
            onChange={(e) =>
              setGrant({
                ...grant,
                contactAssignment: {
                  ...grant.contactAssignment,
                  [key]: e.target.value,
                },
              })
            }
          />
        </div>
      ))}
    </div>

    {/* Grant Purpose and Description */}
    <div className="section">
      <h3>Grant Purpose and Description</h3>
      {Object.entries(grant.purposeDescription).map(([key, value]) => (
        <div className="field-group" key={key}>
          <label>{key}</label>
          <textarea
            value={value}
            onChange={(e) =>
              setGrant({
                ...grant,
                purposeDescription: {
                  ...grant.purposeDescription,
                  [key]: e.target.value,
                },
              })
            }
          />
        </div>
      ))}
    </div>

    {/* Additional Information */}
    <div className="section">
      <h3>Additional Information</h3>
      {Object.entries(grant.additionalInfo).map(([key, value]) => (
        <div className="field-group" key={key}>
          <label>{key}</label>
          <textarea
            value={value}
            onChange={(e) =>
              setGrant({
                ...grant,
                additionalInfo: {
                  ...grant.additionalInfo,
                  [key]: e.target.value,
                },
              })
            }
          />
        </div>
      ))}
    </div>
  </div>
);

// =======================
// Main Component
// =======================
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

  const calculateProgress = (tasksObj) => {
    const allTasks = Object.values(tasksObj).flat();
    if (allTasks.length === 0) return 0;
    const doneTasks = allTasks.filter((t) => t.status === "Done").length;
    return Math.round((doneTasks / allTasks.length) * 100);
  };

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(grant, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grant_${grant.id || "data"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    if (!grant) return;

    // Convert key-value pairs to CSV rows
    const headers = Object.keys(grant).join(",");
    const values = Object.values(grant)
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");

    const csvContent = `${headers}\n${values}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grant_${grant.id || "data"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!grant) return <p>Loading grant details...</p>;

  return (
    <div className="grant-details-container">
      <button className="back-button" onClick={() => navigate("/grants")}>
        ← Back to Grants
      </button>

      <div className="grant-info-bar">
        <div className="grant-left">
          <h2>
            {grant.organization} - {grant.title}
          </h2>
          <span className={`status ${grant.status.toLowerCase()}`}>{grant.status}</span>
        </div>
        <div className="grant-right">
          <p>
            <strong>Amount:</strong> {grant.amount}
          </p>
          <p>
            <strong>Progress:</strong> {calculateProgress(grant.tracking)}%
          </p>
          <p>
            <strong>Deadline:</strong> {grant.deadline}
          </p>
        </div>
      </div>

      <div className="grant-actions">
        <label className="action-btn">
          Attach a File
          <input type="file" style={{ display: "none" }} onChange={handleFileChange} />
        </label>
        {selectedFile && <span className="file-name">{selectedFile.name}</span>}
        <button className="action-btn" onClick={handleSendEmail}>
          Send Email
        </button>
        <button
          onClick={exportAsJSON}
          className="action-btn"
        >
          Export JSON
        </button>
        <button
          onClick={exportAsCSV}
          className="action-btn"
        >
          Export CSV
        </button>
      </div>

      <div className="grant-nav-bar">
        {["", "gifts", "pledges", "contacts", "bio", "other", "links", "addresses", "tracking"].map(
          (tab) => (
            <NavLink
              key={tab}
              to={tab === "" ? `/grants/${id}` : `/grants/${id}/${tab}`}
              end={tab === ""}
              className={({ isActive }) => (isActive ? "active-tab" : "")}
            >
              {tab === "" ? "Main" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </NavLink>
          )
        )}
      </div>

      <Routes>
        <Route path="/" element={<MainTabContent grant={grant} setGrant={setGrant} />} />
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
