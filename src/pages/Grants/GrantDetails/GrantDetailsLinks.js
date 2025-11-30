import React, { useState, useEffect } from "react";
import "../../../styles/GrantDetailsLinks.css";


const GrantDetailsLinks = ({ grantId }) => {
  const [organizationalRelationships, setOrganizationalRelationships] = useState([]);
  const [connectedGrants, setConnectedGrants] = useState([]);
  const [keyContacts, setKeyContacts] = useState([]);


  const [modal, setModal] = useState({
    open: false,
    section: null, // "org", "grant", "contact"
    index: null, // for edit
    data: {}, // form data
  });


  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((res) => res.json())
      .then((data) => {
        const grantData = data.find((g) => g.id === parseInt(grantId));
        if (!grantData || !grantData.links) return;


        const { organizationalRelationships, connectedGrants, keyContacts } = grantData.links;
        setOrganizationalRelationships(organizationalRelationships || []);
        setConnectedGrants(connectedGrants || []);
        setKeyContacts(keyContacts || []);
      })
      .catch(console.error);
  }, [grantId]);


  // --- Modal Handlers ---
  const openModal = (section, index = null, data = {}) => {
    setModal({ open: true, section, index, data });
  };


  const closeModal = () => setModal({ open: false, section: null, index: null, data: {} });


  const handleInputChange = (field, value) => {
    setModal((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
    }));
  };


  const handleSave = () => {
    const { section, index, data } = modal;


    if (section === "org") {
      const list = [...organizationalRelationships];
      if (index === null) list.push(data);
      else list[index] = data;
      setOrganizationalRelationships(list);
    } else if (section === "grant") {
      const list = [...connectedGrants];
      if (index === null) list.push(data);
      else list[index] = data;
      setConnectedGrants(list);
    } else if (section === "contact") {
      const list = [...keyContacts];
      if (index === null) list.push(data);
      else list[index] = data;
      setKeyContacts(list);
    }


    closeModal();
  };


  // --- Delete Handlers ---
  const handleDelete = (section, index) => {
    if (section === "org") setOrganizationalRelationships(organizationalRelationships.filter((_, i) => i !== index));
    if (section === "grant") setConnectedGrants(connectedGrants.filter((_, i) => i !== index));
    if (section === "contact") setKeyContacts(keyContacts.filter((_, i) => i !== index));
  };


  return (
    <>
      <div className="links-wrapper">
        <div className="links-container">
          <Section title="Organizational Relationships" actionLabel="+ Add Relationship" onAdd={() => openModal("org")}>
            {organizationalRelationships.map((org, i) => (
              <OrgRelationship
                key={i}
                {...org}
                onDelete={() => handleDelete("org", i)}
                onEdit={() => openModal("org", i, org)}
              />
            ))}
          </Section>


          <Section title="Connected Grants" actionLabel="+ Link Grant" onAdd={() => openModal("grant")}>
            {connectedGrants.map((grant, i) => (
              <ConnectedGrant
                key={i}
                {...grant}
                onDelete={() => handleDelete("grant", i)}
                onEdit={() => openModal("grant", i, grant)}
              />
            ))}
          </Section>


          {/* <Section title="Key Contacts" actionLabel="+ Add Contact" onAdd={() => openModal("contact")}>
            {keyContacts.map((contact, i) => (
              <KeyContact
                key={i}
                {...contact}
                onDelete={() => handleDelete("contact", i)}
                onEdit={() => openModal("contact", i, contact)}
              />
            ))}
          </Section> */}
        </div>
      </div>


      {/* Modal */}
      {modal.open && (
        <div className="gms-modal-backdrop">
          <div className="gms-modal-content">
            <h2>
              {modal.index === null
                ? modal.section === "org"
                  ? "Add Organizational Relationship"
                  : modal.section === "grant"
                  ? "Add Connected Grant"
                  : "Add Key Contact"
                : modal.section === "org"
                ? "Edit Organizational Relationship"
                : modal.section === "grant"
                ? "Edit Connected Grant"
                : "Edit Key Contact"}
            </h2>


            {modal.section === "org" && (
              <>
                <input placeholder="Organization Name" value={modal.data.name || ""} onChange={(e) => handleInputChange("name", e.target.value)} />
                <input placeholder="Role" value={modal.data.role || ""} onChange={(e) => handleInputChange("role", e.target.value)} />
                <input placeholder="Since Year" value={modal.data.since || ""} onChange={(e) => handleInputChange("since", e.target.value)} />
                <input placeholder="Status" value={modal.data.status || ""} onChange={(e) => handleInputChange("status", e.target.value)} />
              </>
            )}


            {modal.section === "grant" && (
              <>
                <input placeholder="Grant Title" value={modal.data.title || ""} onChange={(e) => handleInputChange("title", e.target.value)} />
                <input placeholder="Grant ID" value={modal.data.id || ""} onChange={(e) => handleInputChange("id", e.target.value)} />
                <input placeholder="Type" value={modal.data.type || ""} onChange={(e) => handleInputChange("type", e.target.value)} />
                <input placeholder="Amount" value={modal.data.amount || ""} onChange={(e) => handleInputChange("amount", e.target.value)} />
                <input placeholder="Status" value={modal.data.status || ""} onChange={(e) => handleInputChange("status", e.target.value)} />
              </>
            )}


            {modal.section === "contact" && (
              <>
                <input placeholder="Initials" value={modal.data.initials || ""} onChange={(e) => handleInputChange("initials", e.target.value)} />
                <input placeholder="Name" value={modal.data.name || ""} onChange={(e) => handleInputChange("name", e.target.value)} />
                <input placeholder="Title" value={modal.data.title || ""} onChange={(e) => handleInputChange("title", e.target.value)} />
                <input placeholder="Tag" value={modal.data.tag || ""} onChange={(e) => handleInputChange("tag", e.target.value)} />
                <input placeholder="Email" value={modal.data.email || ""} onChange={(e) => handleInputChange("email", e.target.value)} />
                <input placeholder="Phone" value={modal.data.phone || ""} onChange={(e) => handleInputChange("phone", e.target.value)} />
              </>
            )}


            <div className="gms-modal-buttons">
              <button className="gms-modal-cancel" onClick={closeModal}>Cancel</button>
              <button className="gms-modal-save" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


// Section Component
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


// --- Cards ---
function OrgRelationship({ name, role, since, status, onDelete, onEdit }) {
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
        <i className="ri-delete-bin-line" title="Delete" onClick={onDelete}></i>
        <i className="ri-edit-line" title="Edit" onClick={onEdit}></i>
      </div>
    </div>
  );
}


function ConnectedGrant({ title, id, status, type, amount, onDelete, onEdit }) {
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
        <i className="ri-delete-bin-line" title="Delete" onClick={onDelete}></i>
        <i className="ri-edit-line" title="Edit" onClick={onEdit}></i>
      </div>
    </div>
  );
}


function KeyContact({ initials, name, title, tag, email, phone, onDelete, onEdit }) {
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
        <i className="ri-delete-bin-line" title="Delete" onClick={onDelete}></i>
        <i className="ri-edit-line" title="Edit" onClick={onEdit}></i>
      </div>
    </div>
  );
}


export default GrantDetailsLinks;




