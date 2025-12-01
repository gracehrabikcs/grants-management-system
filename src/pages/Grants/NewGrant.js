import React, { useState } from "react";
import "../../styles/NewGrant.css";
import { collection, doc, setDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

// CLEANER: Convert all undefined values to null recursively
function clean(obj) {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (typeof obj !== "object") return obj;

  const result = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    const value = obj[key];
    if (value === undefined) {
      result[key] = null;
    } else if (typeof value === "object" && value !== null) {
      result[key] = clean(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

const initialFormData = {
  // --- MAIN ---
  anticipatedNotificationDate: "",
  applicationDate: "",
  applicationStatus: "",
  applicationType: "",
  grantPeriod: "",
  fiscalYear: "",
  reportDeadline: "",
  reportSubmitted: "",
  expectedOutcomes: "",
  grantPurpose: "",
  projectObjectives: "",
  projectSummary: "",
  organization: "",
  title: "",

  // --- ADDRESS ---
  apt: "",
  city: "",
  country: "",
  state: "",
  street: "",
  zipCode: "",
  addressType: "",
  dateVerified: "",
  primary: false,
  type: "",

  // --- BIO ---
  fundingPreferences: "",
  organizationDetails: "",

  // --- ORGANIZATION DETAILS ---
  annualBudget: "",
  foundedYear: "",
  keyPrograms: "",
  missionStatement: "",
  staffSize: "",

  // --- CONTACTS ---
  phone: "",
  email: "",
  primaryContact: "",
  secondaryContact: "",
  contactsNotes: "",

  // --- PLEDGES ---
  pledgeAmount: "",
  pledgeDonor: "",
  pledgeSchedule: "",
  pledgeReceived: "",
  pledgedDate: "",
  pledgeNotes: "",

  // --- INVOICES ---
  invoiceDate: "",
  invoicePurpose: "",
  invoiceSpent: "",
  invoiceAcknowledged: false,

  // --- OTHER ---
  otherNotes: "",
  otherBudgetNotes: "",
  otherInternalNotes: "",

  // --- INTERACTIONS ---
  interactionContact: "",
  interactionDate: "",
  interactionNext: "",
  interactionOutcome: "",
  interactionSubject: "",
  interactionType: "",
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
        // MAIN
        Main: {
          "Application Management": {
            "Anticipated Notification Date": formData.anticipatedNotificationDate,
            "Application Date": formData.applicationDate,
            "Application Status": formData.applicationStatus,
            "Application Type": formData.applicationType,
            "Grant Period": formData.grantPeriod,
            "reportDeadline": formData.reportDeadline,
            "Report Submitted": formData.reportSubmitted,
          }
        },
      });
      // Other Firestore writes remain unchanged...
      alert(`Grant saved with ID: ${nextId}`);
      setFormData(initialFormData);
      setStep(1);

      navigate("/grants");

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
            {renderInput("Organization", "organization")}
            {renderInput("Title", "title")}
            {renderInput("Anticipated Notification Date", "anticipatedNotificationDate", "date")}
            {renderInput("Application Date", "applicationDate", "date")}
            <div className="form-group">
              <label>Application Status</label>
              <select
                value={formData.applicationStatus}
                onChange={(e) => updateField("applicationStatus", e.target.value)}
              >
                <option value="">Select status...</option>
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
            {renderInput("Application Type", "applicationType")}
            {renderInput("Grant Period", "grantPeriod")}
            {renderInput("Fiscal Year", "fiscalYear")}
            {renderInput("Report Deadline", "reportDeadline", "date")}
            {renderInput("Report Submitted", "reportSubmitted", "date")}
            

            <div className="wizard-buttons">
              <button type="button" onClick={() => { if (window.confirm("Cancel creating this grant? All progress will be lost.")) navigate("/grants"); }}>Cancel</button>
              <button type="submit">Submit Grant</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
