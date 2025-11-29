import "../../../styles/GrantDetailsTracking.css";
import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../firebase";

export default function GrantDetailsTracking({ grantId }) {
  const [sections, setSections] = useState([]);
  const [tasksBySection, setTasksBySection] = useState({});
  const [showSections, setShowSections] = useState({});
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [hideDone, setHideDone] = useState(false);

  // NEW — editing section state
  const [editingSection, setEditingSection] = useState(null);
  const [sectionNameInput, setSectionNameInput] = useState("");

  // Load sections
  useEffect(() => {
    if (!grantId) return;
    const ref = collection(db, "grants", grantId, "trackingSections");

    const unsub = onSnapshot(ref, (snapshot) => {
      const secList = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setSections(secList);

      // Ensure visibility state is preserved
      setShowSections((prev) => {
        const updated = { ...prev };
        secList.forEach((s) => {
          if (updated[s.id] === undefined) updated[s.id] = true;
        });
        return updated;
      });
    });

    return unsub;
  }, [grantId]);

  // Load tasks for each section
  useEffect(() => {
    if (!grantId) return;
    const unsubs = [];
    const tasksState = {};

    sections.forEach((section) => {
      const tasksRef = collection(
        db,
        "grants",
        grantId,
        "trackingSections",
        section.id,
        "trackingTasks"
      );

      const unsub = onSnapshot(tasksRef, (snapshot) => {
        tasksState[section.id] = snapshot.docs.map((d) => {
          const data = d.data();
          return { id: d.id, ...data };
        });

        setTasksBySection((prev) => ({
          ...prev,
          ...tasksState,
        }));
      });

      unsubs.push(unsub);
    });

    return () => unsubs.forEach((u) => u());
  }, [sections, grantId]);

  // --- Section Name Editing ---
  const startEditingSection = (sectionId, name) => {
    setEditingSection(sectionId);
    setSectionNameInput(name);
  };

  const saveSectionName = async (sectionId) => {
    await updateDoc(
      doc(db, "grants", grantId, "trackingSections", sectionId),
      {
        "Section Name": sectionNameInput,
      }
    );
    setEditingSection(null);
  };

  // Section toggle
  const toggleSection = (sectionId) => {
    setShowSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleAddSection = async () => {
    const name = prompt("Enter new section name:");
    if (!name) return;
    await addDoc(collection(db, "grants", grantId, "trackingSections"), {
      "Section Name": name,
    });
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Delete this section?")) return;
    await deleteDoc(
      doc(db, "grants", grantId, "trackingSections", sectionId)
    );
  };

  const handleAddTask = async (sectionId) => {
    const existing = tasksBySection[sectionId] || [];
    const maxOrder = existing.reduce(
      (m, t) => Math.max(m, t["Task Order"] ?? 0),
      -1
    );

    await addDoc(
      collection(
        db,
        "grants",
        grantId,
        "trackingSections",
        sectionId,
        "trackingTasks"
      ),
      {
        Task: "New Task",
        "Task Status": "To Do",
        "Assignee Email": "",
        "Task Notes": "",
        "Task Deadline": "",
        "File Location": "",
        "Task Order": maxOrder + 1,
      }
    );
  };

  const handleDeleteTask = async (sectionId, taskId) => {
    if (!window.confirm("Delete this task?")) return;
    await deleteDoc(
      doc(
        db,
        "grants",
        grantId,
        "trackingSections",
        sectionId,
        "trackingTasks",
        taskId
      )
    );
  };

  const updateTaskField = async (sectionId, taskId, field, value) => {
    await updateDoc(
      doc(
        db,
        "grants",
        grantId,
        "trackingSections",
        sectionId,
        "trackingTasks",
        taskId
      ),
      { [field]: value }
    );
  };

  const filteredAndSortedTasks = (tasks) => {
    let result = [...tasks];
    if (search)
      result = result.filter((t) =>
        t.Task.toLowerCase().includes(search.toLowerCase())
      );
    if (hideDone)
      result = result.filter((t) => t["Task Status"] !== "Done");

    const statusOrder = ["To Do", "In Progress", "Done"];

    result.sort((a, b) => {
      const diff =
        statusOrder.indexOf(a["Task Status"]) -
        statusOrder.indexOf(b["Task Status"]);
      if (diff !== 0) return sortAsc ? diff : -diff;

      return sortAsc
        ? a.Task.localeCompare(b.Task)
        : b.Task.localeCompare(a.Task);
    });

    return result;
  };

  // --- Render Section Header ---
  const renderSectionHeader = (section) => {
    return (
      <div className="task-section-header">
        {editingSection === section.id ? (
          <input
            value={sectionNameInput}
            onChange={(e) => setSectionNameInput(e.target.value)}
            onBlur={() => saveSectionName(section.id)}
            autoFocus
          />
        ) : (
          <h3
            onClick={() => toggleSection(section.id)}
            onDoubleClick={() =>
              startEditingSection(section.id, section["Section Name"])
            }
            style={{ cursor: "pointer" }}
          >
            {section["Section Name"]}{" "}
            {showSections[section.id] ? "▼" : "▶"}
          </h3>
        )}

        <div className="section-actions">
          <button
            className="action-btn small"
            onClick={() => handleAddTask(section.id)}
          >
            + Add Task
          </button>
          <button
            className="action-btn small delete"
            onClick={() => handleDeleteSection(section.id)}
          >
            ✕ Delete Section
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="tracking-container">
      <h2>Grant Task Tracking</h2>

      <div className="tracking-controls">
        <button className="action-btn" onClick={handleAddSection}>
          + New Section
        </button>

        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="action-btn" onClick={() => setSortAsc(!sortAsc)}>
          Sort {sortAsc ? "▲" : "▼"}
        </button>

        <button className="action-btn" onClick={() => setHideDone(!hideDone)}>
          {hideDone ? "Show All" : "Hide Done"}
        </button>
      </div>

      {sections.map((section) => {
        const tasks =
          filteredAndSortedTasks(tasksBySection[section.id] || []);

        return (
          <div key={section.id} className="task-section">
            {renderSectionHeader(section)}

            {showSections[section.id] && (
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Assignee Email</th>
                    <th>Notes</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <input
                          value={task.Task || ""}
                          onChange={(e) =>
                            updateTaskField(
                              section.id,
                              task.id,
                              "Task",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <select
                          value={task["Task Status"] || "To Do"}
                          onChange={(e) =>
                            updateTaskField(
                              section.id,
                              task.id,
                              "Task Status",
                              e.target.value
                            )
                          }
                        >
                          <option>To Do</option>
                          <option>In Progress</option>
                          <option>Done</option>
                        </select>
                      </td>

                      <td>
                        <input
                          type="email"
                          value={task["Assignee Email"] || ""}
                          onChange={(e) =>
                            updateTaskField(
                              section.id,
                              task.id,
                              "Assignee Email",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <textarea
                          value={task["Task Notes"] || ""}
                          rows={2}
                          onChange={(e) =>
                            updateTaskField(
                              section.id,
                              task.id,
                              "Task Notes",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="datetime-local"
                          value={task["Task Deadline"] || ""}
                          onChange={(e) =>
                            updateTaskField(
                              section.id,
                              task.id,
                              "Task Deadline",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <button
                          className="action-btn small delete"
                          onClick={() =>
                            handleDeleteTask(section.id, task.id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}
