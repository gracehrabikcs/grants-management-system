import React, { useState } from "react";
import "../../../styles/GrantDetails.css"; // We'll use the same CSS as the main page for consistency


const GrantDetailsTracking = () => {
  const [tasks, setTasks] = useState({
    "Application Process": [
      {
        id: 1,
        name: "Review grant application",
        status: "To Do",
        files: [],
        assignee: "Alice",
      },
      {
        id: 2,
        name: "Verify budget",
        status: "In Progress",
        files: [],
        assignee: "Bob",
      },
    ],
    "Reporting Requirements": [
      {
        id: 3,
        name: "Quarterly financial report",
        status: "Done",
        files: [],
        assignee: "Charlie",
      },
    ],
  });

  const [search, setSearch] = useState("");
  const [showSections, setShowSections] = useState({
    "Application Process": true,
    "Reporting Requirements": true,
  });

  const handleToggleSection = (section) => {
    setShowSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFileChange = (section, taskId, event) => {
    const file = event.target.files[0];
    setTasks((prev) => ({
      ...prev,
      [section]: prev[section].map((task) =>
        task.id === taskId
          ? { ...task, files: [...task.files, file] }
          : task
      ),
    }));
  };

  const handleStatusChange = (section, taskId, event) => {
    const status = event.target.value;
    setTasks((prev) => ({
      ...prev,
      [section]: prev[section].map((task) =>
        task.id === taskId ? { ...task, status } : task
      ),
    }));
  };

  return (
    <div className="tracking-container">
      {/* Top controls */}
      <div className="tracking-controls">
        <button className="action-btn">+ New Task</button>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="action-btn">Filter</button>
        <button className="action-btn">Sort</button>
        <button className="action-btn">Hide</button>
      </div>

      {/* Task Sections */}
      {Object.keys(tasks).map((section) => (
        <div className="task-section" key={section}>
          <h3
            className="task-section-title"
            onClick={() => handleToggleSection(section)}
            style={{ cursor: "pointer" }}
          >
            {section} {showSections[section] ? "▼" : "▶"}
          </h3>

          {showSections[section] && (
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Files</th>
                  <th>Assignee</th>
                </tr>
              </thead>
              <tbody>
                {tasks[section]
                  .filter((task) =>
                    task.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((task) => (
                    <tr key={task.id}>
                      <td>{task.name}</td>
                      <td>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(section, task.id, e)}
                        >
                          <option>To Do</option>
                          <option>In Progress</option>
                          <option>Done</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(section, task.id, e)}
                        />
                        {task.files.length > 0 && (
                          <ul>
                            {task.files.map((file, idx) => (
                              <li key={idx}>{file.name}</li>
                            ))}
                          </ul>
                        )}
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
                              ),
                            }))
                          }
                        />
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
