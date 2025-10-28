import React from "react";
import "../../../styles/GrantDetailsAddresses.css";


const GrantDetailsAddresses = () => {
  const currentAddresses = [
    {
      type: "Business",
      tag: "Primary",
      verified: "2024-09-14",
      address: [
        "123 Innovation Drive",
        "Suite 400",
        "San Francisco, CA 94103",
        "United States",
      ],
    },
  ];

  const alternateAddresses = [
    {
      type: "Mailing",
      verified: "2024-08-21",
      address: [
        "P.O. Box 5678",
        "San Francisco, CA 94104",
        "United States",
      ],
    },
    {
      type: "Home",
      verified: "2024-07-09",
      address: [
        "456 Residential Lane",
        "Berkeley, CA 94702",
        "United States",
      ],
    },
  ];

  const historicalAddresses = [
    {
      type: "Business",
      range: "1/14/2020 - 12/30/2023",
      address: [
        "789 Old Market Street",
        "Floor 2",
        "San Francisco, CA 94108",
        "United States",
      ],
    },
    {
      type: "Business",
      range: "5/31/2018 - 12/30/2019",
      address: [
        "321 Startup Boulevard",
        "Palo Alto, CA 94301",
        "United States",
      ],
    },
  ];

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
