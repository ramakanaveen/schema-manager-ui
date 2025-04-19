// src/components/layout/AppHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { DatabaseIcon, UserIcon, BellIcon, HelpCircleIcon } from 'lucide-react';
import './AppHeader.css';

const AppHeader = ({ title }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="logo">
          <DatabaseIcon size={24} />
          <span>Schema Manager</span>
        </Link>
        {title && <h1 className="page-title">{title}</h1>}
      </div>
      
      <div className="header-right">
        <button className="header-button">
          <HelpCircleIcon size={20} />
        </button>
        <button className="header-button">
          <BellIcon size={20} />
        </button>
        <div className="user-menu">
          <button className="user-button">
            <div className="avatar">
              <UserIcon size={20} />
            </div>
            <span>User</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;