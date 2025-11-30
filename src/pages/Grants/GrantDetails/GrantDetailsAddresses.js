import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetailsAddress.css";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase";

const GrantDetailsAddresses = () => {
  const { id } = useParams();
  const grantId = id;

  const [addresses, setAddresses] = useState({
    currentAddresses: [],
    alternateAddresses: [],
    historicalAddresses: []
  });

  const [modal, setModal] = useState({
    open: false,
    mode: "add",
    section: null,
    index: null,
    addr: { type: "", tag: "", verified: "", range: "", address: [], primary: false, docId: null }
  });

  // Load addresses from addresses subcollection
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const addressesCol = collection(db, "grants", grantId, "addresses");
        const snapshot = await getDocs(addressesCol);

        const current = snapshot.docs.map(docSnap => {
          const a = docSnap.data().address || {};
          return {
            type: a.type || a.addressType || "",
            tag: a.apt || "",
            verified: a.dateVerified || "",
            range: "",
            address: [
              a.street || "",
              a.city || "",
              a.state || "",
              a.zipCode || "",
              a.country || ""
            ].filter(Boolean),
            primary: a.primary || false,
            docId: docSnap.id
          };
        });

        setAddresses({
          currentAddresses: current,
          alternateAddresses: [],
          historicalAddresses: []
        });
      } catch (err) {
        console.error("Error loading addresses:", err);
      }
    };

    loadAddresses();
  }, [grantId]);

  // Modal handlers
  const openAddModal = (section) => {
    setModal({
      open: true,
      mode: "add",
      section,
      index: null,
      addr: { type: "", tag: "", verified: "", range: "", address: [], primary: false, docId: null }
    });
  };

  const openEditModal = (section, index, addr) => {
    setModal({
      open: true,
      mode: "edit",
      section,
      index,
      addr: { ...addr, address: addr.address || [], docId: addr.docId }
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      mode: "add",
      section: null,
      index: null,
      addr: { type: "", tag: "", verified: "", range: "", address: [], primary: false, docId: null }
    });
  };

  const handleInputChange = (field, value) => {
    setModal(prev => ({
      ...prev,
      addr: { ...prev.addr, [field]: value }
    }));
  };

  // Save addresses to subcollection
  const handleSave = async () => {
    const section = modal.section;
    const updatedAddr = { ...modal.addr };

    const updatedAddresses = { ...addresses };

    if (modal.mode === "add") {
      // Generate a new doc ID
      const newDocRef = doc(collection(db, "grants", grantId, "addresses"));
      await setDoc(newDocRef, { address: {
        apt: updatedAddr.tag,
        street: updatedAddr.address[0] || "",
        city: updatedAddr.address[1] || "",
        state: updatedAddr.address[2] || "",
        zipCode: updatedAddr.address[3] || "",
        country: updatedAddr.address[4] || "",
        type: updatedAddr.type,
        addressType: updatedAddr.type,
        dateVerified: updatedAddr.verified,
        primary: updatedAddr.primary
      }});
      updatedAddr.docId = newDocRef.id;
      updatedAddresses[section] = [...updatedAddresses[section], updatedAddr];
    } else {
      // Update existing doc
      const docRef = doc(db, "grants", grantId, "addresses", updatedAddr.docId);
      await setDoc(docRef, { address: {
        apt: updatedAddr.tag,
        street: updatedAddr.address[0] || "",
        city: updatedAddr.address[1] || "",
        state: updatedAddr.address[2] || "",
        zipCode: updatedAddr.address[3] || "",
        country: updatedAddr.address[4] || "",
        type: updatedAddr.type,
        addressType: updatedAddr.type,
        dateVerified: updatedAddr.verified,
        primary: updatedAddr.primary
      }});
      updatedAddresses[section][modal.index] = updatedAddr;
    }

    setAddresses(updatedAddresses);
    closeModal();
  };

  const handleDelete = async (section, index) => {
    const addr = addresses[section][index];
    if (!addr.docId) return;

    await deleteDoc(doc(db, "grants", grantId, "addresses", addr.docId));

    const updatedAddresses = {
      ...addresses,
      [section]: addresses[section].filter((_, i) => i !== index)
    };

    setAddresses(updatedAddresses);
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
              placeholder="Tag / Apt"
              value={modal.addr.tag || ""}
              onChange={(e) => handleInputChange("tag", e.target.value)}
            />
            <input
              placeholder="Last Verified Date"
              value={modal.addr.verified || ""}
              onChange={(e) => handleInputChange("verified", e.target.value)}
            />
            <textarea
              placeholder="Address lines: Street|City|State|Zip|Country"
              value={(modal.addr.address || []).join("|")}
              onChange={(e) => handleInputChange("address", e.target.value ? e.target.value.split("|") : [])}
            />
            <label>
              <input type="checkbox" checked={modal.addr.primary} onChange={(e) => handleInputChange("primary", e.target.checked)} /> Primary
            </label>

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

// Section component
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

// AddressCard component
function AddressCard({ type, tag, verified, range, address, onEdit, onDelete, primary }) {
  return (
    <div className="gms-card gms-address-card">
      <div className="gms-address-header">
        <div className="gms-address-type">
          <i className="ri-map-pin-line" /> {type} {tag && <span className="gms-tag">{tag}</span>} {primary && <strong>(Primary)</strong>}
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
