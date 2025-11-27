import React, { useState } from "react";
import "../../styles/NewGrant.css";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // make sure the path is correct

export default function NewGrantWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Main Grant Info
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

    // Bio Fields
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

    // Pledge Fields
    pledgeAmount: "",
    pledgeDonor: "",
    pledgeSchedule: "",
    pledgeReceived: "",
    pledgedDate: "",

    // Gift Fields
    giftAmount: "",
    giftRemaining: "",
    giftBudgetCode: "",
    giftPurpose: "",
    giftAcknowledgment: "",
    giftCompliance: "",
    giftStatus: "",
    fiscalYear: "",
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const next = () => setStep(prev => prev + 1);
  const back = () => setStep(prev => prev - 1);

  // 🔑 Updated handleSubmit with custom numeric IDs
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const grantsRef = collection(db, "grants");
      const snapshot = await getDocs(grantsRef);

      // Find the highest numeric ID among existing docs
      const numericIds = snapshot.docs
        .map(doc => parseInt(doc.id))
        .filter(id => !isNaN(id));
      const nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;

      // Save with custom ID
      await setDoc(doc(db, "grants", nextId.toString()), formData);
      console.log("Document written with custom ID:", nextId);
      alert("Grant saved to Firebase with ID: " + nextId);

      // Reset form
      setFormData({});
      setStep(1);
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Error saving grant. Check console.");
    }
  };

  return (
    <div className="wizard-container">
      <h1>New Grant</h1>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="step">
            <h2>Main Grant Info</h2>
            <input placeholder="Anticipated Notification Date" onChange={e => updateField("anticipatedNotificationDate", e.target.value)} />
            <input placeholder="Application Date" onChange={e => updateField("applicationDate", e.target.value)} />
            <input placeholder="Application Status" onChange={e => updateField("applicationStatus", e.target.value)} />
            <input placeholder="Application Type" onChange={e => updateField("applicationType", e.target.value)} />
            <input placeholder="Grant Period" onChange={e => updateField("grantPeriod", e.target.value)} />
            <input placeholder="Report Deadline" onChange={e => updateField("reportDeadline", e.target.value)} />
            <input placeholder="Report Submitted" onChange={e => updateField("reportSubmitted", e.target.value)} />
            <input placeholder="Expected Outcomes" onChange={e => updateField("expectedOutcomes", e.target.value)} />
            <textarea placeholder="Grant Purpose" onChange={e => updateField("grantPurpose", e.target.value)} />
            <textarea placeholder="Project Objectives" onChange={e => updateField("projectObjectives", e.target.value)} />
            <textarea placeholder="Project Summary" onChange={e => updateField("projectSummary", e.target.value)} />
            <input placeholder="Organization" onChange={e => updateField("organization", e.target.value)} />
            <input placeholder="Title" onChange={e => updateField("title", e.target.value)} />
            <button type="button" onClick={next}>Next</button>
          </div>
        )}
        
        {step === 2 && (
          <div className="step">
            <h2>Address</h2>
            <input placeholder="Apt" onChange={e => updateField("apt", e.target.value)} />
            <input placeholder="City" onChange={e => updateField("city", e.target.value)} />
            <input placeholder="Country" onChange={e => updateField("country", e.target.value)} />
            <input placeholder="State" onChange={e => updateField("state", e.target.value)} />
            <input placeholder="Street" onChange={e => updateField("street", e.target.value)} />
            <input placeholder="Zip Code" onChange={e => updateField("zipCode", e.target.value)} />
            <input placeholder="Address Type" onChange={e => updateField("addressType", e.target.value)} />
            <input placeholder="Date Verified" onChange={e => updateField("dateVerified", e.target.value)} />
            <label>
              <input type="checkbox" onChange={e => updateField("primary", e.target.checked)} /> Primary
            </label>
            <input placeholder="Type" onChange={e => updateField("type", e.target.value)} />
            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <h2>Bio</h2>
            <textarea placeholder="Funding Preferences" onChange={e => updateField("fundingPreferences", e.target.value)} />
            <input placeholder="Funding Timestamp" onChange={e => updateField("fundingTs", e.target.value)} />
            <textarea placeholder="Organization Bio Details" onChange={e => updateField("organizationDetailsBio", e.target.value)} />
            <input placeholder="Organization Timestamp" onChange={e => updateField("organizationTs", e.target.value)} />

            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {step === 4 && (
          <div className="step">
            <h2>Organization Details</h2>
            <input placeholder="Annual Budget" onChange={e => updateField("annualBudget", e.target.value)} />
            <input placeholder="Founded Year" onChange={e => updateField("foundedYear", e.target.value)} />
            <textarea placeholder="Key Programs" onChange={e => updateField("keyPrograms", e.target.value)} />
            <textarea placeholder="Mission Statement" onChange={e => updateField("missionStatement", e.target.value)} />
            <input placeholder="Staff Size" onChange={e => updateField("staffSize", e.target.value)} />

            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {step === 5 && (
          <div className="step">
            <h2>Pledges</h2>
            <input placeholder="Pledge Amount" onChange={e => updateField("pledgeAmount", e.target.value)} />
            <input placeholder="Donor" onChange={e => updateField("pledgeDonor", e.target.value)} />
            <input placeholder="Schedule" onChange={e => updateField("pledgeSchedule", e.target.value)} />
            <input placeholder="Amount Received" onChange={e => updateField("pledgeReceived", e.target.value)} />
            <input placeholder="Pledged Date" onChange={e => updateField("pledgedDate", e.target.value)} />

            <button type="button" onClick={back}>Back</button>
            <button type="button" onClick={next}>Next</button>
          </div>
        )}

        {step === 6 && (
          <div className="step">
            <h2>Gifts</h2>
            <input placeholder="Gift Amount" onChange={e => updateField("giftAmount", e.target.value)} />
            <input placeholder="Amount Remaining" onChange={e => updateField("giftRemaining", e.target.value)} />
            <input placeholder="Budget Code" onChange={e => updateField("giftBudgetCode", e.target.value)} />
            <input placeholder="Purpose" onChange={e => updateField("giftPurpose", e.target.value)} />
            <input placeholder="Acknowledgment" onChange={e => updateField("giftAcknowledgment", e.target.value)} />
            <input placeholder="Compliance" onChange={e => updateField("giftCompliance", e.target.value)} />
            <input placeholder="Status" onChange={e => updateField("giftStatus", e.target.value)} />
            <input placeholder="Fiscal Year" onChange={e => updateField("fiscalYear", e.target.value)} />

            <button type="button" onClick={back}>Back</button>
            <button type="submit">Submit Grant</button>
          </div>
        )}
      </form>
    </div>
  );
}
