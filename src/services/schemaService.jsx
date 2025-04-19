// src/services/schemaService.js
import config from '../config';

const API_URL = `${config.apiUrl}/schema-manager`;

// Fetch all schema groups
export const fetchGroups = async () => {
  const response = await fetch(`${API_URL}/groups`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch groups');
  }
  return await response.json();
};

// Create a new schema group
export const createGroup = async (data) => {
  const response = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create group');
  }
  
  return await response.json();
};

// Fetch schemas, optionally by group
export const fetchSchemas = async (groupId) => {
  const url = groupId ? `${API_URL}/schemas?group_id=${groupId}` : `${API_URL}/schemas`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch schemas');
  }
  
  return await response.json();
};

// Fetch a single schema
export const fetchSchema = async (schemaId) => {
  const response = await fetch(`${API_URL}/schemas/${schemaId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch schema');
  }
  
  return await response.json();
};

// Create a new schema
export const createSchema = async (data) => {
  const response = await fetch(`${API_URL}/schemas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create schema');
  }
  
  return await response.json();
};

// Fetch schema JSON
export const fetchSchemaJson = async (schemaId, versionId = null) => {
  const url = versionId 
    ? `${API_URL}/schemas/${schemaId}/json?version_id=${versionId}` 
    : `${API_URL}/schemas/${schemaId}/json`;
    
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch schema JSON');
  }
  
  return await response.json();
};

// Update schema JSON
export const updateSchemaJson = async (schemaId, schemaJson, createVersion = false, versionNotes = '') => {
  const response = await fetch(`${API_URL}/schemas/${schemaId}/json`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      schema_json: schemaJson,
      create_version: createVersion,
      version_notes: versionNotes
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update schema JSON');
  }
  
  return await response.json();
};

// Fetch schema versions
export const fetchSchemaVersions = async (schemaId) => {
  const response = await fetch(`${API_URL}/schemas/${schemaId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch schema versions');
  }
  
  return await response.json();
};

// Activate a schema version
export const activateSchemaVersion = async (schemaId, versionId) => {
  const response = await fetch(`${API_URL}/schemas/${schemaId}/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version_id: versionId
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to activate schema version');
  }
  
  return await response.json();
};