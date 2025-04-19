// src/components/SchemaManager/ColumnEditor.jsx
import React, { useState } from 'react';
import AIAssistant from './AIAssistant';
import { Trash2Icon, EditIcon, HelpCircleIcon } from 'lucide-react';

const ColumnEditor = ({ column, onUpdate, onDelete, tableName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const [type, setType] = useState(column.type || column.kdb_type || 'symbol');
  const [description, setDescription] = useState(column.description || column.column_desc || '');
  
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
      description
    });
    
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
        
        <div className="col-actions">
          <button 
            className="btn btn-sm btn-success"
            onClick={handleSave}
          >
            Save
          </button>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="column-editor">
      <div className="col-name">{column.name}</div>
      <div className="col-type">{column.type || column.kdb_type || 'symbol'}</div>
      <div className="col-description">{column.description || column.column_desc || '-'}</div>
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