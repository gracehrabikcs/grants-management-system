import React, { useState, useEffect } from "react";
import "../../../styles/GrantDetailsLinks.css";


const GrantDetailsLinks = ({ grantId }) => {
  const [organizationalRelationships, setOrganizationalRelationships] = useState([]);
  const [connectedGrants, setConnectedGrants] = useState([]);
  const [keyContacts, setKeyContacts] = useState([]);

  useEffect(() => {
    fetch("/data/links.json")
      .then((res) => res.json())
      .then((data) => {
        const grantData = data[grantId] || {
          organizationalRelationships: [],
          connectedGrants: [],
          keyContacts: [],
        };
        setOrganizationalRelationships(grantData.organizationalRelationships);
        setConnectedGrants(grantData.connectedGrants);
        setKeyContacts(grantData.keyContacts);
      })
      .catch(console.error);
  }, [grantId]);

  // --- Add Handlers ---
  const handleAddOrg = () => {
    const name = prompt("Enter Organization Name:");
    if (!name) return;
    const role = prompt("Enter Role:");
    const since = prompt("Enter Since Year:");
    const status = prompt("Enter Status (Active/Inactive):") || "Active";
    setOrganizationalRelationships([
      ...organizationalRelationships,
      { name, role, since, status },
    ]);
  };

  const handleAddGrant = () => {
    const title = prompt("Enter Grant Title:");
    if (!title) return;
    const id = prompt("Enter Grant ID:");
    const type = prompt("Enter Grant Type:");
    const amount = prompt("Enter Amount:");
    const status = prompt("Enter Status (Active/Completed/Pending):") || "Active";
    setConnectedGrants([
      ...connectedGrants,
      { title, id, type, amount, status },
    ]);
  };

  const handleAddContact = () => {
    const initials = prompt("Enter Initials:");
    if (!initials) return;
    const name = prompt("Enter Name:");
    const title = prompt("Enter Title:");
    const tag = prompt("Enter Tag (optional):");
    const email = prompt("Enter Email:");
    const phone = prompt("Enter Phone:");
    setKeyContacts([
      ...keyContacts,
      { initials, name, title, tag, email, phone },
    ]);
  };

  // --- Delete Handlers ---
  const handleDeleteOrg = (index) => {
    setOrganizationalRelationships(
      organizationalRelationships.filter((_, i) => i !== index)
    );
  };

  const handleDeleteGrant = (index) => {
    setConnectedGrants(connectedGrants.filter((_, i) => i !== index));
  };

  const handleDeleteContact = (index) => {
    setKeyContacts(keyContacts.filter((_, i) => i !== index));
  };

  return (
    <div className="links-wrapper">
      <div className="links-container">
        <Section title="Organizational Relationships" actionLabel="+ Add Relationship" onAdd={handleAddOrg}>
          {organizationalRelationships.map((org, i) => (
            <OrgRelationship key={i} {...org} onDelete={() => handleDeleteOrg(i)} />
          ))}
        </Section>

        <Section title="Connected Grants" actionLabel="+ Link Grant" onAdd={handleAddGrant}>
          {connectedGrants.map((grant, i) => (
            <ConnectedGrant key={i} {...grant} onDelete={() => handleDeleteGrant(i)} />
          ))}
        </Section>

        <Section title="Key Contacts" actionLabel="+ Add Contact" onAdd={handleAddContact}>
          {keyContacts.map((contact, i) => (
            <KeyContact key={i} {...contact} onDelete={() => handleDeleteContact(i)} />
          ))}
        </Section>
      </div>
    </div>
  );
};

// --- Reusable Section Component ---
function Section({ title, actionLabel, children, onAdd }) {
  return (
    <div className="links-section">
      <div className="links-section-header">
        <h3 className="links-section-title">{title}</h3>
        <button className="links-add-btn" onClick={onAdd}>{actionLabel}</button>
      </div>
      <div className="links-section-content">{children}</div>
    </div>
  );
}

// --- Subcomponents ---
function OrgRelationship({ name, role, since, status, onDelete }) {
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
        <i className="ri-delete-bin-line" title="Delete" onClick={onDelete}></i>
      </div>
    </div>
  );
}

function ConnectedGrant({ title, id, status, type, amount, onDelete }) {
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
        <i className="ri-delete-bin-line" title="Delete" onClick={onDelete}></i>
      </div>
    </div>
  );
}

function KeyContact({ initials, name, title, tag, email, phone, onDelete }) {
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
        <i className="ri-delete-bin-line" title="Delete" onClick={onDelete}></i>
      </div>
    </div>
  );
}

export default GrantDetailsLinks;


