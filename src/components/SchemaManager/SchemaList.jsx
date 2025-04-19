// src/components/SchemaManager/SchemaList.jsx
import React from 'react';
import { format } from 'date-fns';
import { 
  DatabaseIcon, 
  TableIcon, 
  TagIcon, 
  ClockIcon,
  CheckCircleIcon,
  PencilIcon
} from 'lucide-react';

const SchemaList = ({ schemas, onSchemaClick }) => {
  if (!schemas || schemas.length === 0) {
    return (
      <div className="empty-state">
        <DatabaseIcon size={48} />
        <h3>No Schemas Found</h3>
        <p>Create a new schema to get started</p>
      </div>
    );
  }
  
  return (
    <div className="schema-list">
      {schemas.map(schema => (
        <div 
          key={schema.id} 
          className="schema-card"
          onClick={() => onSchemaClick(schema)}
        >
          <div className="schema-header">
            <h3>{schema.name}</h3>
            {schema.status === 'active' && (
              <span className="status-badge active">
                <CheckCircleIcon size={14} />
                Active
              </span>
            )}
            {schema.status === 'draft' && (
              <span className="status-badge draft">
                <PencilIcon size={14} />
                Draft
              </span>
            )}
          </div>
          
          <p className="schema-description">{schema.description}</p>
          
          <div className="schema-meta">
            <div className="meta-item">
              <TableIcon size={14} />
              <span>{schema.table_count || 0} Tables</span>
            </div>
            <div className="meta-item">
              <TagIcon size={14} />
              <span>{schema.group_name}</span>
            </div>
            <div className="meta-item">
              <ClockIcon size={14} />
              <span>{formatDate(schema.updated_at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (e) {
    return dateString;
  }
};

export default SchemaList;