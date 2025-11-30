import React, { useState, useEffect } from "react";
import "../../styles/Grants.css";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase"; // adjust path if needed

const Grants = () => {
  const [grants, setGrants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  // Robust date formatter that accepts Firestore Timestamp, Date, ISO string, or {seconds,nanoseconds}
  const formatDate = (val) => {
    if (!val && val !== 0) return "";
    // Firestore Timestamp-like object with toDate()
    if (typeof val === "object" && typeof val.toDate === "function") {
      return val.toDate().toLocaleDateString();
    }
    // Plain JS Date
    if (val instanceof Date) {
      return val.toLocaleDateString();
    }
    // Object like { seconds: ..., nanoseconds: ... }
    if (typeof val === "object" && val.seconds) {
      return new Date(val.seconds * 1000).toLocaleDateString();
    }
    // ISO string or anything else coercible
    try {
      const d = new Date(val);
      if (!isNaN(d)) return d.toLocaleDateString();
    } catch (e) {}
    // fallback to string
    return String(val);
  };

  // Calculate progress using same weights as GrantDetailsMain
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

  // Load grants + their pledges + tracking sections/tasks
  useEffect(() => {
    const loadAll = async () => {
      try {
        const grantsSnap = await getDocs(collection(db, "grants"));
        const results = [];

        for (const gDoc of grantsSnap.docs) {
          const raw = { id: gDoc.id, ...gDoc.data() };

          // Normalize basic fields (case differences)
          const Organization = raw.Organization || raw.organization || raw.org || "";
          const Title = raw.Title || raw.title || raw.name || "";
          // Status could be top-level, or inside Main.Application Management
          const status =
            raw.status ||
            raw.Status ||
            raw.main?.["Application Management"]?.["Application Status"] ||
            raw.Main?.["Application Management"]?.["Application Status"] ||
            "";

          // ====== PLEDGES: sum amounts ======
          let totalPledges = 0;
          try {
            const pledgesSnap = await getDocs(collection(db, "grants", gDoc.id, "pledges"));
            pledgesSnap.forEach((p) => {
              const amt = p.data()?.amount;
              if (typeof amt === "number") totalPledges += amt;
              else if (!isNaN(Number(amt))) totalPledges += Number(amt);
            });
          } catch (e) {
            // ignore if no pledges
          }

          // ====== TRACKING SECTIONS & TASKS ======
          const sections = [];
          try {
            const sectionsSnap = await getDocs(collection(db, "grants", gDoc.id, "trackingSections"));
            for (const sDoc of sectionsSnap.docs) {
              const sRaw = { id: sDoc.id, ...sDoc.data() };
              // fetch its tasks
              const tasks = [];
              try {
                const tasksSnap = await getDocs(
                  collection(db, "grants", gDoc.id, "trackingSections", sDoc.id, "trackingTasks")
                );
                tasksSnap.forEach((t) => tasks.push({ id: t.id, ...t.data() }));
              } catch (e) {
                // ignore missing tasks
              }
              sections.push({ ...sRaw, tasks });
            }
          } catch (e) {
            // ignore missing trackingSections
          }

          const progress = computeProgressFromSections(sections);

          // Report deadline reading from several possible locations
          const reportDeadline =
            raw.Main?.["Application Management"]?.["Report Deadline"] ||
            raw.main?.["Application Management"]?.["Report Deadline"] ||
            raw.reportDeadline ||
            raw.ReportDeadline ||
            null;

          results.push({
            id: gDoc.id,
            Organization,
            Title,
            status,
            totalPledges,
            trackingSections: sections,
            progress,
            reportDeadline,
            raw, // keep raw doc for anything else
          });
        }

        setGrants(results);
      } catch (err) {
        console.error("Error loading grants:", err);
      }
    };

    loadAll();
  }, []);

  // Filter
  const filtered = grants.filter((g) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (g.Title || "").toLowerCase().includes(q) ||
      (g.Organization || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || (g.status || "") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCardClick = (id) => navigate(`/grants/${id}`);

  return (
    <div className="grants-container">
      <header className="grants-header">
        <div className="grants-header-top">
          <div className="grants-title">
            <h1>All Grants</h1>
            <p>Comprehensive view of all grant applications and their current status</p>
          </div>

          <button
            className="add-grant-btn"
            onClick={() => navigate("/grants/new")}
          >
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
          {["All", "Active", "Under Review", "Approved"].map((s) => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? "active-filter" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grant-grid">
        {filtered.map((g) => (
          <div
            key={g.id}
            className="grant-card"
            onClick={() => handleCardClick(g.id)}
            style={{ cursor: "pointer" }}
          >
            <h3>{g.Title || "Untitled"}</h3>
            <p className="organization">{g.Organization}</p>

            <span className={`status ${String(g.status || "").toLowerCase().replace(/\s+/g, "")}`}>
              {g.status || "Unknown"}
            </span>

            <div className="grant-info">
              <p>
                <strong>Total Pledges:</strong> ${Number(g.totalPledges || 0).toLocaleString()}
              </p>
              <p>
                <strong>Report Deadline:</strong> {formatDate(g.reportDeadline)}
              </p>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${g.progress}%` }} />
            </div>
            <p className="progress-text">{g.progress}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grants;
