// src/pages/SchemaDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchSchema, fetchSchemaJson, updateSchemaJson } from '../services/schemaService';
import AppHeader from '../components/layout/AppHeader';
import SchemaEditor from '../components/SchemaManager/SchemaEditor';
import JSONViewer from '../components/SchemaManager/JSONViewer';
import VersionHistory from '../components/SchemaManager/VersionHistory';
import './SchemaDetail.css';

const SchemaDetail = () => {
  const { schemaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [schema, setSchema] = useState(null);
  const [schemaJson, setSchemaJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJsonEdited, setIsJsonEdited] = useState(false);
  
  // Get the active tab from URL query param or default to 'tables'
  const searchParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'tables');
  
  // Load schema data
  useEffect(() => {
    const loadSchemaData = async () => {
      setLoading(true);
      try {
        // Load schema metadata
        const schemaData = await fetchSchema(schemaId);
        setSchema(schemaData);
        
        // Load schema JSON
        const jsonData = await fetchSchemaJson(schemaId);
        setSchemaJson(jsonData);
      } catch (err) {
        setError(err.message || 'Failed to load schema');
        console.error('Error loading schema:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (schemaId) {
      loadSchemaData();
    }
  }, [schemaId]);
  
  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/schema-manager/schema/${schemaId}?tab=${tab}`, { replace: true });
  };
  
  // Handle updates from SchemaEditor
  const handleSchemaUpdate = (updatedJson) => {
    setSchemaJson(updatedJson);
    setIsJsonEdited(true);
  };
  
  // Handle updates from JSONViewer (if we add JSON editing capability)
  const handleJsonUpdate = (updatedJson) => {
    setSchemaJson(updatedJson);
    setIsJsonEdited(true);
  };
  
  // Handle saving changes
  const handleSaveChanges = async (createVersion = false) => {
    if (!schemaId || !schemaJson) return;
    
    try {
      await updateSchemaJson(
        schemaId,
        schemaJson,
        createVersion,
        createVersion ? `Updated schema on ${new Date().toLocaleDateString()}` : ''
      );
      
      setIsJsonEdited(false);
      // Refresh data after save if needed
      // loadSchemaData();
    } catch (err) {
      setError(err.message || 'Failed to save schema');
      console.error('Error saving schema:', err);
    }
  };
  
  const handleBack = () => {
    navigate('/schema-manager');
  };
  
  if (loading) {
    return (
      <div className="schema-detail-page">
        <AppHeader title="Schema Editor" />
        <div className="loading-state">Loading schema...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="schema-detail-page">
        <AppHeader title="Schema Editor" />
        <div className="error-state">Error: {error}</div>
      </div>
    );
  }
  
  if (!schema) {
    return (
      <div className="schema-detail-page">
        <AppHeader title="Schema Editor" />
        <div className="error-state">Schema not found</div>
      </div>
    );
  }
  
  return (
    <div className="schema-detail-page">
      <AppHeader title={`Schema: ${schema.name}`} />
      <div className="schema-detail-content">
        <div className="schema-detail-header">
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back
          </button>
          <h1>{schema.name}</h1>
          <div className="schema-status">
            {schema.status === 'active' && <span className="status-badge active">✓ Active</span>}
            {schema.status === 'draft' && <span className="status-badge draft">✏️ Draft</span>}
            {schema.status === 'deprecated' && <span className="status-badge deprecated">⏱️ Deprecated</span>}
          </div>
          
          {isJsonEdited && (
            <div className="schema-actions">
              <button 
                className="btn btn-primary"
                onClick={() => handleSaveChanges(false)}
              >
                Save Changes
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => handleSaveChanges(true)}
              >
                Save as New Version
              </button>
            </div>
          )}
        </div>
        
        <div className="schema-tabs">
          <button 
            className={`tab-button ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => handleTabChange('tables')}
          >
            Tables
          </button>
          <button 
            className={`tab-button ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => handleTabChange('json')}
          >
            JSON
          </button>
          <button 
            className={`tab-button ${activeTab === 'versions' ? 'active' : ''}`}
            onClick={() => handleTabChange('versions')}
          >
            Versions
          </button>
        </div>
        
        <div className="schema-tab-content">
          {activeTab === 'tables' && (
            <SchemaEditor 
              schema={schema} 
              schemaJson={schemaJson}
              onUpdate={handleSchemaUpdate}
            />
          )}
          
          {activeTab === 'json' && (
            <JSONViewer 
              schemaId={schemaId} 
              schemaJson={schemaJson}
              onUpdate={handleJsonUpdate}
            />
          )}
          
          {activeTab === 'versions' && (
            <VersionHistory schemaId={schemaId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemaDetail;