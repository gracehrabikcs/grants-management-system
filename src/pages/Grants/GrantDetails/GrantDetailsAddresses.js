import React, { useState, useEffect } from "react";
import "../../../styles/GrantDetailsAddress.css";

const GrantDetailsAddresses = ({ grantId }) => {
  const [addresses, setAddresses] = useState({
    currentAddresses: [],
    alternateAddresses: [],
    historicalAddresses: []
  });

  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then(res => res.json())
      .then(data => {
        const grantData = data.find(g => g.id === grantId)?.addresses || {
          currentAddresses: [],
          alternateAddresses: [],
          historicalAddresses: []
        };
        setAddresses(grantData);
      })
      .catch(err => console.error("Error loading addresses:", err));
  }, [grantId]);

  const { currentAddresses, alternateAddresses, historicalAddresses } = addresses;

  return (
    <div className="content">
      <div className="gms-wrap">
        <Section title="Current Addresses">
          {currentAddresses.map((addr, i) => (
            <AddressCard key={i} {...addr} />
          ))}
          <AddButton label="Add Address" />
        </Section>

        <Section title="Alternate Addresses">
          {alternateAddresses.map((addr, i) => (
            <AddressCard key={i} {...addr} />
          ))}
          <AddButton label="Add Alternate" />
        </Section>

        <Section title="Historical Addresses">
          {historicalAddresses.map((addr, i) => (
            <AddressCard key={i} {...addr} />
          ))}
        </Section>
      </div>
    </div>
  );
};

// --- Reusable Subcomponents ---

function Section({ title, children }) {
  return (
    <div className="gms-section">
      <h3 className="gms-section-title">{title}</h3>
      <div className="gms-address-grid">{children}</div>
    </div>
  );
}

function AddressCard({ type, tag, verified, range, address }) {
  return (
    <div className="gms-card gms-address-card">
      <div className="gms-address-header">
        <div className="gms-address-type">
          <i className="ri-map-pin-line" /> {type}
          {tag && <span className="gms-tag">{tag}</span>}
        </div>
        <div className="gms-address-actions">
          <i className="ri-edit-line" title="Edit"></i>
          <i className="ri-delete-bin-6-line" title="Delete"></i>
        </div>
      </div>

      <div className="gms-address-meta">
        {verified && <div>Last verified: {verified}</div>}
        {range && <div>{range}</div>}
      </div>

      <div className="gms-address-text">
        {address.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}

function AddButton({ label }) {
  return (
    <button className="gms-add-btn">
      <i className="ri-add-line" /> {label}
    </button>
  );
}

export default GrantDetailsAddresses;

