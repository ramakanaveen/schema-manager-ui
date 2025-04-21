// src/components/SchemaManager/AIAssistant.jsx
import React, { useState } from 'react';
import { SparklesIcon, LoaderIcon, CheckIcon, XIcon } from 'lucide-react';
import { generateDescriptionsWithFallback } from '../../services/aiService';
import './AIAssistant.css';

const AIAssistant = ({ type, name, tableName, tableContext, onSelectDescription }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Prepare the request with full table context
      const requestData = {
        table_name: tableName,
        count: 3
      };
      
      // Add table context if available
      if (tableContext) {
        requestData.table_context = tableContext;
      }
      
      // For column-specific descriptions, add column name
      if (type === 'column') {
        requestData.column_name = name;
      }
      
      const data = await generateDescriptionsWithFallback(requestData);
      
      setSuggestions(data.descriptions || []);
      setShowSuggestions(true);
    } catch (err) {
      setError(err.message || 'Failed to generate descriptions');
      console.error('Error generating descriptions:', err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSelectSuggestion = (suggestion) => {
    onSelectDescription(suggestion);
    setShowSuggestions(false);
  };
  
  return (
    <div className="ai-assistant">
      <button
        className={`btn btn-ai btn-sm ${isGenerating ? 'generating' : ''}`}
        onClick={handleGenerate}
        disabled={isGenerating}
        title={`Generate ${type} description with AI`}
      >
        {isGenerating ? (
          <LoaderIcon size={16} className="spinner" />
        ) : (
          <SparklesIcon size={16} />
        )}
        <span>{isGenerating ? 'Generating...' : 'AI Suggest'}</span>
      </button>
      
      {error && (
        <div className="ai-error">
          <XIcon size={14} />
          <span>{error}</span>
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          <div className="suggestions-header">
            <h4>AI Suggestions</h4>
            <button 
              className="close-button"
              onClick={() => setShowSuggestions(false)}
            >
              <XIcon size={16} />
            </button>
          </div>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="suggestion-item"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="suggestion-content">{suggestion}</div>
                <button className="select-button">
                  <CheckIcon size={14} />
                  <span>Use</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;