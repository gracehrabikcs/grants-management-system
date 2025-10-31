import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetailsAddress.css";

const GrantDetailsAddresses = () => {
  const { id } = useParams();
  const grantId = Number(id);

  const [addresses, setAddresses] = useState({
    currentAddresses: [],
    alternateAddresses: [],
    historicalAddresses: []
  });

  const [modal, setModal] = useState({
    open: false,
    mode: "add", // "add" or "edit"
    section: null,
    index: null,
    addr: { type: "", tag: "", verified: "", range: "", address: [] }
  });

  // Load addresses
  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((res) => res.json())
      .then((data) => {
        const grantData = data.find((g) => g.id === grantId)?.addresses || {
          currentAddresses: [],
          alternateAddresses: [],
          historicalAddresses: []
        };
        setAddresses(grantData);
      })
      .catch((err) => console.error("Error loading addresses:", err));
  }, [grantId]);

  // Open Add Modal
  const openAddModal = (section) => {
    setModal({
      open: true,
      mode: "add",
      section,
      index: null,
      addr: { type: "", tag: "", verified: "", range: "", address: [] }
    });
  };

  // Open Edit Modal
  const openEditModal = (section, index, addr) => {
    setModal({
      open: true,
      mode: "edit",
      section,
      index,
      addr: { ...addr, address: addr.address || [] }
    });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "add", section: null, index: null, addr: { type: "", tag: "", verified: "", range: "", address: [] } });
  };

  const handleInputChange = (field, value) => {
    setModal((prev) => ({
      ...prev,
      addr: { ...prev.addr, [field]: value }
    }));
  };

  const handleSave = () => {
    const section = modal.section;
    const updatedAddr = { ...modal.addr };
    updatedAddr.address = updatedAddr.address || [];

    setAddresses((prev) => {
      const list = [...prev[section]];
      if (modal.mode === "add") {
        list.push(updatedAddr);
      } else {
        list[modal.index] = updatedAddr;
      }
      return { ...prev, [section]: list };
    });

    closeModal();
  };

  const handleDelete = (section, index) => {
    setAddresses((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const { currentAddresses, alternateAddresses, historicalAddresses } = addresses;

  return (
    <>
      <div className="content">
        <div className="gms-wrap">
          <Section title="Current Addresses" onAdd={() => openAddModal("currentAddresses")}>
            {currentAddresses.map((addr, i) => (
              <AddressCard
                key={i}
                {...addr}
                onEdit={() => openEditModal("currentAddresses", i, addr)}
                onDelete={() => handleDelete("currentAddresses", i)}
              />
            ))}
          </Section>

          <Section title="Alternate Addresses" onAdd={() => openAddModal("alternateAddresses")}>
            {alternateAddresses.map((addr, i) => (
              <AddressCard
                key={i}
                {...addr}
                onEdit={() => openEditModal("alternateAddresses", i, addr)}
                onDelete={() => handleDelete("alternateAddresses", i)}
              />
            ))}
          </Section>

          <Section title="Historical Addresses" onAdd={() => openAddModal("historicalAddresses")}>
            {historicalAddresses.map((addr, i) => (
              <AddressCard
                key={i}
                {...addr}
                onEdit={() => openEditModal("historicalAddresses", i, addr)}
                onDelete={() => handleDelete("historicalAddresses", i)}
              />
            ))}
          </Section>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="gms-modal-backdrop">
          <div className="gms-modal-content">
            <h2>{modal.mode === "add" ? "Add Address" : "Edit Address"}</h2>

            <input
              placeholder="Address Type"
              value={modal.addr.type || ""}
              onChange={(e) => handleInputChange("type", e.target.value)}
            />
            <input
              placeholder="Tag (optional)"
              value={modal.addr.tag || ""}
              onChange={(e) => handleInputChange("tag", e.target.value)}
            />
            <input
              placeholder="Last Verified Date (YYYY-MM-DD)"
              value={modal.addr.verified || ""}
              onChange={(e) => handleInputChange("verified", e.target.value)}
            />
            <input
              placeholder="Date Range (for historical)"
              value={modal.addr.range || ""}
              onChange={(e) => handleInputChange("range", e.target.value)}
            />
            <textarea
              placeholder="Address lines separated by |"
              value={(modal.addr.address || []).join("|")}
              onChange={(e) => handleInputChange("address", e.target.value ? e.target.value.split("|") : [])}
            />

            <div className="gms-modal-buttons">
              <button className="gms-modal-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button className="gms-modal-save" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Section
function Section({ title, children, onAdd }) {
  return (
    <div className="gms-section">
      <h3 className="gms-section-title">{title}</h3>
      <div className="gms-address-grid">{children}</div>
      {onAdd && (
        <button className="gms-add-btn" onClick={onAdd}>
          <i className="ri-add-line" /> Add
        </button>
      )}
    </div>
  );
}

// AddressCard
function AddressCard({ type, tag, verified, range, address, onEdit, onDelete }) {
  return (
    <div className="gms-card gms-address-card">
      <div className="gms-address-header">
        <div className="gms-address-type">
          <i className="ri-map-pin-line" /> {type} {tag && <span className="gms-tag">{tag}</span>}
        </div>
        <div className="gms-address-actions">
          <i className="ri-edit-line" title="Edit" onClick={onEdit}></i>
          <i className="ri-delete-bin-6-line" title="Delete" onClick={onDelete}></i>
        </div>
      </div>

      <div className="gms-address-meta">
        {verified && <div>Last verified: {verified}</div>}
        {range && <div>{range}</div>}
      </div>

      <div className="gms-address-text">
        {address?.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}

export default GrantDetailsAddresses;





