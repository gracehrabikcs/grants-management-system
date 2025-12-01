import React, { useState, useEffect } from "react";
import "../../styles/Grants.css";
import { useNavigate } from "react-router-dom";
import { deleteDoc, collection, getDocs, doc } from "firebase/firestore";
import { db } from "../../firebase"; // adjust path if needed

const Grants = () => {
  const [grants, setGrants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortAsc, setSortAsc] = useState(false); // false = descending by default
  const navigate = useNavigate();

  const formatDate = (val) => {
    if (!val) return "";
    let date;
    if (typeof val.toDate === "function") date = val.toDate();
    else if (val.seconds) date = new Date(val.seconds * 1000);
    else date = new Date(val);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${month}/${day}/${year}`;
  };

  // Utility to make any date sortable
  const toDateValue = (d) => {
    if (!d) return 0;
    if (typeof d.toDate === "function") return d.toDate().getTime();
    if (d.seconds) return d.seconds * 1000;
    return new Date(d).getTime() || 0;
  };

  const computeProgressFromSections = (sectionsArray) => {
    if (!sectionsArray || sectionsArray.length === 0) return 0;
    let totalTasks = 0;
    let completedValue = 0;
    const statusWeight = { "To Do": 0, "In Progress": 0.5, "Done": 1 };
    sectionsArray.forEach((section) => {
      (section.tasks || []).forEach((task) => {
        totalTasks += 1;
        const s = task["Task Status"] || task.TaskStatus || task.status || "";
        completedValue += statusWeight[s] || 0;
      });
    });
    if (totalTasks === 0) return 0;
    return Math.round((completedValue / totalTasks) * 100);
  };

  // Load grants
  useEffect(() => {
    const loadAll = async () => {
      try {
        const grantsSnap = await getDocs(collection(db, "grants"));
        const results = [];

        for (const gDoc of grantsSnap.docs) {
          const raw = { id: gDoc.id, ...gDoc.data() };

          const Organization = raw.Organization || raw.organization || raw.org || "";
          const Title = raw.Title || raw.title || raw.name || "";

          const status =
            raw.Main?.["Application Management"]?.["Application Status"] || "";

          const fiscalYear =
            raw.Main?.["Application Management"]?.["Fiscal Year"] || "Unknown";

          const applicationDate =
            raw.Main?.["Application Management"]?.["Application Date"] || null;

          // Total pledges
          let totalPledges = 0;
          try {
            const pledgesSnap = await getDocs(collection(db, "grants", gDoc.id, "pledges"));
            pledgesSnap.forEach((p) => {
              const amt = p.data()?.amount;
              if (typeof amt === "number") totalPledges += amt;
              else if (!isNaN(Number(amt))) totalPledges += Number(amt);
            });
          } catch (e) {}

          // Tracking sections & tasks
          const sections = [];
          try {
            const sectionsSnap = await getDocs(
              collection(db, "grants", gDoc.id, "trackingSections")
            );
            for (const sDoc of sectionsSnap.docs) {
              const sRaw = { id: sDoc.id, ...sDoc.data() };
              const tasks = [];
              try {
                const tasksSnap = await getDocs(
                  collection(db, "grants", gDoc.id, "trackingSections", sDoc.id, "trackingTasks")
                );
                tasksSnap.forEach((t) => tasks.push({ id: t.id, ...t.data() }));
              } catch (e) {}
              sections.push({ ...sRaw, tasks });
            }
          } catch (e) {}

          const progress = computeProgressFromSections(sections);
          const reportDeadline = raw.Main?.["Application Management"]?.["reportDeadline"] || null;

          results.push({
            id: gDoc.id,
            Organization,
            Title,
            status,
            fiscalYear,
            applicationDate,
            totalPledges,
            trackingSections: sections,
            progress,
            reportDeadline,
            raw,
          });
        }

        // Default sort: newest first (descending)
        results.sort((a, b) => toDateValue(b.applicationDate) - toDateValue(a.applicationDate));

        setGrants(results);
      } catch (err) {
        console.error("Error loading grants:", err);
      }
    };

    loadAll();
  }, []);

  // Filtered + sorted
  const filtered = grants
    .filter((g) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (g.Title || "").toLowerCase().includes(q) ||
        (g.Organization || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All" || (g.status || "") === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) =>
      sortAsc
        ? toDateValue(a.applicationDate) - toDateValue(b.applicationDate)
        : toDateValue(b.applicationDate) - toDateValue(a.applicationDate)
    );

  const handleCardClick = (id) => navigate(`/grants/${id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this grant permanently?")) return;

    try {
      const pledgesSnap = await getDocs(collection(db, "grants", id, "pledges"));
      for (const p of pledgesSnap.docs)
        await deleteDoc(doc(db, "grants", id, "pledges", p.id));

      const sectionsSnap = await getDocs(collection(db, "grants", id, "trackingSections"));
      for (const s of sectionsSnap.docs) {
        const tasksSnap = await getDocs(
          collection(db, "grants", id, "trackingSections", s.id, "trackingTasks")
        );
        for (const t of tasksSnap.docs)
          await deleteDoc(
            doc(db, "grants", id, "trackingSections", s.id, "trackingTasks", t.id)
          );

        await deleteDoc(doc(db, "grants", id, "trackingSections", s.id));
      }

      await deleteDoc(doc(db, "grants", id));
      setGrants((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="grants-container">
      <header className="grants-header">
        <div className="grants-header-top">
          <div className="grants-title">
            <h1>All Grants</h1>
            <p>Comprehensive view of all grant applications and their current status</p>
          </div>

          <button className="add-grant-btn" onClick={() => navigate("/grants/new")}>
            + Add New Grant
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search grants..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="filter-buttons">
          {["All", "Active", "Under Review", "Approved", "Completed"].map((s) => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? "active-filter" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}

          <button className="filter-btn" onClick={() => setSortAsc((prev) => !prev)}>
            Sort by Application Date {sortAsc ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div className="grant-grid">
        {filtered.map((g) => (
          <div key={g.id} className="grant-card" onClick={() => handleCardClick(g.id)}>
            <h3>{g.Title || "Untitled"}</h3>
            <p className="organization">{g.Organization}</p>
            <p className="grant-id">Grant ID: {g.id}</p>

            <span
              className={`status ${String(g.status || "").toLowerCase().replace(/\s+/g, "")}`}
            >
              {g.status || "Unknown"}
            </span>

            <div className="grant-info">
              <p>
                <strong>Total Pledges:</strong>{" "}
                ${Number(g.totalPledges || 0).toLocaleString()}
              </p>
              <p>
                <strong>Application Date:</strong>{" "}
                {formatDate(g.applicationDate)}
              </p>
              <p>
                <strong>Report Deadline:</strong> {formatDate(g.reportDeadline)}
              </p>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${g.progress}%` }} />
            </div>
            <p className="progress-text">{g.progress}%</p>

            <button
              className="grant-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(g.id);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grants;
