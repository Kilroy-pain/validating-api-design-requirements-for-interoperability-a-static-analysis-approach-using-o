const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default {
  getRules: async () => {
    const response = await fetch(`${API_BASE}/api/rules`);
    return response.json();
  },

  createRule: async (rule) => {
    const response = await fetch(`${API_BASE}/api/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    return response.json();
  },

  updateRule: async (id, rule) => {
    const response = await fetch(`${API_BASE}/api/rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    return response.json();
  },

  deleteRule: async (id) => {
    const response = await fetch(`${API_BASE}/api/rules/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  getReports: async () => {
    const response = await fetch(`${API_BASE}/api/reports`);
    return response.json();
  }
};