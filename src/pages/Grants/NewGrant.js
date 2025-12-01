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
      // ADDRESSES
      const addressRef = doc(collection(grantRef, "addresses"), "A1");
      await setDoc(addressRef, {
        address: {
          apt: formData.apt,
          city: formData.city,
          country: formData.country,
          state: formData.state,
          street: formData.street,
          zipCode: formData.zipCode,
          addressType: formData.addressType,
          dateVerified: formData.dateVerified || serverTimestamp(),
          primary: formData.primary,
          type: formData.type,
        },
      });

      // BIO
      const bioRef = doc(grantRef, "bio/details"); // fixed path
      await setDoc(bioRef, {
        fundingPreferences: formData.fundingPreferences || "",
        fundingTs: new Date().toLocaleString(),
        organizationDetails: formData.organizationDetails || "",
        organizationTs: new Date().toLocaleString(),
        updatedAt: serverTimestamp(),
      });


      // CONTACTS
      const contactsRef = doc(collection(grantRef, "contacts"));
      await setDoc(contactsRef, {
        id: contactsRef.id,
        phone: formData.phone || "",
        email: formData.email || "",
        primaryContact: formData.primaryContact || "",
        secondaryContact: formData.secondaryContact || "",
        notes: formData.contactsNotes || "",
        updatedAt: serverTimestamp(),
      });

      // ORGANIZATION DETAILS
      const orgRef = doc(collection(grantRef, "organizationDetails"), "O1");
      await setDoc(orgRef, {
        annualBudget: formData.annualBudget,
        foundedYear: formData.foundedYear,
        keyPrograms: formData.keyPrograms,
        missionStatement: formData.missionStatement,
        staffSize: formData.staffSize,
        createdAt: serverTimestamp(),
      });

      // PLEDGES
      const pledgeRef = doc(collection(grantRef, "pledges"));
      await setDoc(pledgeRef, {
        amount: formData.pledgeAmount ? Number(formData.pledgeAmount) : 0,
        donor: formData.pledgeDonor || "",
        received: formData.pledgeReceived ? Number(formData.pledgeReceived) : 0,
        schedule: formData.pledgeSchedule || "",
        pledgedDate: formData.pledgedDate || "",
        notes: formData.pledgeNotes || "",
        notesUpdatedAt: formData.pledgeNotes ? serverTimestamp() : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // INVOICES
      const invoiceRef = doc(collection(grantRef, "invoices"));
      await setDoc(invoiceRef, {
        id: invoiceRef.id,
        date: formData.invoiceDate || "",
        purpose: formData.invoicePurpose || "",
        spent: formData.invoiceSpent ? Number(formData.invoiceSpent) : 0,
        acknowledged: formData.invoiceAcknowledged || false,
        createdAt: serverTimestamp(),
      });

      // OTHER / TRACKING / INTERACTIONS
      const otherRef = doc(grantRef, "other/notes"); // fixed path
      await setDoc(otherRef, {
        notes: formData.otherNotes || "",
        budgetNotes: formData.otherBudgetNotes || "",
        budgetUpdatedAt: serverTimestamp(),
        internalNotes: formData.otherInternalNotes || "",
        internalUpdatedAt: serverTimestamp(),
      });


      const trackingSectionRef = doc(collection(grantRef, "trackingSections"), "S1");
      await setDoc(trackingSectionRef, { "Section Name": "Application Process" });

      const taskRef = doc(collection(trackingSectionRef, "trackingTasks"), "T1");
      await setDoc(taskRef, {
        "Assignee Email": "",
        Task: "",
        "Task Deadline": "",
        "Task Notes": "",
        "Task Status": "To Do",
      });

      const interactionRef = doc(collection(grantRef, "interactions"), "I1");
      await setDoc(interactionRef, {
        contact: formData.interactionContact || "",
        date: formData.interactionDate || "",
        next: formData.interactionNext || "",
        outcome: formData.interactionOutcome || "",
        subject: formData.interactionSubject || "",
        type: formData.interactionType || "",
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
