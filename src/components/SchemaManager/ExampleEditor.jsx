// src/components/SchemaManager/ExampleEditor.jsx
import React, { useState } from 'react';
import CodeEditor from '../common/CodeEditor';
import { generateExamples } from '../../services/aiService';
import { PlusIcon, SparklesIcon, Trash2Icon, LoaderIcon } from 'lucide-react';

const ExampleEditor = ({ tableName, examples, tableSchema, onUpdate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [newExample, setNewExample] = useState({ natural_language: '', query: '' });
  
  const handleGenerateExamples = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const data = await generateExamples({
        table_name: tableName,
        table_schema: tableSchema,
        count: 3
      });
      
      if (data.examples && data.examples.length > 0) {
        // Combine existing examples with new ones
        const updatedExamples = [...(examples || []), ...data.examples];
        onUpdate(updatedExamples);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate examples');
      console.error('Error generating examples:', err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleAddExample = () => {
    if (!newExample.natural_language || !newExample.query) return;
    
    const updatedExamples = [...(examples || []), newExample];
    onUpdate(updatedExamples);
    setNewExample({ natural_language: '', query: '' });
  };
  
  const handleDeleteExample = (index) => {
    const updatedExamples = [...(examples || [])];
    updatedExamples.splice(index, 1);
    onUpdate(updatedExamples);
  };
  
  const handleExampleChange = (index, field, value) => {
    const updatedExamples = [...(examples || [])];
    updatedExamples[index] = { ...updatedExamples[index], [field]: value };
    onUpdate(updatedExamples);
  };
  
  return (
    <div className="example-editor">
      <div className="section-header">
        <h3>Query Examples</h3>
        <div className="header-actions">
          <button
            className="btn btn-sm btn-ai"
            onClick={handleGenerateExamples}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <LoaderIcon size={16} className="spinner" />
            ) : (
              <SparklesIcon size={16} />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Examples with AI'}</span>
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="examples-list">
        {(examples || []).length === 0 ? (
          <div className="empty-state">
            <p>No examples defined</p>
            <p>Examples help improve query generation accuracy</p>
          </div>
        ) : (
          examples.map((example, index) => (
            <div key={index} className="example-item">
              <div className="example-header">
                <h4>Example {index + 1}</h4>
                <button
                  className="btn btn-icon text-danger"
                  onClick={() => handleDeleteExample(index)}
                  title="Delete example"
                >
                  <Trash2Icon size={16} />
                </button>
              </div>
              
              <div className="example-content">
                <div className="example-field">
                  <label>Natural Language Query:</label>
                  <input
                    type="text"
                    value={example.natural_language}
                    onChange={(e) => handleExampleChange(index, 'natural_language', e.target.value)}
                    placeholder="e.g., Show me all trades for AAPL today"
                  />
                </div>
                
                <div className="example-field">
                  <label>KDB/Q Query:</label>
                  <CodeEditor
                    value={example.query}
                    onChange={(value) => handleExampleChange(index, 'query', value)}
                    language="q"
                    height="100px"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="add-example-form">
        <h4>Add New Example</h4>
        <div className="example-field">
          <label>Natural Language Query:</label>
          <input
            type="text"
            value={newExample.natural_language}
            onChange={(e) => setNewExample({...newExample, natural_language: e.target.value})}
            placeholder="e.g., Show me all trades for AAPL today"
          />
        </div>
        
        <div className="example-field">
          <label>KDB/Q Query:</label>
          <CodeEditor
            value={newExample.query}
            onChange={(value) => setNewExample({...newExample, query: value})}
            language="q"
            height="100px"
            placeholder="e.g., select from trades where sym=`AAPL, date=.z.d"
          />
        </div>
        
        <button
          className="btn btn-primary"
          onClick={handleAddExample}
          disabled={!newExample.natural_language || !newExample.query}
        >
          <PlusIcon size={16} />
          <span>Add Example</span>
        </button>
      </div>
    </div>
  );
};

export default ExampleEditor;