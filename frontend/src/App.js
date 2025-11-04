import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/parties" element={<div className="page-placeholder">Parties Page - Coming Soon</div>} />
            <Route path="/items" element={<div className="page-placeholder">Items Page - Coming Soon</div>} />
            <Route path="/sale" element={<div className="page-placeholder">Sale Page - Coming Soon</div>} />
            <Route path="/purchase" element={<div className="page-placeholder">Purchase Page - Coming Soon</div>} />
            <Route path="/cash-bank" element={<div className="page-placeholder">Cash & Bank Page - Coming Soon</div>} />
            <Route path="/reports" element={<div className="page-placeholder">Reports Page - Coming Soon</div>} />
            <Route path="/sync" element={<div className="page-placeholder">Sync Page - Coming Soon</div>} />
            <Route path="/bulk-gst" element={<div className="page-placeholder">Bulk GST Page - Coming Soon</div>} />
            <Route path="/utilities" element={<div className="page-placeholder">Utilities Page - Coming Soon</div>} />
            <Route path="/settings" element={<div className="page-placeholder">Settings Page - Coming Soon</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
