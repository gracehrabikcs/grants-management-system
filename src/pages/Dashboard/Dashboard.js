import React, { useEffect, useState } from "react";
import "../../styles/Dashboard.css";
import "../../styles/StatCard.css";
import "../../styles/GrantTable.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const Dashboard = () => {
  const [grants, setGrants] = useState([]);
  const [totalFunding, setTotalFunding] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrants = async () => {
      try {
        const grantSnap = await getDocs(collection(db, "grants"));
        const grantList = [];

        let globalFunding = 0;

        // Loop through all grant documents
        for (const grantDoc of grantSnap.docs) {
          const grantData = { id: grantDoc.id, ...grantDoc.data() };

          // Fetch pledges inside each grant
          const pledgesRef = collection(db, "grants", grantDoc.id, "pledges");
          const pledgeSnap = await getDocs(pledgesRef);

          let grantFunding = 0;

          pledgeSnap.forEach((p) => {
            // Pull "received" instead of "amount"
            const received = Number(p.data().received);

            if (!isNaN(received)) {
              grantFunding += received;
              globalFunding += received;
            }
          });

          // attach calculated totalFunding to the grant
          grantData.totalFunding = grantFunding;

          grantList.push(grantData);
        }

        setGrants(grantList);
        setTotalFunding(globalFunding);

      } catch (err) {
        console.error("Error loading grants:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGrants();
  }, []);

  const totalGrants = grants.length;

  if (loading) return <p style={{ padding: "2rem" }}>Loading dashboard...</p>;

  return (
    <div className="dashboard">
      <h1>Grant Dashboard</h1>
      <p>Manage and track your organization’s grants and funding applications</p>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard title="Total Grants" value={totalGrants} />

        <StatCard
          title="Total Funding"
          value={totalFunding.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        />

        <StatCard title= "Pending Applications" value="––" />

        <StatCard title= "Approved Applications" value="––" />

        
      </div>

      {/* Grant List Table */}
      <div style={{ marginTop: "2rem" }}>
        <h2>All Grants</h2>
        <table className="grant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Grant Title</th>
              <th>Organization</th>
              <th>Total Funding</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {grants.map((g) => (
              <tr key={g.id}>
                <td>{g.id}</td>
                <td>{g.title || "No title"}</td>
                <td>{g.organization || "N/A"}</td>
                <td>
                  {g.totalFunding.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </td>

                <td>
                  {g.deadline
                    ? new Date(g.deadline.seconds * 1000)
                        .toISOString()
                        .split("T")[0]
                    : "No deadline"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Stat Card Component
function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p style={{ fontSize: "1.8rem", margin: "8px 0" }}>{value}</p>
    </div>
  );
}

export default Dashboard;
