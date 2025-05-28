// src/pages/SchemaDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchSchema, fetchSchemaJson, updateSchemaJson } from '../services/schemaService';
import AppHeader from '../components/layout/AppHeader';
import SchemaEditor from '../components/SchemaManager/SchemaEditor';
import JSONViewer from '../components/SchemaManager/JSONViewer';
import VersionHistory from '../components/SchemaManager/VersionHistory';
import { SaveIcon, RotateCwIcon, AlertCircleIcon } from 'lucide-react';
import './SchemaDetail.css';

const SchemaDetail = () => {
  const { schemaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [schema, setSchema] = useState(null);
  const [schemaJson, setSchemaJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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
        setHasUnsavedChanges(false);
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
  
  // Handle updates from SchemaEditor (table editing)
  const handleSchemaUpdate = (updatedJson) => {
    console.log('Schema updated from table editor:', updatedJson);
    setSchemaJson(updatedJson);
    setHasUnsavedChanges(true);
  };
  
  // Handle updates from JSONViewer (JSON editing)
  const handleJsonUpdate = (updatedJson) => {
    console.log('Schema updated from JSON editor:', updatedJson);
    setSchemaJson(updatedJson);
    setHasUnsavedChanges(true);
  };
  
  // Handle save completion from JSONViewer - this clears the unsaved changes indicator
  const handleJsonSaveComplete = () => {
    console.log('JSON save completed, clearing unsaved changes flag');
    setHasUnsavedChanges(false);
  };
  
  // Handle saving changes
  const handleSaveChanges = async (createVersion = false) => {
    if (!schemaId || !schemaJson) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await updateSchemaJson(
        schemaId,
        schemaJson,
        createVersion,
        createVersion ? `Updated schema on ${new Date().toLocaleDateString()}` : ''
      );
      
      setHasUnsavedChanges(false);
      
      // Show success message (you could add a toast notification here)
      console.log('Schema saved successfully' + (createVersion ? ' as new version' : ''));
      
      // Optionally refresh the schema metadata if it changed
      if (createVersion) {
        const refreshedSchema = await fetchSchema(schemaId);
        setSchema(refreshedSchema);
      }
    } catch (err) {
      setError(err.message || 'Failed to save schema');
      console.error('Error saving schema:', err);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle refresh/reload
  const handleRefresh = async () => {
    if (hasUnsavedChanges) {
      const confirmRefresh = window.confirm(
        'You have unsaved changes. Refreshing will lose these changes. Continue?'
      );
      if (!confirmRefresh) return;
    }
    
    setLoading(true);
    try {
      const [schemaData, jsonData] = await Promise.all([
        fetchSchema(schemaId),
        fetchSchemaJson(schemaId)
      ]);
      
      setSchema(schemaData);
      setSchemaJson(jsonData);
      setHasUnsavedChanges(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to refresh schema');
      console.error('Error refreshing schema:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Leaving will lose these changes. Continue?'
      );
      if (!confirmLeave) return;
    }
    navigate('/schema-manager');
  };
  
  if (loading) {
    return (
      <div className="schema-detail-page">
        <AppHeader title="Schema Editor" />
        <div className="loading-state">
          <RotateCwIcon size={32} className="spin" />
          <p>Loading schema...</p>
        </div>
      </div>
    );
  }
  
  if (error && !schema) {
    return (
      <div className="schema-detail-page">
        <AppHeader title="Schema Editor" />
        <div className="error-state">
          <AlertCircleIcon size={32} />
          <p>Error: {error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!schema) {
    return (
      <div className="schema-detail-page">
        <AppHeader title="Schema Editor" />
        <div className="error-state">
          <AlertCircleIcon size={32} />
          <p>Schema not found</p>
          <button className="btn btn-secondary" onClick={handleBack}>
            Go Back
          </button>
        </div>
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
          
          <div className="schema-header-right">
            <div className="schema-status">
              {schema.status === 'active' && <span className="status-badge active">✓ Active</span>}
              {schema.status === 'draft' && <span className="status-badge draft">✏️ Draft</span>}
              {schema.status === 'deprecated' && <span className="status-badge deprecated">⏱️ Deprecated</span>}
            </div>
            
            {hasUnsavedChanges && (
              <div className="unsaved-changes-indicator">
                <AlertCircleIcon size={16} />
                <span>Unsaved changes</span>
              </div>
            )}
            
            <div className="schema-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleRefresh}
                disabled={saving}
              >
                <RotateCwIcon size={16} className={loading ? 'spin' : ''} />
                <span>Refresh</span>
              </button>
              
              <button 
                className="btn btn-success"
                onClick={() => handleSaveChanges(false)}
                disabled={saving || !hasUnsavedChanges}
              >
                <SaveIcon size={16} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={() => handleSaveChanges(true)}
                disabled={saving || !hasUnsavedChanges}
              >
                <SaveIcon size={16} />
                <span>Save as New Version</span>
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="error-banner">
            <AlertCircleIcon size={16} />
            <span>{error}</span>
            <button 
              className="btn-close" 
              onClick={() => setError(null)}
              title="Dismiss"
            >
              ×
            </button>
          </div>
        )}
        
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
              onSaveComplete={handleJsonSaveComplete}
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