// src/components/SchemaManager/JSONViewer.jsx
import React, { useState } from 'react';
import CodeEditor from '../common/CodeEditor';
import { CheckCircleIcon, AlertCircleIcon } from 'lucide-react';

const JSONViewer = ({ json, onChange }) => {
  const [jsonString, setJsonString] = useState(JSON.stringify(json, null, 2));
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState(null);
  
  const handleChange = (value) => {
    setJsonString(value);
    
    try {
      const parsedJson = JSON.parse(value);
      setIsValid(true);
      setError(null);
      onChange(parsedJson);
    } catch (err) {
      setIsValid(false);
      setError(err.message);
    }
  };
  
  return (
    <div className="json-viewer">
      <div className="json-header">
        <h3>Schema JSON</h3>
        <div className="json-status">
          {isValid ? (
            <span className="valid-status">
              <CheckCircleIcon size={16} />
              <span>Valid JSON</span>
            </span>
          ) : (
            <span className="invalid-status">
              <AlertCircleIcon size={16} />
              <span>Invalid JSON: {error}</span>
            </span>
          )}
        </div>
      </div>
      
      <div className="json-editor-container">
        <CodeEditor
          value={jsonString}
          onChange={handleChange}
          language="json"
          height="600px"
        />
      </div>
    </div>
  );
};

export default JSONViewer;