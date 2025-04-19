// src/components/SchemaManager/TableEditor.jsx
import React, { useState, useEffect } from 'react';
import { PencilIcon, Trash2Icon, PlusIcon } from 'lucide-react';
import './TableEditor.css';

const TableEditor = ({ table, onUpdate }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tableName, setTableName] = useState(table?.name || 'New Table');
  const [tableDescription, setTableDescription] = useState(table?.description || '');
  const [columns, setColumns] = useState(table?.columns || []);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [newColumn, setNewColumn] = useState({
    name: '',
    type: 'symbol',
    description: '',
    required: false,
    key: false
  });

  // Update local state when table prop changes
  useEffect(() => {
    if (table) {
      setTableName(table.name || 'New Table');
      setTableDescription(table.description || '');
      setColumns(table.columns || []);
    }
  }, [table]);

  const columnTypes = [
    { value: 'symbol', label: 'Symbol (s)' },
    { value: 'char', label: 'Char (c)' },
    { value: 'string', label: 'String' },
    { value: 'boolean', label: 'Boolean (b)' },
    { value: 'byte', label: 'Byte (x)' },
    { value: 'short', label: 'Short (h)' },
    { value: 'int', label: 'Int (i)' },
    { value: 'long', label: 'Long (j)' },
    { value: 'real', label: 'Real (e)' },
    { value: 'float', label: 'Float (f)' },
    { value: 'time', label: 'Time (t)' },
    { value: 'minute', label: 'Minute (u)' },
    { value: 'second', label: 'Second (v)' },
    { value: 'timestamp', label: 'Timestamp (p)' },
    { value: 'month', label: 'Month (m)' },
    { value: 'date', label: 'Date (d)' },
    { value: 'datetime', label: 'Datetime (z)' },
    { value: 'timespan', label: 'Timespan (n)' }
  ];

  // Update table name
  const handleNameUpdate = () => {
    if (tableName && tableName !== table?.name) {
      const updatedTable = { 
        ...table, 
        name: tableName 
      };
      onUpdate(updatedTable);
    }
    setIsEditingName(false);
  };

  // Update table description
  const handleDescriptionUpdate = () => {
    if (tableDescription !== table?.description) {
      const updatedTable = { 
        ...table, 
        description: tableDescription 
      };
      onUpdate(updatedTable);
    }
    setIsEditingDescription(false);
  };

  // Add new column
  const handleAddColumn = () => {
    if (!newColumn.name.trim()) {
      return;
    }

    const columnToAdd = {
      id: Date.now().toString(),
      ...newColumn
    };

    const updatedColumns = [...columns, columnToAdd];
    setColumns(updatedColumns);
    
    const updatedTable = {
      ...table,
      columns: updatedColumns
    };
    
    onUpdate(updatedTable);
    
    // Reset form
    setNewColumn({
      name: '',
      type: 'symbol',
      description: '',
      required: false,
      key: false
    });
    setIsAddingColumn(false);
  };

  // Start editing a column
  const handleEditColumn = (columnId) => {
    const columnToEdit = columns.find(c => c.id === columnId);
    if (columnToEdit) {
      setEditingColumnId(columnId);
      setNewColumn({ ...columnToEdit });
    }
  };

  // Update column
  const handleUpdateColumn = () => {
    if (!newColumn.name.trim() || !editingColumnId) {
      return;
    }

    const updatedColumns = columns.map(col => 
      col.id === editingColumnId ? { ...newColumn, id: col.id } : col
    );
    
    setColumns(updatedColumns);
    
    const updatedTable = {
      ...table,
      columns: updatedColumns
    };
    
    onUpdate(updatedTable);
    
    // Reset form
    setNewColumn({
      name: '',
      type: 'symbol',
      description: '',
      required: false,
      key: false
    });
    setEditingColumnId(null);
  };

  // Delete column
  const handleDeleteColumn = (columnId) => {
    const updatedColumns = columns.filter(col => col.id !== columnId);
    setColumns(updatedColumns);
    
    const updatedTable = {
      ...table,
      columns: updatedColumns
    };
    
    onUpdate(updatedTable);
  };

  // Cancel editing or adding
  const handleCancelColumnEdit = () => {
    setNewColumn({
      name: '',
      type: 'symbol',
      description: '',
      required: false,
      key: false
    });
    setEditingColumnId(null);
    setIsAddingColumn(false);
  };

  return (
    <div className="table-editor">
      {/* Table Name Section */}
      <div className="table-header">
        {isEditingName ? (
          <div className="inline-edit">
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              onBlur={handleNameUpdate}
              onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
              autoFocus
            />
            <button 
              className="btn btn-sm btn-primary"
              onClick={handleNameUpdate}
            >
              Save
            </button>
          </div>
        ) : (
          <h2 
            className="editable-title"
            onClick={() => setIsEditingName(true)}
          >
            {tableName} <span className="edit-icon">✏️</span>
          </h2>
        )}
      </div>

      {/* Table Description Section */}
      <div className="table-description">
        {isEditingDescription ? (
          <div className="description-edit">
            <textarea
              value={tableDescription}
              onChange={(e) => setTableDescription(e.target.value)}
              onBlur={handleDescriptionUpdate}
              rows={3}
              placeholder="Enter table description..."
              autoFocus
            />
            <button 
              className="btn btn-sm btn-primary"
              onClick={handleDescriptionUpdate}
            >
              Save
            </button>
          </div>
        ) : (
          <div 
            className="description-display"
            onClick={() => setIsEditingDescription(true)}
          >
            <p>{tableDescription || 'Add a description...'} <span className="edit-icon">✏️</span></p>
          </div>
        )}
      </div>

      {/* Columns Section */}
      <div className="columns-section">
        <div className="section-header">
          <h3>Columns</h3>
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => {
              setIsAddingColumn(true);
              setEditingColumnId(null);
            }}
          >
            <span className="icon">+</span> Add Column
          </button>
        </div>

        {columns.length === 0 ? (
          <div className="empty-columns">
            <p>No columns defined</p>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => {
                setIsAddingColumn(true);
                setEditingColumnId(null);
              }}
            >
              <span className="icon">+</span> Add Column
            </button>
          </div>
        ) : (
          <div className="columns-table">
            <div className="columns-header">
              <div className="column-name">Name</div>
              <div className="column-type">Type</div>
              <div className="column-description">Description</div>
              <div className="column-options">Options</div>
              <div className="column-actions">Actions</div>
            </div>
            
            <div className="columns-body">
              {columns.map(column => (
                <div key={column.id} className="column-row">
                  <div className="column-name">{column.name}</div>
                  <div className="column-type">{column.type}</div>
                  <div className="column-description">{column.description || '-'}</div>
                  <div className="column-options">
                    {column.required && (
                      <span className="option-badge">Required</span>
                    )}
                    {column.key && (
                      <span className="option-badge key">Key</span>
                    )}
                  </div>
                  <div className="column-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleEditColumn(column.id)}
                      title="Edit column"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon delete"
                      onClick={() => handleDeleteColumn(column.id)}
                      title="Delete column"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Column Form */}
        {(isAddingColumn || editingColumnId) && (
          <div className="add-column-form">
            <h4>{editingColumnId ? 'Edit Column' : 'Add New Column'}</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="column-name">Name*</label>
                <input
                  id="column-name"
                  type="text"
                  value={newColumn.name}
                  onChange={(e) => setNewColumn({...newColumn, name: e.target.value})}
                  placeholder="Column name"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="column-type">Type*</label>
                <select
                  id="column-type"
                  value={newColumn.type}
                  onChange={(e) => setNewColumn({...newColumn, type: e.target.value})}
                >
                  {columnTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="column-description">Description</label>
              <input
                id="column-description"
                type="text"
                value={newColumn.description}
                onChange={(e) => setNewColumn({...newColumn, description: e.target.value})}
                placeholder="Column description"
              />
            </div>
            
            <div className="form-row column-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newColumn.required}
                  onChange={(e) => setNewColumn({...newColumn, required: e.target.checked})}
                />
                Required
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newColumn.key}
                  onChange={(e) => setNewColumn({...newColumn, key: e.target.checked})}
                />
                Key Column
              </label>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-sm btn-secondary"
                onClick={handleCancelColumnEdit}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-sm btn-primary"
                onClick={editingColumnId ? handleUpdateColumn : handleAddColumn}
                disabled={!newColumn.name.trim()}
              >
                {editingColumnId ? 'Update Column' : 'Add Column'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableEditor;