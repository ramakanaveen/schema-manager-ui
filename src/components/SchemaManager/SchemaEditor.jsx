// src/components/SchemaManager/SchemaEditor.jsx
import React, { useState, useEffect } from 'react';
import TableEditor from './TableEditor';
//import JSONViewer from './JSONViewer';
import TableImportModal from './TableImportModal'; // Import the new component
import { fetchSchemaJson, updateSchemaJson } from '../../services/schemaService';
import './SchemaEditor.css';

const SchemaEditor = ({ schema, schemaJson: initialSchemaJson, onUpdate }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [schemaJson, setSchemaJson] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false); // New state for import modal
  
  // Initialize schemaJson state when initialSchemaJson changes
  useEffect(() => {
    if (initialSchemaJson) {
      setSchemaJson(initialSchemaJson);
    }
  }, [initialSchemaJson]);
  
  useEffect(() => {
    const loadSchemaData = async () => {
      if (!schema) return;
      
      setLoading(true);
      try {
        // If schemaJson is provided, use it, otherwise fetch it
        const json = schemaJson || initialSchemaJson || await fetchSchemaJson(schema.id);
        
        // Make sure we set the schemaJson state if it wasn't already set
        if (!schemaJson) {
          setSchemaJson(json);
        }
        
        // Extract tables from the schema JSON in spot.json format
        let tablesList = [];
        
        // Check if we have a nested structure (like in spot.json)
        if (json.group && json.schemas) {
          // Handle the spot.json format
          const schemas = json.schemas || [];
          schemas.forEach(schemaItem => {
            if (schemaItem.schema && Array.isArray(schemaItem.schema)) {
              schemaItem.schema.forEach(schemaData => {
                if (schemaData.tables && Array.isArray(schemaData.tables)) {
                  schemaData.tables.forEach(tableObj => {
                    const tableName = tableObj.kdb_table_name || "unknown";
                    
                    // Convert columns to our expected format
                    const columnsArray = (tableObj.columns || []).map((col, index) => ({
                      id: `${tableName}-${col.name || index}`,
                      name: col.name || `column_${index}`,
                      type: col.type || col.kdb_type || 'symbol',
                      description: col.column_desc || col.description || '',
                      required: col.required || false,
                      key: col.key || false,
                      kdb_type: col.kdb_type || null,
                      references: col.references || null
                    }));
                    
                    tablesList.push({
                      id: tableName,
                      name: tableName,
                      description: tableObj.description || '',
                      columns: columnsArray,
                      examples: tableObj.examples || [],
                      kdb_table_name: tableName,
                      // Store a reference to the original object to update it correctly
                      _originalRef: tableObj
                    });
                  });
                }
              });
            }
          });
        }
        
        // If we didn't find any tables in the nested format, fall back to standard format
        if (tablesList.length === 0 && json.tables) {
          if (Array.isArray(json.tables)) {
            // Tables are in array format
            json.tables.forEach(tableObj => {
              const tableName = tableObj.kdb_table_name || tableObj.name || "unknown";
              
              // Convert columns to our expected format
              const columnsArray = (tableObj.columns || []).map((col, index) => ({
                id: `${tableName}-${col.name || index}`,
                name: col.name || `column_${index}`,
                type: col.type || col.kdb_type || 'symbol',
                description: col.column_desc || col.description || '',
                required: col.required || false,
                key: col.key || false,
                kdb_type: col.kdb_type || null,
                references: col.references || null
              }));
              
              tablesList.push({
                id: tableName,
                name: tableName,
                description: tableObj.description || '',
                columns: columnsArray,
                examples: tableObj.examples || [],
                kdb_table_name: tableName,
                // Store a reference to the original object to update it correctly
                _originalRef: tableObj
              });
            });
          } else {
            // Tables are in object format (key-value pairs)
            Object.entries(json.tables).forEach(([tableName, tableData]) => {
              // Handle columns array or object with correct field mapping
              let columnsArray = [];
              
              if (Array.isArray(tableData.columns)) {
                columnsArray = tableData.columns.map((col, index) => ({
                  id: `${tableName}-${col.name || index}`,
                  name: col.name || `column_${index}`,
                  type: col.type || col.kdb_type || 'symbol',
                  description: col.column_desc || col.description || '',
                  required: col.required || false,
                  key: col.key || false,
                  kdb_type: col.kdb_type || null,
                  references: col.references || null
                }));
              } else if (tableData.columns && typeof tableData.columns === 'object') {
                // Convert column object to array
                columnsArray = Object.entries(tableData.columns).map(([colName, colData]) => ({
                  id: `${tableName}-${colName}`,
                  name: colName,
                  type: colData.type || colData.kdb_type || 'symbol',
                  description: colData.description || '',
                  required: colData.required || false,
                  key: colData.key || false
                }));
              }
              
              tablesList.push({
                id: tableName,
                name: tableName,
                description: tableData.description || '',
                columns: columnsArray,
                examples: tableData.examples || [],
                kdb_table_name: tableData.kdb_table_name || tableName,
                // Store a reference to the original object
                _originalRef: tableData
              });
            });
          }
        }
        
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
  }, [schema, schemaJson, initialSchemaJson, refreshKey, selectedTable]);

  const handleTableSelect = (table) => {
    setSelectedTable(table);
  };

  // Show import modal
  const handleShowImportModal = () => {
    setShowImportModal(true);
  };

  // Handle imported table from modal
  const handleImportTable = (importedTable) => {
    console.log("Importing table:", importedTable);
    
    // Create new table object in the same format as spot.json
    const newTableObj = {
      kdb_table_name: importedTable.name,
      description: importedTable.description,
      columns: importedTable.columns.map(col => ({
        name: col.name,
        type: col.type,
        kdb_type: col.type,
        column_desc: col.description,
        required: col.required,
        key: col.key
      })),
      examples: importedTable.examples || []
    };
    
    // Add to tables list for UI
    const newTable = {
      id: importedTable.name,
      name: importedTable.name,
      description: importedTable.description,
      columns: importedTable.columns,
      examples: importedTable.examples || [],
      kdb_table_name: importedTable.name,
      _originalRef: newTableObj  // Reference to the original object
    };
    
    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    
    // Update schemaJson in the same format
    const updatedJson = { ...(schemaJson || {}) };
    
    // Check if we have the spot.json format
    if (updatedJson.group && updatedJson.schemas && updatedJson.schemas.length > 0) {
      // Find the first schema item
      if (updatedJson.schemas[0].schema && updatedJson.schemas[0].schema.length > 0) {
        // Add the table to the first schema
        if (updatedJson.schemas[0].schema[0].tables) {
          if (Array.isArray(updatedJson.schemas[0].schema[0].tables)) {
            updatedJson.schemas[0].schema[0].tables.push(newTableObj);
          }
        } else {
          // Initialize tables array if it doesn't exist
          updatedJson.schemas[0].schema[0].tables = [newTableObj];
        }
      }
    } else {
      // Simpler format
      if (!updatedJson.tables) {
        updatedJson.tables = [];
      }
      
      if (Array.isArray(updatedJson.tables)) {
        updatedJson.tables.push(newTableObj);
      } else {
        // Convert to array format if it's an object
        const tablesArray = [];
        Object.entries(updatedJson.tables).forEach(([tableName, tableData]) => {
          tablesArray.push({
            kdb_table_name: tableName,
            ...tableData
          });
        });
        tablesArray.push(newTableObj);
        updatedJson.tables = tablesArray;
      }
    }
    
    setSchemaJson(updatedJson);
    
    // Notify parent component of the update
    if (onUpdate) {
      onUpdate(updatedJson);
    }
    
    // Select the new table
    setSelectedTable(newTable);
    
    // Close the import modal
    setShowImportModal(false);
  };
  
  const handleAddTable = () => {
    // Create a new table with default values
    const newTableName = `new_table_${Date.now()}`;
    
    // Create new table object in the same format as spot.json
    const newTableObj = {
      kdb_table_name: newTableName,
      description: 'New table description',
      columns: []
    };
    
    // Add to tables list for UI
    const newTable = {
      id: newTableName,
      name: newTableName,
      description: 'New table description',
      columns: [],
      examples: [],
      kdb_table_name: newTableName,
      _originalRef: newTableObj  // Reference to the original object
    };
    
    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    
    // Update schemaJson in the same format
    const updatedJson = { ...(schemaJson || {}) };
    
    // Check if we have the spot.json format
    if (updatedJson.group && updatedJson.schemas && updatedJson.schemas.length > 0) {
      // Find the first schema item
      if (updatedJson.schemas[0].schema && updatedJson.schemas[0].schema.length > 0) {
        // Add the table to the first schema
        if (updatedJson.schemas[0].schema[0].tables) {
          if (Array.isArray(updatedJson.schemas[0].schema[0].tables)) {
            updatedJson.schemas[0].schema[0].tables.push(newTableObj);
          }
        } else {
          // Initialize tables array if it doesn't exist
          updatedJson.schemas[0].schema[0].tables = [newTableObj];
        }
      }
    } else {
      // Simpler format
      if (!updatedJson.tables) {
        updatedJson.tables = [];
      }
      
      if (Array.isArray(updatedJson.tables)) {
        updatedJson.tables.push(newTableObj);
      } else {
        // Convert to array format if it's an object
        const tablesArray = [];
        Object.entries(updatedJson.tables).forEach(([tableName, tableData]) => {
          tablesArray.push({
            kdb_table_name: tableName,
            ...tableData
          });
        });
        tablesArray.push(newTableObj);
        updatedJson.tables = tablesArray;
      }
    }
    
    setSchemaJson(updatedJson);
    
    // Notify parent component of the update
    if (onUpdate) {
      onUpdate(updatedJson);
    }
    
    // Select the new table
    setSelectedTable(newTable);
  };
  
  const handleTableUpdate = (updatedTable) => {
    // Find index of table to update
    const tableIndex = tables.findIndex(t => t.id === (selectedTable?.id || ''));
    if (tableIndex === -1) return;
    
    // Handle table rename
    // const oldTableName = tables[tableIndex].name;
    // const isTableRenamed = oldTableName !== updatedTable.name;
    
    // Get the reference to the original table object
    const originalRef = tables[tableIndex]._originalRef;
    if (!originalRef) {
      console.error("Original table reference not found");
      return;
    }
    
    // Update the original reference directly
    originalRef.kdb_table_name = updatedTable.name;
    originalRef.description = updatedTable.description;
    
    // Update examples if they exist
    if (updatedTable.examples) {
      originalRef.examples = updatedTable.examples;
    }
    
    // Update columns in the original format
    originalRef.columns = updatedTable.columns.map(column => ({
      name: column.name,
      kdb_type: column.type,  // Use type as kdb_type
      type: column.type,
      column_desc: column.description,
      required: column.required,
      key: column.key,
      references: column.references
    }));
    
    // Update tables array
    const updatedTables = [...tables];
    updatedTables[tableIndex] = {
      ...updatedTable,
      _originalRef: originalRef  // Keep reference to original
    };
    setTables(updatedTables);
    
    // Update selectedTable if it's the one being updated
    if (selectedTable?.id === updatedTable.id) {
      setSelectedTable({
        ...updatedTable,
        _originalRef: originalRef
      });
    }
    
    // Notify parent component of the update
    if (onUpdate && schemaJson) {
      onUpdate(schemaJson);
    }
  };
  
  // Handle initiating table deletion
  const handleInitiateDeleteTable = (table) => {
    setTableToDelete(table);
    setShowDeleteConfirm(true);
  };

  // Handle confirming table deletion
  const handleConfirmDeleteTable = () => {
    if (!tableToDelete) return;
    
    // Create a copy of the schema JSON
    const updatedJson = { ...(schemaJson || {}) };
    
    // Handle deletion based on the schema format
    if (updatedJson.group && updatedJson.schemas && updatedJson.schemas.length > 0) {
      // Spot.json format
      updatedJson.schemas.forEach(schemaItem => {
        if (schemaItem.schema && Array.isArray(schemaItem.schema)) {
          schemaItem.schema.forEach(schemaData => {
            if (schemaData.tables && Array.isArray(schemaData.tables)) {
              // Filter out the table to delete
              schemaData.tables = schemaData.tables.filter(
                tableObj => tableObj.kdb_table_name !== tableToDelete.name
              );
            }
          });
        }
      });
    } else if (updatedJson.tables) {
      // Standard format
      if (Array.isArray(updatedJson.tables)) {
        // Filter out the table to delete
        updatedJson.tables = updatedJson.tables.filter(
          tableObj => (tableObj.kdb_table_name || tableObj.name) !== tableToDelete.name
        );
      } else {
        // Object format
        const { [tableToDelete.name]: deletedTable, ...remainingTables } = updatedJson.tables;
        updatedJson.tables = remainingTables;
      }
    }
    
    // Update the tables list
    const updatedTables = tables.filter(table => table.id !== tableToDelete.id);
    setTables(updatedTables);
    
    // Update schema JSON
    setSchemaJson(updatedJson);
    
    // Notify parent component of the update
    if (onUpdate) {
      onUpdate(updatedJson);
    }
    
    // Reset selected table if it was deleted
    if (selectedTable && selectedTable.id === tableToDelete.id) {
      setSelectedTable(updatedTables.length > 0 ? updatedTables[0] : null);
    }
    
    // Reset delete confirmation state
    setShowDeleteConfirm(false);
    setTableToDelete(null);
  };

  // Cancel delete operation
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setTableToDelete(null);
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
      
      // Force reload by incrementing refresh key
      setRefreshKey(prevKey => prevKey + 1);
      
      // Show success message
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
            <div className="table-actions">
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleShowImportModal}
                title="Import table from CSV/JSON"
              >
                <span className="icon">📋</span> Import
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleAddTable}
                title="Add empty table"
              >
                <span className="icon">+</span> Add
              </button>
            </div>
          </div>
          
          <div className="tables-list">
            {tables.length === 0 ? (
              <div className="empty-tables">
                <p>No tables defined</p>
                <div className="empty-tables-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={handleShowImportModal}
                  >
                    <span className="icon">📋</span> Import Table
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={handleAddTable}
                  >
                    <span className="icon">+</span> Add Empty Table
                  </button>
                </div>
              </div>
            ) : (
              <ul className="tables-nav">
                {tables.map(table => (
                  <li key={table.id} className="table-nav-item-container">
                    <button
                      className={`table-nav-item ${selectedTable?.id === table.id ? 'active' : ''}`}
                      onClick={() => handleTableSelect(table)}
                    >
                      {table.name}
                    </button>
                    <button 
                      className="table-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInitiateDeleteTable(table);
                      }}
                      title="Delete table"
                    >
                      🗑️
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
              tableName={selectedTable.name}
              allTables={tables}
            />
          ) : (
            <div className="no-table-selected">
              <p>Select a table from the list or create a new one</p>
              <div className="no-table-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleShowImportModal}
                >
                  <span className="icon">📋</span> Import Table
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleAddTable}
                >
                  <span className="icon">+</span> Add Empty Table
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <h3>Delete Table</h3>
            <p>Are you sure you want to delete the table "{tableToDelete?.name}"?</p>
            <p className="warning">This action cannot be undone!</p>
            <div className="delete-confirm-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleConfirmDeleteTable}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Import Modal */}
      {showImportModal && (
        <TableImportModal 
          onClose={() => setShowImportModal(false)}
          onImport={handleImportTable}
        />
      )}
    </div>
  );
};

export default SchemaEditor;