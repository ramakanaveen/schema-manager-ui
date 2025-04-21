// src/pages/SchemaManager.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGroups, fetchSchemas } from '../services/schemaService';

// Import the Dashboard component
import Dashboard from '../components/SchemaManager/Dashboard';
import GroupCreationWizard from '../components/SchemaManager/GroupCreationWizard';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';

const SchemaManager = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateGroupWizard, setShowCreateGroupWizard] = useState(false);
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
    setShowCreateGroupWizard(true);
  };
  
  const handleCloseWizard = () => {
    setShowCreateGroupWizard(false);
    // Refresh groups after a new one is created
    loadGroups();
  };

  const loadGroups = async () => {
    try {
      const response = await fetchGroups();
      setGroups(response.groups || []);
      
      // If a new group was created, select it
      if (response.groups && response.groups.length > 0 && 
          (!selectedGroup || !response.groups.find(g => g.id === selectedGroup.id))) {
        setSelectedGroup(response.groups[0]);
      }
    } catch (err) {
      console.error('Error reloading groups:', err);
    }
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
      {showCreateGroupWizard && (
        <GroupCreationWizard onClose={handleCloseWizard} />
      )}
    </div>
  );
};

export default SchemaManager;