import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetailsGifts.css";

/* ------------------ Helpers ------------------ */
const currencyFormat = (value) =>
  typeof value === "number" && !isNaN(value)
    ? value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    : "";

const parseCurrencyInput = (str) => {
  if (str === "" || str == null) return 0;
  const cleaned = String(str).replace(/[^0-9.-]+/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

/* ------------------ Row Component ------------------ */
const GiftRow = ({ gift, onToggleAcknowledge, onEdit, onDelete, onAddFiles }) => {
  const remaining = (Number(gift.amount) || 0) - (Number(gift.spent) || 0);
  return (
    <tr>
      <td className="col-id">{gift.id}</td>
      <td className="col-date">{gift.date}</td>
      <td className="col-amount" style={{ textAlign: "right" }}>{currencyFormat(Number(gift.amount) || 0)}</td>
      <td className="col-spent" style={{ textAlign: "right" }}>{currencyFormat(Number(gift.spent) || 0)}</td>
      <td className="col-remaining" style={{ textAlign: "right" }}>{currencyFormat(remaining)}</td>
      <td className="col-status">
        <span className={`badge status-${String(gift.status).toLowerCase()}`}>{gift.status}</span>
      </td>
      <td className="col-purpose">{gift.purpose}</td>
      <td className="col-fy">{gift.fiscalYear}</td>
      <td className="col-compliance">
        <span className={`badge compliance-${String(gift.compliance).toLowerCase().replace(/\s/g, "-")}`}>
          {gift.compliance}
        </span>
      </td>
      <td className="col-acknowledge">
        <button
          className={`btn-ack ${gift.acknowledged ? "ack-true" : "ack-false"}`}
          onClick={() => onToggleAcknowledge(gift.id)}
        >
          {gift.acknowledged ? "Sent" : "Pending"}
        </button>
      </td>
      <td className="col-files">
        {gift.files && gift.files.length > 0 ? (
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {gift.files.map((f, idx) => (
              <li key={idx}>
                <a href={URL.createObjectURL(f)} target="_blank" rel="noopener noreferrer">
                  {f.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          "-"
        )}
      </td>
      <td className="col-actions" style={{ whiteSpace: "nowrap" }}>
        <button className="gms-small-btn" onClick={() => onEdit(gift)}>Edit</button>
        <button className="gms-small-btn gms-delete" onClick={() => onDelete(gift.id)} style={{ marginLeft: 8 }}>
          Delete
        </button>
        <button className="gms-small-btn" style={{ marginLeft: 8 }} onClick={() => onAddFiles(gift.id)}>
          Add Files
        </button>
      </td>
    </tr>
  );
};

/* ------------------ Empty Gift Factory ------------------ */
const emptyGift = () => ({
  date: "",
  amount: 0,
  spent: 0,
  status: "Received",
  purpose: "",
  fiscalYear: "2025",
  compliance: "Yes",
  acknowledged: false,
  files: [],
});

/* ------------------ Main Component ------------------ */
export default function GrantDetailsGifts() {
  const { id } = useParams();
  const grantId = Number(id);

  const [gifts, setGifts] = useState([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [showOnly, setShowOnly] = useState("all");

  // Modal state
  const [modal, setModal] = useState({
    open: false,
    mode: "add",
    gift: emptyGift(),
    editId: null,
    modalIdPreview: "",
  });

  // Load gifts from JSON
  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((res) => res.json())
      .then((data) => {
        const selected = data.find((g) => g.id === grantId);
        if (selected && selected.gifts) {
          const normalized = selected.gifts.map((x) => ({
            ...x,
            amount: Number(x.amount) || 0,
            spent: Number(x.spent) || 0,
            acknowledged: !!x.acknowledged,
            fiscalYear: x.fiscalYear ? String(x.fiscalYear) : "2025",
            status: x.status || "Received",
            compliance: x.compliance || "Yes",
            files: x.files || [],
          }));
          setGifts(normalized);
        } else {
          setGifts([]);
        }
      })
      .catch((err) => {
        console.error("Error loading gifts:", err);
        setGifts([]);
      });
  }, [grantId]);

  // Summary totals
  const totals = useMemo(() => {
    const totalReceived = gifts.reduce((sum, g) => sum + (g.status === "Received" ? Number(g.amount || 0) : 0), 0);
    const totalSpent = gifts.reduce((sum, g) => sum + Number(g.spent || 0), 0);
    const remaining = totalReceived - totalSpent;
    const complianceOnTrack = gifts.length === 0 ? true : gifts.every((g) => String(g.compliance).toLowerCase() === "yes" || String(g.compliance).toLowerCase() === "compliant");
    return { totalReceived, totalSpent, remaining, complianceOnTrack };
  }, [gifts]);

  // Search + Filter + Sort
  const displayed = useMemo(() => {
    let filtered = gifts.filter((g) => {
      if (showOnly === "received" && g.status !== "Received") return false;
      if (showOnly === "pending" && g.status !== "Pending") return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return String(g.id).toLowerCase().includes(q) || (g.purpose || "").toLowerCase().includes(q);
    });

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const da = new Date(a.date || 0).getTime();
        const db = new Date(b.date || 0).getTime();
        return sortDir === "asc" ? da - db : db - da;
      } else if (sortBy === "amount") {
        return sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });

    return filtered;
  }, [gifts, query, sortBy, sortDir, showOnly]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const handleToggleAcknowledge = (giftId) => {
    setGifts((prev) => prev.map((g) => (g.id === giftId ? { ...g, acknowledged: !g.acknowledged } : g)));
  };

  const generateNextId = (list) => (!list || list.length === 0 ? 1 : Math.max(...list.map((it) => Number(it.id || 0))) + 1);

  const openAddModal = () => {
    const previewId = generateNextId(gifts);
    setModal({ open: true, mode: "add", gift: emptyGift(), editId: null, modalIdPreview: String(previewId) });
  };

  const openEditModal = (gift) => {
    setModal({
      open: true,
      mode: "edit",
      gift: { ...gift },
      editId: gift.id,
      modalIdPreview: String(gift.id),
    });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "add", gift: emptyGift(), editId: null, modalIdPreview: "" });
  };

  const handleModalChange = (field, value) => {
    if (field === "amount" || field === "spent") {
      const num = typeof value === "number" ? value : parseCurrencyInput(value);
      setModal((m) => ({ ...m, gift: { ...m.gift, [field]: num } }));
    } else {
      setModal((m) => ({ ...m, gift: { ...m.gift, [field]: value } }));
    }
  };

  const handleSaveModal = () => {
    const g = { ...modal.gift, amount: Number(modal.gift.amount) || 0, spent: Number(modal.gift.spent) || 0 };
    if (modal.mode === "add") {
      const newId = generateNextId(gifts);
      const newGift = { id: newId, ...g };
      setGifts((prev) => [newGift, ...prev]);
    } else {
      setGifts((prev) => prev.map((it) => (it.id === modal.editId ? { ...it, ...g } : it)));
    }
    closeModal();
  };

  const handleDelete = (giftId) => {
    if (!window.confirm("Delete this gift?")) return;
    setGifts((prev) => prev.filter((g) => g.id !== giftId));
  };

  const handleClearSearch = () => setQuery("");

  // ------------------ Multi-file support ------------------
  const handleAddFiles = (giftId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e) => {
      const newFiles = Array.from(e.target.files);
      if (newFiles.length > 0) {
        setGifts((prev) =>
          prev.map((g) =>
            g.id === giftId ? { ...g, files: [...(g.files || []), ...newFiles] } : g
          )
        );
      }
    };
    input.click();
  };

  // ------------------ Render ------------------
  return (
    <div className="gifts-container">
      {/* Summary panel */}
      <div className="gifts-summary-container">
        <div className="summary-card">
          <label>Total Received</label>
          <div className="summary-value">{currencyFormat(totals.totalReceived)}</div>
        </div>
        <div className="summary-card">
          <label>Total Spent</label>
          <div className="summary-value">{currencyFormat(totals.totalSpent)}</div>
          <div className="summary-sub">
            ({totals.totalSpent === 0 ? 0 : Math.round((totals.totalSpent / (totals.totalReceived || 1)) * 100)}% of received)
          </div>
        </div>
        <div className="summary-card">
          <label>Remaining Balance</label>
          <div className="summary-value">{currencyFormat(totals.remaining)}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="gifts-toolbar">
        <div className="left">
          <button className="btn-primary" onClick={openAddModal}>+ New Gift</button>
        </div>

        <div className="center">
          <input
            className="gifts-search"
            placeholder="Search gifts by ID or purpose"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && <button className="btn-clear" onClick={handleClearSearch}>Clear</button>}
        </div>

        <div className="right">
          <button className="btn-filter" onClick={() => setShowOnly("all")}>All</button>
          <button className="btn-filter" onClick={() => setShowOnly("received")}>Received</button>
          <button className="btn-filter" onClick={() => setShowOnly("pending")}>Pending</button>

          <div className="sort-controls" style={{ display: "inline-flex", marginLeft: 8 }}>
            <button className={`btn-sort ${sortBy === "date" ? "active" : ""}`} onClick={() => toggleSort("date")}>
              Sort by Date {sortBy === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </button>
            <button className={`btn-sort ${sortBy === "amount" ? "active" : ""}`} onClick={() => toggleSort("amount")} style={{ marginLeft: 8 }}>
              Sort by Amount {sortBy === "amount" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="gifts-table-wrapper">
        <table className="gifts-table">
          <thead>
            <tr>
              <th>Gift ID</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th style={{ textAlign: "right" }}>Spent</th>
              <th style={{ textAlign: "right" }}>Remaining</th>
              <th>Status</th>
              <th>Purpose</th>
              <th>Fiscal Year</th>
              <th>Compliance</th>
              <th>Acknowledge</th>
              <th>Files</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr className="no-results">
                <td colSpan="12">No gifts match your search or filter.</td>
              </tr>
            ) : (
              displayed.map((g) => (
                <GiftRow
                  key={g.id}
                  gift={g}
                  onToggleAcknowledge={handleToggleAcknowledge}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onAddFiles={handleAddFiles}
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
            <h2>{modal.mode === "add" ? "Add Gift" : `Edit Gift #${modal.modalIdPreview}`}</h2>

            <div className="modal-row">
              <label>Gift ID</label>
              <input value={modal.modalIdPreview} disabled />
            </div>

            <div className="modal-row">
              <label>Date</label>
              <input type="date" value={modal.gift.date || ""} onChange={(e) => handleModalChange("date", e.target.value)} />
            </div>

            <div className="modal-row">
              <label>Amount</label>
              <input
                type="text"
                placeholder="$0"
                value={currencyFormat(Number(modal.gift.amount || 0))}
                onChange={(e) => handleModalChange("amount", e.target.value)}
                onFocus={(e) => { const raw = Number(modal.gift.amount) || 0; e.target.value = raw === 0 ? "" : String(raw); }}
                onBlur={(e) => handleModalChange("amount", parseCurrencyInput(e.target.value))}
              />
            </div>

            <div className="modal-row">
              <label>Spent</label>
              <input
                type="text"
                placeholder="$0"
                value={currencyFormat(Number(modal.gift.spent || 0))}
                onChange={(e) => handleModalChange("spent", e.target.value)}
                onFocus={(e) => { const raw = Number(modal.gift.spent) || 0; e.target.value = raw === 0 ? "" : String(raw); }}
                onBlur={(e) => handleModalChange("spent", parseCurrencyInput(e.target.value))}
              />
            </div>

            <div className="modal-row">
              <label>Status</label>
              <select value={modal.gift.status} onChange={(e) => handleModalChange("status", e.target.value)}>
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="modal-row">
              <label>Purpose</label>
              <textarea rows={3} value={modal.gift.purpose} onChange={(e) => handleModalChange("purpose", e.target.value)} />
            </div>

            <div className="modal-row">
              <label>Fiscal Year</label>
              <select value={modal.gift.fiscalYear} onChange={(e) => handleModalChange("fiscalYear", e.target.value)}>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>

            <div className="modal-row">
              <label>Compliance</label>
              <select value={modal.gift.compliance} onChange={(e) => handleModalChange("compliance", e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="modal-row">
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Acknowledged</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="radio" name="ack" checked={!!modal.gift.acknowledged} onChange={() => handleModalChange("acknowledged", true)} /> Yes
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="radio" name="ack" checked={!modal.gift.acknowledged} onChange={() => handleModalChange("acknowledged", false)} /> No
                </label>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: "flex-end", marginTop: 16 }}>
              <button className="btn-cancel" onClick={closeModal} style={{ marginRight: 12 }}>Cancel</button>
              <button className="btn-save" onClick={handleSaveModal}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


