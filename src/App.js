import React from "react";
import Sidebar from "../src/components/Sidebar";
import Dashboard from "../src/pages/Dashboard/Dashboard";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Sidebar />
      <Dashboard />
    </div>
  );
}


export default App;
