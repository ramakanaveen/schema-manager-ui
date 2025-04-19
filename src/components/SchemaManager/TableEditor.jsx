// src/components/SchemaManager/TableEditor.jsx
import React, { useState } from 'react';
import ColumnEditor from './ColumnEditor';
import ExampleEditor from './ExampleEditor';
import AIAssistant from './AIAssistant';
import { PlusIcon, Trash2Icon, HelpCircleIcon, EditIcon } from 'lucide-react';

const TableEditor = ({ table, onUpdate }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tableName, setTableName] = useState(table.name);
  const [tableDescription, setTableDescription] = useState(table.description || '');
  const [activeSection, setActiveSection] = useState('columns');
  
  // Handle updating table name
  const handleNameUpdate = () => {
    if (tableName && tableName !== table.name) {
      const updatedTable = { ...table, name: tableName };
      onUpdate(updatedTable);
    }
    setIsEditingName(false);
  };
  
  // Handle updating table description
  const handleDescriptionUpdate = () => {
    if (tableDescription !== table.description) {
      const updatedTable = { ...table, description: tableDescription };
      onUpdate(updatedTable);
    }
    setIsEditingDescription(false);
  };
  
  // Handle adding a new column
  const handleAddColumn = () => {
    const columns = table.columns || [];
    const newColumn = {
      name: `column_${columns.length + 1}`,
      type: 'symbol',
      description: ''
    };
    
    const updatedTable = {
      ...table,
      columns: [...columns, newColumn]
    };
    
    onUpdate(updatedTable);
  };
  
  // Handle updating a column
  const handleColumnUpdate = (index, updatedColumn) => {
    const columns = [...(table.columns || [])];
    columns[index] = updatedColumn;
    
    const updatedTable = {
      ...table,
      columns: columns
    };
    
    onUpdate(updatedTable);
  };
  
  // Handle deleting a column
  const handleColumnDelete = (index) => {
    const columns = [...(table.columns || [])];
    columns.splice(index, 1);
    
    const updatedTable = {
      ...table,
      columns: columns
    };
    
    onUpdate(updatedTable);
  };
  
  // Handle updating examples
  const handleExamplesUpdate = (examples) => {
    const updatedTable = {
      ...table,
      examples: examples
    };
    
    onUpdate(updatedTable);
  };
  
  // Handle AI-generated description
  const handleAIDescription = (description) => {
    setTableDescription(description);
    const updatedTable = {
      ...table,
      description: description
    };
    
    onUpdate(updatedTable);
  };
  
  return (
    <div className="table-editor">
      <div className="table-header">
        <div className="table-name-section">
          {isEditingName ? (
            <div className="inline-edit">
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onBlur={handleNameUpdate}
                autoFocus
              />
              <button onClick={handleNameUpdate}>Save</button>
            </div>
          ) : (
            <h2 onClick={() => setIsEditingName(true)}>
              {table.name}
              <EditIcon size={16} className="edit-icon" />
            </h2>
          )}
        </div>
        
        <div className="table-description-section">
          {isEditingDescription ? (
            <div className="description-edit">
              <textarea
                value={tableDescription}
                onChange={(e) => setTableDescription(e.target.value)}
                onBlur={handleDescriptionUpdate}
                rows={3}
                autoFocus
              />
              <div className="edit-actions">
                <button onClick={handleDescriptionUpdate}>Save</button>
                <AIAssistant
                  type="table"
                  name={table.name}
                  onSelectDescription={handleAIDescription}
                />
              </div>
            </div>
          ) : (
            <div 
              className="description-display"
              onClick={() => setIsEditingDescription(true)}
            >
              <p>{table.description || 'Add a description...'}</p>
              <EditIcon size={16} className="edit-icon" />
            </div>
          )}
        </div>
      </div>
      
      <div className="table-content-tabs">
        <button 
          className={`tab-button ${activeSection === 'columns' ? 'active' : ''}`}
          onClick={() => setActiveSection('columns')}
        >
          Columns
        </button>
        <button 
          className={`tab-button ${activeSection === 'examples' ? 'active' : ''}`}
          onClick={() => setActiveSection('examples')}
        >
          Examples
        </button>
      </div>
      
      {activeSection === 'columns' && (
        <div className="columns-section">
          <div className="section-header">
            <h3>Columns</h3>
            <button 
              className="btn btn-sm btn-primary"
              onClick={handleAddColumn}
            >
              <PlusIcon size={14} />
              <span>Add Column</span>
            </button>
          </div>
          
          <div className="columns-list">
            <div className="columns-header">
              <div className="col-name">Name</div>
              <div className="col-type">Type</div>
              <div className="col-description">Description</div>
              <div className="col-actions">Actions</div>
            </div>
            
            {(table.columns || []).length === 0 ? (
              <div className="empty-state">
                <p>No columns defined</p>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={handleAddColumn}
                >
                  Add Column
                </button>
              </div>
            ) : (
              (table.columns || []).map((column, index) => (
                <ColumnEditor
                  key={`${column.name}-${index}`}
                  column={column}
                  onUpdate={(updatedColumn) => handleColumnUpdate(index, updatedColumn)}
                  onDelete={() => handleColumnDelete(index)}
                  tableName={table.name}
                />
              ))
            )}
          </div>
        </div>
      )}
      
      {activeSection === 'examples' && (
        <ExampleEditor
          tableName={table.name}
          examples={table.examples || []}
          tableSchema={table}
          onUpdate={handleExamplesUpdate}
        />
      )}
    </div>
  );
};

export default TableEditor;