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

// Generate table schema from content (CSV or JSON)
export const generateTableSchema = async (data) => {
  try {
    const response = await fetch(`${API_URL}/generate-schema`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to generate table schema: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating table schema:', error);
    
    // If API fails, try client-side fallback for simple CSV parsing
    if (data.contentType === 'csv' && data.content) {
      try {
        return generateFallbackSchema(data);
      } catch (fallbackError) {
        console.error('Fallback schema generation failed:', fallbackError);
        throw error; // Throw the original error
      }
    }
    
    throw error;
  }
};

// Fallback method to generate basic schema from CSV when API is unavailable
const generateFallbackSchema = (data) => {
  const { tableName, description, content, contentType } = data;
  
  if (contentType !== 'csv') {
    throw new Error('Fallback only supports CSV format');
  }
  
  // Split content into lines
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error('Not enough data to generate schema');
  }
  
  // Extract header row and first data row
  const headerRow = lines[0].split(',').map(header => header.trim());
  const dataRow = lines[1].split(',').map(cell => cell.trim());
  
  // Generate columns based on header and data
  const columns = headerRow.map((header, index) => {
    const sampleValue = index < dataRow.length ? dataRow[index] : '';
    const type = inferColumnType(sampleValue);
    
    return {
      name: header.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
      type,
      description: `Column for ${header}`,
      required: false,
      key: index === 0 // Make first column the key for simplicity
    };
  });
  
  return {
    name: tableName,
    description: description || `Table generated from CSV data`,
    columns
  };
};

// Helper to infer column type from sample value
const inferColumnType = (value) => {
  if (!value) return 'symbol';
  
  // Check if it's a number
  if (!isNaN(value) && !isNaN(parseFloat(value))) {
    // Check if it's an integer
    if (parseInt(value) === parseFloat(value)) {
      return 'long';
    }
    return 'float';
  }
  
  // Check if it looks like a date
  const dateRegex = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/;
  if (dateRegex.test(value)) {
    return 'date';
  }
  
  // Check if it looks like a timestamp
  const timestampRegex = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}\s\d{1,2}:\d{1,2}(:\d{1,2})?$/;
  if (timestampRegex.test(value)) {
    return 'timestamp';
  }
  
  // Default to symbol for text
  return 'symbol';
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