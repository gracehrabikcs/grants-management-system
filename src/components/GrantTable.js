import React from "react";
import "../styles/GrantTable.css";


const grants = [
  { id: "GR-001", title: "Education Innovation Fund", org: "Future Learning Institute", amount: "$50,000", status: "Active", deadline: "2024-03-15", progress: 75 },
  { id: "GR-002", title: "Healthcare Research Grant", org: "Medical Research Center", amount: "$125,000", status: "Under Review", deadline: "2024-04-20", progress: 45 },
  { id: "GR-003", title: "Environmental Conservation Project", org: "Green Earth Foundation", amount: "$75,000", status: "Approved", deadline: "2024-02-10", progress: 90 },
  { id: "GR-004", title: "Technology Development Initiative", org: "Tech Innovators LLC", amount: "$200,000", status: "Pending", deadline: "2024-05-30", progress: 20 },
  { id: "GR-005", title: "Community Arts Program", org: "Creative Community Hub", amount: "$30,000", status: "Rejected", deadline: "2024-01-25", progress: 0 }
];

const GrantTable = () => (
  <table className="grant-table">
    <thead>
      <tr>
        <th>Grant ID</th>
        <th>Title</th>
        <th>Organization</th>
        <th>Amount</th>
        <th>Status</th>
        <th>Deadline</th>
        <th>Progress</th>
      </tr>
    </thead>
    <tbody>
      {grants.map((g) => (
        <tr key={g.id}>
          <td>{g.id}</td>
          <td>{g.title}</td>
          <td>{g.org}</td>
          <td>{g.amount}</td>
          <td className={`status ${g.status.replace(" ", "-").toLowerCase()}`}>{g.status}</td>
          <td>{g.deadline}</td>
          <td>
            <div className="progress-bar">
              <div style={{ width: `${g.progress}%` }}></div>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default GrantTable;
