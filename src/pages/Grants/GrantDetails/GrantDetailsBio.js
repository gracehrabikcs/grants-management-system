import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetails.css";

const GrantDetailsBio = () => {
  const { id } = useParams();
  const [grant, setGrant] = useState(null);
  const [bioData, setBioData] = useState(null);

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

  const handleAddContact = () => {
    const newContactKey = `additionalContact${Object.keys(
      bioData.contactInformation
    ).length + 1}`;

    setBioData((prev) => ({
      ...prev,
      contactInformation: {
        ...prev.contactInformation,
        [newContactKey]: {
          name: "",
          title: "",
          email: "",
          phone: "",
          notes: "",
        },
      },
    }));
  };

  if (!bioData) return <p>Loading bio details...</p>;

  const renderSection = (sectionTitle, sectionKey, textAreaFields = []) => (
    <div className="section" key={sectionKey}>
      <h3>{sectionTitle}</h3>
      {Object.entries(bioData[sectionKey]).map(([field, value]) => {
        // Handle special case for dynamically added contacts
        const formattedLabel = field.startsWith("additionalContact")
          ? "Additional Contact"
          : field
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());

        const isTextArea = textAreaFields.includes(field);
        const isNestedContact =
          typeof value === "object" && value !== null && !Array.isArray(value);

        if (isNestedContact) {
          // Render nested contact info (like additional contacts)
          return (
            <div
              key={field}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "12px",
                backgroundColor: "#fafafa",
              }}
            >
              <h4 style={{ marginBottom: "8px" }}>{formattedLabel}</h4>
              {Object.entries(value).map(([subField, subValue]) => (
                <div className="field-group" key={subField}>
                  <label>
                    {subField
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </label>
                  <input
                    type="text"
                    value={subValue}
                    onChange={(e) =>
                      setBioData((prev) => ({
                        ...prev,
                        [sectionKey]: {
                          ...prev[sectionKey],
                          [field]: {
                            ...prev[sectionKey][field],
                            [subField]: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          );
        }

        // Render standard fields
        return (
          <div className="field-group" key={field}>
            <label>{formattedLabel}</label>
            {isTextArea ? (
              <textarea
                value={value}
                onChange={(e) =>
                  handleChange(sectionKey, field, e.target.value)
                }
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  handleChange(sectionKey, field, e.target.value)
                }
              />
            )}
          </div>
        );
      })}
      {/* Add Contact Button (only for contact section) */}
      {sectionKey === "contactInformation" && (
        <button
          className="action-btn"
          onClick={handleAddContact}
          style={{ marginTop: "10px" }}
        >
          + Add Contact
        </button>
      )}
    </div>
  );

  return (
    <div className="grant-bio-container">
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
