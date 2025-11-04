import React, { useEffect, useMemo, useState } from "react";
import "../../../styles/GrantDetailsContacts.css";

const NOTES_KEY = "gms_contacts_notes";
const NOTES_TS_KEY = "gms_contacts_notes_ts";
const CONTACTS_KEY = "gms_contacts_list";
const INTERACTIONS_KEY = "gms_contacts_interactions";

function initialsOf(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

const INITIAL_CONTACTS = [
  {
    id: "c1",
    name: "Dr. Sarah Chen",
    role: "Principal Investigator",
    email: "s.chen@university.edu",
    phone: "(555) 123-4567",
    department: "Computer Science & Education",
    institution: "Future Learning University",
    lastContact: "March 8, 2024",
    keyStakeholder: true,
  },
  {
    id: "c2",
    name: "Michael Rodriguez",
    role: "Project Manager",
    email: "m.rodriguez@tech.org",
    phone: "(555) 555-9843",
    department: "Grants Admin",
    institution: "Tech Innovation Corp",
    lastContact: "March 5, 2024",
    keyStakeholder: false,
  },
  {
    id: "c3",
    name: "Emily Johnson",
    role: "Research Coordinator",
    email: "emily.j@research.edu",
    phone: "(555) 201-8899",
    department: "Research",
    institution: "Education Trust",
    lastContact: "March 1, 2024",
    keyStakeholder: false,
  },
  {
    id: "c4",
    name: "David Kim",
    role: "Financial Officer",
    email: "dkim@communitybank.com",
    phone: "(555) 220-0188",
    department: "Finance",
    institution: "Community Bank",
    lastContact: "Feb 28, 2024",
    keyStakeholder: false,
  },
  {
    id: "c5",
    name: "Lisa Thompson",
    role: "External Evaluator",
    email: "lisa.t@eval.org",
    phone: "(555) 300-7781",
    department: "Evaluation",
    institution: "Evaluation Partners",
    lastContact: "Feb 28, 2024",
    keyStakeholder: false,
  },
];

const INITIAL_INTERACTIONS = [
  {
    id: "i1",
    date: "Mar 8, 2024",
    contact: "Dr. Sarah Chen",
    type: "Email",
    subject: "Q1 Progress Review",
    outcome: "Report submitted on time",
    next: "Schedule Q2 review meeting",
  },
  {
    id: "i2",
    date: "Mar 5, 2024",
    contact: "Michael Rodriguez",
    type: "Phone",
    subject: "Budget adjustment discussion",
    outcome: "Approved 5% reallocation",
    next: "Update budget documents",
  },
  {
    id: "i3",
    date: "Mar 1, 2024",
    contact: "Emily Johnson",
    type: "Meeting",
    subject: "Data collection status",
    outcome: "75% completion achieved",
    next: "Plan final data collection phase",
  },
  {
    id: "i4",
    date: "Feb 28, 2024",
    contact: "Lisa Thompson",
    type: "Email",
    subject: "External evaluation timeline",
    outcome: "Timeline confirmed",
    next: "Send evaluation materials",
  },
];

export default function GrantDetailsContacts() {
  const [contacts, setContacts] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");
  const [notesTs, setNotesTs] = useState("");
  
useEffect(() => {
  // contacts
  const savedContacts = localStorage.getItem(CONTACTS_KEY);
  if (savedContacts) {
    const parsed = JSON.parse(savedContacts);
    setContacts(parsed);
    if (parsed[0]) setSelectedId(parsed[0].id);
  } else {
    // first time: use initial mock data
    setContacts(INITIAL_CONTACTS);
    setSelectedId(INITIAL_CONTACTS[0].id);
  }

  // interactions
  const savedInteractions = localStorage.getItem(INTERACTIONS_KEY);
  if (savedInteractions) {
    setInteractions(JSON.parse(savedInteractions));
  } else {
    setInteractions(INITIAL_INTERACTIONS);
  }
}, []);

useEffect(() => {
  if (contacts.length) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  }
}, [contacts]);

useEffect(() => {
  if (interactions.length) {
    localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(interactions));
  }
}, [interactions]);


  // load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(NOTES_KEY);
    const savedTs = localStorage.getItem(NOTES_TS_KEY);
    if (savedNotes != null) {
      setNotes(savedNotes);
    } else {
      // initial default if none saved yet
      setNotes(
        [
          "March 8, 2024: Discussed Q1 progress with Dr. Sarah Chen. All milestones on track. Need to schedule Q2 review meeting by end of month.",
          "March 5, 2024: Budget reallocation approved after discussion with Michael Rodriguez. 5% moved from equipment to personnel costs.",
          "",
          "Follow-up needed:",
          "- Send evaluation materials to Lisa Thompson",
          "- Update budget documentation",
          "- Schedule team meeting for Q2 planning",
        ].join("\n")
      );
    }
    if (savedTs != null) {
      setNotesTs(savedTs);
    }
  }, []);

  const selected = useMemo(
    () => contacts.find((c) => c.id === selectedId),
    [selectedId, contacts]
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
  }, [query, contacts]);

  const metrics = {
    total: contacts.length,
    // removed active contacts
    keyStakeholders: contacts.filter((c) => c.keyStakeholder).length,
    recentInteractions: interactions.length,
  };

  // --- handlers ---

  function handleSaveNotes() {
    const ts = new Date().toLocaleString();
    localStorage.setItem(NOTES_KEY, notes);
    localStorage.setItem(NOTES_TS_KEY, ts);
    setNotesTs(ts);
    alert("Notes saved.");
  }

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

function promptContactFields(existing = {}) {
  const name = prompt("Name:", existing.name || "");
  if (!name) return null;

  const email = prompt("Email:", existing.email || "") || "";
  const phone = prompt("Phone:", existing.phone || "") || "";
  const department = prompt("Department:", existing.department || "") || "";
  const institution = prompt("Institution:", existing.institution || "") || "";
  const role = prompt("Position / Job title:", existing.role || "") || "";
  const lastContact =
    prompt("Last contact date:", existing.lastContact || "") || "—";

  // ask about key stakeholder
  const ksAnswer = prompt(
    "Is this a key stakeholder? (yes/no)",
    existing.keyStakeholder ? "yes" : "no"
  );
  const keyStakeholder =
    ksAnswer && ksAnswer.toLowerCase().startsWith("y");

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


  function handleAddContact() {
    const data = promptContactFields();
    if (!data) return;
    const newContact = {
      id: "c" + (contacts.length + 1),
      ...data,
    };
    setContacts((prev) => [...prev, newContact]);
    setSelectedId(newContact.id);
  }

  function handleEditContact() {
    if (!selected) return;
    const data = promptContactFields(selected);
    if (!data) return;
    setContacts((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, ...data } : c))
    );
  }

  function handleContactDelete(e, contactId) {
    e.stopPropagation();
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    const ok = window.confirm(
      `Are you sure you want to remove ${contact.name}?`
    );
    if (!ok) return;
    const remaining = contacts.filter((c) => c.id !== contactId);
    setContacts(remaining);
    if (selectedId === contactId) {
      setSelectedId(remaining[0] ? remaining[0].id : "");
    }
  }

  function handleEmail() {
    if (!selected || !selected.email) {
      alert("No email for this contact.");
      return;
    }
    window.location.href = `mailto:${selected.email}`;
  }

  function handleLogInteraction() {
    const date =
      prompt("Date (e.g. Mar 10, 2024):", new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })) || "";
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
      id: "i" + (interactions.length + 1),
      date,
      contact: contactName,
      type,
      subject,
      outcome,
      next,
    };
    setInteractions((prev) => [newInteraction, ...prev]);
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

  function handleEditInteraction(id) {
    const interaction = interactions.find((i) => i.id === id);
    if (!interaction) return;
    const date = prompt("Date:", interaction.date) || interaction.date;
    const contact = prompt("Contact:", interaction.contact) || interaction.contact;
    const typeRaw =
      prompt(
        "Type (email, phone, meeting, other):",
        interaction.type
      ) || interaction.type;
    const type = normalizeType(typeRaw);
    const subject = prompt("Subject:", interaction.subject) || interaction.subject;
    const outcome = prompt("Outcome:", interaction.outcome) || interaction.outcome;
    const next = prompt("Next action:", interaction.next) || interaction.next;

    setInteractions((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, date, contact, type, subject, outcome, next }
          : i
      )
    );
  }

  function handleDeleteInteraction(id) {
    const it = interactions.find((i) => i.id === id);
    if (!it) return;
    const ok = window.confirm(`Delete interaction with ${it.contact}?`);
    if (!ok) return;
    setInteractions((prev) => prev.filter((i) => i.id !== id));
  }

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
            {/* removed Active Contacts */}
            <Metric label="Key Stakeholders" value={metrics.keyStakeholders} />
            <Metric
              label="Recent Interactions"
              value={metrics.recentInteractions}
            />
          </div>
        </div>

        {/* notes */}
        <div className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div className="gms-head">
              <span className="gms-ico">📄</span> Contact Notes
            </div>
            <button className="gms-btn primary" onClick={handleSaveNotes}>
              Save Notes
            </button>
          </div>
          <textarea
            className="gms-notes"
            rows={8}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="gms-micro gms-mt8">
            Last updated: {notesTs ? notesTs : "Not saved yet"}
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
                  {/* removed status badge */}
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
                  {/* removed Call / Message */}
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
              <button className="gms-btn ghost" onClick={handleExportInteractions}>
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

/* helpers */
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

function normalizeType(t = "") {
  const v = t.trim().toLowerCase();
  if (v === "email") return "Email";
  if (v === "phone") return "Phone";
  if (v === "meeting") return "Meeting";
  return "Other";
}


