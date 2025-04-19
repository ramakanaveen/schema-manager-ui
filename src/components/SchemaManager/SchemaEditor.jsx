// src/components/SchemaManager/SchemaEditor.jsx
import React, { useState } from 'react';
import './SchemaEditor.css';

const SchemaEditor = ({ schema, onUpdate }) => {
  const [tables, setTables] = useState(schema.tables || []);
  const [selectedTable, setSelectedTable] = useState(null);
  
  const handleAddTable = () => {
    const newTable = {
      id: Date.now().toString(),
      name: `New Table ${tables.length + 1}`,
      description: '',
      columns: []
    };
    
    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    setSelectedTable(newTable);
    
    // Call parent update if needed
    if (onUpdate) {
      onUpdate({
        ...schema,
        tables: updatedTables
      });
    }
  };
  
  return (
    <div className="schema-editor">
      <div className="schema-editor-sidebar">
        <div className="tables-header">
          <h3>Tables</h3>
          <button className="btn btn-sm btn-primary" onClick={handleAddTable}>
            + Add Table
          </button>
        </div>
        
        <ul className="tables-list">
          {tables.length === 0 ? (
            <li className="empty-tables">No tables defined</li>
          ) : (
            tables.map(table => (
              <li 
                key={table.id} 
                className={`table-item ${selectedTable && selectedTable.id === table.id ? 'active' : ''}`}
                onClick={() => setSelectedTable(table)}
              >
                {table.name}
              </li>
            ))
          )}
        </ul>
      </div>
      
      <div className="schema-editor-content">
        {selectedTable ? (
          <div className="table-editor">
            <h2>{selectedTable.name}</h2>
            <p className="placeholder-message">Table editor is under construction</p>
          </div>
        ) : (
          <div className="no-table-selected">
            <p>Select a table from the list or create a new one</p>
            <button className="btn btn-primary" onClick={handleAddTable}>
              + Add Table
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemaEditor;