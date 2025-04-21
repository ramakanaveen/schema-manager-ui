// src/components/SchemaManager/ExampleEditor.jsx
import React, { useState } from 'react';
import { PlusIcon, SaveIcon, XIcon } from 'lucide-react';
import CodeEditor from '../common/CodeEditor';
import './ExampleEditor.css'; // Make sure to create this CSS file

const ExampleEditor = ({ examples = [], onUpdate }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [newExample, setNewExample] = useState({ natural_language: '', query: '' });
  const [isAddingExample, setIsAddingExample] = useState(false);
  
  const handleAddExample = () => {
    if (!newExample.natural_language || !newExample.query) return;
    
    const updatedExamples = [...(examples || []), newExample];
    onUpdate(updatedExamples);
    
    // Reset form
    setNewExample({ natural_language: '', query: '' });
    setIsAddingExample(false);
  };
  
  const handleEditExample = (index) => {
    setEditingIndex(index);
    setNewExample({ ...examples[index] });
  };
  
  const handleUpdateExample = () => {
    if (editingIndex === null || !newExample.natural_language || !newExample.query) return;
    
    const updatedExamples = [...examples];
    updatedExamples[editingIndex] = newExample;
    onUpdate(updatedExamples);
    
    // Reset form
    setNewExample({ natural_language: '', query: '' });
    setEditingIndex(null);
  };
  
  const handleDeleteExample = (index) => {
    const updatedExamples = [...examples];
    updatedExamples.splice(index, 1);
    onUpdate(updatedExamples);
  };
  
  const handleCancel = () => {
    setNewExample({ natural_language: '', query: '' });
    setEditingIndex(null);
    setIsAddingExample(false);
  };
  
  return (
    <div className="example-editor">
      <div className="section-header">
        <h3>Query Examples</h3>
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => {
            setIsAddingExample(true);
            setEditingIndex(null);
          }}
        >
          <PlusIcon size={16} />
          <span>Add Example</span>
        </button>
      </div>
      
      {examples?.length === 0 ? (
        <div className="empty-state">
          <p>No examples defined yet</p>
          <p>Examples help improve query generation accuracy</p>
        </div>
      ) : (
        <div className="examples-list">
          {examples.map((example, index) => (
            <div key={index} className="example-item">
              {editingIndex === index ? (
                <div className="example-edit-form">
                  <div className="form-group">
                    <label>Natural Language Query:</label>
                    <input
                      type="text"
                      value={newExample.natural_language}
                      onChange={(e) => setNewExample({...newExample, natural_language: e.target.value})}
                      placeholder="e.g., Show me all trades for AAPL today"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>KDB/Q Query:</label>
                    <CodeEditor
                      value={newExample.query}
                      onChange={(value) => setNewExample({...newExample, query: value})}
                      language="q"
                      height="100px"
                    />
                  </div>
                  
                  <div className="example-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={handleUpdateExample}
                    >
                      <SaveIcon size={14} />
                      <span>Save</span>
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={handleCancel}
                    >
                      <XIcon size={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="example-display">
                  <div className="example-header">
                    <h4>Example {index + 1}</h4>
                    <div className="example-actions">
                      <button 
                        className="btn-icon"
                        onClick={() => handleEditExample(index)}
                        title="Edit example"
                      >
                          ✏️
                      </button>
                      <button 
                        className="btn-icon delete"
                        onClick={() => handleDeleteExample(index)}
                        title="Delete example"
                      >
                         🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="example-content">
                    <div className="example-field">
                      <label>Natural Language Query:</label>
                      <p>{example.natural_language}</p>
                    </div>
                    
                    <div className="example-field">
                      <label>KDB/Q Query:</label>
                      <CodeEditor
                        value={example.query}
                        language="q"
                        height="80px"
                        readOnly={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {isAddingExample && (
        <div className="add-example-form">
          <h4>Add New Example</h4>
          <div className="form-group">
            <label>Natural Language Query:</label>
            <input
              type="text"
              value={newExample.natural_language}
              onChange={(e) => setNewExample({...newExample, natural_language: e.target.value})}
              placeholder="e.g., Show me all trades for AAPL today"
            />
          </div>
          
          <div className="form-group">
            <label>KDB/Q Query:</label>
            <CodeEditor
              value={newExample.query}
              onChange={(value) => setNewExample({...newExample, query: value})}
              language="q"
              height="100px"
              placeholder="e.g., select from trades where sym=`AAPL, date=.z.d"
            />
          </div>
          
          <div className="form-actions">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleAddExample}
              disabled={!newExample.natural_language || !newExample.query}
            >
              Add Example
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExampleEditor;