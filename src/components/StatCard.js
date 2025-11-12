import React from "react";
import "../styles/StatCard.css";

const StatCard = ({ title, value, change }) => (
  <div className="stat-card">
    <h4>{title}</h4>
    <h2>{value}</h2>
    <p>{change}</p>
  </div>
);

export default StatCard;
