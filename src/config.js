const config = {
    // API Configuration
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
    apiPrefix: '/api/v1',
    
    // Get the full API URL
    get apiUrl() {
      return `${this.apiBaseUrl}${this.apiPrefix}`;
    }
  };
  
  export default config;