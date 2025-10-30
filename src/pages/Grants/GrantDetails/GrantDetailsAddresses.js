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

  const handleAddCurrent = () => {
    const type = prompt("Enter Address Type (Business/Home/etc.):");
    if (!type) return;
    const tag = prompt("Enter Tag (optional):");
    const verified = prompt("Enter Last Verified Date (YYYY-MM-DD):");
    const lines = prompt("Enter Address Lines separated by |").split("|");
    setAddresses((prev) => ({
      ...prev,
      currentAddresses: [...prev.currentAddresses, { type, tag, verified, address: lines }]
    }));
  };

  const handleAddAlternate = () => {
    const type = prompt("Enter Address Type (Mailing/Home/etc.):");
    if (!type) return;
    const verified = prompt("Enter Last Verified Date (YYYY-MM-DD):");
    const lines = prompt("Enter Address Lines separated by |").split("|");
    setAddresses((prev) => ({
      ...prev,
      alternateAddresses: [...prev.alternateAddresses, { type, verified, address: lines }]
    }));
  };

  const handleAddHistorical = () => {
    const type = prompt("Enter Address Type (Business/Home/etc.):");
    if (!type) return;
    const range = prompt("Enter Date Range (e.g., 2020-01-01 - 2022-12-31):");
    const lines = prompt("Enter Address Lines separated by |").split("|");
    setAddresses((prev) => ({
      ...prev,
      historicalAddresses: [...prev.historicalAddresses, { type, range, address: lines }]
    }));
  };

  const handleDelete = (section, index) => {
    setAddresses((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleEditSave = (section, index, updated) => {
    setAddresses((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) => (i === index ? updated : item))
    }));
  };

  const handleEdit = (section, index, addr) => {
    const newType = prompt("Edit Address Type:", addr.type);
    if (!newType) return;
    const newLines = prompt("Edit Address Lines separated by |", addr.address.join("|"));
    if (!newLines) return;

    const updated = {
      ...addr,
      type: newType,
      address: newLines.split("|")
    };

    handleEditSave(section, index, updated);
  };

  const { currentAddresses, alternateAddresses, historicalAddresses } = addresses;

  return (
    <div className="content">
      <div className="gms-wrap">
        <Section title="Current Addresses" onAdd={handleAddCurrent}>
          {currentAddresses.map((addr, i) => (
            <AddressCard
              key={i}
              {...addr}
              onDelete={() => handleDelete("currentAddresses", i)}
              onEdit={() => handleEdit("currentAddresses", i, addr)}
            />
          ))}
        </Section>

        <Section title="Alternate Addresses" onAdd={handleAddAlternate}>
          {alternateAddresses.map((addr, i) => (
            <AddressCard
              key={i}
              {...addr}
              onDelete={() => handleDelete("alternateAddresses", i)}
              onEdit={() => handleEdit("alternateAddresses", i, addr)}
            />
          ))}
        </Section>

        <Section title="Historical Addresses" onAdd={handleAddHistorical}>
          {historicalAddresses.map((addr, i) => (
            <AddressCard
              key={i}
              {...addr}
              onDelete={() => handleDelete("historicalAddresses", i)}
              onEdit={() => handleEdit("historicalAddresses", i, addr)}
            />
          ))}
        </Section>
      </div>
    </div>
  );
};

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

function AddressCard({ type, tag, verified, range, address, onDelete, onEdit }) {
  return (
    <div className="gms-card gms-address-card">
      <div className="gms-address-header">
        <div className="gms-address-type">
          <i className="ri-map-pin-line" /> {type}
          {tag && <span className="gms-tag">{tag}</span>}
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

