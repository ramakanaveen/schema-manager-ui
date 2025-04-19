// src/components/common/CodeEditor.jsx
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeEditor = ({ 
  value, 
  onChange, 
  language = 'javascript',
  height = '200px',
  readOnly = false,
  placeholder = ''
}) => {
  // If the component is read-only, just use the syntax highlighter
  if (readOnly) {
    return (
      <div className="code-editor readonly" style={{ height }}>
        <SyntaxHighlighter 
          language={language} 
          style={vscDarkPlus}
          wrapLines={true}
          showLineNumbers={true}
        >
          {value || placeholder || '// No code provided'}
        </SyntaxHighlighter>
      </div>
    );
  }
  
  // Otherwise, use a textarea with syntax highlighting
  return (
    <div className="code-editor" style={{ height }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck="false"
      />
      <SyntaxHighlighter 
        language={language} 
        style={vscDarkPlus}
        wrapLines={true}
        showLineNumbers={true}
      >
        {value || placeholder || ''}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeEditor;