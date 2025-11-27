import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "../src/components/Sidebar";
import Dashboard from "../src/pages/Dashboard/Dashboard";
import Grants from "../src/pages/Grants/Grants";
import Calendar from "../src/pages/Calendar/Calendar";
import Reports from "../src/pages/Reports/Reports";
import "./App.css";
import GrantDetailsMain from "../src/pages/Grants/GrantDetails/GrantDetailsMain";
import NewGrant from "../src/pages/Grants/NewGrant"; 


function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="content">  {/* Global Wrapper */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/grants" element={<Grants />} />
            <Route path="/grants/new" element={<NewGrant />} />
            <Route path="/grants/:id/*" element={<GrantDetailsMain />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
