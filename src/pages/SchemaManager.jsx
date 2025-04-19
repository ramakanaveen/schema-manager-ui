// src/pages/SchemaManager.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SchemaList from '../components/SchemaManager/SchemaList';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';
import { fetchGroups, fetchSchemas } from '../services/schemaService';
import { PlusIcon, FolderIcon } from 'lucide-react';

const SchemaManager = () => {
  const [groups, setGroups] = useState([]);
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load groups and schemas
        const groupsData = await fetchGroups();
        setGroups(groupsData.groups);
        
        // If no group is selected, use the first one
        const groupId = selectedGroup?.id || (groupsData.groups[0]?.id || null);
        
        if (groupId) {
          const schemasData = await fetchSchemas(groupId);
          setSchemas(schemasData.schemas);
          setSelectedGroup(groupsData.groups.find(g => g.id === groupId));
        } else {
          setSchemas([]);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedGroup?.id]);
  
  const handleGroupChange = (group) => {
    setSelectedGroup(group);
  };
  
  const handleCreateSchema = () => {
    if (!selectedGroup) {
      alert('Please select a group first');
      return;
    }
    
    navigate(`/schema-manager/create?groupId=${selectedGroup.id}`);
  };
  
  const handleSchemaClick = (schema) => {
    navigate(`/schema-manager/schema/${schema.id}`);
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
        />
        <div className="schema-content">
          <div className="content-header">
            <h2>{selectedGroup ? selectedGroup.name : 'All Schemas'}</h2>
            <div className="header-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleCreateSchema}
                disabled={!selectedGroup}
              >
                <PlusIcon size={16} />
                <span>Create Schema</span>
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-state">Loading schemas...</div>
          ) : error ? (
            <div className="error-state">Error: {error}</div>
          ) : (
            <SchemaList 
              schemas={schemas} 
              onSchemaClick={handleSchemaClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemaManager;