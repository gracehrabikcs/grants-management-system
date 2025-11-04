import React, { useEffect, useState } from "react";
import "../../../styles/GrantDetailsOther.css";

const BUDGET_NOTES_KEY = "gms_other_budget_notes";
const INTERNAL_NOTES_KEY = "gms_other_internal_notes";
const CONDITIONS_KEY = "gms_other_conditions";

export default function GrantDetailsOther() {
  const [budgetNotes, setBudgetNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [budgetTs, setBudgetTs] = useState("");
  const [internalTs, setInternalTs] = useState("");
  const [conditions, setConditions] = useState([]);

  // load on mount
  useEffect(() => {
    // budget
    const savedBudget = localStorage.getItem(BUDGET_NOTES_KEY);
    if (savedBudget != null) {
      setBudgetNotes(savedBudget);
      const ts = localStorage.getItem(BUDGET_NOTES_KEY + "_ts");
      if (ts) setBudgetTs(ts);
    } else {
      setBudgetNotes(
        "Budget allocation for Q1–Q4 2024. Total grant amount: $150,000. Breakdown: Personnel (60%), Equipment (25%), Operations (15%). Quarterly reporting required. Unused funds must be returned within 30 days of project completion."
      );
    }

    // internal
    const savedInternal = localStorage.getItem(INTERNAL_NOTES_KEY);
    if (savedInternal != null) {
      setInternalNotes(savedInternal);
      const ts = localStorage.getItem(INTERNAL_NOTES_KEY + "_ts");
      if (ts) setInternalTs(ts);
    } else {
      setInternalNotes(
        "Internal tracking notes for grant management team. Primary contact: Dr. Sarah Johnson. Secondary contact: Prof. Michael Chen. Regular review meetings scheduled for the 15th of each month. Project milestone reviews every quarter."
      );
    }

    // conditions
    const savedConditions = localStorage.getItem(CONDITIONS_KEY);
    if (savedConditions) {
      setConditions(JSON.parse(savedConditions));
    } else {
      setConditions([
        {
          id: "sc1",
          text: "Quarterly progress reports required",
          status: "Active",
        },
        {
          id: "sc2",
          text: "Annual site visit by funding agency",
          status: "Pending",
        },
        {
          id: "sc3",
          text: "Equipment must be purchased within 6 months",
          status: "Active",
        },
        {
          id: "sc4",
          text: "Intellectual property agreements signed",
          status: "Completed",
        },
      ]);
    }
  }, []);

  // persist conditions whenever they change
  useEffect(() => {
    if (conditions.length) {
      localStorage.setItem(CONDITIONS_KEY, JSON.stringify(conditions));
    }
  }, [conditions]);

  function handleSaveBudget() {
    const ts = new Date().toLocaleString();
    localStorage.setItem(BUDGET_NOTES_KEY, budgetNotes);
    localStorage.setItem(BUDGET_NOTES_KEY + "_ts", ts);
    setBudgetTs(ts);
    alert("Budget notes saved.");
  }

  function handleSaveInternal() {
    const ts = new Date().toLocaleString();
    localStorage.setItem(INTERNAL_NOTES_KEY, internalNotes);
    localStorage.setItem(INTERNAL_NOTES_KEY + "_ts", ts);
    setInternalTs(ts);
    alert("Internal notes saved.");
  }

  function handleAddCondition() {
    const text = prompt("Condition description:");
    if (!text) return;
    const statusRaw = prompt(
      "Status (Active/Pending/Completed):",
      "Active"
    );
    const status = normalizeStatus(statusRaw);
    const newCond = {
      id: "sc" + (conditions.length + 1),
      text,
      status,
    };
    setConditions((prev) => [...prev, newCond]);
  }

  function handleEditCondition(id) {
    const cond = conditions.find((c) => c.id === id);
    if (!cond) return;
    const text =
      prompt("Edit condition description:", cond.text) ?? cond.text;
    const statusRaw =
      prompt(
        "Status (Active/Pending/Completed):",
        cond.status
      ) ?? cond.status;
    const status = normalizeStatus(statusRaw);
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, text, status } : c))
    );
  }

  function handleDeleteCondition(id) {
    const cond = conditions.find((c) => c.id === id);
    if (!cond) return;
    const ok = window.confirm(`Delete condition "${cond.text}"?`);
    if (!ok) return;
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="content">
      <div className="gms-wrap">
        {/* Budget notes */}
        <section className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div>
              <div className="gms-head">Budget and Finance Notes</div>
              <div className="gms-subtle">
                Financial tracking and budget allocation details for this grant
              </div>
            </div>
            <button className="gms-btn primary" onClick={handleSaveBudget}>
              Save
            </button>
          </div>
          <textarea
            className="gms-notes"
            rows={5}
            value={budgetNotes}
            onChange={(e) => setBudgetNotes(e.target.value)}
          />
          <div className="gms-micro gms-mt8">
            Last updated: {budgetTs || "Not saved yet"}
          </div>
        </section>

        {/* Internal notes */}
        <section className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div>
              <div className="gms-head">Internal Notes</div>
              <div className="gms-subtle">
                Private notes for internal team communication and coordination
              </div>
            </div>
            <button className="gms-btn primary" onClick={handleSaveInternal}>
              Save
            </button>
          </div>
          <textarea
            className="gms-notes"
            rows={5}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
          />
          <div className="gms-micro gms-mt8">
            Last updated: {internalTs || "Not saved yet"}
          </div>
        </section>

        {/* Special conditions */}
        <section className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div>
              <div className="gms-head">Special Conditions</div>
              <div className="gms-subtle">
                Grant-specific requirements, conditions, and compliance items
              </div>
            </div>
            <button className="gms-btn" onClick={handleAddCondition}>
              + Add Condition
            </button>
          </div>

          <ul className="gms-conditions">
            {conditions.map((c) => (
              <li key={c.id} className="gms-condition-row">
                <span className="gms-condition-text">{c.text}</span>
                <div className="gms-condition-actions">
                  <span
                    className={`gms-status ${mapStatusClass(c.status)}`}
                  >
                    {c.status}
                  </span>
                  <button
                    className="gms-kebab"
                    title="Edit condition"
                    onClick={() => handleEditCondition(c.id)}
                  >
                    ✏️
                  </button>
                  <button
                    className="gms-kebab"
                    title="Delete condition"
                    onClick={() => handleDeleteCondition(c.id)}
                  >
                    🗑️
                  </button>
                </div>
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

function normalizeStatus(raw = "") {
  const v = raw.trim().toLowerCase();
  if (v === "active") return "Active";
  if (v === "pending") return "Pending";
  if (v === "completed") return "Completed";
  return "Active";
}

