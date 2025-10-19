import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Grants from "./pages/Grants";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="content">  {/* Global Wrapper */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/grants" element={<Grants />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
