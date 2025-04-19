// src/pages/SchemaDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchSchema } from '../services/schemaService';
import AppHeader from '../components/layout/AppHeader';
import Sidebar from '../components/layout/Sidebar';
import SchemaEditor from '../components/SchemaManager/SchemaEditor';
import JSONViewer from '../components/SchemaManager/JSONViewer';
import VersionHistory from '../components/SchemaManager/VersionHistory';
import './SchemaDetail.css';

const SchemaDetail = () => {
  const { schemaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the active tab from URL query param or default to 'tables'
  const searchParams = new URLSearchParams(location.search);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'tables');
  
  useEffect(() => {
    const loadSchema = async () => {
      setLoading(true);
      try {
        const data = await fetchSchema(schemaId);
        setSchema(data);
      } catch (err) {
        setError(err.message || 'Failed to load schema');
        console.error('Error loading schema:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (schemaId) {
      loadSchema();
    }
  }, [schemaId]);
  
  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/schema-manager/schema/${schemaId}?tab=${tab}`, { replace: true });
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
            <SchemaEditor schema={schema} onUpdate={() => {}} />
          )}
          
          {activeTab === 'json' && (
            <JSONViewer schemaId={schemaId} />
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