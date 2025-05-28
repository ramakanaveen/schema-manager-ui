// src/components/SchemaManager/JSONViewer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchSchemaJson } from '../../services/schemaService';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { EditIcon, SaveIcon, XIcon, CheckIcon, AlertCircleIcon, EyeIcon } from 'lucide-react';
import './JSONViewer.css';

const JSONViewer = ({ schemaId, schemaJson, onUpdate, onSaveComplete }) => {
  const [json, setJson] = useState(null);
  const [editableJson, setEditableJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [jsonError, setJsonError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // Default to editing mode
  const textareaRef = useRef(null);
  
  useEffect(() => {
    const loadJson = async () => {
      setLoading(true);
      try {
        // If schemaJson is provided, use it, otherwise fetch it
        const data = schemaJson || await fetchSchemaJson(schemaId);
        setJson(data);
        setEditableJson(JSON.stringify(data, null, 2));
        setHasChanges(false);
      } catch (err) {
        setError(err.message || 'Failed to load schema JSON');
        console.error('Error loading schema JSON:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (schemaId) {
      loadJson();
    }
  }, [schemaId, schemaJson]);

  // Update editableJson when schemaJson prop changes
  useEffect(() => {
    if (schemaJson && !isEditing) {
      setJson(schemaJson);
      setEditableJson(JSON.stringify(schemaJson, null, 2));
      setHasChanges(false);
    }
  }, [schemaJson, isEditing]);

  const handleCopy = () => {
    const textToCopy = isEditing ? editableJson : JSON.stringify(json, null, 2);
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  const handleDownload = () => {
    const dataToDownload = isEditing ? editableJson : JSON.stringify(json, null, 2);
    if (dataToDownload) {
      const dataStr = "data:text/json;charset=utf-8," + 
                      encodeURIComponent(dataToDownload);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `schema-${schemaId}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setJsonError(null);
    setShowPreview(false); // Start with editing enabled
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableJson(JSON.stringify(json, null, 2));
    setJsonError(null);
    setHasChanges(false);
  };

  const validateJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      return { valid: true, parsed };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  };

  const handleJsonChange = (value) => {
    setEditableJson(value);
    setHasChanges(true);
    
    // Validate JSON as user types
    const validation = validateJson(value);
    if (!validation.valid) {
      setJsonError(validation.error);
    } else {
      setJsonError(null);
    }
  };

  const handleSaveChanges = () => {
    const validation = validateJson(editableJson);
    
    if (!validation.valid) {
      setJsonError(validation.error);
      return;
    }

    try {
      const updatedJson = validation.parsed;
      setJson(updatedJson);
      setIsEditing(false);
      setJsonError(null);
      setHasChanges(false);
      
      // Notify parent component of changes
      if (onUpdate) {
        onUpdate(updatedJson);
      }
      
      // Notify parent that save is complete (this clears the "unsaved changes" indicator)
      if (onSaveComplete) {
        onSaveComplete();
      }
      
      return true;
    } catch (err) {
      setJsonError('Failed to save changes: ' + err.message);
      return false;
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(editableJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setEditableJson(formatted);
      setJsonError(null);
    } catch (err) {
      setJsonError('Cannot format invalid JSON');
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };
  
  if (loading) {
    return <div className="json-viewer-loading">Loading JSON...</div>;
  }
  
  if (error) {
    return <div className="json-viewer-error">Error: {error}</div>;
  }
  
  if (!json) {
    return <div className="json-viewer-empty">No JSON data available</div>;
  }
  
  return (
    <div className="json-viewer">
      <div className="json-actions">
        <div className="json-actions-left">
          {!isEditing ? (
            <button 
              className="btn btn-sm btn-primary"
              onClick={handleStartEdit}
            >
              <EditIcon size={16} />
              <span>Edit JSON</span>
            </button>
          ) : (
            <>
              <button 
                className="btn btn-sm btn-success"
                onClick={handleSaveChanges}
                disabled={!!jsonError}
              >
                <SaveIcon size={16} />
                <span>Save Changes</span>
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={handleCancelEdit}
              >
                <XIcon size={16} />
                <span>Cancel</span>
              </button>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={formatJson}
                disabled={!!jsonError}
              >
                <span>Format</span>
              </button>
              <button 
                className={`btn btn-sm btn-secondary ${showPreview ? 'active' : ''}`}
                onClick={togglePreview}
                title="Toggle syntax highlighting"
              >
                <EyeIcon size={16} />
                <span>{showPreview ? 'Hide' : 'Show'} Highlighting</span>
              </button>
            </>
          )}
        </div>
        
        <div className="json-actions-right">
          {hasChanges && (
            <span className="changes-indicator">
              <AlertCircleIcon size={16} />
              <span>Unsaved changes</span>
            </span>
          )}
          <button 
            className="btn btn-sm btn-secondary"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <CheckIcon size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <span>Copy</span>
            )}
          </button>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={handleDownload}
          >
            <span>Download</span>
          </button>
        </div>
      </div>

      {jsonError && (
        <div className="json-error">
          <AlertCircleIcon size={16} />
          <span>JSON Error: {jsonError}</span>
        </div>
      )}
      
      <div className="json-content">
        {isEditing ? (
          <div className="json-editor">
            {showPreview ? (
              // Show syntax highlighter (read-only preview)
              <div className="json-preview-mode">
                <SyntaxHighlighter 
                  language="json" 
                  style={vscDarkPlus}
                  wrapLines={true}
                  showLineNumbers={true}
                  customStyle={{
                    height: '500px',
                    margin: 0
                  }}
                >
                  {editableJson || '{}'}
                </SyntaxHighlighter>
                <div className="preview-overlay-message">
                  Preview mode - Click "Hide Highlighting" to edit
                </div>
              </div>
            ) : (
              // Show textarea for editing (DEFAULT)
              <textarea
                ref={textareaRef}
                value={editableJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                className={`json-textarea ${jsonError ? 'error' : ''}`}
                spellCheck="false"
                placeholder="Enter valid JSON..."
                autoFocus
              />
            )}
          </div>
        ) : (
          <SyntaxHighlighter 
            language="json" 
            style={vscDarkPlus}
            wrapLines={true}
            showLineNumbers={true}
          >
            {JSON.stringify(json, null, 2)}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
};

export default JSONViewer;