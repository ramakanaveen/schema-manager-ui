// src/components/SchemaManager/VersionHistory.jsx
import React, { useState, useEffect } from 'react';
import { fetchSchemaVersions } from '../../services/schemaService';
import './VersionHistory.css';

const VersionHistory = ({ schemaId }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadVersions = async () => {
      setLoading(true);
      try {
        const data = await fetchSchemaVersions(schemaId);
        setVersions(data.versions || []);
      } catch (err) {
        setError(err.message || 'Failed to load versions');
        console.error('Error loading versions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (schemaId) {
      loadVersions();
    }
  }, [schemaId]);
  
  if (loading) {
    return <div className="loading-state">Loading versions...</div>;
  }
  
  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }
  
  if (!versions || versions.length === 0) {
    return <div className="empty-state">No versions found</div>;
  }
  
  return (
    <div className="version-history">
      <table className="versions-table">
        <thead>
          <tr>
            <th>Version</th>
            <th>Created</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {versions.map(version => (
            <tr key={version.id}>
              <td>{version.version_number || version.version || '1.0'}</td>
              <td>{version.created_at || 'N/A'}</td>
              <td>
                {version.status === 'active' && <span className="status-badge active">✓ Active</span>}
                {version.status === 'draft' && <span className="status-badge draft">✏️ Draft</span>}
                {version.status === 'deprecated' && <span className="status-badge deprecated">⏱️ Deprecated</span>}
              </td>
              <td>
                <div className="version-actions">
                  {version.status !== 'active' && (
                    <button className="btn btn-sm btn-primary">
                      Activate
                    </button>
                  )}
                  <button className="btn btn-sm btn-secondary">
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VersionHistory;