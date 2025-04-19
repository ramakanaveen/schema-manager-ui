// src/components/SchemaManager/VersionHistory.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  fetchSchemaVersions, 
  activateSchemaVersion,
  fetchSchemaJson
} from '../../services/schemaService';
import { CheckCircleIcon, ClockIcon, PencilIcon } from 'lucide-react';

const VersionHistory = ({ schemaId }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activating, setActivating] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([null, null]);
  const [diff, setDiff] = useState(null);
  
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
    
    loadVersions();
  }, [schemaId]);
  
  const handleActivate = async (versionId) => {
    setActivating(true);
    try {
      await activateSchemaVersion(schemaId, versionId);
      
      // Reload versions to update status
      const data = await fetchSchemaVersions(schemaId);
      setVersions(data.versions || []);
    } catch (err) {
      setError(err.message || 'Failed to activate version');
      console.error('Error activating version:', err);
    } finally {
      setActivating(false);
    }
  };
  
  const handleCompareVersions = async () => {
    if (!selectedVersions[0] || !selectedVersions[1]) {
      return;
    }
    
    try {
      const version1 = await fetchSchemaJson(schemaId, selectedVersions[0].id);
      const version2 = await fetchSchemaJson(schemaId, selectedVersions[1].id);
      
      setDiff({
        version1: {
          id: selectedVersions[0].id,
          version: selectedVersions[0].version,
          json: version1
        },
        version2: {
          id: selectedVersions[1].id,
          version: selectedVersions[1].version,
          json: version2
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to compare versions');
      console.error('Error comparing versions:', err);
    }
  };
  
  const handleSelectVersion = (version, index) => {
    const newSelection = [...selectedVersions];
    newSelection[index] = version === newSelection[index] ? null : version;
    setSelectedVersions(newSelection);
    
    // Clear diff if selection changed
    setDiff(null);
  };
  
  if (loading) {
    return <div className="loading-state">Loading versions...</div>;
  }
  
  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }
  
  return (
    <div className="version-history">
      <div className="version-header">
        <h3>Version History</h3>
        
        {selectedVersions[0] && selectedVersions[1] && (
          <button 
            className="btn btn-primary"
            onClick={handleCompareVersions}
          >
            Compare Versions
          </button>
        )}
      </div>
      
      <div className="versions-list">
        <div className="version-table-header">
          <div className="col-selector"></div>
          <div className="col-version">Version</div>
          <div className="col-status">Status</div>
          <div className="col-date">Created</div>
          <div className="col-actions">Actions</div>
        </div>
        
        {versions.length === 0 ? (
          <div className="empty-state">No versions found</div>
        ) : (
          versions.map((version) => (
            <div
              key={version.id}
              className={`version-row ${version.status === 'active' ? 'active-version' : ''}`}
            >
              <div className="col-selector">
                <input 
                  type="checkbox"
                  checked={selectedVersions.some(v => v && v.id === version.id)}
                  onChange={() => handleSelectVersion(
                    version,
                    selectedVersions[0] && selectedVersions[0].id === version.id ? 0 :
                    selectedVersions[1] && selectedVersions[1].id === version.id ? 1 : 
                    selectedVersions[0] ? 1 : 0
                  )}
                />
              </div>
              <div className="col-version">
                {version.version_name || `Version ${version.version}`}
              </div>
              <div className="col-status">
                {version.status === 'active' ? (
                  <span className="status active">
                    <CheckCircleIcon size={14} />
                    Active
                  </span>
                ) : version.status === 'draft' ? (
                  <span className="status draft">
                    <PencilIcon size={14} />
                    Draft
                  </span>
                ) : (
                  <span className="status deprecated">
                    <ClockIcon size={14} />
                    Deprecated
                  </span>
                )}
              </div>
              <div className="col-date">
                {formatDate(version.created_at)}
              </div>
              <div className="col-actions">
                {version.status !== 'active' && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleActivate(version.id)}
                    disabled={activating}
                  >
                    {activating ? 'Activating...' : 'Activate'}
                  </button>
                )}
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => window.open(`/schema-manager/schema/${schemaId}/version/${version.id}`, '_blank')}
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {diff && (
        <div className="version-diff">
          <h3>Version Comparison</h3>
          <div className="diff-header">
            <div className="diff-version">
              <h4>Version {diff.version1.version}</h4>
              <span className="diff-date">{formatDate(
                versions.find(v => v.id === diff.version1.id)?.created_at
              )}</span>
            </div>
            <div className="diff-version">
              <h4>Version {diff.version2.version}</h4>
              <span className="diff-date">{formatDate(
                versions.find(v => v.id === diff.version2.id)?.created_at
              )}</span>
            </div>
          </div>
          
          <div className="diff-content">
            {/* You could use a diff library here to show the differences */}
            <div className="diff-json">
              <CodeEditor
                value={JSON.stringify(diff.version1.json, null, 2)}
                language="json"
                readOnly={true}
                height="400px"
              />
            </div>
            <div className="diff-json">
              <CodeEditor
                value={JSON.stringify(diff.version2.json, null, 2)}
                language="json"
                readOnly={true}
                height="400px"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (e) {
    return dateString;
  }
};

export default VersionHistory;