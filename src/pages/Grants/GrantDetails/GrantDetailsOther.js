import React, { useState } from "react";
import "../../../styles/GrantDetailsOther.css";

export default function GrantDetailsOther() {
  const [budgetNotes, setBudgetNotes] = useState(
    "Budget allocation for Q1–Q4 2024. Total grant amount: $150,000. Breakdown: Personnel (60%), Equipment (25%), Operations (15%). Quarterly reporting required. Unused funds must be returned within 30 days of project completion."
  );

  const [internalNotes, setInternalNotes] = useState(
    "Internal tracking notes for grant management team. Primary contact: Dr. Sarah Johnson. Secondary contact: Prof. Michael Chen. Regular review meetings scheduled for the 15th of each month. Project milestone reviews every quarter."
  );

  const [conditions, setConditions] = useState([
    { id: "sc1", text: "Quarterly progress reports required", status: "Active" },
    { id: "sc2", text: "Annual site visit by funding agency", status: "Pending" },
    { id: "sc3", text: "Equipment must be purchased within 6 months", status: "Active" },
    { id: "sc4", text: "Intellectual property agreements signed", status: "Completed" },
  ]);

  function onEditBudget() {
    // hook up to modal/editor 
    const next = prompt("Edit Budget & Finance Notes:", budgetNotes);
    if (typeof next === "string") setBudgetNotes(next);
  }

  function onEditInternal() {
    const next = prompt("Edit Internal Notes:", internalNotes);
    if (typeof next === "string") setInternalNotes(next);
  }

  function onManageConditions() {
    alert("Open conditions manager (stub). Replace with your modal/route.");
  }

  return (
    <div className="content">
      <div className="gms-wrap">

       
        <section className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div>
              <div className="gms-head">Budget and Finance Notes</div>
              <div className="gms-subtle">
                Financial tracking and budget allocation details for this grant
              </div>
            </div>
            <button className="gms-btn ghost" onClick={onEditBudget}>✏️ Edit</button>
          </div>
          <p className="gms-paragraph">{budgetNotes}</p>
        </section>

       
        <section className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div>
              <div className="gms-head">Internal Notes</div>
              <div className="gms-subtle">
                Private notes for internal team communication and coordination
              </div>
            </div>
            <button className="gms-btn ghost" onClick={onEditInternal}>✏️ Edit</button>
          </div>
          <p className="gms-paragraph">{internalNotes}</p>
        </section>

        
        <section className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div>
              <div className="gms-head">Special Conditions</div>
              <div className="gms-subtle">
                Grant-specific requirements, conditions, and compliance items
              </div>
            </div>
            <button className="gms-btn" onClick={onManageConditions}>
              ✏️ Manage Conditions
            </button>
          </div>

          <ul className="gms-conditions">
            {conditions.map((c) => (
              <li key={c.id} className="gms-condition-row">
                <span className="gms-condition-text">{c.text}</span>
                <span className={`gms-status ${mapStatusClass(c.status)}`}>{c.status}</span>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
}

function mapStatusClass(status) {
  switch (status) {
    case "Active":
      return "status-active";
    case "Pending":
      return "status-pending";
    case "Completed":
      return "status-completed";
    default:
      return "";
  }
}

