// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FolderIcon, PlusIcon, HomeIcon, SettingsIcon, DatabaseIcon, LoaderIcon } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ groups, selectedGroup, onGroupChange, onCreateGroup, loading }) => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link to="/" className="nav-item">
          <HomeIcon size={18} />
          <span>Home</span>
        </Link>
        
        <Link to="/schema-manager" className="nav-item active">
          <DatabaseIcon size={18} />
          <span>Schemas</span>
        </Link>
        
        <Link to="/settings" className="nav-item">
          <SettingsIcon size={18} />
          <span>Settings</span>
        </Link>
      </nav>
      
      <div className="sidebar-groups">
        <div className="group-header">
          <h3>Groups</h3>
          <button 
            className="btn-icon"
            onClick={onCreateGroup}
            title="Create new group"
          >
            <PlusIcon size={16} />
          </button>
        </div>
        
        {loading ? (
          <div className="loading-groups">
            <LoaderIcon size={18} className="spinner" />
            <span>Loading groups...</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="empty-groups">
            <p>No groups found</p>
            <button 
              className="btn btn-sm btn-primary"
              onClick={onCreateGroup}
            >
              <PlusIcon size={14} />
              <span>Create Group</span>
            </button>
          </div>
        ) : (
          <ul className="group-list">
            {groups.map(group => (
              <li key={group.id}>
                <button
                  className={`group-item ${selectedGroup?.id === group.id ? 'active' : ''}`}
                  onClick={() => onGroupChange(group)}
                >
                  <FolderIcon size={16} />
                  <span>{group.name}</span>
                  <span className="group-count">{group.schema_count || 0}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;