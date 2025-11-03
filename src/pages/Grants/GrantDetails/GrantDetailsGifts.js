import React, { useState, useMemo } from "react";

const initialGifts = [
  {
    id: "GFT-001",
    date: "2025-09-15",
    amount: 15000,
    spent: 12000,
    budgetCode: "EDU-101",
    type: "Restricted",
    status: "Received",
    purpose: "Teacher training",
    fiscalYear: "FY2025",
    compliance: "Compliant",
    acknowledged: true,
  },
  {
    id: "GFT-002",
    date: "2025-06-01",
    amount: 10000,
    spent: 2500,
    budgetCode: "EDU-102",
    type: "Unrestricted",
    status: "Pending",
    purpose: "Curriculum development",
    fiscalYear: "FY2025",
    compliance: "Under Review",
    acknowledged: false,
  },
  {
    id: "GFT-003",
    date: "2024-12-10",
    amount: 25000,
    spent: 12500,
    budgetCode: "EDU-103",
    type: "Restricted",
    status: "Received",
    purpose: "Student scholarships",
    fiscalYear: "FY2024",
    compliance: "Compliant",
    acknowledged: true,
  },
];

const currencyFormat = (value) =>
  value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const GiftRow = ({ gift, onToggleAcknowledge }) => {
  const remaining = gift.amount - gift.spent;
  return (
    <tr>
      <td className="col-id">{gift.id}</td>
      <td className="col-date">{gift.date}</td>
      <td className="col-amount">{currencyFormat(gift.amount)}</td>
      <td className="col-spent">{currencyFormat(gift.spent)}</td>
      <td className="col-remaining">{currencyFormat(remaining)}</td>
      <td className="col-budget">{gift.budgetCode}</td>
      <td className="col-type">{gift.type}</td>
      <td className="col-status">
        <span className={`badge status-${gift.status.toLowerCase()}`}>{gift.status}</span>
      </td>
      <td className="col-purpose">{gift.purpose}</td>
      <td className="col-fy">{gift.fiscalYear}</td>
      <td className="col-compliance">
        <span className={`badge compliance-${gift.compliance.toLowerCase().replace(/\s/g, "-")}`}>
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
    </tr>
  );
};

const GrantDetailsGifts = () => {
  const [gifts, setGifts] = useState(initialGifts);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date"); // 'date' or 'amount'
  const [sortDir, setSortDir] = useState("desc"); // 'asc' or 'desc'
  const [showOnly, setShowOnly] = useState("all"); // placeholder for filter (all, received, pending)

// Meta row state for editable fields
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [meta, setMeta] = useState({
    fiscalYear: "FY 2025",
    grantManager: "Sarah Johnson",
    nextReportDue: "2026-03-01",
  });

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setMeta((prev) => ({ ...prev, [name]: value }));
  };

  // Derived totals for summary cards
  const totals = useMemo(() => {
    const totalReceived = gifts.reduce((sum, g) => sum + g.amount * (g.status === "Received" ? 1 : 0), 0);
    const totalSpent = gifts.reduce((sum, g) => sum + g.spent, 0);
    const remaining = totalReceived - totalSpent;
    const complianceOnTrack = gifts.every((g) => g.compliance === "Compliant");
    return { totalReceived, totalSpent, remaining, complianceOnTrack };
  }, [gifts]);

  // Search + Filter + Sort applied to the table
  const displayed = useMemo(() => {
    let filtered = gifts.filter((g) => {
      // showOnly filter
      if (showOnly === "received" && g.status !== "Received") return false;
      if (showOnly === "pending" && g.status !== "Pending") return false;

      // search (match id, purpose, type, budget code)
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        g.id.toLowerCase().includes(q) ||
        g.purpose.toLowerCase().includes(q) ||
        g.type.toLowerCase().includes(q) ||
        g.budgetCode.toLowerCase().includes(q)
      );
    });

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
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

  const handleToggleAcknowledge = (id) => {
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, acknowledged: !g.acknowledged } : g)));
  };

  const handleAddGift = () => {
    alert("Add Gift");
  };

  const handleClearSearch = () => setQuery("");

  return (
    <div className="grant-gifts-container">
      {/* Summary panel */}
      <div className="gifts-summary-container">
        <div className="summary-card">
          <label>Total Received</label>
          <div className="summary-value">{currencyFormat(totals.totalReceived)}</div>
        </div>
        <div className="summary-card">
          <label>Total Spent</label>
          <div className="summary-value">{currencyFormat(totals.totalSpent)}</div>
          <div className="summary-sub">({(totals.totalSpent === 0 ? 0 : Math.round((totals.totalSpent / (totals.totalReceived || 1)) * 100))}% of received)</div>
        </div>
        <div className="summary-card">
          <label>Remaining Balance</label>
          <div className="summary-value">{currencyFormat(totals.remaining)}</div>
        </div>
      </div>

      <div className="gifts-meta-row">
  <div>
    <strong>Fiscal Year:</strong>{" "}
    {isEditingMeta ? (
      <input
        type="text"
        name="fiscalYear"
        value={meta.fiscalYear}
        onChange={handleMetaChange}
      />
    ) : (
      meta.fiscalYear
    )}
  </div>

  <div>
    <strong>Grant Manager:</strong>{" "}
    {isEditingMeta ? (
      <input
        type="text"
        name="grantManager"
        value={meta.grantManager}
        onChange={handleMetaChange}
      />
    ) : (
      meta.grantManager
    )}
  </div>

  <div>
    <strong>Next Report Due:</strong>{" "}
    {isEditingMeta ? (
      <input
        type="date"
        name="nextReportDue"
        value={meta.nextReportDue}
        onChange={handleMetaChange}
      />
    ) : (
      meta.nextReportDue
    )}
  </div>

  {/* Edit / Save button */}
  <button
    className="btn-primary"
    onClick={() => setIsEditingMeta(!isEditingMeta)}
  >
    {isEditingMeta ? "Save" : "Edit"}
  </button>
</div>



      {/* Toolbar */}
      <div className="gifts-toolbar">
        <div className="left">
          <button className="btn-primary" onClick={handleAddGift}>+ New Gift</button>
        </div>

        <div className="center">
          <input
            className="gifts-search"
            placeholder="Search gifts by ID, purpose, type or budget code"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && <button className="btn-clear" onClick={handleClearSearch}>Clear</button>}
        </div>

        <div className="right">
          <button className="btn-filter" onClick={() => setShowOnly("all")}>All</button>
          <button className="btn-filter" onClick={() => setShowOnly("received")}>Received</button>
          <button className="btn-filter" onClick={() => setShowOnly("pending")}>Pending</button>

          <div className="sort-controls">
            <button
              className={`btn-sort ${sortBy === "date" ? "active" : ""}`}
              onClick={() => toggleSort("date")}
            >
              Sort by Date {sortBy === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </button>
            <button
              className={`btn-sort ${sortBy === "amount" ? "active" : ""}`}
              onClick={() => toggleSort("amount")}
            >
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
              <th>Amount</th>
              <th>Spent</th>
              <th>Remaining</th>
              <th>Budget Code</th>
              <th>Type</th>
              <th>Status</th>
              <th>Purpose</th>
              <th>Fiscal Year</th>
              <th>Compliance</th>
              <th>Acknowledge</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr className="no-results"><td colSpan="12">No gifts match your search or filter.</td></tr>
            ) : (
              displayed.map((g) => (
                <GiftRow key={g.id} gift={g} onToggleAcknowledge={handleToggleAcknowledge} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GrantDetailsGifts;
