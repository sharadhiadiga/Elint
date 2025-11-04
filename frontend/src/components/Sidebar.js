import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/parties', icon: '👥', label: 'Parties', hasSubmenu: true },
    { path: '/items', icon: '📦', label: 'Items', hasSubmenu: true },
    { path: '/sale', icon: '📝', label: 'Sale', hasSubmenu: true },
    { path: '/purchase', icon: '🛒', label: 'Purchase & Expense', hasSubmenu: true },
    { path: '/cash-bank', icon: '💰', label: 'Cash & Bank', hasSubmenu: true },
    { path: '/reports', icon: '📊', label: 'Reports' },
    { path: '/sync', icon: '🔄', label: 'Sync, Share & Backup', hasSubmenu: true },
    { path: '/bulk-gst', icon: '📋', label: 'Bulk GST Update' },
    { path: '/utilities', icon: '🔧', label: 'Utilities', hasSubmenu: true },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🔥</span>
          <span className="logo-text">Elints</span>
        </div>
        <div className="open-anything">
          <button className="open-anything-btn">Open Anything (Ctrl+F)</button>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.hasSubmenu && <span className="nav-arrow">›</span>}
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">A</div>
          <span className="user-name">Asd</span>
          <span className="user-arrow">›</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
