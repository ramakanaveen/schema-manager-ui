// src/components/SchemaManager/SchemaEditor.jsx
import React, { useState, useEffect } from 'react';
import TableEditor from './TableEditor';
import JSONViewer from './JSONViewer';
import { fetchSchemaJson, updateSchemaJson } from '../../services/schemaService';
import './SchemaEditor.css';

const SchemaEditor = ({ schema }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [schemaJson, setSchemaJson] = useState(null);
 
useEffect(() => {
  const loadSchemaData = async () => {
    if (!schema) return;
    
    setLoading(true);
    try {
      // Fetch schema JSON
      const json = await fetchSchemaJson(schema.id);
      setSchemaJson(json);
      
      // Convert tables object to array
      const tablesList = Object.entries(json.tables || {}).map(([name, tableData]) => {
        // Handle columns array with correct field mapping
        const columnsArray = (tableData.columns || []).map((col, index) => ({
          id: `${name}-${col.name || index}`,
          name: col.name || `column_${index}`,
          type: col.type || col.kdb_type || 'symbol',
          description: col.column_desc || '',
          required: col.required || false,
          key: col.key || false,
          kdb_type: col.kdb_type || null,
          references: col.references || null
        }));
        
        return {
          id: name,
          name: name,
          description: tableData.description || '',
          columns: columnsArray,
          examples: tableData.examples || [],
          kdb_table_name: tableData.kdb_table_name || name
        };
      });
      
      setTables(tablesList);
      
      // Select first table if available
      if (tablesList.length > 0 && !selectedTable) {
        setSelectedTable(tablesList[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load schema data');
      console.error('Error loading schema data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  loadSchemaData();
}, [schema]);
  
  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };
  
  const handleAddTable = () => {
    // Create a new table with default values
    const newTableName = `new_table_${Date.now()}`;
    const newTable = {
      id: newTableName,
      name: newTableName,
      description: 'New table description',
      columns: []
    };
    
    // Add to tables list
    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    
    // Update schemaJson
    const updatedJson = { ...schemaJson };
    updatedJson.tables = updatedJson.tables || {};
    updatedJson.tables[newTableName] = {
      description: 'New table description',
      columns: {}
    };
    setSchemaJson(updatedJson);
    
    // Select the new table
    setSelectedTable(newTable);
  };
  
  const handleTableUpdate = (updatedTable) => {
    // Find index of table to update
    const tableIndex = tables.findIndex(t => t.id === (selectedTable?.id || ''));
    if (tableIndex === -1) return;
    
    // Handle table rename
    const oldTableName = tables[tableIndex].name;
    const isTableRenamed = oldTableName !== updatedTable.name;
    
    // Update tables array
    const updatedTables = [...tables];
    updatedTables[tableIndex] = updatedTable;
    setTables(updatedTables);
    
    // Update selectedTable if it's the one being updated
    if (selectedTable?.id === updatedTable.id) {
      setSelectedTable(updatedTable);
    }
    
    // Update schemaJson
    const updatedJson = { ...schemaJson };
    updatedJson.tables = updatedJson.tables || {};
    
    if (isTableRenamed) {
      // Create table with new name
      updatedJson.tables[updatedTable.name] = {
        description: updatedTable.description,
        columns: {}
      };
      
      // Copy columns from old table
      const oldTable = schemaJson.tables[oldTableName] || { columns: {} };
      updatedJson.tables[updatedTable.name].columns = { ...oldTable.columns };
      
      // Delete old table
      delete updatedJson.tables[oldTableName];
    } else {
      // Just update description
      updatedJson.tables[updatedTable.name] = {
        ...updatedJson.tables[updatedTable.name],
        description: updatedTable.description
      };
    }
    
    // Update columns
    updatedJson.tables[updatedTable.name].columns = {};
    updatedTable.columns.forEach(column => {
      updatedJson.tables[updatedTable.name].columns[column.name] = {
        type: column.type,
        description: column.description,
        required: column.required,
        key: column.key
      };
    });
    
    setSchemaJson(updatedJson);
  };
  
  const handleSaveSchema = async (createVersion = false) => {
    if (!schema || !schemaJson) return;
    
    setSaving(true);
    setError(null);
    
    try {
      await updateSchemaJson(
        schema.id,
        schemaJson,
        createVersion,
        createVersion ? `Updated schema on ${new Date().toLocaleDateString()}` : ''
      );
      
      // Show success message (could implement a toast notification here)
      console.log('Schema saved successfully' + (createVersion ? ' as new version' : ''));
    } catch (err) {
      setError(err.message || 'Failed to save schema');
      console.error('Error saving schema:', err);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="loading-state">Loading schema...</div>;
  }
  
  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }
  
  return (
    <div className="schema-editor">
      <div className="schema-editor-actions">
        <button 
          className="btn btn-primary"
          onClick={() => handleSaveSchema(false)}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => handleSaveSchema(true)}
          disabled={saving}
        >
          Save as New Version
        </button>
      </div>
      
      <div className="schema-editor-container">
        <div className="schema-sidebar">
          <div className="tables-header">
            <h3>Tables</h3>
            <button 
              className="btn btn-sm btn-primary"
              onClick={handleAddTable}
            >
              <span className="icon">+</span> Add Table
            </button>
          </div>
          
          <div className="tables-list">
            {tables.length === 0 ? (
              <div className="empty-tables">
                <p>No tables defined</p>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={handleAddTable}
                >
                  <span className="icon">+</span> Add Table
                </button>
              </div>
            ) : (
              <ul className="tables-nav">
                {tables.map(table => (
                  <li key={table.id}>
                    <button
                      className={`table-nav-item ${selectedTable?.id === table.id ? 'active' : ''}`}
                      onClick={() => handleTableSelect(table)}
                    >
                      {table.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="schema-content">
          {selectedTable ? (
            <TableEditor 
              table={selectedTable}
              onUpdate={handleTableUpdate}
            />
          ) : (
            <div className="no-table-selected">
              <p>Select a table from the list or create a new one</p>
              <button 
                className="btn btn-primary"
                onClick={handleAddTable}
              >
                <span className="icon">+</span> Add Table
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemaEditor;