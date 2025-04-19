// src/components/SchemaManager/ColumnEditor.jsx
import React, { useState } from 'react';
import { Trash2Icon, EditIcon, SaveIcon, XIcon } from 'lucide-react';
import AIAssistant from './AIAssistant';
import './ColumnEditor.css';

const ColumnEditor = ({ column, onUpdate, onDelete, tableName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const [type, setType] = useState(column.type || 'symbol');
  const [description, setDescription] = useState(column.description || '');
  const [isRequired, setIsRequired] = useState(column.required || false);
  const [isKey, setIsKey] = useState(column.key || false);
  
  // Available KDB types
  const kdbTypes = [
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
  
  // Handle save
  const handleSave = () => {
    if (!name) return;
    
    onUpdate({
      ...column,
      name,
      type,
      description,
      required: isRequired,
      key: isKey
    });
    
    setIsEditing(false);
  };
  
  // Handle cancel
  const handleCancel = () => {
    // Reset to original values
    setName(column.name);
    setType(column.type || 'symbol');
    setDescription(column.description || '');
    setIsRequired(column.required || false);
    setIsKey(column.key || false);
    setIsEditing(false);
  };
  
  // Handle AI-generated description
  const handleAIDescription = (selectedDescription) => {
    setDescription(selectedDescription);
  };
  
  if (isEditing) {
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
            onChange={(e) => setType(e.target.value)}
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
      <div className="col-type">{column.type || 'symbol'}</div>
      <div className="col-description">
        {column.description || <span className="no-description">No description</span>}
      </div>
      <div className="col-options">
        {column.required && <span className="option-badge required">Required</span>}
        {column.key && <span className="option-badge key">Key</span>}
      </div>
      <div className="col-actions">
        <button 
          className="btn btn-icon"
          onClick={() => setIsEditing(true)}
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