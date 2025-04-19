// src/pages/SchemaManager.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGroups, fetchSchemas } from '../services/schemaService';

// Import the Dashboard component
import Dashboard from '../components/SchemaManager/Dashboard';

// Import layout components (you'll need to implement these)
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';

const SchemaManager = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      try {
        const response = await fetchGroups();
        setGroups(response.groups || []);
        
        // If groups were loaded and none is selected, select the first one
        if (response.groups && response.groups.length > 0 && !selectedGroup) {
          setSelectedGroup(response.groups[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load groups');
        console.error('Error loading groups:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadGroups();
  }, [selectedGroup]);
  
  const handleGroupChange = (group) => {
    setSelectedGroup(group);
  };
  
  const handleCreateGroup = () => {
    navigate('/schema-manager/groups/create');
  };

  return (
    <div className="schema-manager-page">
      <AppHeader title="Schema Manager" />
      <div className="main-content">
        <Sidebar 
          groups={groups} 
          selectedGroup={selectedGroup}
          onGroupChange={handleGroupChange}
          onCreateGroup={handleCreateGroup}
          loading={loading}
        />
        <div className="schema-content">
          <Dashboard groupId={selectedGroup?.id} />
        </div>
      </div>
    </div>
  );
};

export default SchemaManager;