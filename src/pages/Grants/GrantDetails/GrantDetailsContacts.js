import React, { useMemo, useState } from "react";
import "../../../styles/GrantDetailsContacts.css";

function initialsOf(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

const MOCK_CONTACTS = [
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
    status: "Active",
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
    status: "Active",
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
    status: "Active",
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
    status: "Inactive",
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
    status: "Active",
  },
];

const MOCK_INTERACTIONS = [
  { date: "Mar 8, 2024", contact: "Dr. Sarah Chen", type: "Email", subject: "Q1 Progress Review", outcome: "Report submitted on time", next: "Schedule Q2 review meeting" },
  { date: "Mar 5, 2024", contact: "Michael Rodriguez", type: "Phone", subject: "Budget adjustment discussion", outcome: "Approved 5% reallocation", next: "Update budget documents" },
  { date: "Mar 1, 2024", contact: "Emily Johnson", type: "Meeting", subject: "Data collection status", outcome: "75% completion achieved", next: "Plan final data collection phase" },
  { date: "Feb 28, 2024", contact: "Lisa Thompson", type: "Email", subject: "External evaluation timeline", outcome: "Timeline confirmed", next: "Send evaluation materials" },
];

export default function GrantDetailsContacts() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(MOCK_CONTACTS[0].id);
  const [notes, setNotes] = useState(
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

  const selected = useMemo(
    () => MOCK_CONTACTS.find((c) => c.id === selectedId),
    [selectedId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_CONTACTS;
    return MOCK_CONTACTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [query]);

  const metrics = {
    total: MOCK_CONTACTS.length,
    active: MOCK_CONTACTS.filter((c) => c.status === "Active").length,
    keyStakeholders: MOCK_CONTACTS.filter((c) => c.keyStakeholder).length,
    recentInteractions: MOCK_INTERACTIONS.length,
  };

  function handleSaveNotes() {
    // Hook API here
    alert("Notes saved (mock).");
  }

  return (
    <div className="content">
      <div className="gms-wrap">
       
        <div className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div className="gms-head">Contact Summary</div>
            <button className="gms-btn ghost">Export</button>
          </div>
          <div className="gms-kpi-grid">
            <Metric label="Total Contacts" value={metrics.total} />
            <Metric label="Active Contacts" value={metrics.active} />
            <Metric label="Key Stakeholders" value={metrics.keyStakeholders} />
            <Metric label="Recent Interactions" value={metrics.recentInteractions} />
          </div>
        </div>

        <div className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div className="gms-head"><span className="gms-ico">📄</span> Contact Notes</div>
            <button className="gms-btn primary" onClick={handleSaveNotes}>Save Notes</button>
          </div>
          <textarea
            className="gms-notes"
            rows={8}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="gms-micro gms-mt8">Last updated: March 8, 2024 at 2:30 PM</div>
        </div>

       
        <div className="gms-columns">
      
          <div className="gms-card">
            <div className="gms-flex-between gms-mb8">
              <div className="gms-head">Contact List</div>
              <div className="gms-flex gap8">
                <button className="gms-btn">+ Add Contact</button>
                <button className="gms-btn ghost">🔍</button>
              </div>
            </div>

            <input
              className="gms-input"
              placeholder="Search contacts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="gms-list">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  className={`gms-list-item ${c.id === selectedId ? "active" : ""}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="gms-avatar">{initialsOf(c.name)}</div>
                  <div className="gms-list-text">
                    <div className="gms-strong">{c.name}</div>
                    <div className="gms-subtle">{c.role}</div>
                  </div>
                  <div className="gms-spacer" />
                  <span className={`gms-badge ${c.status === "Active" ? "dark" : ""}`}>
                    {c.status}
                  </span>
                  <button className="gms-kebab" onClick={(e) => e.preventDefault()}>⋯</button>
                </button>
              ))}
            </div>
          </div>

          
          <div className="gms-card">
            <div className="gms-flex-between gms-mb8">
              <div className="gms-head">Contact Details</div>
              <button className="gms-btn ghost">✏️ Edit</button>
            </div>

            {selected && (
              <>
                <div className="gms-detail-header">
                  <div className="gms-avatar lg">{initialsOf(selected.name)}</div>
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
                  <button className="gms-btn ghost">✉️ Email</button>
                  <button className="gms-btn ghost">📞 Call</button>
                  <button className="gms-btn ghost">💬 Message</button>
                </div>
              </>
            )}
          </div>
        </div>

        
        <div className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div className="gms-head">Interaction Tracking</div>
            <div className="gms-flex gap8">
              <button className="gms-btn">+ Log Interaction</button>
              <button className="gms-btn ghost">Export</button>
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
                </tr>
              </thead>
              <tbody>
                {MOCK_INTERACTIONS.map((row, i) => (
                  <tr key={i}>
                    <td>{row.date}</td>
                    <td>{row.contact}</td>
                    <td><span className="gms-pill">{row.type}</span></td>
                    <td>{row.subject}</td>
                    <td>{row.outcome}</td>
                    <td className="gms-flex-between">
                      <span>{row.next}</span>
                      <button className="gms-kebab" title="Edit next action">✏️</button>
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

