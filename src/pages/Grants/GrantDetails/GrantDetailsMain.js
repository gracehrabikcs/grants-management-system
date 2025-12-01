import React, { useState, useEffect } from "react";
import { useNavigate, useParams, NavLink, Routes, Route } from "react-router-dom";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import "../../../styles/GrantDetails.css";

import GrantDetailsTracking from "./GrantDetailsTracking";
import GrantDetailsGifts from "./GrantDetailsGifts";
import GrantDetailsBio from "./GrantDetailsBio";
import GrantDetailsContacts from "./GrantDetailsContacts";
import GrantDetailsPledges from "./GrantDetailsPledges";
import GrantDetailsAddresses from "./GrantDetailsAddresses";
import GrantDetailsOther from "./GrantDetailsOther";

/* ===========================================
    🔧 FIX: Timestamp Converter
   =========================================== */
const formatTimestamp = (ts) => {
  if (!ts) return "N/A";
  if (typeof ts === "string") return ts; // string dates already safe
  if (ts.seconds === undefined) return "N/A";

  const date = new Date(ts.seconds * 1000);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/* ===========================================
    Main Tab Content
   =========================================== */

const MainTabContent = ({ grant, setGrant, progress, id }) => {
  const appManagement = grant?.Main?.["Application Management"] || {};
  const grantPurposeDescription = grant?.Main?.["Grant Purpose and Description"] || {};

  /**
   * Handles updating BOTH:
   * - top-level fields (Title, Organization)
   * - nested fields inside Main → sections
   */
  const handleChange = async (section, field, value) => {
    let updatedGrant;

    if (section === "top") {
      // Update TOP LEVEL fields like Title, Organization
      updatedGrant = {
        ...grant,
        [field]: value,
      };

      setGrant(updatedGrant);

      const grantRef = doc(db, "grants", id);
      await updateDoc(grantRef, {
        [field]: value, // top-level write
      });

      return;
    }

    // Otherwise update nested Main fields
    updatedGrant = {
      ...grant,
      Main: {
        ...grant.Main,
        [section]: {
          ...grant.Main?.[section],
          [field]: value,
        },
      },
    };

    setGrant(updatedGrant);

    const grantRef = doc(db, "grants", id);
    await updateDoc(grantRef, {
      Main: updatedGrant.Main,
    });
  };

  return (
    <div className="grant-main-content">

      {/* ============================
          TOP LEVEL FIELDS
      ============================ */}
      <div className="section">
        <h3>Basic Information</h3>

        <div className="field-group">
          <label>Title</label>
          <input
            type="text"
            value={grant.Title || ""}
            onChange={(e) => handleChange("top", "Title", e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Organization</label>
          <input
            type="text"
            value={grant.Organization || ""}
            onChange={(e) => handleChange("top", "Organization", e.target.value)}
          />
        </div>
      </div>

      {/* ============================
          APPLICATION MANAGEMENT
      ============================ */}
      <div className="section">
        <h3>Application Management</h3>

        <div className="field-group">
          <label>Application Date</label>
          <input
            type="date"
            value={appManagement["Application Date"] || ""}
            onChange={(e) =>
              handleChange("Application Management", "Application Date", e.target.value)
            }
          />
        </div>

        <div className="field-group">
          <label>Application Status</label>
          <select
            value={appManagement["Application Status"] || ""}
            onChange={(e) =>
              handleChange("Application Management", "Application Status", e.target.value)
            }
          >
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="field-group">
          <label>Application Type</label>
          <input
            type="text"
            value={appManagement["Application Type"] || ""}
            onChange={(e) =>
              handleChange("Application Management", "Application Type", e.target.value)
            }
          />
        </div>

        <div className="field-group">
          <label>Date Awarded</label>
          <input
            type="date"
            value={appManagement["Date Awarded"] || ""}
            onChange={(e) =>
              handleChange("Application Management", "Date Awarded", e.target.value)
            }
          />
        </div>

        <div className="field-group">
          <label>Grant Period</label>
          <input
            type="text"
            value={appManagement["Grant Period"] || ""}
            onChange={(e) =>
              handleChange("Application Management", "Grant Period", e.target.value)
            }
          />
        </div>

        <div className="field-group">
          <label>Fiscal Year</label>
          <input
            type="text"
            value={appManagement["Fiscal Year"] || ""}
            onChange={(e) =>
              handleChange("Application Management", "Fiscal Year", e.target.value)
            }
          />
        </div>

        <div className="field-group">
          <label>Anticipated Notification Date</label>
          <input
            type="date"
            value={appManagement["Anticipated Notification Date"] || ""}
            onChange={(e) =>
              handleChange(
                "Application Management",
                "Anticipated Notification Date",
                e.target.value
              )
            }
          />
        </div>

        <div className="field-group">
          <label>Report Deadline</label>
          <input
            type="date"
            value={appManagement["reportDeadline"] || ""}
            onChange={(e) =>
              handleChange("Application Management", "reportDeadline", e.target.value)
            }
          />
        </div>

        <div className="field-group">
          <label>Report Submitted</label>
          <input
            type="date"
            value={appManagement["Report Submitted"] || ""}
            onChange={(e) =>
              handleChange("Application Management", "Report Submitted", e.target.value)
            }
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

      {/* ============================
          GRANT PURPOSE & DESCRIPTION
      ============================ */}
      <div className="section">
        <h3>Grant Purpose and Description</h3>

        <div className="field-group">
          <label>Expected Outcomes</label>
          <input
            type="text"
            value={grantPurposeDescription["Expected Outcomes"] || ""}
            onChange={(e) =>
              handleChange(
                "Grant Purpose and Description",
                "Expected Outcomes",
                e.target.value
              )
            }
          />
        </div>

        <div className="field-group">
          <label>Grant Purpose</label>
          <input
            type="text"
            value={grantPurposeDescription["Grant Purpose"] || ""}
            onChange={(e) =>
              handleChange(
                "Grant Purpose and Description",
                "Grant Purpose",
                e.target.value
              )
            }
          />
        </div>

        <div className="field-group">
          <label>Project Objectives</label>
          <input
            type="text"
            value={grantPurposeDescription["Project Objectives"] || ""}
            onChange={(e) =>
              handleChange(
                "Grant Purpose and Description",
                "Project Objectives",
                e.target.value
              )
            }
          />
        </div>

        <div className="field-group">
          <label>Project Summary</label>
          <input
            type="text"
            value={grantPurposeDescription["Project Summary"] || ""}
            onChange={(e) =>
              handleChange(
                "Grant Purpose and Description",
                "Project Summary",
                e.target.value
              )
            }
          />
        </div>
      </div>
    </div>
  );
};


/* ===========================================
    Main Component
   =========================================== */
const GrantDetailsMain = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [grant, setGrant] = useState(null);
  const [trackingSections, setTrackingSections] = useState([]);

  // Fetch grant and tracking tasks from Firestore
  useEffect(() => {
    const fetchGrantData = async () => {
      try {
        const grantRef = doc(db, "grants", id);
        const grantSnap = await getDoc(grantRef);
        if (!grantSnap.exists()) return;

        const grantData = { id: grantSnap.id, ...grantSnap.data() };
        setGrant(grantData);

        const sectionsCol = collection(db, "grants", id, "trackingSections");
        const sectionsSnap = await getDocs(sectionsCol);
        const sectionsData = await Promise.all(
          sectionsSnap.docs.map(async (sectionDoc) => {
            const tasksCol = collection(
              db,
              "grants",
              id,
              "trackingSections",
              sectionDoc.id,
              "trackingTasks"
            );
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

          {/* FIX APPLIED HERE */}
          <p>
            <strong>Report Deadline:</strong>{" "}
            {formatTimestamp(grant?.Main?.["Application Management"]?.["reportDeadline"])}
          </p>

          <p><strong>Progress:</strong> {calculateProgress(trackingSections)}%</p>
        </div>
      </div>

      <div className="grant-nav-bar">
        {["", "invoices", "pledges", "contacts", "bio", "other", "addresses", "tracking"].map(
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
        <Route
          path="/"
          element={
            <MainTabContent
              grant={grant}
              setGrant={setGrant}
              progress={calculateProgress(trackingSections)}
              id={id}
            />
          }
        />
        <Route path="invoices" element={<GrantDetailsGifts />} />
        <Route path="pledges" element={<GrantDetailsPledges />} />
        <Route path="contacts" element={<GrantDetailsContacts />} />
        <Route path="bio" element={<GrantDetailsBio />} />
        <Route path="other" element={<GrantDetailsOther />} />
        <Route path="addresses" element={<GrantDetailsAddresses grantId={id} />} />
        <Route
          path="tracking"
          element={<GrantDetailsTracking grantId={id} setTasks={setTrackingSections} />}
        />
      </Routes>
    </div>
  );
};

export default GrantDetailsMain;