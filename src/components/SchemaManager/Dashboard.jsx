// src/components/SchemaManager/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DatabaseIcon, 
  PlusIcon, 
  SearchIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  RotateCwIcon, // Replaced RefreshIcon with RotateCwIcon
  GridIcon,
  ListIcon,
  FilterIcon,
  FolderIcon
} from 'lucide-react';
import { fetchSchemas } from '../../services/schemaService';
import { format } from 'date-fns';
import './Dashboard.css';

const Dashboard = ({ groupId }) => {
  const navigate = useNavigate();
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Fetch schemas when groupId changes
  useEffect(() => {
    const loadSchemas = async () => {
      if (!groupId) {
        setSchemas([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetchSchemas(groupId);
        setSchemas(response.schemas || []);
      } catch (err) {
        setError(err.message || 'Failed to load schemas');
        console.error('Error loading schemas:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSchemas();
  }, [groupId]);
  
  // Handle creating a new schema
  const handleCreateSchema = () => {
    if (!groupId) {
      alert('Please select a group first');
      return;
    }
    navigate(`/schema-manager/create?groupId=${groupId}`);
  };
  
  // Filter schemas based on status and search query
  const filteredSchemas = schemas.filter(schema => {
    // Apply status filter
    if (statusFilter !== 'all' && schema.status !== statusFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        schema.name.toLowerCase().includes(query) ||
        (schema.description && schema.description.toLowerCase().includes(query)) ||
        (schema.group_name && schema.group_name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Handle clicking a schema card
  const handleSchemaClick = (schema) => {
    navigate(`/schema-manager/schema/${schema.id}`);
  };
  
  // Handle schema action buttons
  const handleViewJson = (e, schema) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/schema-manager/schema/${schema.id}?tab=json`);
  };
  
  const handleEditSchema = (e, schema) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/schema-manager/schema/${schema.id}`);
  };
  
  const handleDeleteSchema = async (e, schema) => {
    e.stopPropagation(); // Prevent card click
    
    if (window.confirm(`Are you sure you want to delete the schema "${schema.name}"?`)) {
      try {
        // Implement delete logic here
        // await deleteSchema(schema.id);
        
        // Update local state
        setSchemas(schemas.filter(s => s.id !== schema.id));
      } catch (err) {
        setError(err.message || 'Failed to delete schema');
        console.error('Error deleting schema:', err);
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Handle refresh schemas
  const handleRefresh = async () => {
    if (!groupId) return;
    
    setLoading(true);
    try {
      const response = await fetchSchemas(groupId);
      setSchemas(response.schemas || []);
    } catch (err) {
      setError(err.message || 'Failed to refresh schemas');
      console.error('Error refreshing schemas:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Schemas</h1>
        <div className="dashboard-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateSchema}
            disabled={!groupId}
          >
            <PlusIcon size={16} />
            <span>Create Schema</span>
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={loading || !groupId}
          >
            <RotateCwIcon size={16} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
      
      {!groupId ? (
        <div className="empty-state">
          <FolderIcon size={48} />
          <h3>No Group Selected</h3>
          <p>Please select a group from the sidebar to view schemas</p>
        </div>
      ) : (
        <>
          <div className="dashboard-filters">
            <div className="search-box">
              <SearchIcon size={18} />
              <input
                type="text"
                placeholder="Search schemas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-controls">
              <div className="status-filter">
                <label><FilterIcon size={16} /> Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>
              
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <GridIcon size={16} />
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          {loading && schemas.length === 0 ? (
            <div className="loading-state">
              <RotateCwIcon size={32} className="spin" />
              <p>Loading schemas...</p>
            </div>
          ) : filteredSchemas.length === 0 ? (
            <div className="empty-state">
              <DatabaseIcon size={48} />
              <h3>No Schemas Found</h3>
              <p>{searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create a new schema to get started'}</p>
              <button 
                className="btn btn-primary"
                onClick={handleCreateSchema}
              >
                <PlusIcon size={16} />
                <span>Create Schema</span>
              </button>
            </div>
          ) : (
            <div className={`schemas-container ${viewMode}`}>
              {filteredSchemas.map(schema => (
                <div 
                  key={schema.id}
                  className="schema-card"
                  onClick={() => handleSchemaClick(schema)}
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
                        <PencilIcon size={16} style={{ color: '#0277bd' }} />
                        Draft
                      </span>
                    )}
                    {schema.status === 'deprecated' && (
                      <span className="status-badge deprecated">
                        <ClockIcon size={14} />
                        Deprecated
                      </span>
                    )}
                  </div>
                  
                  <p className="schema-description">
                    {schema.description || 'No description provided'}
                  </p>
                  
                  <div className="schema-meta">
                    <div className="table-count">
                      <span>{schema.table_count || 0} Tables</span>
                    </div>
                    <div className="version-info">
                      <span>v{schema.version || '1.0'}</span>
                    </div>
                    <div className="updated-at">
                      <span>Updated: {formatDate(schema.updated_at)}</span>
                    </div>
                  </div>
                  
                  <div className="schema-actions" style={{ opacity: 1, backgroundColor: 'rgba(255,255,255,0.8)' }}>
                    <button 
                      className="action-btn edit"
                      onClick={(e) => handleEditSchema(e, schema)}
                      title="Edit Schema"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn view-json"
                      onClick={(e) => handleViewJson(e, schema)}
                      title="View JSON"
                    >
                       📄
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={(e) => handleDeleteSchema(e, schema)}
                      title="Delete Schema"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;