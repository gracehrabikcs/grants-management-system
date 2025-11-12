import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetails.css";

const GrantDetailsBio = () => {
  const { id } = useParams();
  const [grant, setGrant] = useState(null);
  const [bioData, setBioData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Fetch grant details from JSON
  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((res) => res.json())
      .then((data) => {
        const selected = data.find((g) => g.id === parseInt(id));
        if (selected && selected.bio) {
          setGrant(selected);
          setBioData(selected.bio);
        }
      })
      .catch((err) => console.error("Error loading grant bio:", err));
  }, [id]);

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
      // Simulate save (local only)
      setSaveMessage("✅ Changes saved locally!");
      setTimeout(() => setSaveMessage(""), 2500);
    }
    setIsEditing(!isEditing);
  };

  if (!bioData) return <p>Loading bio details...</p>;

  const renderSection = (sectionTitle, sectionKey, textAreaFields = []) => (
    <div className="section" key={sectionKey}>
      <h3>{sectionTitle}</h3>
      {Object.entries(bioData[sectionKey]).map(([field, value]) => {
        const formattedLabel = field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        const isTextArea = textAreaFields.includes(field);
        return (
          <div className="field-group" key={field}>
            <label>{formattedLabel}</label>
            {isTextArea ? (
              <textarea
                value={value}
                readOnly={!isEditing}
                onChange={(e) => handleChange(sectionKey, field, e.target.value)}
              />
            ) : (
              <input
                type="text"
                value={value}
                readOnly={!isEditing}
                onChange={(e) => handleChange(sectionKey, field, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );

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

      {/* Bio Sections */}
      {renderSection("Funding Preferences", "fundingPreferences")}
      {renderSection("Contact Information", "contactInformation")}
      {renderSection("Organization Details", "organizationDetails", [
        "missionStatement",
        "keyPrograms",
      ])}
      {renderSection("Additional Information", "additionalInformation")}
    </div>
  );
};

export default GrantDetailsBio;
