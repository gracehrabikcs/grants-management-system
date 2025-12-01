import React, { useState } from "react";
import "../../styles/NewGrant.css";
import { collection, doc, setDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

const initialFormData = {
  // ... all your initial form data remains the same
};

export default function NewGrant() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const navigate = useNavigate();

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const snapshot = await getDocs(collection(db, "grants"));
      const numericIds = snapshot.docs.map((d) => parseInt(d.id)).filter((n) => !isNaN(n));
      const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;

      const grantRef = doc(db, "grants", nextId.toString());

      await setDoc(grantRef, {
        Title: formData.title,
        Organization: formData.organization,
        updatedAt: serverTimestamp(),
        Main: {
          "Application Management": {
            "Anticipated Notification Date": formData.anticipatedNotificationDate,
            "Application Date": formData.applicationDate,
            "Application Status": formData.applicationStatus,
            "Application Type": formData.applicationType,
            "Grant Period": formData.grantPeriod,
            "Report Deadline": formData.reportDeadline,
            "Report Submitted": formData.reportSubmitted,
          },
          "Grant Purpose and Description": {
            "Expected Outcomes": formData.expectedOutcomes,
            "Grant Purpose": formData.grantPurpose,
            "Project Objectives": formData.projectObjectives,
            "Project Summary": formData.projectSummary,
          },
        },
      });

      // Other Firestore writes remain unchanged...
      alert(`Grant saved with ID: ${nextId}`);
      setFormData(initialFormData);
      setStep(1);
    } catch (err) {
      console.error("Error saving grant:", err);
      alert("Something went wrong. Check console.");
    }
  };

  const renderInput = (label, field, type = "text") => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={formData[field]}
        onChange={(e) => updateField(field, e.target.value)}
      />
    </div>
  );

  const renderTextarea = (label, field) => (
    <div className="form-group">
      <label>{label}</label>
      <textarea
        value={formData[field]}
        onChange={(e) => updateField(field, e.target.value)}
      />
    </div>
  );

  return (
    <div className="wizard-container">
      <h1>New Grant</h1>
      <form onSubmit={handleSubmit}>

        {/* STEP 1: Main */}
        {step === 1 && (
          <div className="step">
            <h2>Main Grant Info</h2>
            {renderInput("Anticipated Notification Date", "anticipatedNotificationDate", "date")}
            {renderInput("Application Date", "applicationDate", "date")}
            {renderInput("Application Status", "applicationStatus")}
            {renderInput("Application Type", "applicationType")}
            {renderInput("Grant Period", "grantPeriod")}
            {renderInput("Report Deadline", "reportDeadline", "date")}
            {renderInput("Report Submitted", "reportSubmitted")}
            {renderTextarea("Expected Outcomes", "expectedOutcomes")}
            {renderTextarea("Grant Purpose", "grantPurpose")}
            {renderTextarea("Project Objectives", "projectObjectives")}
            {renderTextarea("Project Summary", "projectSummary")}
            {renderInput("Organization", "organization")}
            {renderInput("Title", "title")}

            <div className="wizard-buttons">
              <button type="button" onClick={() => { if (window.confirm("Cancel creating this grant? All progress will be lost.")) navigate("/grants"); }}>Cancel</button>
              <button type="button" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 2: Address */}
        {step === 2 && (
          <div className="step">
            <h2>Address</h2>
            {renderInput("Apt", "apt")}
            {renderInput("City", "city")}
            {renderInput("Country", "country")}
            {renderInput("State", "state")}
            {renderInput("Street", "street")}
            {renderInput("Zip Code", "zipCode")}
            {renderInput("Address Type", "addressType")}
            {renderInput("Date Verified", "dateVerified", "date")}
            <div className="form-group">
              <label>
                <input type="checkbox" checked={formData.primary} onChange={(e) => updateField("primary", e.target.checked)} /> Primary
              </label>
            </div>
            {renderInput("Type", "type")}

            <div className="wizard-buttons">
              <button type="button" onClick={back}>Back</button>
              <button type="button" onClick={() => { if (window.confirm("Cancel creating this grant? All progress will be lost.")) navigate("/grants"); }}>Cancel</button>
              <button type="button" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 3: Bio */}
        {step === 3 && (
          <div className="step">
            <h2>Bio</h2>
            {renderTextarea("Funding Preferences", "fundingPreferences")}
            {renderTextarea("Organization Details", "organizationDetails")}
            <div className="wizard-buttons">
              <button type="button" onClick={back}>Back</button>
              <button type="button" onClick={() => { if (window.confirm("Cancel creating this grant? All progress will be lost.")) navigate("/grants"); }}>Cancel</button>
              <button type="button" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 4: Organization Details */}
        {step === 4 && (
          <div className="step">
            <h2>Organization Details</h2>
            {renderInput("Annual Budget", "annualBudget")}
            {renderInput("Founded Year", "foundedYear")}
            {renderTextarea("Key Programs", "keyPrograms")}
            {renderTextarea("Mission Statement", "missionStatement")}
            {renderInput("Staff Size", "staffSize")}
            <div className="wizard-buttons">
              <button type="button" onClick={back}>Back</button>
              <button type="button" onClick={() => { if (window.confirm("Cancel creating this grant? All progress will be lost.")) navigate("/grants"); }}>Cancel</button>
              <button type="button" onClick={next}>Next</button>
            </div>
          </div>
        )}
        {/* STEP 5: Contacts */}
        {step === 5 && (
          <div className="step">
            <h2>Contacts</h2>
            {renderInput("Phone", "phone")}
            {renderInput("Email", "email")}
            {renderInput("Primary Contact", "primaryContact")}
            {renderInput("Secondary Contact", "secondaryContact")}
            {renderTextarea("Notes", "contactsNotes")}

            <div className="wizard-buttons">
              <button type="button" onClick={back}>Back</button>
              <button type="button" onClick={() => { if (window.confirm("Cancel creating this grant? All progress will be lost.")) navigate("/grants"); }}>Cancel</button>
              <button type="button" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 6: Pledges */}
        {step === 6 && (
          <div className="step">
            <h2>Pledges</h2>
            {renderInput("Pledge Amount", "pledgeAmount")}
            {renderInput("Donor", "pledgeDonor")}
            {renderInput("Schedule", "pledgeSchedule")}
            {renderInput("Amount Received", "pledgeReceived")}
            {renderInput("Pledged Date", "pledgedDate", "date")}
            {renderTextarea("Notes", "pledgeNotes")}

            <div className="wizard-buttons">
              <button type="button" onClick={back}>Back</button>
              <button type="button" onClick={() => { if (window.confirm("Cancel creating this grant? All progress will be lost.")) navigate("/grants"); }}>Cancel</button>
              <button type="button" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 7: Invoices */}
        {step === 7 && (
          <div className="step">
            <h2>Gifts / Invoices</h2>
            {renderInput("Gift Amount", "invoiceSpent")}
            {renderInput("Purpose", "invoicePurpose")}
            <div className="form-group">
              <label>
                <input type="checkbox" checked={formData.invoiceAcknowledged} onChange={(e) => updateField("invoiceAcknowledged", e.target.checked)} /> Acknowledged
              </label>
            </div>

            <div className="wizard-buttons">
              <button type="button" onClick={back}>Back</button>
              <button type="button" onClick={() => { if (window.confirm("Cancel creating this grant? All progress will be lost.")) navigate("/grants"); }}>Cancel</button>
              <button type="button" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 8: Other */}
        {step === 8 && (
          <div className="step">
            <h2>Other</h2>
            {renderTextarea("General Notes", "otherNotes")}
            {renderTextarea("Budget Notes", "otherBudgetNotes")}
            {renderTextarea("Internal Notes", "otherInternalNotes")}

            <div className="wizard-buttons">
              <button type="button" onClick={back}>Back</button>
              <button type="button" onClick={() => { if (window.confirm("Cancel creating this grant? All progress will be lost.")) navigate("/grants"); }}>Cancel</button>
              <button type="button" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 9: Interactions */}
        {step === 9 && (
          <div className="step">
            <h2>Interactions</h2>
            {renderInput("Contact", "interactionContact")}
            {renderInput("Date", "interactionDate", "date")}
            {renderInput("Next Step", "interactionNext")}
            {renderInput("Outcome", "interactionOutcome")}
            {renderInput("Subject", "interactionSubject")}
            {renderInput("Type", "interactionType")}

            <div className="wizard-buttons">
              <button type="button" onClick={back}>Back</button>
              <button type="button" onClick={() => { if (window.confirm("Cancel creating this grant? All progress will be lost.")) navigate("/grants"); }}>Cancel</button>
              <button type="submit">Submit Grant</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
