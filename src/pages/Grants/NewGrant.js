import React, { useState } from "react";
import "../../styles/NewGrant.css";
import { collection, doc, setDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

const initialFormData = {
  // --- MAIN ---
  anticipatedNotificationDate: "",
  applicationDate: "",
  applicationStatus: "",
  applicationType: "",
  grantPeriod: "",
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

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate next numeric ID
      const snapshot = await getDocs(collection(db, "grants"));
      const numericIds = snapshot.docs.map((d) => parseInt(d.id)).filter((n) => !isNaN(n));
      const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;

      const grantRef = doc(db, "grants", nextId.toString());

      // MAIN MAP
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

      alert(`Grant saved with ID: ${nextId}`);
      setFormData(initialFormData); // reset form
      setStep(1);
    } catch (err) {
      console.error("Error saving grant:", err);
      alert("Something went wrong. Check console.");
    }
  };

  return (
    <div className="wizard-container">
      <h1>New Grant</h1>
      <form onSubmit={handleSubmit}>
        {/* STEP 1: Main */}
        {step === 1 && (
          <div className="step">
            <h2>Main Grant Info</h2>
            <input placeholder="Anticipated Notification Date" value={formData.anticipatedNotificationDate} onChange={(e) => updateField("anticipatedNotificationDate", e.target.value)} />
            <input placeholder="Application Date" value={formData.applicationDate} onChange={(e) => updateField("applicationDate", e.target.value)} />
            <input placeholder="Application Status" value={formData.applicationStatus} onChange={(e) => updateField("applicationStatus", e.target.value)} />
            <input placeholder="Application Type" value={formData.applicationType} onChange={(e) => updateField("applicationType", e.target.value)} />
            <input placeholder="Grant Period" value={formData.grantPeriod} onChange={(e) => updateField("grantPeriod", e.target.value)} />
            <input placeholder="Report Deadline" value={formData.reportDeadline} onChange={(e) => updateField("reportDeadline", e.target.value)} />
            <input placeholder="Report Submitted" value={formData.reportSubmitted} onChange={(e) => updateField("reportSubmitted", e.target.value)} />
            <textarea placeholder="Expected Outcomes" value={formData.expectedOutcomes} onChange={(e) => updateField("expectedOutcomes", e.target.value)} />
            <textarea placeholder="Grant Purpose" value={formData.grantPurpose} onChange={(e) => updateField("grantPurpose", e.target.value)} />
            <textarea placeholder="Project Objectives" value={formData.projectObjectives} onChange={(e) => updateField("projectObjectives", e.target.value)} />
            <textarea placeholder="Project Summary" value={formData.projectSummary} onChange={(e) => updateField("projectSummary", e.target.value)} />
            <input placeholder="Organization" value={formData.organization} onChange={(e) => updateField("organization", e.target.value)} />
            <input placeholder="Title" value={formData.title} onChange={(e) => updateField("title", e.target.value)} />
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {/* STEP 2: Address */}
        {step === 2 && (
          <div className="step">
            <h2>Address</h2>
            <input placeholder="Apt" value={formData.apt} onChange={(e) => updateField("apt", e.target.value)} />
            <input placeholder="City" value={formData.city} onChange={(e) => updateField("city", e.target.value)} />
            <input placeholder="Country" value={formData.country} onChange={(e) => updateField("country", e.target.value)} />
            <input placeholder="State" value={formData.state} onChange={(e) => updateField("state", e.target.value)} />
            <input placeholder="Street" value={formData.street} onChange={(e) => updateField("street", e.target.value)} />
            <input placeholder="Zip Code" value={formData.zipCode} onChange={(e) => updateField("zipCode", e.target.value)} />
            <input placeholder="Address Type" value={formData.addressType} onChange={(e) => updateField("addressType", e.target.value)} />
            <input placeholder="Date Verified" value={formData.dateVerified} onChange={(e) => updateField("dateVerified", e.target.value)} />
            <label>
              <input type="checkbox" checked={formData.primary} onChange={(e) => updateField("primary", e.target.checked)} /> Primary
            </label>
            <input placeholder="Type" value={formData.type} onChange={(e) => updateField("type", e.target.value)} />
            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {/* STEP 3: Bio */}
        {step === 3 && (
          <div className="step">
            <h2>Bio</h2>
            <textarea placeholder="Funding Preferences" value={formData.fundingPreferences} onChange={(e) => updateField("fundingPreferences", e.target.value)} />
            <textarea placeholder="Organization Details" value={formData.organizationDetails} onChange={(e) => updateField("organizationDetails", e.target.value)} />
            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {/* STEP 4: Organization Details */}
        {step === 4 && (
          <div className="step">
            <h2>Organization Details</h2>
            <input placeholder="Annual Budget" value={formData.annualBudget} onChange={(e) => updateField("annualBudget", e.target.value)} />
            <input placeholder="Founded Year" value={formData.foundedYear} onChange={(e) => updateField("foundedYear", e.target.value)} />
            <textarea placeholder="Key Programs" value={formData.keyPrograms} onChange={(e) => updateField("keyPrograms", e.target.value)} />
            <textarea placeholder="Mission Statement" value={formData.missionStatement} onChange={(e) => updateField("missionStatement", e.target.value)} />
            <input placeholder="Staff Size" value={formData.staffSize} onChange={(e) => updateField("staffSize", e.target.value)} />
            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {/* STEP 5: Contacts */}
        {step === 5 && (
          <div className="step">
            <h2>Contacts</h2>
            <input placeholder="Phone" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} />
            <input placeholder="Email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
            <input placeholder="Primary Contact" value={formData.primaryContact} onChange={(e) => updateField("primaryContact", e.target.value)} />
            <input placeholder="Secondary Contact" value={formData.secondaryContact} onChange={(e) => updateField("secondaryContact", e.target.value)} />
            <textarea placeholder="Notes" value={formData.contactsNotes} onChange={(e) => updateField("contactsNotes", e.target.value)} />
            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {/* STEP 6: Pledges */}
        {step === 6 && (
          <div className="step">
            <h2>Pledges</h2>
            <input placeholder="Pledge Amount" value={formData.pledgeAmount} onChange={(e) => updateField("pledgeAmount", e.target.value)} />
            <input placeholder="Donor" value={formData.pledgeDonor} onChange={(e) => updateField("pledgeDonor", e.target.value)} />
            <input placeholder="Schedule" value={formData.pledgeSchedule} onChange={(e) => updateField("pledgeSchedule", e.target.value)} />
            <input placeholder="Amount Received" value={formData.pledgeReceived} onChange={(e) => updateField("pledgeReceived", e.target.value)} />
            <input placeholder="Pledged Date" value={formData.pledgedDate} onChange={(e) => updateField("pledgedDate", e.target.value)} />
            <textarea placeholder="Notes" value={formData.pledgeNotes} onChange={(e) => updateField("pledgeNotes", e.target.value)} />
            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {/* STEP 7: Invoices */}
        {step === 7 && (
          <div className="step">
            <h2>Gifts / Invoices</h2>
            <input placeholder="Gift Amount" value={formData.invoiceSpent} onChange={(e) => updateField("invoiceSpent", e.target.value)} />
            <input placeholder="Purpose" value={formData.invoicePurpose} onChange={(e) => updateField("invoicePurpose", e.target.value)} />
            <label>
              <input type="checkbox" checked={formData.invoiceAcknowledged} onChange={(e) => updateField("invoiceAcknowledged", e.target.checked)} /> Acknowledged
            </label>
            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {/* STEP 8: Other */}
        {step === 8 && (
          <div className="step">
            <h2>Other</h2>
            <textarea placeholder="General Notes" value={formData.otherNotes} onChange={(e) => updateField("otherNotes", e.target.value)} />
            <textarea placeholder="Budget Notes" value={formData.otherBudgetNotes} onChange={(e) => updateField("otherBudgetNotes", e.target.value)} />
            <textarea placeholder="Internal Notes" value={formData.otherInternalNotes} onChange={(e) => updateField("otherInternalNotes", e.target.value)} />
            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {/* STEP 9: Interactions */}
        {step === 9 && (
          <div className="step">
            <h2>Interactions</h2>
            <input placeholder="Contact" value={formData.interactionContact} onChange={(e) => updateField("interactionContact", e.target.value)} />
            <input placeholder="Date" value={formData.interactionDate} onChange={(e) => updateField("interactionDate", e.target.value)} />
            <input placeholder="Next Step" value={formData.interactionNext} onChange={(e) => updateField("interactionNext", e.target.value)} />
            <input placeholder="Outcome" value={formData.interactionOutcome} onChange={(e) => updateField("interactionOutcome", e.target.value)} />
            <input placeholder="Subject" value={formData.interactionSubject} onChange={(e) => updateField("interactionSubject", e.target.value)} />
            <input placeholder="Type" value={formData.interactionType} onChange={(e) => updateField("interactionType", e.target.value)} />
            <button type="button" onClick={back}>Back</button>
            <button type="submit">Submit Grant</button>
          </div>
        )}
      </form>
    </div>
  );
}
