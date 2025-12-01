import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetailsBio.css";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

export default function GrantDetailsBio() {
  const { id } = useParams();
  const [organizationNotes, setOrganizationNotes] = useState("");
  const [fundingNotes, setFundingNotes] = useState("");
  const [organizationTs, setOrganizationTs] = useState("");
  const [fundingTs, setFundingTs] = useState("");
  const [loading, setLoading] = useState(true);

  // Load notes from Firebase
  useEffect(() => {
    const loadBio = async () => {
      try {
        const ref = doc(db, "grants", id, "bio", "details");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setOrganizationNotes(data.organizationDetails || "");
          setFundingNotes(data.fundingPreferences || "");
          setOrganizationTs(data.organizationTs || "");
          setFundingTs(data.fundingTs || "");
        }
      } catch (err) {
        console.error("Error loading bio:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBio();
  }, [id]);

  if (loading) return <p>Loading bio details…</p>;

  // Save organization notes
  const handleSaveOrganization = async () => {
    const ts = new Date().toLocaleString();
    try {
      const ref = doc(db, "grants", id, "bio", "details");
      await setDoc(
        ref,
        { organizationDetails: organizationNotes, organizationTs: ts, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setOrganizationTs(ts);
      alert("Organization Details saved.");
    } catch (err) {
      console.error("Error saving organization notes:", err);
      alert("Could not save Organization Details.");
    }
  };

  // Save funding preferences notes
  const handleSaveFunding = async () => {
    const ts = new Date().toLocaleString();
    try {
      const ref = doc(db, "grants", id, "bio", "details");
      await setDoc(
        ref,
        { fundingPreferences: fundingNotes, fundingTs: ts, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setFundingTs(ts);
      alert("Funding Preferences saved.");
    } catch (err) {
      console.error("Error saving funding notes:", err);
      alert("Could not save Funding Preferences.");
    }
  };

  return (
    <div className="grant-bio-container">
      {/* Organization Details */}
      <section className="gms-card">
        <div className="gms-flex-between gms-mb8">
          <div>
            <div className="gms-head">Organization Details</div>
            <div className="gms-subtle">Notes about the organization for this grant</div>
          </div>
          <button className="gms-btn primary" onClick={handleSaveOrganization}>Save</button>
        </div>
        <textarea
          className="gms-notes"
          rows={6}
          value={organizationNotes}
          onChange={(e) => setOrganizationNotes(e.target.value)}
        />
        <div className="gms-micro gms-mt8">Last updated: {organizationTs || "Not saved yet"}</div>
      </section>

      {/* Funding Preferences */}
      <section className="gms-card" style={{ marginTop: 20 }}>
        <div className="gms-flex-between gms-mb8">
          <div>
            <div className="gms-head">Funding Preferences</div>
            <div className="gms-subtle">Notes about funding preferences for this grant</div>
          </div>
          <button className="gms-btn primary" onClick={handleSaveFunding}>Save</button>
        </div>
        <textarea
          className="gms-notes"
          rows={6}
          value={fundingNotes}
          onChange={(e) => setFundingNotes(e.target.value)}
        />
        <div className="gms-micro gms-mt8">Last updated: {fundingTs || "Not saved yet"}</div>
      </section>
    </div>
  );
}
