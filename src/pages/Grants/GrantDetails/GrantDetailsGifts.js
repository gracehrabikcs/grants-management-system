import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetailsGifts.css";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase";

/* ------------------ Helpers ------------------ */
const currencyFormat = (value) =>
  typeof value === "number" && !isNaN(value)
    ? value.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      })
    : "";

const parseCurrencyInput = (str) => {
  if (str === "" || str == null) return 0;
  const cleaned = String(str).replace(/[^0-9.-]+/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

/* ------------------ Row Component ------------------ */
const GiftRow = ({ gift, onToggleAcknowledge, onEdit, onDelete }) => (
  <tr>
    <td className="col-id">{gift.id}</td>
    <td className="col-date">{gift.date}</td>
    <td className="col-purpose">{gift.purpose}</td>
    <td className="col-spent" style={{ textAlign: "left" }}>
      {currencyFormat(Number(gift.spent) || 0)}
    </td>
    <td className="col-acknowledge">
      <button
        className={`btn-ack ${gift.acknowledged ? "ack-true" : "ack-false"}`}
        onClick={() => onToggleAcknowledge(gift.id)}
      >
        {gift.acknowledged ? "Sent" : "Pending"}
      </button>
    </td>
    <td className="col-actions" style={{ whiteSpace: "nowrap" }}>
      <button className="gms-small-btn" onClick={() => onEdit(gift)}>
        Edit
      </button>
      <button
        className="gms-small-btn gms-delete"
        onClick={() => onDelete(gift.id)}
        style={{ marginLeft: 8 }}
      >
        Delete
      </button>
    </td>
  </tr>
);

/* ------------------ Empty Gift Factory ------------------ */
const emptyGift = () => ({
  date: "",
  spent: 0,
  purpose: "",
  acknowledged: false,
});

/* ------------------ Main Component ------------------ */
export default function GrantDetailsGifts() {
  const { id } = useParams();
  const grantId = id;

  const [gifts, setGifts] = useState([]);
  const [totalReceivedFromPledges, setTotalReceivedFromPledges] = useState(0);
  const [queryText, setQueryText] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [modal, setModal] = useState({
    open: false,
    mode: "add",
    gift: emptyGift(),
    editId: null,
    modalIdPreview: "",
  });

  /* ------------------ Load Gifts from Firestore ------------------ */
  const loadGifts = async () => {
    setLoading(true);
    setError("");
    try {
      const giftsCol = collection(db, "grants", grantId, "gifts");
      const q = query(giftsCol, orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const giftsData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setGifts(giftsData);
    } catch (err) {
      console.error("Error loading gifts:", err);
      setError("Could not load gifts.");
      setGifts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Load Total Received from Pledges ------------------ */
  const loadTotalReceivedFromPledges = async () => {
    try {
      const pledgesSnap = await getDocs(
        collection(db, "grants", grantId, "pledges")
      );
      const pledgesData = pledgesSnap.docs.map((d) => d.data());
      const total = pledgesData.reduce(
        (sum, p) => sum + (Number(p.received) || 0),
        0
      );
      setTotalReceivedFromPledges(total);
    } catch (err) {
      console.error("Error loading total received from pledges:", err);
      setTotalReceivedFromPledges(0);
    }
  };

  useEffect(() => {
    loadGifts();
    loadTotalReceivedFromPledges();
  }, [grantId]);

  /* ------------------ Totals ------------------ */
  const totals = useMemo(() => {
    const totalReceived = totalReceivedFromPledges;
    const totalSpent = gifts.reduce((sum, g) => sum + Number(g.spent || 0), 0);
    const remaining = totalReceived - totalSpent;
    return { totalReceived, totalSpent, remaining };
  }, [gifts, totalReceivedFromPledges]);

  /* ------------------ Search + Sort ------------------ */
  const displayed = useMemo(() => {
    let filtered = gifts.filter((g) => {
      if (!queryText) return true;
      const q = queryText.toLowerCase();
      return (
        String(g.id).toLowerCase().includes(q) ||
        (g.purpose || "").toLowerCase().includes(q)
      );
    });

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const da = new Date(a.date || 0).getTime();
        const db = new Date(b.date || 0).getTime();
        return sortDir === "asc" ? da - db : db - da;
      } else if (sortBy === "spent") {
        return sortDir === "asc" ? a.spent - b.spent : b.spent - a.spent;
      }
      return 0;
    });

    return filtered;
  }, [gifts, queryText, sortBy, sortDir]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  /* ------------------ Acknowledge Toggle ------------------ */
  const handleToggleAcknowledge = async (giftId) => {
    const gift = gifts.find((g) => g.id === giftId);
    if (!gift) return;
    try {
      await setDoc(
        doc(db, "grants", grantId, "gifts", giftId),
        { acknowledged: !gift.acknowledged, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setGifts((prev) =>
        prev.map((g) =>
          g.id === giftId ? { ...g, acknowledged: !g.acknowledged } : g
        )
      );
    } catch (err) {
      console.error("Error toggling acknowledge:", err);
    }
  };

  /* ------------------ Modal Controls ------------------ */
  const generateNextId = (list) =>
    !list || list.length === 0
      ? "1"
      : String(Math.max(...list.map((it) => Number(it.id || 0))) + 1);

  const openAddModal = () => {
    const previewId = generateNextId(gifts);
    setModal({
      open: true,
      mode: "add",
      gift: emptyGift(),
      editId: null,
      modalIdPreview: previewId,
    });
  };

  const openEditModal = (gift) => {
    setModal({
      open: true,
      mode: "edit",
      gift: { ...gift },
      editId: gift.id,
      modalIdPreview: gift.id,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      mode: "add",
      gift: emptyGift(),
      editId: null,
      modalIdPreview: "",
    });
  };

  const handleModalChange = (field, value) => {
    if (field === "spent") {
      const num = typeof value === "number" ? value : parseCurrencyInput(value);
      setModal((m) => ({ ...m, gift: { ...m.gift, [field]: num } }));
    } else {
      setModal((m) => ({ ...m, gift: { ...m.gift, [field]: value } }));
    }
  };

  /* ------------------ Save Gift ------------------ */
  const handleSaveModal = async () => {
    const g = { ...modal.gift, spent: Number(modal.gift.spent) || 0 };
    try {
      const giftsCol = collection(db, "grants", grantId, "gifts");

      if (modal.mode === "add") {
        const newId = generateNextId(gifts);
        const newGift = { id: newId, ...g, createdAt: serverTimestamp() };
        await setDoc(doc(giftsCol, newId), newGift);
        setGifts((prev) => [newGift, ...prev]);
      } else {
        await setDoc(
          doc(giftsCol, modal.editId),
          { ...g, updatedAt: serverTimestamp() },
          { merge: true }
        );
        setGifts((prev) =>
          prev.map((it) => (it.id === modal.editId ? { ...it, ...g } : it))
        );
      }
    } catch (err) {
      console.error("Error saving gift:", err);
    }
    closeModal();
  };

  /* ------------------ Delete Gift ------------------ */
  const handleDelete = async (giftId) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await deleteDoc(doc(db, "grants", grantId, "gifts", giftId));
      setGifts((prev) => prev.filter((g) => g.id !== giftId));
    } catch (err) {
      console.error("Error deleting gift:", err);
    }
  };

  /* ------------------ Render ------------------ */
  return (
    <div className="gifts-container">
      {/* Summary */}
      <div className="gifts-summary-container">
        <div className="summary-card">
          <label>Total Received</label>
          <div className="summary-value">
            {currencyFormat(totals.totalReceived)}
          </div>
        </div>
        <div className="summary-card">
          <label>Total Spent</label>
          <div className="summary-value">{currencyFormat(totals.totalSpent)}</div>
        </div>
        <div className="summary-card">
          <label>Remaining Balance</label>
          <div className="summary-value">{currencyFormat(totals.remaining)}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="gifts-toolbar">
        <div className="left">
          <button className="btn-primary" onClick={openAddModal}>
            + New Invoice
          </button>
        </div>
        <div className="center">
          <input
            className="gifts-search"
            placeholder="Search invoices by ID or purpose"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
          {queryText && (
            <button className="btn-clear" onClick={() => setQueryText("")}>
              Clear
            </button>
          )}
        </div>
        <div className="right">
          <div
            className="sort-controls"
            style={{ display: "inline-flex", marginLeft: 8 }}
          >
            <button
              className={`btn-sort ${sortBy === "date" ? "active" : ""}`}
              onClick={() => toggleSort("date")}
            >
              Sort by Date {sortBy === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </button>
            <button
              className={`btn-sort ${sortBy === "spent" ? "active" : ""}`}
              onClick={() => toggleSort("spent")}
              style={{ marginLeft: 8 }}
            >
              Sort by Spent {sortBy === "spent" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="gifts-table-wrapper">
        {loading && <div style={{ marginBottom: 8 }}>Loading gifts…</div>}
        {error && <div style={{ marginBottom: 8, color: "red" }}>{error}</div>}

        <table className="gifts-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date</th>
              <th>Purpose</th>
              <th style={{ textAlign: "left" }}>Spent</th>
              <th>Acknowledge</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No invoices found.
                </td>
              </tr>
            ) : (
              displayed.map((g) => (
                <GiftRow
                  key={g.id}
                  gift={g}
                  onToggleAcknowledge={handleToggleAcknowledge}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="gifts-modal-backdrop">
          <div className="gifts-modal" style={{ maxWidth: 620, width: "92%" }}>
            <h2>
              {modal.mode === "add"
                ? "Add Invoice"
                : `Edit Invoice #${modal.modalIdPreview}`}
            </h2>
            <div className="modal-row">
              <label>Invoice ID</label>
              <input value={modal.modalIdPreview} disabled />
            </div>
            <div className="modal-row">
              <label>Date</label>
              <input
                type="date"
                value={modal.gift.date || ""}
                onChange={(e) => handleModalChange("date", e.target.value)}
              />
            </div>
            <div className="modal-row">
              <label>Spent</label>
              <input
                type="text"
                placeholder="$0"
                value={currencyFormat(Number(modal.gift.spent || 0))}
                onChange={(e) => handleModalChange("spent", e.target.value)}
                onFocus={(e) => {
                  const raw = Number(modal.gift.spent) || 0;
                  e.target.value = raw === 0 ? "" : String(raw);
                }}
                onBlur={(e) =>
                  handleModalChange("spent", parseCurrencyInput(e.target.value))
                }
              />
            </div>
            <div className="modal-row">
              <label>Purpose</label>
              <textarea
                rows={3}
                value={modal.gift.purpose}
                onChange={(e) => handleModalChange("purpose", e.target.value)}
              />
            </div>
            <div
              className="modal-actions"
              style={{ justifyContent: "flex-end", marginTop: 16 }}
            >
              <button
                className="btn-cancel"
                onClick={closeModal}
                style={{ marginRight: 12 }}
              >
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveModal}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
