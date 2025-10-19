import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

//adding a test comment to grace-branch

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Grant Management System</h2>
      <ul>
        <li>
          <NavLink 
            to="/" 
            end 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/grants" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Grants
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/calendar" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Calendar
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/reports" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Reports
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
