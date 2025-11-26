import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetailsPledges.css";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  collection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase";

const GrantDetailsPledges = () => {
  const { id } = useParams();
  const grantId = id || "1"; // Firestore doc id for the grant, e.g. "1"

  const [pledges, setPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Notes state (for the side Notes panel)
  const [activePledge, setActivePledge] = useState(null);
  const [notesText, setNotesText] = useState("");
  const [notesTs, setNotesTs] = useState("");

  // ---------- Firestore load ----------
  async function loadPledges() {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "grants", grantId, "pledges"));
      const rows = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPledges(rows);
    } catch (err) {
      console.error("Error loading pledges:", err);
      setError("Could not load pledges.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPledges();
  }, [grantId]);

  // ---------- Helpers ----------
  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  const sum = (arr, key) =>
    arr.reduce((a, x) => a + (Number(x[key]) || 0), 0);

  const totalPledged = sum(pledges, "amount");
  const totalReceived = sum(pledges, "received");
  const outstanding = totalPledged - totalReceived;
  const fulfillment = totalPledged
    ? Math.round((totalReceived / totalPledged) * 100)
    : 0;

  const donutData = [
    { name: "Received", value: totalReceived },
    { name: "Outstanding", value: outstanding },
  ];
  const donutColors = ["#22c55e", "#ef4444"];

  function parseMoney(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  // ---------- CRUD Handlers ----------
  async function handleAddPledge() {
    const donor = prompt("Donor name:");
    if (!donor) return;

    const amountStr = prompt("Total pledged amount:", "0");
    const amount = parseMoney(amountStr);

    const pledgedDate =
      prompt(
        "Pledged date (YYYY-MM-DD):",
        new Date().toISOString().slice(0, 10)
      ) || "";

    const schedule =
      prompt(
        "Schedule (Annual / Quarterly / Semi-Annual / One-time):",
        "Annual"
      ) || "";

    const receivedStr = prompt("Amount received so far:", "0");
    const received = parseMoney(receivedStr);

    try {
      await addDoc(collection(db, "grants", grantId, "pledges"), {
        donor,
        amount,
        pledgedDate,
        schedule,
        received,
        createdAt: serverTimestamp(),
      });
      await loadPledges();
    } catch (err) {
      console.error("Error adding pledge:", err);
      alert("Could not add pledge.");
    }
  }

  async function handleEditPledge(row) {
    const donor =
      prompt("Donor name:", row.donor || "") ?? row.donor;

    const amountStr =
      prompt("Total pledged amount:", row.amount ?? "") ?? row.amount;
    const amount = parseMoney(amountStr);

    const pledgedDate =
      prompt(
        "Pledged date (YYYY-MM-DD):",
        row.pledgedDate || ""
      ) ?? row.pledgedDate;

    const schedule =
      prompt("Schedule:", row.schedule || "") ?? row.schedule;

    const receivedStr =
      prompt("Amount received so far:", row.received ?? "") ??
      row.received;
    const received = parseMoney(receivedStr);

    try {
      const ref = doc(db, "grants", grantId, "pledges", row.id);
      await updateDoc(ref, {
        donor,
        amount,
        pledgedDate,
        schedule,
        received,
        updatedAt: serverTimestamp(),
      });
      await loadPledges();
    } catch (err) {
      console.error("Error updating pledge:", err);
      alert("Could not update pledge.");
    }
  }

  async function handleDeletePledge(row) {
    if (!window.confirm(`Delete pledge from "${row.donor}"?`)) return;
    try {
      const ref = doc(db, "grants", grantId, "pledges", row.id);
      await deleteDoc(ref);
      await loadPledges();
    } catch (err) {
      console.error("Error deleting pledge:", err);
      alert("Could not delete pledge.");
    }
  }

  // ---------- Notes Handlers (side panel) ----------
  async function openNotesPanel(row) {
    setActivePledge(row);
    setNotesText("");
    setNotesTs("");

    try {
      const ref = doc(db, "grants", grantId, "pledges", row.id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setNotesText(data.notes || "");
        setNotesTs(
          data.notesUpdatedAt
            ? data.notesUpdatedAt.toDate().toLocaleString()
            : "Not saved yet"
        );
      } else {
        setNotesTs("Not saved yet");
      }
    } catch (err) {
      console.error("Error loading pledge notes:", err);
    }
  }

  async function saveNotes() {
    if (!activePledge) return;

    try {
      const ref = doc(db, "grants", grantId, "pledges", activePledge.id);
      await updateDoc(ref, {
        notes: notesText,
        notesUpdatedAt: serverTimestamp(),
      });

      setNotesTs(new Date().toLocaleString());
      alert("Notes saved.");
    } catch (err) {
      console.error("Error saving pledge notes:", err);
      alert("Could not save notes.");
    }
  }

  // ---------- Render ----------
  return (
    <div className="content">
      <div className="gms-wrap">
        {/* KPI Row */}
        <div className="gms-grid gms-grid-4">
          <KpiCard
            title="Total Pledged"
            subtitle={`From ${pledges.length} pledges`}
          >
            <div className="gms-kpi">
              {currency.format(totalPledged || 0)}
            </div>
          </KpiCard>

          <KpiCard
            title="Total Received"
            subtitle={
              totalPledged
                ? `${Math.round(
                    (totalReceived / totalPledged) * 100
                  )}% of total pledged`
                : "—"
            }
          >
            <div className="gms-kpi gms-green">
              {currency.format(totalReceived || 0)}
            </div>
          </KpiCard>

          <KpiCard
            title="Outstanding"
            subtitle={
              totalPledged
                ? `${
                    100 -
                    Math.round(
                      (totalReceived / totalPledged) * 100
                    )
                  }% remaining`
                : "—"
            }
          >
            <div className="gms-kpi gms-red">
              {currency.format(outstanding || 0)}
            </div>
          </KpiCard>

          <KpiCard title="Fulfillment Rate">
            <div className="gms-kpi">{fulfillment}%</div>
            <div className="gms-bar">
              <div
                className="gms-bar-fill"
                style={{ width: `${fulfillment}%` }}
              />
            </div>
          </KpiCard>
        </div>

        {/* Charts + Notes panel */}
        <div className="gms-grid gms-grid-2">
          <Panel
            title="Pledge Status Distribution"
            subtitle="Breakdown of received vs outstanding amounts"
          >
            <div className="gms-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                  >
                    {donutData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={donutColors[i % donutColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) =>
                      currency.format(Number(v) || 0)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            title="Notes"
            subtitle={
              activePledge
                ? `Pledge Notes — ${activePledge.donor}`
                : "Select a pledge and click 📝 to view or edit notes."
            }
          >
            {!activePledge ? (
              <div className="gms-subtle">
                Choose a pledge from the table below and click the 📝
                Notes button to view or edit its notes here.
              </div>
            ) : (
              <>
                <textarea
                  className="gms-notes"
                  rows={8}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                />

                <div className="gms-micro gms-mt8">
                  Last updated: {notesTs || "Not saved yet"}
                </div>

                <div
                  className="gms-modal-footer"
                  style={{ marginTop: 8 }}
                >
                  <button
                    className="gms-btn primary"
                    onClick={saveNotes}
                  >
                    Save Notes
                  </button>
                  <button
                    className="gms-btn"
                    onClick={() => {
                      setActivePledge(null);
                      setNotesText("");
                      setNotesTs("");
                    }}
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
          </Panel>
        </div>

        {/* Table + Add button */}
        <Panel
          title="Individual Pledge Records"
          subtitle="Detailed view of all pledges and payment tracking"
        >
          <div className="gms-flex-between gms-mb8">
            <div className="gms-subtle"></div>
            <button className="gms-btn" onClick={handleAddPledge}>
              + Add Pledge
            </button>
          </div>

          {loading && (
            <div className="gms-subtle">Loading pledges…</div>
          )}
          {error && (
            <div
              className="gms-subtle gms-red"
              style={{ marginBottom: 8 }}
            >
              {error}
            </div>
          )}

          <div className="gms-table-wrap">
            <table className="gms-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Pledged Date</th>
                  <th>Schedule</th>
                  <th>Received</th>
                  <th>Outstanding</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pledges.map((row) => {
                  const rowOutstanding =
                    (Number(row.amount) || 0) -
                    (Number(row.received) || 0);
                  return (
                    <tr key={row.id}>
                      <td>{row.donor}</td>
                      <td>{currency.format(row.amount || 0)}</td>
                      <td>{row.pledgedDate}</td>
                      <td>{row.schedule}</td>
                      <td className="gms-green">
                        {currency.format(row.received || 0)}
                      </td>
                      <td
                        className={
                          rowOutstanding > 0 ? "gms-red" : ""
                        }
                      >
                        {currency.format(rowOutstanding)}
                      </td>
                      <td className="gms-flex gap8">
                        <button
                          className="gms-kebab"
                          title="Edit pledge"
                          onClick={() => handleEditPledge(row)}
                        >
                          ✏️
                        </button>
                        <button
                          className="gms-kebab"
                          title="Delete pledge"
                          onClick={() => handleDeletePledge(row)}
                        >
                          🗑️
                        </button>
                        <button
                          className="gms-kebab"
                          title="Pledge Notes"
                          onClick={() => openNotesPanel(row)}
                        >
                          📝
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!loading && pledges.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No pledges for this grant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
};

// helper components
function KpiCard({ title, subtitle, children }) {
  return (
    <div className="gms-card">
      <div className="gms-subtle">{title}</div>
      <div className="gms-stack">{children}</div>
      {subtitle && <div className="gms-micro">{subtitle}</div>}
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="gms-card">
      <div className="gms-head">{title}</div>
      {subtitle && (
        <div className="gms-subtle" style={{ marginBottom: 8 }}>
          {subtitle}
        </div>
      )}
      {children}
    </div>
  );
}

export default GrantDetailsPledges;









