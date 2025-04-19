// src/components/SchemaManager/JSONViewer.jsx
import React, { useState, useEffect } from 'react';
import { fetchSchemaJson } from '../../services/schemaService';
import './JSONViewer.css';

const JSONViewer = ({ schemaId }) => {
  const [json, setJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadJson = async () => {
      setLoading(true);
      try {
        const data = await fetchSchemaJson(schemaId);
        setJson(data);
      } catch (err) {
        setError(err.message || 'Failed to load schema JSON');
        console.error('Error loading schema JSON:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (schemaId) {
      loadJson();
    }
  }, [schemaId]);
  
  if (loading) {
    return <div className="loading-state">Loading JSON...</div>;
  }
  
  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }
  
  if (!json) {
    return <div className="empty-state">No JSON data available</div>;
  }
  
  return (
    <div className="json-viewer">
      <div className="json-actions">
        <button className="btn btn-sm btn-secondary">
          Copy
        </button>
        <button className="btn btn-sm btn-secondary">
          Download
        </button>
      </div>
      
      <pre className="json-content">
        {JSON.stringify(json, null, 2)}
      </pre>
    </div>
  );
};

export default JSONViewer;