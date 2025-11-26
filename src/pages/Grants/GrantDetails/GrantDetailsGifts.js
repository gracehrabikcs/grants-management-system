import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetailsGifts.css";


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
const GiftRow = ({ gift, onToggleAcknowledge, onEdit, onDelete }) => {
  return (
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

      {/* FILES COLUMN REMOVED */}

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
        {/* ADD FILES BUTTON REMOVED */}
      </td>
    </tr>
  );
};


/* ------------------ Empty Invoice Factory ------------------ */
const emptyGift = () => ({
  date: "",
  spent: 0,
  purpose: "",
  acknowledged: false,
  // files removed
});


/* ------------------ Main Component ------------------ */
export default function GrantDetailsGifts() {
  const { id } = useParams();
  const grantId = Number(id);

  const [gifts, setGifts] = useState([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  // Modal state
  const [modal, setModal] = useState({
    open: false,
    mode: "add",
    gift: emptyGift(),
    editId: null,
    modalIdPreview: "",
  });


  /* ------------------ Load Gifts ------------------ */
  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((res) => res.json())
      .then((data) => {
        const selected = data.find((g) => g.id === grantId);
        if (selected && selected.gifts) {
          const normalized = selected.gifts.map((x) => ({
            ...x,
            spent: Number(x.spent) || 0,
            acknowledged: !!x.acknowledged,
            purpose: x.purpose || "",
            // files removed
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


  /* ------------------ Summary Totals ------------------ */
  const totals = useMemo(() => {
    const totalReceived = 0; // external source
    const totalSpent = gifts.reduce((sum, g) => sum + Number(g.spent || 0), 0);
    const remaining = totalReceived - totalSpent;
    return { totalReceived, totalSpent, remaining };
  }, [gifts]);


  /* ------------------ Search + Sort ------------------ */
  const displayed = useMemo(() => {
    let filtered = gifts.filter((g) => {
      if (!query) return true;
      const q = query.toLowerCase();
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
  }, [gifts, query, sortBy, sortDir]);


  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };


  /* ------------------ Acknowledge ------------------ */
  const handleToggleAcknowledge = (giftId) => {
    setGifts((prev) =>
      prev.map((g) =>
        g.id === giftId ? { ...g, acknowledged: !g.acknowledged } : g
      )
    );
  };


  /* ------------------ ID Generator ------------------ */
  const generateNextId = (list) =>
    !list || list.length === 0
      ? 1
      : Math.max(...list.map((it) => Number(it.id || 0))) + 1;


  /* ------------------ Modal Controls ------------------ */
  const openAddModal = () => {
    const previewId = generateNextId(gifts);
    setModal({
      open: true,
      mode: "add",
      gift: emptyGift(),
      editId: null,
      modalIdPreview: String(previewId),
    });
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


  const handleSaveModal = () => {
    const g = { ...modal.gift, spent: Number(modal.gift.spent) || 0 };
    if (modal.mode === "add") {
      const newId = generateNextId(gifts);
      const newGift = { id: newId, ...g };
      setGifts((prev) => [newGift, ...prev]);
    } else {
      setGifts((prev) =>
        prev.map((it) => (it.id === modal.editId ? { ...it, ...g } : it))
      );
    }
    closeModal();
  };


  const handleDelete = (giftId) => {
    if (!window.confirm("Delete this invoice?")) return;
    setGifts((prev) => prev.filter((g) => g.id !== giftId));
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
          <div className="summary-value">
            {currencyFormat(totals.totalSpent)}
          </div>
        </div>

        <div className="summary-card">
          <label>Remaining Balance</label>
          <div className="summary-value">
            {currencyFormat(totals.remaining)}
          </div>
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="btn-clear" onClick={() => setQuery("")}>
              Clear
            </button>
          )}
        </div>

        <div className="right">
          <div className="sort-controls" style={{ display: "inline-flex", marginLeft: 8 }}>
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
              <tr className="no-results">
                <td colSpan="6">No invoices match your search.</td>
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
                onChange={(e) =>
                  handleModalChange("date", e.target.value)
                }
              />
            </div>

            <div className="modal-row">
              <label>Spent</label>
              <input
                type="text"
                placeholder="$0"
                value={currencyFormat(Number(modal.gift.spent || 0))}
                onChange={(e) =>
                  handleModalChange("spent", e.target.value)
                }
                onFocus={(e) => {
                  const raw = Number(modal.gift.spent) || 0;
                  e.target.value =
                    raw === 0 ? "" : String(raw);
                }}
                onBlur={(e) =>
                  handleModalChange(
                    "spent",
                    parseCurrencyInput(e.target.value)
                  )
                }
              />
            </div>

            <div className="modal-row">
              <label>Purpose</label>
              <textarea
                rows={3}
                value={modal.gift.purpose}
                onChange={(e) =>
                  handleModalChange("purpose", e.target.value)
                }
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
