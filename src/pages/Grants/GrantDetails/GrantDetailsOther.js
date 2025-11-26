import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetailsOther.css";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

export default function GrantDetailsOther() {
  const { id } = useParams(); // grant id from route, e.g. "1"

  const [budgetNotes, setBudgetNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [budgetTs, setBudgetTs] = useState("");
  const [internalTs, setInternalTs] = useState("");
  const [loading, setLoading] = useState(true);

  // Helper: reference to the "other/notes" doc for this grant
  function getOtherDocRef() {
    // path: grants/{id}/other/notes
    return doc(db, "grants", String(id), "other", "notes");
  }

  // Load notes from Firestore on mount / when id changes
  useEffect(() => {
    async function loadNotes() {
      setLoading(true);
      try {
        const ref = getOtherDocRef();
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

          setBudgetNotes(data.budgetNotes || "");
          setInternalNotes(data.internalNotes || "");

          if (data.budgetUpdatedAt?.toDate) {
            setBudgetTs(data.budgetUpdatedAt.toDate().toLocaleString());
          } else {
            setBudgetTs("");
          }

          if (data.internalUpdatedAt?.toDate) {
            setInternalTs(data.internalUpdatedAt.toDate().toLocaleString());
          } else {
            setInternalTs("");
          }
        } else {
          // First time: nothing saved yet
          setBudgetNotes("");
          setInternalNotes("");
          setBudgetTs("");
          setInternalTs("");
        }
      } catch (err) {
        console.error("Error loading other notes:", err);
        alert("There was a problem loading notes from the database.");
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, [id]); // reload if grant id changes

  async function handleSaveBudget() {
    try {
      const ref = getOtherDocRef();
      // Merge so we don't overwrite internal notes
      await setDoc(
        ref,
        {
          budgetNotes,
          budgetUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const now = new Date().toLocaleString();
      setBudgetTs(now);
      alert("Budget notes saved to the database.");
    } catch (err) {
      console.error("Error saving budget notes:", err);
      alert("There was a problem saving the budget notes.");
    }
  }

  async function handleSaveInternal() {
    try {
      const ref = getOtherDocRef();
      await setDoc(
        ref,
        {
          internalNotes,
          internalUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const now = new Date().toLocaleString();
      setInternalTs(now);
      alert("Internal notes saved to the database.");
    } catch (err) {
      console.error("Error saving internal notes:", err);
      alert("There was a problem saving the internal notes.");
    }
  }

  if (loading) {
    return <p>Loading notes...</p>;
  }

  return (
    <div className="content">
      <div className="gms-wrap">
        {/* Budget notes */}
        <section className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div>
              <div className="gms-head">Budget and Finance Notes</div>
              <div className="gms-subtle">
                Financial tracking and budget allocation details for this grant
              </div>
            </div>
            <button className="gms-btn primary" onClick={handleSaveBudget}>
              Save
            </button>
          </div>
          <textarea
            className="gms-notes"
            rows={5}
            value={budgetNotes}
            onChange={(e) => setBudgetNotes(e.target.value)}
          />
          <div className="gms-micro gms-mt8">
            Last updated: {budgetTs || "Not saved yet"}
          </div>
        </section>

        {/* Internal notes */}
        <section className="gms-card">
          <div className="gms-flex-between gms-mb8">
            <div>
              <div className="gms-head">Internal Notes</div>
              <div className="gms-subtle">
                Private notes for internal team communication and coordination
              </div>
            </div>
            <button className="gms-btn primary" onClick={handleSaveInternal}>
              Save
            </button>
          </div>
          <textarea
            className="gms-notes"
            rows={5}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
          />
          <div className="gms-micro gms-mt8">
            Last updated: {internalTs || "Not saved yet"}
          </div>
        </section>
      </div>
    </div>
  );
}

