import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetails.css";

const GrantDetailsBio = () => {
  const { id } = useParams();
  const [bioData, setBioData] = useState(null);

  // Fetch grant details from JSON
  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((res) => res.json())
      .then((data) => {
        const selected = data.find((g) => g.id === parseInt(id));
        if (selected && selected.bio) {
          setBioData({
            ...selected.bio,
            additionalContacts:
              selected.bio.additionalContacts || [] // Ensure array exists
          });
        }
      })
      .catch((err) => console.error("Error loading grant bio:", err));
  }, [id]);

  // Handles updates to fields
  const handleChange = (section, fieldOrIndex, fieldOrValue, maybeValue) => {
    // Case: normal section (not additionalContacts)
    if (section !== "additionalContacts") {
      setBioData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [fieldOrIndex]: fieldOrValue,
        },
      }));
      return;
    }

    // Case: additionalContacts section
    const index = fieldOrIndex;
    const field = fieldOrValue;
    const value = maybeValue;

    setBioData((prev) => {
      const updated = [...prev.additionalContacts];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, additionalContacts: updated };
    });
  };

  // Add a new additional contact
  const addAdditionalContact = () => {
    const newContact = {
      contactName: "",
      title: "",
      email: "",
      phone: "",
      notes: ""
    };

    setBioData((prev) => ({
      ...prev,
      additionalContacts: [...prev.additionalContacts, newContact],
    }));
  };

  // Remove an additional contact
  const removeAdditionalContact = (index) => {
    setBioData((prev) => {
      const updated = [...prev.additionalContacts];
      updated.splice(index, 1);
      return { ...prev, additionalContacts: updated };
    });
  };

  if (!bioData) return <p>Loading bio details...</p>;

  // Renders any standard section
  const renderSection = (title, sectionKey, textAreaFields = []) => (
    <div className="section" key={sectionKey} style={{ marginTop: title === "Funding Preferences" ? "20px" : "0" }}>
      <h3>{title}</h3>

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
                onChange={(e) => handleChange(sectionKey, field, e.target.value)}
              />
            ) : (
              <input
                type="text"
                value={value}
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

      {/* Funding Preferences */}
      {renderSection("Funding Preferences", "fundingPreferences")}

      {/* Contact Information */}
      {renderSection("Contact Information", "contactInformation")}

      {/* Additional Contacts */}
      <div className="section">
        <h3>Additional Contacts</h3>

        {bioData.additionalContacts.map((contact, index) => (
          <div className="contact-card" key={index}>
            <div className="contact-header">
              <h4>Additional Contact</h4>

              {/* Remove Contact Button */}
              <button
                className="remove-btn"
                onClick={() => removeAdditionalContact(index)}
              >
                Remove
              </button>
            </div>

            {Object.entries(contact).map(([field, value]) => {
              const formattedLabel = field
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());

              return (
                <div className="field-group" key={field}>
                  <label>{formattedLabel}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      handleChange(
                        "additionalContacts",
                        index,
                        field,
                        e.target.value
                      )
                    }
                  />
                </div>
              );
            })}
          </div>
        ))}

        {/* Add Additional Contact Button */}
        <button
          className="action-btn"
          style={{ marginTop: "10px" }}
          onClick={addAdditionalContact}
        >
          + Add Additional Contact
        </button>
      </div>

      {/* Organization Details */}
      {renderSection("Organization Details", "organizationDetails", [
        "missionStatement",
        "keyPrograms",
      ])}

      {/* Additional Information */}
      {renderSection("Additional Information", "additionalInformation")}
    </div>
  );
};

export default GrantDetailsBio;
