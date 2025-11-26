import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase"; // make sure db is exported from firebase.js
import "../../../styles/GrantDetails.css";

const GrantDetailsBio = () => {
  const [bioData, setBioData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Fetch grant "1" from "grants" collection
  useEffect(() => {
    const fetchGrant = async () => {
      try {
        const grantRef = doc(db, "grants", "1"); // document ID "1"
        const grantSnap = await getDoc(grantRef);

        if (grantSnap.exists()) {
          const data = grantSnap.data();
          // Safely extract Bio and Organization Details
          const bio = data?.Bio || {};
          const organizationDetails = data?.["Organization Details"] || {};

          setBioData({
            Bio: bio,
            organizationDetails: organizationDetails,
          });
        } else {
          console.error("Grant not found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching grant from Firestore:", error);
      }
    };

    fetchGrant();
  }, []);

  const handleChange = (section, field, value) => {
    setBioData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // TODO: persist changes to Firestore here
      setSaveMessage("✅ Changes saved locally!");
      setTimeout(() => setSaveMessage(""), 2500);
    }
    setIsEditing(!isEditing);
  };

  if (!bioData || !bioData.Bio) return <p>Loading bio details...</p>;

  const { Bio } = bioData;
  const fundingPreferences = Bio?.["Funding Preferences"] || {};
  const focusArea = Bio?.["Focus Area"] || "";
  const fundingRange = Bio?.["Funding Range"] || "";
  const geographicFocus = Bio?.["Geographic Focus"] || "";
  const grantTypes = Bio?.["Grant Types"] || "";
  const otherNotes = Bio?.["Other Notes"] || "";
  const restrictions = Bio?.["Restrictions"] || "";

  const org = bioData.organizationDetails;
  const annualBudget = org?.["Annual Budget"] || "";
  const foundedYear = org?.["Founded Year"] || "";
  const keyPrograms = org?.["Key Programs"] || "";
  const missionStatement = org?.["Mission Statement"] || "";
  const staffSize = org?.["Staff Size"] || "";

  return (
    <div className="grant-bio-container">
      {/* Header and Edit Button */}
      <div className="grant-actions" style={{ justifyContent: "flex-end" }}>
        <button className="action-btn" onClick={handleEditToggle}>
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          style={{
            color: "green",
            textAlign: "right",
            marginBottom: "10px",
            fontWeight: "500",
          }}
        >
          {saveMessage}
        </div>
      )}

      {/* Funding Preferences */}
      <div className="section">
        <h3>Funding Preferences</h3>
        {Object.entries(fundingPreferences).map(([key, value]) => (
          <div className="field-group" key={key}>
            <label>{key}</label>
            <input
              type="text"
              value={value}
              readOnly={!isEditing}
              onChange={(e) =>
                handleChange("Bio", "Funding Preferences", {
                  ...fundingPreferences,
                  [key]: e.target.value,
                })
              }
            />
          </div>
        ))}
        <div className="field-group">
          <label>Focus Area</label>
          <input
            type="text"
            value={focusArea}
            readOnly={!isEditing}
            onChange={(e) => handleChange("Bio", "Focus Area", e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>Funding Range</label>
          <input
            type="text"
            value={fundingRange}
            readOnly={!isEditing}
            onChange={(e) =>
              handleChange("Bio", "Funding Range", e.target.value)
            }
          />
        </div>
        <div className="field-group">
          <label>Geographic Focus</label>
          <input
            type="text"
            value={geographicFocus}
            readOnly={!isEditing}
            onChange={(e) =>
              handleChange("Bio", "Geographic Focus", e.target.value)
            }
          />
        </div>
        <div className="field-group">
          <label>Grant Types</label>
          <input
            type="text"
            value={grantTypes}
            readOnly={!isEditing}
            onChange={(e) =>
              handleChange("Bio", "Grant Types", e.target.value)
            }
          />
        </div>
        <div className="field-group">
          <label>Other Notes</label>
          <input
            type="text"
            value={otherNotes}
            readOnly={!isEditing}
            onChange={(e) =>
              handleChange("Bio", "Other Notes", e.target.value)
            }
          />
        </div>
        <div className="field-group">
          <label>Restrictions</label>
          <input
            type="text"
            value={restrictions}
            readOnly={!isEditing}
            onChange={(e) =>
              handleChange("Bio", "Restrictions", e.target.value)
            }
          />
        </div>
      </div>

      {/* Organization Details */}
      <div className="section">
        <h3>Organization Details</h3>
        <div className="field-group">
          <label>Annual Budget</label>
          <input
            type="text"
            value={annualBudget}
            readOnly={!isEditing}
            onChange={(e) =>
              handleChange("organizationDetails", "Annual Budget", e.target.value)
            }
          />
        </div>
        <div className="field-group">
          <label>Founded Year</label>
          <input
            type="text"
            value={foundedYear}
            readOnly={!isEditing}
            onChange={(e) =>
              handleChange("organizationDetails", "Founded Year", e.target.value)
            }
          />
        </div>
        <div className="field-group">
          <label>Key Programs</label>
          <input
            type="text"
            value={keyPrograms}
            readOnly={!isEditing}
            onChange={(e) =>
              handleChange("organizationDetails", "Key Programs", e.target.value)
            }
          />
        </div>
        <div className="field-group">
          <label>Mission Statement</label>
          <input
            type="text"
            value={missionStatement}
            readOnly={!isEditing}
            onChange={(e) =>
              handleChange("organizationDetails", "Mission Statement", e.target.value)
            }
          />
        </div>
        <div className="field-group">
          <label>Staff Size</label>
          <input
            type="number"
            value={staffSize}
            readOnly={!isEditing}
            onChange={(e) =>
              handleChange("organizationDetails", "Staff Size", e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default GrantDetailsBio;
