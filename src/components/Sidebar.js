import React from "react";
import "../styles/Sidebar.css";

//adding a test comment to grace-branch

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Grant Dashboard</h2>
      <ul>
        <li className="active">Dashboard</li>
        <li>Grants</li>
        <li>Calendar</li>
        <li>Reports</li>
      </ul>
    </div>
  );
};

export default Sidebar;
