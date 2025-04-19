// src/components/SchemaManager/SchemaEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Tabs from '../common/Tabs';
import TableList from './TableList';
import TableEditor from './TableEditor';
import JSONViewer from './JSONViewer';
import VersionHistory from './VersionHistory';
import { 
  fetchSchema, 
  fetchSchemaJson, 
  updateSchemaJson 
} from '../../services/schemaService';
import { SaveIcon, DownloadIcon, UploadIcon } from 'lucide-react';

const SchemaEditor = () => {
  const { schemaId } = useParams();
  const navigate = useNavigate();
  
  const [schema, setSchema] = useState(null);
  const [schemaJson, setSchemaJson] = useState(null);
  const [activeTab, setActiveTab] = useState('tables');
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Load schema data
  useEffect(() => {
    const loadSchema = async () => {
      setLoading(true);
      try {
        // Load schema details
        const schemaData = await fetchSchema(schemaId);
        setSchema(schemaData);
        
        // Load schema JSON
        const jsonData = await fetchSchemaJson(schemaId);
        setSchemaJson(jsonData);
        
        // Select first table by default if available
        if (schemaData.tables && schemaData.tables.length > 0) {
          setSelectedTable(schemaData.tables[0]);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error loading schema:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (schemaId) {
      loadSchema();
    }
  }, [schemaId]);
  
  // Handle JSON updates
  const handleJsonChange = (updatedJson) => {
    setSchemaJson(updatedJson);
    setHasChanges(true);
  };
  
  // Handle table selection
  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };
  
  // Handle adding a new table
  const handleAddTable = () => {
    // Create a new table with default structure
    const newTableName = `new_table_${Date.now()}`;
    const newTable = {
      name: newTableName,
      description: 'New table description',
      columns: []
    };
    
    // Update the schema JSON
    const updatedJson = {
      ...schemaJson,
      tables: {
        ...schemaJson.tables,
        [newTableName]: newTable
      }
    };
    
    setSchemaJson(updatedJson);
    setSelectedTable(newTable);
    setHasChanges(true);
  };
  
  // Handle saving changes
  const handleSave = async (createVersion = false) => {
    if (!hasChanges) return;
    
    setSaving(true);
    try {
      await updateSchemaJson(schemaId, schemaJson, createVersion);
      setHasChanges(false);
      
      // Reload schema data to get updated information
      const schemaData = await fetchSchema(schemaId);
      setSchema(schemaData);
    } catch (err) {
      setError(`Failed to save: ${err.message}`);
      console.error('Error saving schema:', err);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle table updates
  const handleTableUpdate = (tableName, updatedTable) => {
    // Update the schema JSON with the updated table
    const updatedJson = {
      ...schemaJson,
      tables: {
        ...schemaJson.tables,
        [tableName]: updatedTable
      }
    };
    
    setSchemaJson(updatedJson);
    setHasChanges(true);
    
    // If we're updating the selected table, update it in state
    if (selectedTable && selectedTable.name === tableName) {
      setSelectedTable(updatedTable);
    }
  };
  
  // Handle exporting schema JSON
  const handleExportJson = () => {
    if (!schemaJson) return;
    
    const jsonStr = JSON.stringify(schemaJson, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name}_schema.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Handle importing schema JSON
  const handleImportJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedJson = JSON.parse(e.target.result);
        setSchemaJson(importedJson);
        setHasChanges(true);
      } catch (err) {
        setError('Invalid JSON file');
        console.error('Error parsing JSON:', err);
      }
    };
    reader.readAsText(file);
  };
  
  if (loading) {
    return <div className="loading-state">Loading schema...</div>;
  }
  
  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }
  
  if (!schema) {
    return <div className="error-state">Schema not found</div>;
  }
  
  return (
    <div className="schema-editor">
      <div className="editor-header">
        <div className="title-section">
          <h1>{schema.name}</h1>
          <span className="group-name">{schema.group_name}</span>
        </div>
        
        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            onClick={handleExportJson}
            title="Export Schema JSON"
          >
            <DownloadIcon size={16} />
            <span>Export</span>
          </button>
          
          <label className="btn btn-secondary" title="Import Schema JSON">
            <UploadIcon size={16} />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportJson}
            />
          </label>
          
          <button
            className="btn btn-primary"
            onClick={() => handleSave(false)}
            disabled={saving || !hasChanges}
          >
            <SaveIcon size={16} />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
          
          <button
            className="btn btn-success"
            onClick={() => handleSave(true)}
            disabled={saving || !hasChanges}
            title="Create New Version"
          >
            <span>Save as New Version</span>
          </button>
        </div>
      </div>
      
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'tables', label: 'Tables' },
          { id: 'json', label: 'JSON View' },
          { id: 'versions', label: 'Version History' }
        ]}
      />
      
      <div className="editor-content">
        {activeTab === 'tables' && (
          <div className="tables-view">
            <div className="sidebar">
              <TableList
                tables={Object.entries(schemaJson?.tables || {}).map(([name, data]) => ({
                  name,
                  ...data
                }))}
                selectedTable={selectedTable}
                onTableSelect={handleTableSelect}
                onAddTable={handleAddTable}
              />
            </div>
            
            <div className="editor-main">
              {selectedTable ? (
                <TableEditor
                  table={selectedTable}
                  onUpdate={(updatedTable) => handleTableUpdate(selectedTable.name, updatedTable)}
                />
              ) : (
                <div className="empty-selection">
                  <h3>No Table Selected</h3>
                  <p>Select a table from the list or create a new one</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'json' && (
          <JSONViewer
            json={schemaJson}
            onChange={handleJsonChange}
          />
        )}
        
        {activeTab === 'versions' && (
          <VersionHistory
            schemaId={schemaId}
            versions={schema.versions || []}
          />
        )}
      </div>
    </div>
  );
};

export default SchemaEditor;