import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/GrantDetails.css";
import "../../../styles/GrantDetailsTracking.css";

const GrantDetailsTracking = () => {
  const { id } = useParams();
  const [grant, setGrant] = useState(null);
  const [tasks, setTasks] = useState({});
  const [search, setSearch] = useState("");
  const [showSections, setShowSections] = useState({});
  const [sortAsc, setSortAsc] = useState(true);
  const [hideDone, setHideDone] = useState(false);

  // Helper: calculate progress from tasks
  const calculateProgress = (tasksObj) => {
    const allTasks = Object.values(tasksObj).flat();
    if (allTasks.length === 0) return 0;
    const doneTasks = allTasks.filter((t) => t.status === "Done").length;
    return Math.round((doneTasks / allTasks.length) * 100);
  };

  // Load grant details from JSON
  useEffect(() => {
    fetch("/data/grantDetails.json")
      .then((res) => res.json())
      .then((data) => {
        const selected = data.find((g) => g.id === parseInt(id));
        if (selected) {
          setGrant(selected);

          // Use tasks from JSON if available, otherwise empty
          const grantTasks = selected.tracking || {};
          setTasks(grantTasks);

          setShowSections(
            Object.keys(grantTasks).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {})
          );
        }
      })
      .catch((err) => console.error("Error loading grant:", err));
  }, [id]);

  // Toggle section visibility
  const handleToggleSection = (section) => {
    setShowSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Section operations
  const handleAddSection = () => {
    const newSection = prompt("Enter new task category/section name:");
    if (newSection && !tasks[newSection]) {
      setTasks({ ...tasks, [newSection]: [] });
      setShowSections({ ...showSections, [newSection]: true });
    }
  };

  const handleDeleteSection = (section) => {
    if (window.confirm(`Delete the entire section "${section}"?`)) {
      const updated = { ...tasks };
      delete updated[section];
      setTasks(updated);
    }
  };

  // Task operations
  const handleAddTask = (section) => {
    const taskName = prompt("Enter new task name:");
    if (!taskName) return;
    const newTask = { id: Date.now(), name: taskName, status: "To Do", files: [], assignee: "" };
    setTasks((prev) => ({ ...prev, [section]: [...prev[section], newTask] }));
  };

  const handleDeleteTask = (section, taskId) => {
    if (window.confirm("Delete this task?")) {
      setTasks((prev) => ({
        ...prev,
        [section]: prev[section].filter((task) => task.id !== taskId)
      }));
    }
  };

  const handleFileChange = (section, taskId, event) => {
    const file = event.target.files[0];
    setTasks((prev) => ({
      ...prev,
      [section]: prev[section].map((task) =>
        task.id === taskId ? { ...task, files: [...task.files, file] } : task
      )
    }));
  };

  const handleStatusChange = (section, taskId, event) => {
    const status = event.target.value;
    setTasks((prev) => ({
      ...prev,
      [section]: prev[section].map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    }));
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = (sectionTasks) => {
    let result = [...sectionTasks];
    if (search) result = result.filter((task) => task.name.toLowerCase().includes(search.toLowerCase()));
    if (hideDone) result = result.filter((task) => task.status !== "Done");

    const statusOrder = ["To Do", "In Progress", "Done"];
    result.sort((a, b) => {
      const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      if (statusDiff !== 0) return sortAsc ? statusDiff : -statusDiff;
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });

    return result;
  };

  if (!grant) return <p>Loading grant details...</p>;

  return (
    <div className="tracking-container">
      <h2>{grant.title} – Task Tracking</h2>

      <div className="tracking-controls">
        <button className="action-btn" onClick={handleAddSection}>+ New Section</button>
        <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="action-btn" onClick={() => setSortAsc(!sortAsc)}>Sort {sortAsc ? "▲" : "▼"}</button>
        <button className="action-btn" onClick={() => setHideDone(!hideDone)}>{hideDone ? "Show All" : "Hide Done"}</button>
      </div>

      {Object.keys(tasks).map((section) => (
        <div className="task-section" key={section}>
          <div className="task-section-header">
            <h3 className="task-section-title" onClick={() => handleToggleSection(section)} style={{ cursor: "pointer" }}>
              {section} {showSections[section] ? "▼" : "▶"}
            </h3>
            <div className="section-actions">
              <button className="action-btn small" onClick={() => handleAddTask(section)}>+ Add Task</button>
              <button className="action-btn small delete" onClick={() => handleDeleteSection(section)}>✕ Delete Section</button>
            </div>
          </div>

          {showSections[section] && (
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Files</th>
                  <th>Assignee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTasks(tasks[section]).map((task) => (
                  <tr key={task.id}>
                    <td>{task.name}</td>
                    <td>
                      <select value={task.status} onChange={(e) => handleStatusChange(section, task.id, e)}>
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                    </td>
                    <td>
                      <input type="file" onChange={(e) => handleFileChange(section, task.id, e)} />
                      {task.files.length > 0 && <ul>{task.files.map((file, idx) => <li key={idx}>{file.name}</li>)}</ul>}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={task.assignee}
                        onChange={(e) =>
                          setTasks((prev) => ({
                            ...prev,
                            [section]: prev[section].map((t) =>
                              t.id === task.id ? { ...t, assignee: e.target.value } : t
                            )
                          }))
                        }
                      />
                    </td>
                    <td>
                      <button className="action-btn small delete" onClick={() => handleDeleteTask(section, task.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};

export default GrantDetailsTracking;
