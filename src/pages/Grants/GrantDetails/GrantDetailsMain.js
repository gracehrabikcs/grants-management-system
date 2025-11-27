import React, { useState, useEffect } from "react";
import { useNavigate, useParams, NavLink, Routes, Route } from "react-router-dom";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase"; // your Firestore instance
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
// Main Tab Content
// =======================
// =======================
// Main Tab Content
// =======================
const MainTabContent = ({ grant, setGrant, progress, id }) => {
  const appManagement = grant?.Main?.["Application Management"] || {};
  const grantPurposeDescription = grant?.Main?.["Grant Purpose and Description"] || {};

  // Update Firestore for any section
  const handleChange = async (section, field, value) => {
    const updatedGrant = {
      ...grant,
      Main: {
        ...grant.Main,
        [section]: {
          ...grant.Main[section],
          [field]: value
        }
      }
    };
    setGrant(updatedGrant);

    const grantRef = doc(db, "grants", id);
    await updateDoc(grantRef, {
      [`Main.${section}`]: updatedGrant.Main[section]
    });
  };

  return (
    <div className="grant-main-content">
      <div className="section">
        <h3>Application Management</h3>

        <div className="field-group">
          <label>Application Status</label>
          <select
            value={appManagement["Application Status"] || ""}
            onChange={(e) => handleChange("Application Management", "Application Status", e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div className="field-group">
          <label>Application Type</label>
          <input
            type="text"
            value={appManagement["Application Type"] || ""}
            onChange={(e) => handleChange("Application Management", "Application Type", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Grant Period</label>
          <input
            type="text"
            value={appManagement["Grant Period"] || ""}
            onChange={(e) => handleChange("Application Management", "Grant Period", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Anticipated Notification Date</label>
          <input
            type="date"
            value={appManagement["Anticipated Notification Date"] || ""}
            onChange={(e) => handleChange("Application Management", "Anticipated Notification Date", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Report Deadline</label>
          <input
            type="date"
            value={appManagement["Report Deadline"] || ""}
            onChange={(e) => handleChange("Application Management", "Report Deadline", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Report Submitted</label>
          <input
            type="date"
            value={appManagement["Report Submitted"] || ""}
            onChange={(e) => handleChange("Application Management", "Report Submitted", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Progress</label>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span>{progress}% complete</span>
        </div>
      </div>

      <div className="section">
        <h3>Grant Purpose and Description</h3>

        <div className="field-group">
          <label>Expected Outcomes</label>
          <input
            type="text"
            value={grantPurposeDescription["Expected Outcomes"] || ""}
            onChange={(e) => handleChange("Grant Purpose and Description", "Expected Outcomes", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Grant Purpose</label>
          <input
            type="text"
            value={grantPurposeDescription["Grant Purpose"] || ""}
            onChange={(e) => handleChange("Grant Purpose and Description", "Grant Purpose", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Project Objectives</label>
          <input
            type="text"
            value={grantPurposeDescription["Project Objectives"] || ""}
            onChange={(e) => handleChange("Grant Purpose and Description", "Project Objectives", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Project Summary</label>
          <input
            type="text"
            value={grantPurposeDescription["Project Summary"] || ""}
            onChange={(e) => handleChange("Grant Purpose and Description", "Project Summary", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

// =======================
// Main Component
// =======================
const GrantDetailsMain = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [grant, setGrant] = useState(null);
  const [trackingSections, setTrackingSections] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch grant and tracking tasks from Firestore
  useEffect(() => {
    const fetchGrantData = async () => {
      try {
        const grantRef = doc(db, "grants", id);
        const grantSnap = await getDoc(grantRef);
        if (!grantSnap.exists()) return;

        const grantData = { id: grantSnap.id, ...grantSnap.data() };
        setGrant(grantData);

        // Fetch tracking sections and tasks
        const sectionsCol = collection(db, "grants", id, "trackingSections");
        const sectionsSnap = await getDocs(sectionsCol);
        const sectionsData = await Promise.all(
          sectionsSnap.docs.map(async (sectionDoc) => {
            const tasksCol = collection(db, "grants", id, "trackingSections", sectionDoc.id, "trackingTasks");
            const tasksSnap = await getDocs(tasksCol);
            const tasksData = tasksSnap.docs.map((t) => ({ id: t.id, ...t.data() }));
            return { id: sectionDoc.id, ...sectionDoc.data(), tasks: tasksData };
          })
        );

        setTrackingSections(sectionsData);
      } catch (err) {
        console.error("Error fetching grant:", err);
      }
    };

    fetchGrantData();
  }, [id]);

  // Calculate overall progress
  const calculateProgress = (sections) => {
    if (!sections || sections.length === 0) return 0;
    let totalTasks = 0;
    let completedValue = 0;
    const statusWeight = { "To Do": 0, "In Progress": 0.5, "Done": 1 };

    sections.forEach((section) => {
      (section.tasks || []).forEach((task) => {
        totalTasks += 1;
        completedValue += statusWeight[task["Task Status"]] || 0;
      });
    });

    if (totalTasks === 0) return 0;
    return Math.round((completedValue / totalTasks) * 100);
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  const handleSendEmail = () => {
    const email = "example@domain.com";
    const subject = encodeURIComponent(`Regarding Grant ID: ${id}`);
    const body = encodeURIComponent("Hello,\n\nI am reaching out regarding the grant.");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  if (!grant) return <p>Loading grant details...</p>;

  return (
    <div className="grant-details-container">
      <button className="back-button" onClick={() => navigate("/grants")}>
        ← Back to Grants
      </button>

      <div className="grant-info-bar">
        <div className="grant-left">
          <h2>{grant.Organization} - {grant.Title}</h2>
          <span className={`status ${grant.status?.toLowerCase()}`}>{grant.status}</span>
        </div>
        <div className="grant-right">
          <p>
            <strong>Application Status:</strong>{" "}
            {grant?.Main?.["Application Management"]?.["Application Status"] || "N/A"}
          </p>
          <p>
            <strong>Report Deadline:</strong>{" "}
            {grant?.Main?.["Application Management"]?.["Report Deadline"] || "N/A"}
          </p>
          <p><strong>Progress:</strong> {calculateProgress(trackingSections)}%</p>
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
        {["", "gifts", "pledges", "contacts", "bio", "other", "links", "addresses", "tracking"].map(tab => (
          <NavLink
            key={tab}
            to={tab === "" ? `/grants/${id}` : `/grants/${id}/${tab}`}
            end={tab === ""}
            className={({ isActive }) => (isActive ? "active-tab" : "")}
          >
            {tab === "" ? "Main" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </NavLink>
        ))}
      </div>

      <Routes>
        <Route
          path="/"
          element={<MainTabContent grant={grant} setGrant={setGrant} progress={calculateProgress(trackingSections)} id={id} />}
        />
        <Route path="gifts" element={<GrantDetailsGifts />} />
        <Route path="pledges" element={<GrantDetailsPledges />} />
        <Route path="contacts" element={<GrantDetailsContacts />} />
        <Route path="bio" element={<GrantDetailsBio />} />
        <Route path="other" element={<GrantDetailsOther />} />
        <Route path="links" element={<GrantDetailsLinks grantId={id} />} />
        <Route path="addresses" element={<GrantDetailsAddresses grantId={id} />} />
        <Route path="tracking" element={<GrantDetailsTracking grantId={id} setTasks={setTrackingSections} />} />
      </Routes>
    </div>
  );
};

export default GrantDetailsMain;
