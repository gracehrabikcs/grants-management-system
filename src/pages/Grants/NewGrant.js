import React, { useState } from "react";
import "../../styles/NewGrant.css";
import { collection, doc, setDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

export default function NewGrant() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Main
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

    // Address
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

    // Bio
    fundingPreferences: "",
    fundingTs: "",
    organizationDetailsBio: "",
    organizationTs: "",

    // Organization Details
    annualBudget: "",
    foundedYear: "",
    keyPrograms: "",
    missionStatement: "",
    staffSize: "",

    // Pledges
    pledgeAmount: "",
    pledgeDonor: "",
    pledgeSchedule: "",
    pledgeReceived: "",
    pledgedDate: "",

    // Gifts / Invoices
    giftAmount: "",
    giftRemaining: "",
    giftBudgetCode: "",
    giftPurpose: "",
    giftAcknowledgment: "",
    giftCompliance: "",
    giftStatus: "",
    fiscalYear: "",
  });

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Auto ID
      const snapshot = await getDocs(collection(db, "grants"));
      const numericIds = snapshot.docs
        .map((d) => parseInt(d.id))
        .filter((n) => !isNaN(n));
      const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;

      const grantRef = doc(db, "grants", nextId.toString());

      // MAIN MAP
      // MAIN MAP
// CORRECT MAIN STRUCTURE
await setDoc(grantRef, {
  // ---- TOP-LEVEL FIELDS (document root) ----
  title: formData.title,
  organization: formData.organization,

  // ---- MAIN MAP ----
  main: {
    applicationManagement: {
      anticipatedNotificationDate: formData.anticipatedNotificationDate,
      applicationDate: formData.applicationDate,
      applicationStatus: formData.applicationStatus,
      applicationType: formData.applicationType,
      dateAwarded: formData.dateAwarded || "",
      grantPeriod: formData.grantPeriod,
      reportDeadline: formData.reportDeadline,
      reportSubmitted: formData.reportSubmitted,
    },

    grantPurposeAndDescription: {
      expectedOutcomes: formData.expectedOutcomes,
      grantPurpose: formData.grantPurpose,
      projectObjectives: formData.projectObjectives,
      projectSummary: formData.projectSummary,
    },
  },

  updatedAt: serverTimestamp(),
});




      // ADDRESSES SUBCOLLECTION
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

      // BIO SUBCOLLECTION
      const bioRef = doc(collection(grantRef, "bio"), "B1");
      await setDoc(bioRef, {
        fundingPreferences: formData.fundingPreferences,
        fundingTs: formData.fundingTs || serverTimestamp(),
        organizationDetailsBio: formData.organizationDetailsBio,
        organizationTs: formData.organizationTs || serverTimestamp(),
      });

      // ORG DETAILS
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
      const pledgeRef = doc(collection(grantRef, "pledges"), "P1");
      await setDoc(pledgeRef, {
        pledgeAmount: formData.pledgeAmount,
        pledgeDonor: formData.pledgeDonor,
        pledgeSchedule: formData.pledgeSchedule,
        pledgeReceived: formData.pledgeReceived,
        pledgedDate: formData.pledgedDate,
      });

      // INVOICES
      const invoiceRef = doc(collection(grantRef, "invoices"), "1");
      await setDoc(invoiceRef, {
        amount: formData.giftAmount,
        remaining: formData.giftRemaining,
        budgetCode: formData.giftBudgetCode,
        purpose: formData.giftPurpose,
        acknowledgment: formData.giftAcknowledgment,
        compliance: formData.giftCompliance,
        status: formData.giftStatus,
        fiscalYear: formData.fiscalYear,
        createdAt: serverTimestamp(),
      });

      // EMPTY SUBCOLLECTIONS
      await setDoc(doc(collection(grantRef, "contacts"), "C1"), { initialized: true });
      await setDoc(doc(collection(grantRef, "interactions"), "I1"), { initialized: true });
      await setDoc(doc(collection(grantRef, "other"), "O1"), { initialized: true });
      await setDoc(doc(collection(grantRef, "trackingSections"), "T1"), { initialized: true });

      alert(`Grant saved with ID: ${nextId}`);
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
        {/* STEP 1 */}
        {step === 1 && (
          <div className="step">
            <h2>Main Grant Info</h2>
            <input placeholder="Anticipated Notification Date"
              value={formData.anticipatedNotificationDate}
              onChange={(e) => updateField("anticipatedNotificationDate", e.target.value)} />
            <input placeholder="Application Date"
              value={formData.applicationDate}
              onChange={(e) => updateField("applicationDate", e.target.value)} />
            <input placeholder="Application Status"
              value={formData.applicationStatus}
              onChange={(e) => updateField("applicationStatus", e.target.value)} />
            <input placeholder="Application Type"
              value={formData.applicationType}
              onChange={(e) => updateField("applicationType", e.target.value)} />
            <input placeholder="Grant Period"
              value={formData.grantPeriod}
              onChange={(e) => updateField("grantPeriod", e.target.value)} />
            <input placeholder="Report Deadline"
              value={formData.reportDeadline}
              onChange={(e) => updateField("reportDeadline", e.target.value)} />
            <input placeholder="Report Submitted"
              value={formData.reportSubmitted}
              onChange={(e) => updateField("reportSubmitted", e.target.value)} />

            <textarea placeholder="Expected Outcomes"
              value={formData.expectedOutcomes}
              onChange={(e) => updateField("expectedOutcomes", e.target.value)} />

            <textarea placeholder="Grant Purpose"
              value={formData.grantPurpose}
              onChange={(e) => updateField("grantPurpose", e.target.value)} />

            <textarea placeholder="Project Objectives"
              value={formData.projectObjectives}
              onChange={(e) => updateField("projectObjectives", e.target.value)} />

            <textarea placeholder="Project Summary"
              value={formData.projectSummary}
              onChange={(e) => updateField("projectSummary", e.target.value)} />

            <input placeholder="Organization"
              value={formData.organization}
              onChange={(e) => updateField("organization", e.target.value)} />

            <input placeholder="Title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)} />

            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {/* STEP 2 */}
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

        {/* STEP 3 */}
        {step === 3 && (
          <div className="step">
            <h2>Bio</h2>
            <textarea placeholder="Funding Preferences" value={formData.fundingPreferences} onChange={(e) => updateField("fundingPreferences", e.target.value)} />
            <input placeholder="Funding Timestamp" value={formData.fundingTs} onChange={(e) => updateField("fundingTs", e.target.value)} />
            <textarea placeholder="Organization Bio Details" value={formData.organizationDetailsBio} onChange={(e) => updateField("organizationDetailsBio", e.target.value)} />
            <input placeholder="Organization Timestamp" value={formData.organizationTs} onChange={(e) => updateField("organizationTs", e.target.value)} />
            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {/* STEP 4 */}
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

        {/* STEP 5 */}
        {step === 5 && (
          <div className="step">
            <h2>Pledges</h2>
            <input placeholder="Pledge Amount" value={formData.pledgeAmount} onChange={(e) => updateField("pledgeAmount", e.target.value)} />
            <input placeholder="Donor" value={formData.pledgeDonor} onChange={(e) => updateField("pledgeDonor", e.target.value)} />
            <input placeholder="Schedule" value={formData.pledgeSchedule} onChange={(e) => updateField("pledgeSchedule", e.target.value)} />
            <input placeholder="Amount Received" value={formData.pledgeReceived} onChange={(e) => updateField("pledgeReceived", e.target.value)} />
            <input placeholder="Pledged Date" value={formData.pledgedDate} onChange={(e) => updateField("pledgedDate", e.target.value)} />
            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div className="step">
            <h2>Gifts / Invoices</h2>
            <input placeholder="Gift Amount" value={formData.giftAmount} onChange={(e) => updateField("giftAmount", e.target.value)} />
            <input placeholder="Amount Remaining" value={formData.giftRemaining} onChange={(e) => updateField("giftRemaining", e.target.value)} />
            <input placeholder="Budget Code" value={formData.giftBudgetCode} onChange={(e) => updateField("giftBudgetCode", e.target.value)} />
            <input placeholder="Purpose" value={formData.giftPurpose} onChange={(e) => updateField("giftPurpose", e.target.value)} />
            <input placeholder="Acknowledgment" value={formData.giftAcknowledgment} onChange={(e) => updateField("giftAcknowledgment", e.target.value)} />
            <input placeholder="Compliance" value={formData.giftCompliance} onChange={(e) => updateField("giftCompliance", e.target.value)} />
            <input placeholder="Status" value={formData.giftStatus} onChange={(e) => updateField("giftStatus", e.target.value)} />
            <input placeholder="Fiscal Year" value={formData.fiscalYear} onChange={(e) => updateField("fiscalYear", e.target.value)} />

            <button type="button" onClick={back}>Back</button>
            <button type="submit">Submit Grant</button>
          </div>
        )}
      </form>
    </div>
  );
}







