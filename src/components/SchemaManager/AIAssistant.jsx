// src/components/SchemaManager/AIAssistant.jsx (continued)
import React, { useState } from 'react';
import { generateDescriptions } from '../../services/aiService';
import { SparklesIcon, LoaderIcon } from 'lucide-react';

const AIAssistant = ({ type, name, tableName, onSelectDescription }) => {
 const [isGenerating, setIsGenerating] = useState(false);
 const [suggestions, setSuggestions] = useState([]);
 const [error, setError] = useState(null);
 const [showSuggestions, setShowSuggestions] = useState(false);
 
 const handleGenerate = async () => {
   setIsGenerating(true);
   setError(null);
   
   try {
     const data = await generateDescriptions({
       [type === 'column' ? 'column_name' : 'table_name']: name,
       ...(type === 'column' ? { table_name: tableName } : {}),
       count: 3
     });
     
     setSuggestions(data.descriptions);
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
       className="btn btn-sm btn-ai"
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
     
     {error && <div className="ai-error">{error}</div>}
     
     {showSuggestions && suggestions.length > 0 && (
       <div className="suggestions-dropdown">
         <div className="suggestions-header">
           <h4>AI Suggestions</h4>
           <button 
             className="close-button"
             onClick={() => setShowSuggestions(false)}
           >
             &times;
           </button>
         </div>
         <div className="suggestions-list">
           {suggestions.map((suggestion, index) => (
             <div 
               key={index}
               className="suggestion-item"
               onClick={() => handleSelectSuggestion(suggestion)}
             >
               {suggestion}
             </div>
           ))}
         </div>
       </div>
     )}
   </div>
 );
};

export default AIAssistant;