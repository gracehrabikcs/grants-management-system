import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetailsOther.css";

export default function GrantDetailsOther() {
  const { id } = useParams();
  const [grant, setGrant] = useState(null);
  const [budgetNotes, setBudgetNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [budgetTs, setBudgetTs] = useState("");
  const [internalTs, setInternalTs] = useState("");
  const [conditions, setConditions] = useState([]);

  // Load grant "other" details from JSON
  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((res) => res.json())
      .then((data) => {
        const selected = data.find((g) => g.id === parseInt(id));
        if (selected) {
          setGrant(selected);

          // Load "other" data from JSON
          const other = selected.other || {};

          // Budget notes
          setBudgetNotes(other.budgetNotes || "");
          // Internal notes
          setInternalNotes(other.internalNotes || "");
          // Conditions
          setConditions(other.conditions || []);
        }
      })
      .catch((err) => console.error("Error loading grant:", err));
  }, [id]);

  // Persist conditions whenever they change
  useEffect(() => {
    if (conditions.length) {
      localStorage.setItem(`gms_other_conditions_${id}`, JSON.stringify(conditions));
    }
  }, [conditions, id]);

  function handleSaveBudget() {
    const ts = new Date().toLocaleString();
    setBudgetTs(ts);
    localStorage.setItem(`gms_other_budget_${id}`, budgetNotes);
    localStorage.setItem(`gms_other_budget_${id}_ts`, ts);
    alert("Budget notes saved.");
  }

  function handleSaveInternal() {
    const ts = new Date().toLocaleString();
    setInternalTs(ts);
    localStorage.setItem(`gms_other_internal_${id}`, internalNotes);
    localStorage.setItem(`gms_other_internal_${id}_ts`, ts);
    alert("Internal notes saved.");
  }

  function handleAddCondition() {
    const text = prompt("Condition description:");
    if (!text) return;
    const statusRaw = prompt("Status (Active/Pending/Completed):", "Active");
    const status = normalizeStatus(statusRaw);
    const newCond = { id: "sc" + (conditions.length + 1), text, status };
    setConditions((prev) => [...prev, newCond]);
  }

  function handleEditCondition(id) {
    const cond = conditions.find((c) => c.id === id);
    if (!cond) return;
    const text = prompt("Edit condition description:", cond.text) ?? cond.text;
    const statusRaw = prompt("Status (Active/Pending/Completed):", cond.status) ?? cond.status;
    const status = normalizeStatus(statusRaw);
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, text, status } : c))
    );
  }

  function handleDeleteCondition(id) {
    const cond = conditions.find((c) => c.id === id);
    if (!cond) return;
    if (!window.confirm(`Delete condition "${cond.text}"?`)) return;
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }

  if (!grant) return <p>Loading grant details...</p>;

  return (
    <div className="content">
      <div className="gms-wrap">
        {/* Budget notes */}
        <section className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div>
              <div className="gms-head">Budget and Finance Notes</div>
              <div className="gms-subtle">Financial tracking and budget allocation details for this grant</div>
            </div>
            <button className="gms-btn primary" onClick={handleSaveBudget}>Save</button>
          </div>
          <textarea
            className="gms-notes"
            rows={5}
            value={budgetNotes}
            onChange={(e) => setBudgetNotes(e.target.value)}
          />
          <div className="gms-micro gms-mt8">Last updated: {budgetTs || "Not saved yet"}</div>
        </section>

        {/* Internal notes */}
        <section className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div>
              <div className="gms-head">Internal Notes</div>
              <div className="gms-subtle">Private notes for internal team communication and coordination</div>
            </div>
            <button className="gms-btn primary" onClick={handleSaveInternal}>Save</button>
          </div>
          <textarea
            className="gms-notes"
            rows={5}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
          />
          <div className="gms-micro gms-mt8">Last updated: {internalTs || "Not saved yet"}</div>
        </section>

        {/* Special conditions */}
        <section className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div>
              <div className="gms-head">Special Conditions</div>
              <div className="gms-subtle">Grant-specific requirements, conditions, and compliance items</div>
            </div>
            <button className="gms-btn" onClick={handleAddCondition}>+ Add Condition</button>
          </div>
          <ul className="gms-conditions">
            {conditions.map((c) => (
              <li key={c.id} className="gms-condition-row">
                <span className="gms-condition-text">{c.text}</span>
                <div className="gms-condition-actions">
                  <span className={`gms-status ${mapStatusClass(c.status)}`}>{c.status}</span>
                  <button className="gms-kebab" title="Edit condition" onClick={() => handleEditCondition(c.id)}>✏️</button>
                  <button className="gms-kebab" title="Delete condition" onClick={() => handleDeleteCondition(c.id)}>🗑️</button>
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
    case "Active": return "status-active";
    case "Pending": return "status-pending";
    case "Completed": return "status-completed";
    default: return "";
  }
}

function normalizeStatus(raw = "") {
  const v = raw.trim().toLowerCase();
  if (v === "active") return "Active";
  if (v === "pending") return "Pending";
  if (v === "completed") return "Completed";
  return "Active";
}
