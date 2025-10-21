import React, { useState } from "react";
import "../../../styles/GrantDetails.css";

const GrantDetailsBio = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [bioData, setBioData] = useState({
    fundingPreferences: {
      focusAreas: "Education, Youth Development",
      geographicFocus: "United States, Latin America",
      fundingRange: "$10,000 - $100,000",
      grantTypes: "Program Support, General Operating, Capital",
      restrictions: "No grants to individuals",
      otherNotes: "Prefers long-term partnerships and measurable outcomes.",
    },
    contactInformation: {
      contactName: "Jane Smith",
      title: "Director of Philanthropy",
      email: "jane.smith@foundation.org",
      phone: "(555) 123-4567",
      address: "123 Foundation Ave, New York, NY 10001",
      website: "www.foundation.org",
    },
    organizationDetails: {
      foundedYear: "1995",
      missionStatement: "To foster innovation in education through grantmaking.",
      staffSize: "25",
      annualBudget: "$5,000,000",
      taxStatus: "501(c)(3)",
      keyPrograms: "STEM Access Initiative, Teacher Leadership Fund",
    },
    additionalInformation: {
      recentChanges: "Updated focus areas in 2025.",
      evaluationMethods: "Quarterly reports and annual impact assessments.",
      partnerships: "Collaborates with local nonprofits and schools.",
      notes: "Very responsive to follow-up communications.",
    },
  });

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
    setIsEditing(!isEditing);
  };

  return (
    <div className="grant-bio-container">
      {/* Edit / Save Button */}
      <div className="grant-actions" style={{ justifyContent: "flex-end" }}>
        <button className="action-btn" onClick={handleEditToggle}>
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>

      {/* Funding Preferences */}
      <div className="section">
        <h3>Funding Preferences</h3>
        {Object.entries(bioData.fundingPreferences).map(([field, value]) => (
          <div className="field-group" key={field}>
            <label>
              {field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
            <textarea
              value={value}
              readOnly={!isEditing}
              onChange={(e) =>
                handleChange("fundingPreferences", field, e.target.value)
              }
            />
          </div>
        ))}
      </div>

      {/* Contact Information */}
      <div className="section">
        <h3>Contact Information</h3>
        {Object.entries(bioData.contactInformation).map(([field, value]) => (
          <div className="field-group" key={field}>
            <label>
              {field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
            <input
              type="text"
              value={value}
              readOnly={!isEditing}
              onChange={(e) =>
                handleChange("contactInformation", field, e.target.value)
              }
            />
          </div>
        ))}
      </div>

      {/* Organization Details */}
      <div className="section">
        <h3>Organization Details</h3>
        {Object.entries(bioData.organizationDetails).map(([field, value]) => (
          <div className="field-group" key={field}>
            <label>
              {field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
            {field === "missionStatement" || field === "keyPrograms" ? (
              <textarea
                value={value}
                readOnly={!isEditing}
                onChange={(e) =>
                  handleChange("organizationDetails", field, e.target.value)
                }
              />
            ) : (
              <input
                type="text"
                value={value}
                readOnly={!isEditing}
                onChange={(e) =>
                  handleChange("organizationDetails", field, e.target.value)
                }
              />
            )}
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="section">
        <h3>Additional Information</h3>
        {Object.entries(bioData.additionalInformation).map(([field, value]) => (
          <div className="field-group" key={field}>
            <label>
              {field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
            <textarea
              value={value}
              readOnly={!isEditing}
              onChange={(e) =>
                handleChange("additionalInformation", field, e.target.value)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrantDetailsBio;
