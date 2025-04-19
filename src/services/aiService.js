// src/services/aiService.js
import config from '../config';

const API_URL = `${config.apiUrl}/schema-manager/ai`;

// Generate descriptions using AI
export const generateDescriptions = async (data) => {
  const response = await fetch(`${API_URL}/describe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate descriptions');
  }
  
  return await response.json();
};

// Generate examples using AI
export const generateExamples = async (data) => {
  const response = await fetch(`${API_URL}/examples`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate examples');
  }
  
  return await response.json();
};