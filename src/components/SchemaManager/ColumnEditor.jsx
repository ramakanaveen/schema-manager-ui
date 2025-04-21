// src/components/SchemaManager/ColumnEditor.jsx
import React, { useState, useEffect } from 'react';
import { Trash2Icon, EditIcon, SaveIcon, XIcon } from 'lucide-react';
import AIAssistant from './AIAssistant';
import './ColumnEditor.css';

const ColumnEditor = ({ column, onUpdate, onDelete, tableName }) => {
  // Debug log the incoming column data
  console.log("Column being edited:", column);
  console.log("Column type:", column.type, "KDB type:", column.kdb_type);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isKey, setIsKey] = useState(false);
  
  // Available KDB types
  const kdbTypes = [
    { value: 'date', label: 'Date (d)' },  // Move date to the top for testing
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
    { value: 'datetime', label: 'Datetime (z)' },
    { value: 'timespan', label: 'Timespan (n)' }
  ];

  // Initialize form data when the component mounts
  useEffect(() => {
    if (column) {
      // Determine the column's type, with clear debug output
      let determinedType = 'symbol'; // Default
      
      if (column.type) {
        determinedType = column.type;
        console.log(`Using column.type: ${determinedType}`);
      } else if (column.kdb_type) {
        determinedType = column.kdb_type;
        console.log(`Using column.kdb_type: ${determinedType}`);
      }
      
      setName(column.name || '');
      setType(determinedType);
      setDescription(column.description || column.column_desc || '');
      setIsRequired(column.required || false);
      setIsKey(column.key || false);
      
      console.log(`Initialized form with name=${column.name}, type=${determinedType}`);
    }
  }, [column]);
  
  // Reset form data when entering edit mode
  useEffect(() => {
    if (isEditing && column) {
      // Determine the column's type again when entering edit mode
      let determinedType = column.type || column.kdb_type || 'symbol';
      
      setName(column.name || '');
      setType(determinedType);
      setDescription(column.description || column.column_desc || '');
      setIsRequired(column.required || false);
      setIsKey(column.key || false);
      
      console.log(`Entering edit mode with type=${determinedType}`);
    }
  }, [isEditing, column]);
  
  // Handle save
  const handleSave = () => {
    if (!name) return;
    
    const updatedColumn = {
      ...column,
      name,
      type,
      kdb_type: type, // Ensure kdb_type is also updated
      description,
      required: isRequired,
      key: isKey
    };
    
    console.log("Saving updated column:", updatedColumn);
    onUpdate(updatedColumn);
    setIsEditing(false);
  };
  
  // Handle cancel
  const handleCancel = () => {
    console.log("Canceling edit");
    setIsEditing(false);
  };
  
  // Handle AI-generated description
  const handleAIDescription = (selectedDescription) => {
    setDescription(selectedDescription);
  };
  
  if (isEditing) {
    // Debug log current state when rendering edit form
    console.log(`Rendering edit form with type=${type}`);
    console.log(`Available types:`, kdbTypes.map(t => t.value));
    
    return (
      <div className="column-editor editing">
        <div className="col-name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Column name"
            autoFocus
          />
        </div>
        
        <div className="col-type">
          <select 
            value={type}
            onChange={(e) => {
              console.log(`Type changed to: ${e.target.value}`);
              setType(e.target.value);
            }}
          >
            {kdbTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="col-description">
          <div className="description-field">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Column description..."
            />
            <AIAssistant
              type="column"
              name={name}
              tableName={tableName}
              onSelectDescription={handleAIDescription}
            />
          </div>
        </div>
        
        <div className="col-options">
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
            <span>Required</span>
          </label>
          
          <label className="option-checkbox">
            <input
              type="checkbox"
              checked={isKey}
              onChange={(e) => setIsKey(e.target.checked)}
            />
            <span>Key</span>
          </label>
        </div>
        
        <div className="col-actions">
          <button 
            className="btn btn-sm btn-success"
            onClick={handleSave}
            title="Save changes"
          >
            <SaveIcon size={14} />
          </button>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={handleCancel}
            title="Cancel"
          >
            <XIcon size={14} />
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="column-editor">
      <div className="col-name">{column.name}</div>
      <div className="col-type">{column.type || column.kdb_type || 'symbol'}</div>
      <div className="col-description">
        {column.description || column.column_desc || <span className="no-description">No description</span>}
      </div>
      <div className="col-options">
        {column.required && <span className="option-badge required">Required</span>}
        {column.key && <span className="option-badge key">Key</span>}
      </div>
      <div className="col-actions">
        <button 
          className="btn btn-icon"
          onClick={() => {
            console.log("Starting edit for column:", column.name);
            setIsEditing(true);
          }}
          title="Edit column"
        >
          <EditIcon size={16} />
        </button>
        <button 
          className="btn btn-icon text-danger"
          onClick={onDelete}
          title="Delete column"
        >
          <Trash2Icon size={16} />
        </button>
      </div>
    </div>
  );
};
export default ColumnEditor;