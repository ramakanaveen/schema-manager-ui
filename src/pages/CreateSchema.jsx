// src/pages/CreateSchema.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createSchema, fetchGroups } from '../services/schemaService';
import AppHeader from '../components/layout/AppHeader';
import './CreateSchema.css';

const CreateSchema = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultGroupId = queryParams.get('groupId');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_id: defaultGroupId || '',
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load groups for the dropdown
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await fetchGroups();
        setGroups(response.groups || []);
        
        // If no group is selected yet and we have groups, select the first one
        if (!formData.group_id && response.groups && response.groups.length > 0) {
          setFormData(prev => ({
            ...prev,
            group_id: response.groups[0].id
          }));
        }
      } catch (err) {
        setError('Failed to load groups. ' + (err.message || ''));
      }
    };
    
    loadGroups();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Schema name is required');
      }
      
      if (!formData.group_id) {
        throw new Error('Please select a group');
      }

      // Create schema
      const response = await createSchema(formData);
      
      // Navigate to the new schema's detail page
      navigate(`/schema-manager/schema/${response.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create schema');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/schema-manager');
  };

  return (
    <div className="create-schema-page">
      <AppHeader title="Create Schema" />
      <div className="create-schema-content">
        <div className="form-container">
          <h1>Create New Schema</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Schema Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter schema name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a description for this schema"
                rows={4}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="group_id">Group*</label>
              <select
                id="group_id"
                name="group_id"
                value={formData.group_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Schema'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSchema;