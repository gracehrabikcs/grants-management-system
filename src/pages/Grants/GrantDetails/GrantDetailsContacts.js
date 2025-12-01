import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetailsContacts.css";

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase"; // adjust if your path is different

/* -------------------- Helpers -------------------- */

function initialsOf(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizeType(t = "") {
  const v = t.trim().toLowerCase();
  if (v === "email") return "Email";
  if (v === "phone") return "Phone";
  if (v === "meeting") return "Meeting";
  return "Other";
}

function downloadCsv(filename, rows) {
  const processRow = (row) =>
    row
      .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
      .join(",");
  const csvContent = rows.map(processRow).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.click();
  URL.revokeObjectURL(url);
}

/* -------------------- Component -------------------- */

export default function GrantDetailsContacts() {
  const { id: grantId } = useParams(); // grant id from route

  const [contacts, setContacts] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");

  // modal state for per-contact notes
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  /* ---------- Load contacts + interactions from Firestore ---------- */

  useEffect(() => {
    if (!grantId) return;

    const contactsRef = collection(db, "grants", String(grantId), "contacts");
    const interactionsRef = collection(
      db,
      "grants",
      String(grantId),
      "interactions"
    );

    async function load() {
      try {
        // contacts
        const snapContacts = await getDocs(contactsRef);
        const loadedContacts = snapContacts.docs.map((d) => {
          const data = d.data();
          let notesUpdatedAt = "";
          if (data.notesUpdatedAt?.toDate) {
            notesUpdatedAt = data.notesUpdatedAt
              .toDate()
              .toLocaleString();
          }
          return {
            id: d.id,
            ...data,
            notes: data.notes || "",
            notesUpdatedAt,
          };
        });
        setContacts(loadedContacts);
        if (loadedContacts[0]) {
          setSelectedId(loadedContacts[0].id);
        }

        // interactions
        const snapInteractions = await getDocs(interactionsRef);
        const loadedInteractions = snapInteractions.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        // sort most recent first by whatever "date" string they have
        loadedInteractions.sort((a, b) =>
          (b.date || "").localeCompare(a.date || "")
        );
        setInteractions(loadedInteractions);
      } catch (err) {
        console.error("Error loading contacts/interactions:", err);
      }
    }

    load();
  }, [grantId]);

  /* ---------- Derived values ---------- */

  const selected = useMemo(
    () => contacts.find((c) => c.id === selectedId),
    [selectedId, contacts]
  );

const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();
  if (!q) return contacts;
  return contacts.filter(
    (c) =>
      c.name?.toLowerCase().includes(q) ||
      c.role?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.institution?.toLowerCase().includes(q)
  );
}, [query, contacts]);


  const metrics = {
    total: contacts.length,
    keyStakeholders: contacts.filter((c) => c.keyStakeholder).length,
    recentInteractions: interactions.length,
  };

  /* ---------- Notes modal handlers ---------- */

  function openNotesModal() {
    if (!selected) return;
    setNotesDraft(selected.notes || "");
    setIsNotesOpen(true);
  }

  function closeNotesModal() {
    if (isSavingNotes) return;
    setIsNotesOpen(false);
  }

  async function handleSaveNotesForContact() {
    if (!selected || !grantId) return;
    setIsSavingNotes(true);

    try {
      const ref = doc(
        db,
        "grants",
        String(grantId),
        "contacts",
        selected.id
      );

      await updateDoc(ref, {
        notes: notesDraft,
        notesUpdatedAt: serverTimestamp(),
      });

      // update local state so UI shows latest without reload
      const tsLocal = new Date().toLocaleString();
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? { ...c, notes: notesDraft, notesUpdatedAt: tsLocal }
            : c
        )
      );

      setIsNotesOpen(false);
    } catch (err) {
      console.error("Error saving contact notes:", err);
      alert("Could not save notes. Check console for details.");
    } finally {
      setIsSavingNotes(false);
    }
  }

  async function handleClearNotesForContact() {
    if (!selected || !grantId) return;
    const ok = window.confirm(
      `Clear all notes for ${selected.name}?`
    );
    if (!ok) return;

    setIsSavingNotes(true);
    try {
      const ref = doc(
        db,
        "grants",
        String(grantId),
        "contacts",
        selected.id
      );
      await updateDoc(ref, {
        notes: "",
        notesUpdatedAt: serverTimestamp(),
      });

      const tsLocal = new Date().toLocaleString();
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? { ...c, notes: "", notesUpdatedAt: tsLocal }
            : c
        )
      );
      setNotesDraft("");
    } catch (err) {
      console.error("Error clearing notes:", err);
      alert("Could not clear notes. Check console for details.");
    } finally {
      setIsSavingNotes(false);
    }
  }

  /* ---------- Contact CRUD (still via prompts) ---------- */

  function promptContactFields(existing = {}) {
    const name = prompt("Name:", existing.name || "");
    if (!name) return null;

    const email = prompt("Email:", existing.email || "") || "";
    const phone = prompt("Phone:", existing.phone || "") || "";
    const department = prompt("Department:", existing.department || "") || "";
    const institution =
      prompt("Institution:", existing.institution || "") || "";
    const role = prompt("Position / Job title:", existing.role || "") || "";
    const lastContact =
      prompt("Last contact date:", existing.lastContact || "") || "—";

    const ksAnswer = prompt(
      "Is this a key stakeholder? (yes/no)",
      existing.keyStakeholder ? "yes" : "no"
    );
    const keyStakeholder = ksAnswer && ksAnswer.toLowerCase().startsWith("y");

    return {
      name,
      email,
      phone,
      department,
      institution,
      role,
      lastContact,
      keyStakeholder,
    };
  }

  async function handleAddContact() {
    if (!grantId) return;
    const data = promptContactFields();
    if (!data) return;

    try {
      const contactsRef = collection(
        db,
        "grants",
        String(grantId),
        "contacts"
      );
      const docRef = await addDoc(contactsRef, {
        ...data,
        notes: "",
        notesUpdatedAt: null,
      });
      const newContact = {
        id: docRef.id,
        ...data,
        notes: "",
        notesUpdatedAt: "",
      };
      setContacts((prev) => [...prev, newContact]);
      setSelectedId(newContact.id);
    } catch (err) {
      console.error("Error adding contact:", err);
      alert("Could not add contact. Check console for details.");
    }
  }

  async function handleEditContact() {
    if (!selected || !grantId) return;
    const data = promptContactFields(selected);
    if (!data) return;

    try {
      const ref = doc(
        db,
        "grants",
        String(grantId),
        "contacts",
        selected.id
      );
      await updateDoc(ref, data);

      setContacts((prev) =>
        prev.map((c) =>
          c.id === selected.id ? { ...c, ...data } : c
        )
      );
    } catch (err) {
      console.error("Error updating contact:", err);
      alert("Could not update contact. Check console for details.");
    }
  }

  async function handleContactDelete(e, contactId) {
    e.stopPropagation();
    if (!grantId) return;

    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    const ok = window.confirm(
      `Are you sure you want to remove ${contact.name}?`
    );
    if (!ok) return;

    try {
      const ref = doc(
        db,
        "grants",
        String(grantId),
        "contacts",
        contactId
      );
      await deleteDoc(ref);

      const remaining = contacts.filter((c) => c.id !== contactId);
      setContacts(remaining);
      if (selectedId === contactId) {
        setSelectedId(remaining[0] ? remaining[0].id : "");
      }
    } catch (err) {
      console.error("Error deleting contact:", err);
      alert("Could not delete contact. Check console for details.");
    }
  }

  function handleEmail() {
    if (!selected || !selected.email) {
      alert("No email for this contact.");
      return;
    }
    window.location.href = `mailto:${selected.email}`;
  }

  /* ---------- Interaction handlers (still prompt-based) ---------- */

  async function handleLogInteraction() {
    if (!grantId) return;

    const date =
      prompt(
        "Date (e.g. Mar 10, 2024):",
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      ) || "";
    const contactName = prompt(
      "Contact name:",
      selected ? selected.name : ""
    );
    if (!contactName) return;
    const typeRaw = prompt(
      "Type (email, phone, meeting, other):",
      "email"
    );
    const type = normalizeType(typeRaw);
    const subject = prompt("Subject:", "") || "";
    const outcome = prompt("Outcome:", "") || "";
    const next = prompt("Next action:", "") || "";

    const newInteraction = {
      date,
      contact: contactName,
      type,
      subject,
      outcome,
      next,
    };

    try {
      const interactionsRef = collection(
        db,
        "grants",
        String(grantId),
        "interactions"
      );
      const docRef = await addDoc(interactionsRef, newInteraction);
      setInteractions((prev) => [
        { id: docRef.id, ...newInteraction },
        ...prev,
      ]);
    } catch (err) {
      console.error("Error logging interaction:", err);
      alert("Could not log interaction. Check console for details.");
    }
  }

  async function handleEditInteraction(id) {
    if (!grantId) return;
    const interaction = interactions.find((i) => i.id === id);
    if (!interaction) return;

    const date = prompt("Date:", interaction.date) || interaction.date;
    const contact =
      prompt("Contact:", interaction.contact) || interaction.contact;
    const typeRaw =
      prompt(
        "Type (email, phone, meeting, other):",
        interaction.type
      ) || interaction.type;
    const type = normalizeType(typeRaw);
    const subject =
      prompt("Subject:", interaction.subject) || interaction.subject;
    const outcome =
      prompt("Outcome:", interaction.outcome) || interaction.outcome;
    const next =
      prompt("Next action:", interaction.next) || interaction.next;

    const updated = { date, contact, type, subject, outcome, next };

    try {
      const ref = doc(
        db,
        "grants",
        String(grantId),
        "interactions",
        id
      );
      await updateDoc(ref, updated);
      setInteractions((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updated } : i))
      );
    } catch (err) {
      console.error("Error updating interaction:", err);
      alert("Could not update interaction. Check console for details.");
    }
  }

  async function handleDeleteInteraction(id) {
    if (!grantId) return;
    const it = interactions.find((i) => i.id === id);
    if (!it) return;
    const ok = window.confirm(`Delete interaction with ${it.contact}?`);
    if (!ok) return;

    try {
      const ref = doc(
        db,
        "grants",
        String(grantId),
        "interactions",
        id
      );
      await deleteDoc(ref);
      setInteractions((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Error deleting interaction:", err);
      alert("Could not delete interaction. Check console for details.");
    }
  }

  /* ---------- Export handlers ---------- */

  function handleExportContacts() {
    const header = [
      "Name",
      "Position",
      "Email",
      "Phone",
      "Department",
      "Institution",
      "Last Contact",
    ];
    const rows = contacts.map((c) => [
      c.name,
      c.role,
      c.email,
      c.phone,
      c.department,
      c.institution,
      c.lastContact,
    ]);
    downloadCsv("contacts_export.csv", [header, ...rows]);
  }

  function handleExportInteractions() {
    const header = [
      "Date",
      "Contact",
      "Type",
      "Subject",
      "Outcome",
      "Next Action",
    ];
    const rows = interactions.map((i) => [
      i.date,
      i.contact,
      i.type,
      i.subject,
      i.outcome,
      i.next,
    ]);
    downloadCsv("interactions_export.csv", [header, ...rows]);
  }

  /* ---------- Render ---------- */

  return (
    <div className="content">
      <div className="gms-wrap">
        {/* Contact summary */}
        <div className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div className="gms-head">Contact Summary</div>
            <button className="gms-btn ghost" onClick={handleExportContacts}>
              Export
            </button>
          </div>
          <div className="gms-kpi-grid">
            <Metric label="Total Contacts" value={metrics.total} />
            <Metric
              label="Key Stakeholders"
              value={metrics.keyStakeholders}
            />
            <Metric
              label="Recent Interactions"
              value={metrics.recentInteractions}
            />
          </div>
        </div>

        {/* columns */}
        <div className="gms-columns">
          {/* list */}
          <div className="gms-card">
            <div className="gms-flex-between gms-mb8">
              <div className="gms-head">Contact List</div>
              <div className="gms-flex gap8">
                <button className="gms-btn" onClick={handleAddContact}>
                  + Add Contact
                </button>
              </div>
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
                    title="Delete contact"
                  >
                    🗑️
                  </button>
                </button>
              ))}
            </div>
          </div>

          {/* details */}
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
                  <button className="gms-btn ghost" onClick={handleEmail}>
                    ✉️ Email
                  </button>
                  {/* 👉 New per-contact notes button */}
                  <button className="gms-btn ghost" onClick={openNotesModal}>
                    📝 Contact Notes
                  </button>
                </div>

                <div className="gms-micro gms-mt8">
                  Notes last updated:{" "}
                  {selected.notesUpdatedAt || "No notes yet"}
                </div>
              </>
            )}
          </div>
        </div>

        {/* interactions */}
        <div className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div className="gms-head">Interaction Tracking</div>
            <div className="gms-flex gap8">
              <button className="gms-btn" onClick={handleLogInteraction}>
                + Log Interaction
              </button>
              <button
                className="gms-btn ghost"
                onClick={handleExportInteractions}
              >
                Export
              </button>
            </div>
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
                    <td className="gms-flex gap8">
                      <button
                        className="gms-kebab"
                        title="Edit interaction"
                        onClick={() => handleEditInteraction(row.id)}
                      >
                        ✏️
                      </button>
                      <button
                        className="gms-kebab"
                        title="Delete interaction"
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

      {/* ---------- Notes Modal ---------- */}
      {isNotesOpen && selected && (
        <div
          className="gms-notes-modal-overlay"
          onClick={closeNotesModal}
        >
          <div
            className="gms-notes-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gms-notes-modal-header">
              <div className="gms-head">
                Notes for {selected.name}
              </div>
              <button
                className="gms-kebab gms-notes-close"
                onClick={closeNotesModal}
                aria-label="Close notes"
              >
                ✕
              </button>
            </div>

            <textarea
              className="gms-notes"
              rows={8}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Type notes about this contact..."
            />

            <div className="gms-micro gms-mt8">
              Last updated:{" "}
              {selected.notesUpdatedAt || "Not saved yet"}
            </div>

            <div className="gms-notes-modal-footer">
              <button
                className="gms-btn"
                onClick={handleClearNotesForContact}
                disabled={isSavingNotes}
              >
                Clear
              </button>
              <div className="gms-spacer" />
              <button
                className="gms-btn"
                onClick={closeNotesModal}
                disabled={isSavingNotes}
              >
                Cancel
              </button>
              <button
                className="gms-btn primary"
                onClick={handleSaveNotesForContact}
                disabled={isSavingNotes}
              >
                {isSavingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* tiny subcomponents */
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



