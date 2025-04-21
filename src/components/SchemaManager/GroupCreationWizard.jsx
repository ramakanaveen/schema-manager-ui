// src/components/SchemaManager/GroupCreationWizard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup, createSchema , updateSchemaJson } from '../../services/schemaService';
import './GroupCreationWizard.css';

const GroupCreationWizard = ({ onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data for all steps
  const [groupData, setGroupData] = useState({
    name: '',
    description: ''
  });
  
  const [schemaData, setSchemaData] = useState({
    name: '',
    description: ''
  });
  
  const [tableData, setTableData] = useState({
    name: '',
    description: '',
    columns: [
      { name: 'id', type: 'symbol', description: 'Unique identifier', required: true, key: true },
      { name: 'created_at', type: 'timestamp', description: 'Creation timestamp', required: false, key: false }
    ]
  });
  
  // Column being edited or added
  const [columnData, setColumnData] = useState({
    name: '',
    type: 'symbol',
    description: '',
    required: false,
    key: false
  });
  
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
  
  // Handle group input changes
  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setGroupData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle schema input changes
  const handleSchemaChange = (e) => {
    const { name, value } = e.target;
    setSchemaData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle table input changes
  const handleTableChange = (e) => {
    const { name, value } = e.target;
    setTableData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle column input changes
  const handleColumnChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox type inputs
    if (type === 'checkbox') {
      setColumnData(prev => ({ ...prev, [name]: checked }));
    } else {
      setColumnData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Add column to table
  const handleAddColumn = () => {
    if (!columnData.name.trim()) return;
    
    setTableData(prev => ({
      ...prev,
      columns: [...prev.columns, { ...columnData }]
    }));
    
    // Reset column form
    setColumnData({
      name: '',
      type: 'symbol',
      description: '',
      required: false,
      key: false
    });
  };
  
  // Remove column from table
  const handleRemoveColumn = (index) => {
    setTableData(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index)
    }));
  };
  
  // Move to next step
  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };
  
  // Move to previous step
  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };
  
  // Submit all data to create group, schema, and table
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Step 1: Create the group
      const groupResponse = await createGroup({
        name: groupData.name,
        description: groupData.description
      });
      
      // Step 2: Create the schema in the group
      const schemaResponse = await createSchema({
        name: schemaData.name,
        description: schemaData.description,
        group_id: groupResponse.id
      });
      
      const tableJson = {
        tables: [
          {
            kdb_table_name: tableData.name,
            description: tableData.description,
            columns: tableData.columns.map(col => ({
              name: col.name,
              type: col.type,
              kdb_type: col.type,
              column_desc: col.description,
              required: col.required,
              key: col.key
            }))
          }
        ]
      };
      
      // Update the schema with the table
      await updateSchemaJson(
        schemaResponse.id,
        tableJson,
        false,
        'Initial schema creation with table'
      );
      
      // Navigate to the new schema's detail page
      navigate(`/schema-manager/schema/${schemaResponse.id}`);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group and schema');
      console.error('Error creating group:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="group-creation-wizard">
      <div className="wizard-content">
        <div className="wizard-header">
          <h2>Create New Group</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="wizard-steps">
          <div className={`step ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            1. Group Details
          </div>
          <div className={`step ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            2. Schema Details
          </div>
          <div className={`step ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            3. Initial Table
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Step 1: Group Details */}
        {step === 1 && (
          <div className="step-content">
            <h3>Group Details</h3>
            <p>Create a new group to organize your schemas</p>
            
            <div className="form-group">
              <label htmlFor="group-name">Group Name*</label>
              <input
                id="group-name"
                name="name"
                type="text"
                value={groupData.name}
                onChange={handleGroupChange}
                placeholder="Enter group name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="group-description">Description</label>
              <textarea
                id="group-description"
                name="description"
                value={groupData.description}
                onChange={handleGroupChange}
                placeholder="Enter group description"
                rows={5}
              />
            </div>
          </div>
        )}
        
        {/* Step 2: Schema Details */}
        {step === 2 && (
          <div className="step-content">
            <h3>Schema Details</h3>
            <p>Create an initial schema for your group</p>
            
            <div className="form-group">
              <label htmlFor="schema-name">Schema Name*</label>
              <input
                id="schema-name"
                name="name"
                type="text"
                value={schemaData.name}
                onChange={handleSchemaChange}
                placeholder="Enter schema name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="schema-description">Description</label>
              <textarea
                id="schema-description"
                name="description"
                value={schemaData.description}
                onChange={handleSchemaChange}
                placeholder="Enter schema description"
                rows={3}
              />
            </div>
          </div>
        )}
        
        {/* Step 3: Initial Table */}
        {step === 3 && (
          <div className="step-content">
            <h3>Initial Table</h3>
            <p>Create at least one table in your schema</p>
            
            <div className="form-group">
              <label htmlFor="table-name">Table Name*</label>
              <input
                id="table-name"
                name="name"
                type="text"
                value={tableData.name}
                onChange={handleTableChange}
                placeholder="Enter table name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="table-description">Description</label>
              <textarea
                id="table-description"
                name="description"
                value={tableData.description}
                onChange={handleTableChange}
                placeholder="Enter table description"
                rows={2}
              />
            </div>
            
            <div className="columns-section">
              <div className="section-header">
                <h4>Columns</h4>
              </div>
              
              <div className="columns-table">
                <div className="columns-header">
                  <div>Name</div>
                  <div>Type</div>
                  <div>Description</div>
                  <div>Options</div>
                  <div>Actions</div>
                </div>
                
                <div className="columns-body">
                  {tableData.columns.map((column, index) => (
                    <div key={index} className="column-row">
                      <div>{column.name}</div>
                      <div>{column.type}</div>
                      <div>{column.description || '-'}</div>
                      <div>
                        {column.required && <span className="option-badge">Required</span>}
                        {column.key && <span className="option-badge key">Key</span>}
                      </div>
                      <div>
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleRemoveColumn(index)}
                          title="Remove column"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="add-column-form">
                <h4>Add Column</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="column-name">Name*</label>
                    <input
                      id="column-name"
                      name="name"
                      type="text"
                      value={columnData.name}
                      onChange={handleColumnChange}
                      placeholder="Column name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="column-type">Type*</label>
                    <select
                      id="column-type"
                      name="type"
                      value={columnData.type}
                      onChange={handleColumnChange}
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
                    name="description"
                    type="text"
                    value={columnData.description}
                    onChange={handleColumnChange}
                    placeholder="Column description"
                  />
                </div>
                
                <div className="form-row column-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="required"
                      checked={columnData.required}
                      onChange={handleColumnChange}
                    />
                    Required
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="key"
                      checked={columnData.key}
                      onChange={handleColumnChange}
                    />
                    Key Column
                  </label>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-primary"
                    onClick={handleAddColumn}
                    disabled={!columnData.name.trim()}
                  >
                    Add Column
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      <div className="wizard-actions">
        {step > 1 && (
          <button 
            className="btn btn-secondary"
            onClick={handlePrevStep}
            disabled={loading}
          >
            Back
          </button>
        )}
        
        <div>
          {step < 3 ? (
            <button 
              className="btn btn-primary"
              onClick={handleNextStep}
              disabled={
                (step === 1 && !groupData.name.trim()) || 
                (step === 2 && !schemaData.name.trim())
              }
            >
              Next
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={
                loading || 
                !tableData.name.trim() || 
                tableData.columns.length === 0
              }
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default GroupCreationWizard;