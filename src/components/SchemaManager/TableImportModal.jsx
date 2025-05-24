// src/components/SchemaManager/TableImportModal.jsx
import React, { useState } from 'react';
import { X as XIcon, FileText, Table, LoaderIcon, AlertCircle } from 'lucide-react';
import './TableImportModal.css';
import { generateTableSchema } from '../../services/aiService';

const TableImportModal = ({ onClose, onImport }) => {
  const [step, setStep] = useState(1);
  const [tableName, setTableName] = useState('');
  const [tableDescription, setTableDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedSchema, setParsedSchema] = useState(null);
  const [contentType, setContentType] = useState('csv'); // 'csv' or 'json'

  // Handle text content change
  const handleTextContentChange = (e) => {
    setTextContent(e.target.value);
  };

  // Handle content type change
  const handleContentTypeChange = (type) => {
    setContentType(type);
  };

  // Process the pasted content using AI
  const handleProcessContent = async () => {
    if (!tableName.trim()) {
      setError("Table name is required");
      return;
    }

    if (!textContent.trim()) {
      setError("Content is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call AI service to process the content
      const result = await generateTableSchema({
        tableName,
        description: tableDescription,
        content: textContent,
        contentType
      });

      // Check if result is valid
      if (!result || !result.columns || result.columns.length === 0) {
        throw new Error("Failed to parse content structure");
      }

      setParsedSchema(result);
      setStep(2); // Move to review step
    } catch (err) {
      setError(err.message || "Failed to parse content");
      console.error("Error processing table content:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle import confirmation
  const handleConfirmImport = () => {
    // Create the final table object
    const newTable = {
      name: tableName,
      description: tableDescription || `Table generated from ${contentType} data`,
      kdb_table_name: tableName,
      columns: parsedSchema.columns.map(col => ({
        name: col.name,
        type: col.type,
        description: col.description || '',
        required: col.required || false,
        key: col.key || false
      })),
      examples: [] // Empty examples initially
    };

    // Call the parent component's onImport function
    onImport(newTable);
  };

  return (
    <div className="table-import-modal-overlay">
      <div className="table-import-modal">
        <div className="import-modal-header">
          <h2>{step === 1 ? 'Import Table Data' : 'Review Generated Table Schema'}</h2>
          <button className="btn-close" onClick={onClose}>
            <XIcon size={20} />
          </button>
        </div>

        {step === 1 && (
          <div className="import-modal-content">
            <div className="import-step-header">
              <h3>Step 1: Provide Table Information and Data</h3>
              <p>Paste your CSV or JSON content. We'll detect the structure automatically.</p>
            </div>

            <div className="import-form">
              <div className="form-group">
                <label htmlFor="tableName">Table Name*</label>
                <input
                  id="tableName"
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Enter table name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tableDescription">Description</label>
                <textarea
                  id="tableDescription"
                  value={tableDescription}
                  onChange={(e) => setTableDescription(e.target.value)}
                  placeholder="Enter table description"
                  rows={2}
                />
              </div>

              <div className="content-type-selector">
                <div className="form-group-label">Content Type</div>
                <div className="content-type-options">
                  <button
                    className={`content-type-btn ${contentType === 'csv' ? 'active' : ''}`}
                    onClick={() => handleContentTypeChange('csv')}
                  >
                    <FileText size={16} />
                    <span>CSV / Tabular Text</span>
                  </button>
                  <button
                    className={`content-type-btn ${contentType === 'json' ? 'active' : ''}`}
                    onClick={() => handleContentTypeChange('json')}
                  >
                    <Table size={16} />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contentInput">Paste {contentType.toUpperCase()} Content*</label>
                <textarea
                  id="contentInput"
                  className="content-input"
                  value={textContent}
                  onChange={handleTextContentChange}
                  placeholder={
                    contentType === 'csv'
                      ? 'Paste CSV content or tab-separated values...\ne.g., id,name,age,city\n1,John,30,New York\n2,Jane,25,Boston'
                      : 'Paste JSON content...\ne.g., [{"id": 1, "name": "John", "age": 30}, {"id": 2, "name": "Jane", "age": 25}]'
                  }
                  rows={10}
                  required
                />
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="import-form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleProcessContent}
                  disabled={loading || !tableName.trim() || !textContent.trim()}
                >
                  {loading ? (
                    <>
                      <LoaderIcon size={16} className="spinner" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Analyze & Continue</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && parsedSchema && (
          <div className="import-modal-content">
            <div className="import-step-header">
              <h3>Step 2: Review Generated Table Schema</h3>
              <p>We've analyzed your data and generated the following schema. Review and confirm.</p>
            </div>

            <div className="schema-preview">
              <div className="schema-preview-header">
                <div className="preview-table-name">
                  <strong>Table:</strong> {tableName}
                </div>
                <div className="preview-column-count">
                  <strong>Columns:</strong> {parsedSchema.columns.length}
                </div>
              </div>

              <div className="schema-preview-columns">
                <div className="preview-columns-header">
                  <div className="preview-column-name">Name</div>
                  <div className="preview-column-type">Type</div>
                  <div className="preview-column-description">Description</div>
                  <div className="preview-column-options">Options</div>
                </div>

                <div className="preview-columns-body">
                  {parsedSchema.columns.map((column, index) => (
                    <div key={index} className="preview-column-row">
                      <div className="preview-column-name">{column.name}</div>
                      <div className="preview-column-type">{column.type}</div>
                      <div className="preview-column-description">{column.description || '-'}</div>
                      <div className="preview-column-options">
                        {column.required && <span className="option-badge">Required</span>}
                        {column.key && <span className="option-badge key">Key</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="preview-notes">
                <p>
                  <strong>Note:</strong> This is a draft schema. You can further edit the columns after import.
                </p>
              </div>
            </div>

            <div className="import-form-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn btn-primary" onClick={handleConfirmImport}>
                Confirm & Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableImportModal;