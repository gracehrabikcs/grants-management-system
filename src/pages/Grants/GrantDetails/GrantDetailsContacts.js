import React, { useEffect, useMemo, useState } from "react";
import "../../../styles/GrantDetailsContacts.css";
import { useParams } from "react-router-dom";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase"; // <-- YOUR firebase.js

/* ------------------ Helpers ------------------ */

function initialsOf(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizeType(t = "") {
  const v = t.trim().toLowerCase();
  if (v === "email") return "Email";
  if (v === "phone") return "Phone";
  if (v === "meeting") return "Meeting";
  return "Other";
}

/* ------------------------------------------------ */

export default function GrantDetailsContacts() {
  const { id: grantId } = useParams();

  const [contacts, setContacts] = useState([]);
  const [interactions, setInteractions] = useState([]);

  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");

  const [notesDraft, setNotesDraft] = useState("");
  const [notesTs, setNotesTs] = useState("");
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  /* ---------------- Load data from Firestore ---------------- */

  useEffect(() => {
    async function loadContacts() {
      const snap = await getDocs(collection(db, "grants", grantId, "contacts"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setContacts(list);
      if (list.length > 0) setSelectedId(list[0].id);
    }

    async function loadInteractions() {
      const snap = await getDocs(
        collection(db, "grants", grantId, "interactions")
      );
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setInteractions(list);
    }

    loadContacts();
    loadInteractions();
  }, [grantId]);

  const selected = useMemo(
    () => contacts.find((c) => c.id === selectedId),
    [selectedId, contacts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [query, contacts]);

  /* ---------------- Save Notes ---------------- */

  function openNotesModal() {
    if (!selected) return;
    setNotesDraft(selected.notes || "");
    setNotesTs(selected.notesUpdatedAt?.toDate?.()?.toLocaleString() || "");
    setIsNotesOpen(true);
  }

  function closeNotesModal() {
    setIsNotesOpen(false);
  }

  async function handleSaveNotes() {
    if (!selected) return;

    const ref = doc(db, "grants", grantId, "contacts", selected.id);

    await updateDoc(ref, {
      notes: notesDraft,
      notesUpdatedAt: serverTimestamp(),
    });

    // reload the contacts to update UI time
    const snap = await getDocs(collection(db, "grants", grantId, "contacts"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setContacts(list);

    closeNotesModal();
  }

  /* ---------------- Add Contact ---------------- */

  function promptContactFields(existing = {}) {
    const name = prompt("Name:", existing.name || "");
    if (!name) return null;

    return {
      name,
      email: prompt("Email:", existing.email || "") || "",
      phone: prompt("Phone:", existing.phone || "") || "",
      department: prompt("Department:", existing.department || "") || "",
      institution: prompt("Institution:", existing.institution || "") || "",
      role: prompt("Role:", existing.role || "") || "",
      lastContact: prompt("Last contact date:", existing.lastContact || "") || "",
      keyStakeholder:
        (prompt(
          "Is key stakeholder? (yes/no)",
          existing.keyStakeholder ? "yes" : "no"
        ) ?? "")
          .trim()
          .toLowerCase()
          .startsWith("y"),
    };
  }

  async function handleAddContact() {
    const data = promptContactFields();
    if (!data) return;

    await addDoc(collection(db, "grants", grantId, "contacts"), {
      ...data,
      notes: "",
      notesUpdatedAt: null,
    });

    // reload contacts
    const snap = await getDocs(collection(db, "grants", grantId, "contacts"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setContacts(list);
  }

  /* ---------------- Edit Contact ---------------- */

  async function handleEditContact() {
    if (!selected) return;
    const data = promptContactFields(selected);
    if (!data) return;

    const ref = doc(db, "grants", grantId, "contacts", selected.id);
    await updateDoc(ref, data);

    const snap = await getDocs(collection(db, "grants", grantId, "contacts"));
    setContacts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  /* ---------------- Delete Contact ---------------- */

  async function handleContactDelete(e, contactId) {
    e.stopPropagation();
    const target = contacts.find((c) => c.id === contactId);
    if (!target) return;

    if (!window.confirm(`Delete ${target.name}?`)) return;

    await deleteDoc(doc(db, "grants", grantId, "contacts", contactId));

    const snap = await getDocs(collection(db, "grants", grantId, "contacts"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setContacts(list);
    if (list[0]) setSelectedId(list[0].id);
  }

  /* ---------------- Log Interaction ---------------- */

  async function handleLogInteraction() {
    const date =
      prompt("Date (e.g. Mar 10, 2024):", "") || new Date().toDateString();
    const contact = prompt("Contact name:", selected?.name || "");
    if (!contact) return;

    const typeRaw = prompt("Type (email, phone, meeting, other):", "email");
    const type = normalizeType(typeRaw);

    const subject = prompt("Subject:", "") || "";
    const outcome = prompt("Outcome:", "") || "";
    const next = prompt("Next Action:", "") || "";

    await addDoc(collection(db, "grants", grantId, "interactions"), {
      date,
      contact,
      type,
      subject,
      outcome,
      next,
    });

    const snap = await getDocs(collection(db, "grants", grantId, "interactions"));
    setInteractions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  /* ---------------- Delete Interaction ---------------- */

  async function handleDeleteInteraction(id) {
    if (!window.confirm("Delete interaction?")) return;

    await deleteDoc(doc(db, "grants", grantId, "interactions", id));

    const snap = await getDocs(collection(db, "grants", grantId, "interactions"));
    setInteractions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  /* -------------------------------------------------- */

  const metrics = {
    total: contacts.length,
    keyStakeholders: contacts.filter((c) => c.keyStakeholder).length,
    recentInteractions: interactions.length,
  };

  /* ------------------- UI ------------------- */

  return (
    <div className="content">
      <div className="gms-wrap">
        
        {/* Summary */}
        <div className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div className="gms-head">Contact Summary</div>
          </div>
          <div className="gms-kpi-grid">
            <Metric label="Total Contacts" value={metrics.total} />
            <Metric label="Key Stakeholders" value={metrics.keyStakeholders} />
            <Metric
              label="Recent Interactions"
              value={metrics.recentInteractions}
            />
          </div>
        </div>

        {/* Contact Notes */}
        {selected && (
          <div className="gms-card">
            <div className="gms-flex-between gms-mb8">
              <div className="gms-head">Notes for {selected.name}</div>
              <button className="gms-btn primary" onClick={openNotesModal}>
                ✏️ Edit Notes
              </button>
            </div>

            <div className="gms-micro">
              Last updated:{" "}
              {selected.notesUpdatedAt?.toDate?.()?.toLocaleString() ||
                "No notes yet"}
            </div>
          </div>
        )}

        {/* List + Details */}
        <div className="gms-columns">
          {/* List */}
          <div className="gms-card">
            <div className="gms-flex-between gms-mb8">
              <div className="gms-head">Contact List</div>
              <button className="gms-btn" onClick={handleAddContact}>
                + Add Contact
              </button>
            </div>

            <input
              className="gms-input contact-search"
              placeholder="Search contacts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="gms-list">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  className={`gms-list-item ${
                    c.id === selectedId ? "active" : ""
                  }`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="gms-avatar">{initialsOf(c.name)}</div>
                  <div className="gms-list-text">
                    <div className="gms-strong">{c.name}</div>
                    <div className="gms-subtle">{c.role}</div>
                  </div>
                  <div className="gms-spacer" />
                  <button
                    className="gms-kebab"
                    onClick={(e) => handleContactDelete(e, c.id)}
                  >
                    🗑️
                  </button>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="gms-card">
            <div className="gms-flex-between gms-mb8">
              <div className="gms-head">Contact Details</div>
              <button className="gms-btn ghost" onClick={handleEditContact}>
                ✏️ Edit
              </button>
            </div>

            {selected && (
              <>
                <div className="gms-detail-header">
                  <div className="gms-avatar lg">
                    {initialsOf(selected.name)}
                  </div>
                  <div>
                    <div className="gms-strong">{selected.name}</div>
                    <div className="gms-subtle">{selected.role}</div>
                    {selected.keyStakeholder && (
                      <div className="gms-badge key">Key Stakeholder</div>
                    )}
                  </div>
                </div>

                <hr className="gms-hr" />

                <Detail label="Email" value={selected.email} />
                <Detail label="Phone" value={selected.phone} />
                <Detail label="Department" value={selected.department} />
                <Detail label="Institution" value={selected.institution} />
                <Detail label="Last Contact" value={selected.lastContact} />

                <div className="gms-actions">
                  <button className="gms-btn ghost" onClick={() => window.location.href = `mailto:${selected.email}`}>
                    ✉️ Email
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Interactions */}
        <div className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div className="gms-head">Interaction Tracking</div>
            <button className="gms-btn" onClick={handleLogInteraction}>
              + Log Interaction
            </button>
          </div>

          <div className="gms-table-wrap">
            <table className="gms-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Outcome</th>
                  <th>Next Action</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {interactions.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.contact}</td>
                    <td>
                      <span className="gms-pill">{row.type}</span>
                    </td>
                    <td>{row.subject}</td>
                    <td>{row.outcome}</td>
                    <td>{row.next}</td>
                    <td>
                      <button
                        className="gms-kebab"
                        onClick={() => handleDeleteInteraction(row.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* NOTES MODAL */}
      {isNotesOpen && selected && (
        <div className="gms-notes-modal-overlay" onClick={closeNotesModal}>
          <div className="gms-notes-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gms-notes-modal-header">
              <div className="gms-head">Notes – {selected.name}</div>
              <button className="gms-kebab" onClick={closeNotesModal}>
                ✕
              </button>
            </div>

            <textarea
              className="gms-notes"
              rows={8}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
            />

            <div className="gms-micro gms-mt8">
              Last updated: {notesTs || "Not saved yet"}
            </div>

            <div className="gms-notes-modal-footer">
              <button className="gms-btn" onClick={closeNotesModal}>
                Cancel
              </button>
              <button className="gms-btn primary" onClick={handleSaveNotes}>
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Tiny Components */

function Metric({ label, value }) {
  return (
    <div className="gms-metric">
      <div className="gms-metric-value">{value}</div>
      <div className="gms-subtle">{label}</div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="gms-detail-row">
      <div className="gms-subtle">{label}</div>
      <div>{value}</div>
    </div>
  );
}



