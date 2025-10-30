import React from "react";
import "../../../styles/GrantDetailsLinks.css";

const GrantDetailsLinks = () => {
  const organizationalRelationships = [
    {
      name: "Global Education Alliance",
      role: "Parent Organization",
      since: "2021",
      status: "Active",
    },
    {
      name: "Tech for Good Foundation",
      role: "Partner Institution",
      since: "2022",
      status: "Active",
    },
    {
      name: "Community Foundation Trust",
      role: "Fiscal Sponsor",
      since: "2020",
      status: "Active",
    },
  ];

  const connectedGrants = [
    {
      title: "STEM Education Initiative",
      id: "155789",
      status: "Active",
      type: "Related Program",
      amount: "$75,000",
    },
    {
      title: "Teacher Development Fund",
      id: "155234",
      status: "Completed",
      type: "Companion Grant",
      amount: "$45,000",
    },
    {
      title: "Digital Learning Resources",
      id: "156012",
      status: "Pending",
      type: "Follow-up Grant",
      amount: "$60,000",
    },
  ];

  const keyContacts = [
    {
      initials: "MC",
      name: "Dr. Michael Chen",
      title: "Program Director",
      tag: "Primary",
      email: "m.chen@futurelearning.org",
      phone: "(415) 555-0142",
    },
    {
      initials: "SM",
      name: "Sarah Martinez",
      title: "Grant Manager",
      email: "s.martinez@futurelearning.org",
      phone: "(415) 555-0198",
    },
    {
      initials: "JW",
      name: "James Wilson",
      title: "Finance Officer",
      email: "j.wilson@futurelearning.org",
      phone: "(415) 555-0176",
    },
  ];

  return (
    <div className="links-wrapper">
      <div className="links-container">
        {/* Organizational Relationships */}
        <Section title="Organizational Relationships" actionLabel="+ Add Relationship">
          {organizationalRelationships.map((org, i) => (
            <OrgRelationship key={i} {...org} />
          ))}
        </Section>

        {/* Connected Grants */}
        <Section title="Connected Grants" actionLabel="+ Link Grant">
          {connectedGrants.map((grant, i) => (
            <ConnectedGrant key={i} {...grant} />
          ))}
        </Section>

        {/* Key Contacts */}
        <Section title="Key Contacts" actionLabel="+ Add Contact">
          {keyContacts.map((contact, i) => (
            <KeyContact key={i} {...contact} />
          ))}
        </Section>
      </div>
    </div>
  );
};

// --- Reusable Section Component ---
function Section({ title, actionLabel, children }) {
  return (
    <div className="links-section">
      <div className="links-section-header">
        <h3 className="links-section-title">{title}</h3>
        <button className="links-add-btn">{actionLabel}</button>
      </div>
      <div className="links-section-content">{children}</div>
    </div>
  );
}

// --- Subcomponents ---
function OrgRelationship({ name, role, since, status }) {
  return (
    <div className="links-card links-relationship-card">
      <div className="links-info">
        <div className="links-name">{name}</div>
        <div className="links-role">{role}</div>
        <div className="links-meta">Since {since}</div>
      </div>
      <div className="links-status">
        <span className={`links-status-tag ${status.toLowerCase()}`}>{status}</span>
      </div>
      <div className="links-actions">
        <i className="ri-external-link-line" title="Open"></i>
        <i className="ri-delete-bin-line" title="Delete"></i>
      </div>
    </div>
  );
}

function ConnectedGrant({ title, id, status, type, amount }) {
  return (
    <div className="links-card links-grant-card">
      <div className="links-grant-title">{title}</div>
      <div className="links-grant-details">
        <span>Grant ID: {id}</span> | <span>{type}</span> | <span>{amount}</span>
      </div>
      <div className="links-status">
        <span className={`links-status-tag ${status.toLowerCase()}`}>{status}</span>
      </div>
      <div className="links-actions">
        <i className="ri-external-link-line" title="Open"></i>
        <i className="ri-delete-bin-line" title="Delete"></i>
      </div>
    </div>
  );
}

function KeyContact({ initials, name, title, tag, email, phone }) {
  return (
    <div className="links-card links-contact-card">
      <div className="links-avatar">{initials}</div>
      <div className="links-contact-info">
        <div className="links-contact-name">
          {name} {tag && <span className="links-tag">{tag}</span>}
        </div>
        <div className="links-contact-role">{title}</div>
        <div className="links-contact-meta">
          <a href={`mailto:${email}`}>{email}</a> | {phone}
        </div>
      </div>
      <div className="links-actions">
        <i className="ri-mail-line" title="Email"></i>
        <i className="ri-delete-bin-line" title="Delete"></i>
      </div>
    </div>
  );
}

export default GrantDetailsLinks;
