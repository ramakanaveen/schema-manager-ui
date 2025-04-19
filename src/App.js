// src/App.js - Fixed version
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import pages correctly
import SchemaManager from './pages/SchemaManager';
import SchemaDetail from './pages/SchemaDetail'; 
import CreateSchema from './pages/CreateSchema';
import GroupManagement from './pages/GroupManagement';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/schema-manager" />} />
          <Route path="/schema-manager" element={<SchemaManager />} />
          <Route path="/schema-manager/groups/create" element={<GroupManagement />} />
          <Route path="/schema-manager/create" element={<CreateSchema />} />
          <Route path="/schema-manager/schema/:schemaId" element={<SchemaDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;