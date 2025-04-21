// src/components/SchemaManager/JSONViewer.jsx
import React, { useState, useEffect } from 'react';
import { fetchSchemaJson } from '../../services/schemaService';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './JSONViewer.css';

const JSONViewer = ({ schemaId, schemaJson, onUpdate }) => {
  const [json, setJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const loadJson = async () => {
      setLoading(true);
      try {
        // If schemaJson is provided, use it, otherwise fetch it
        const data = schemaJson || await fetchSchemaJson(schemaId);
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
  }, [schemaId, schemaJson]);

  const handleCopy = () => {
    if (json) {
      navigator.clipboard.writeText(JSON.stringify(json, null, 2))
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  const handleDownload = () => {
    if (json) {
      const dataStr = "data:text/json;charset=utf-8," + 
                      encodeURIComponent(JSON.stringify(json, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `schema-${schemaId}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };
  
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
        <button 
          className="btn btn-sm btn-secondary"
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button 
          className="btn btn-sm btn-secondary"
          onClick={handleDownload}
        >
          Download
        </button>
      </div>
      
      <div className="json-content">
        <SyntaxHighlighter 
          language="json" 
          style={vscDarkPlus}
          wrapLines={true}
          showLineNumbers={true}
        >
          {JSON.stringify(json, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default JSONViewer;