// src/services/aiService.js
import config from '../config';

const API_URL = `${config.apiUrl}/schema-manager/ai`;

// Generate descriptions using AI
export const generateDescriptions = async (data) => {
  try {
    const response = await fetch(`${API_URL}/describe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to generate descriptions: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating descriptions:', error);
    throw error;
  }
};

// Generate examples using AI
export const generateExamples = async (data) => {
  try {
    const response = await fetch(`${API_URL}/examples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to generate examples: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating examples:', error);
    throw error;
  }
};

// Helper function that tries the API first, falls back to local generation if needed
export const generateDescriptionsWithFallback = async (data) => {
  try {
    // Try the API first
    return await generateDescriptions(data);
  } catch (error) {
    console.warn('API call failed, using fallback description generation', error);
    // Return empty descriptions so UI can show error state
    return { descriptions: [] };
  }
};