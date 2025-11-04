import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetailsContacts.css";

function initialsOf(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export default function GrantDetailsContacts() {
  const { id } = useParams();
  const [grant, setGrant] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [notes, setNotes] = useState("");
  const [notesTs, setNotesTs] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");

  // Fetch grant from JSON
  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((res) => res.json())
      .then((data) => {
        const selected = data.find((g) => g.id === parseInt(id));
        if (!selected) return;
        setGrant(selected);

        const cont = selected.contacts || {};
        setNotes(cont.notes || "");
        setContacts(cont.list || []);
        if ((cont.list || [])[0]) setSelectedId(cont.list[0].id);
        setInteractions(cont.interactions || []);
      })
      .catch((err) => console.error("Error loading grant:", err));
  }, [id]);

  const selected = useMemo(
    () => contacts.find((c) => c.id === selectedId),
    [contacts, selectedId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [contacts, query]);

  const metrics = {
    total: contacts.length,
    keyStakeholders: contacts.filter((c) => c.keyStakeholder).length,
    recentInteractions: interactions.length,
  };

  // --- Handlers ---
  const handleSaveNotes = () => {
    const ts = new Date().toLocaleString();
    setNotesTs(ts);
    localStorage.setItem(`gms_contacts_notes_${id}`, notes);
    localStorage.setItem(`gms_contacts_notes_ts_${id}`, ts);
    alert("Notes saved.");
  };

  const handleAddContact = () => {
    const name = prompt("Name:");
    if (!name) return;
    const newContact = { id: "c" + (contacts.length + 1), name, role: "", email: "", phone: "", department: "", institution: "", lastContact: "", keyStakeholder: false };
    setContacts((prev) => [...prev, newContact]);
    setSelectedId(newContact.id);
  };

  const handleEditContact = () => {
    if (!selected) return;
    const name = prompt("Name:", selected.name) || selected.name;
    setContacts((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, name } : c))
    );
  };

  const handleContactDelete = (e, contactId) => {
    e.stopPropagation();
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    if (selectedId === contactId) setSelectedId(contacts[0]?.id || "");
  };

  const handleLogInteraction = () => {
    if (!selected) return;
    const date = new Date().toLocaleDateString();
    const type = prompt("Type:", "Email") || "Email";
    const subject = prompt("Subject:", "") || "";
    const outcome = prompt("Outcome:", "") || "";
    const next = prompt("Next action:", "") || "";
    const newInteraction = {
      id: "i" + (interactions.length + 1),
      date,
      contact: selected.name,
      type,
      subject,
      outcome,
      next,
    };
    setInteractions((prev) => [newInteraction, ...prev]);
  };

  if (!grant) return <p>Loading grant contacts...</p>;

  return (
    <div className="content">
      <div className="gms-wrap">
        <div className="gms-card">
          <div className="gms-flex-between">
            <div className="gms-head">Contact Summary</div>
          </div>
          <div className="gms-kpi-grid">
            <div className="gms-metric"><div className="gms-metric-value">{metrics.total}</div><div className="gms-subtle">Total Contacts</div></div>
            <div className="gms-metric"><div className="gms-metric-value">{metrics.keyStakeholders}</div><div className="gms-subtle">Key Stakeholders</div></div>
            <div className="gms-metric"><div className="gms-metric-value">{metrics.recentInteractions}</div><div className="gms-subtle">Recent Interactions</div></div>
          </div>
        </div>

        <div className="gms-card">
          <div className="gms-flex-between">
            <div className="gms-head">Contact Notes</div>
            <button className="gms-btn primary" onClick={handleSaveNotes}>Save Notes</button>
          </div>
          <textarea rows={8} value={notes} onChange={(e) => setNotes(e.target.value)} className="gms-notes" />
          <div className="gms-micro gms-mt8">Last updated: {notesTs || "Not saved yet"}</div>
        </div>

        <div className="gms-columns">
          <div className="gms-card">
            <div className="gms-flex-between">
              <div className="gms-head">Contact List</div>
              <button className="gms-btn" onClick={handleAddContact}>+ Add Contact</button>
            </div>
            <input className="gms-input contact-search" placeholder="Search contacts..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="gms-list">
              {filtered.map((c) => (
                <button key={c.id} className={`gms-list-item ${c.id === selectedId ? "active" : ""}`} onClick={() => setSelectedId(c.id)}>
                  <div className="gms-avatar">{initialsOf(c.name)}</div>
                  <div className="gms-list-text"><div className="gms-strong">{c.name}</div><div className="gms-subtle">{c.role}</div></div>
                  <div className="gms-spacer" />
                  <button className="gms-kebab" onClick={(e) => handleContactDelete(e, c.id)}>🗑️</button>
                </button>
              ))}
            </div>
          </div>

          <div className="gms-card">
            <div className="gms-flex-between">
              <div className="gms-head">Contact Details</div>
              <button className="gms-btn ghost" onClick={handleEditContact}>✏️ Edit</button>
            </div>
            {selected && (
              <>
                <div className="gms-detail-header">
                  <div className="gms-avatar lg">{initialsOf(selected.name)}</div>
                  <div>
                    <div className="gms-strong">{selected.name}</div>
                    <div className="gms-subtle">{selected.role}</div>
                    {selected.keyStakeholder && <div className="gms-badge key">Key Stakeholder</div>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
