// API Interface Layer for Client-to-Backend Operations
const API = {
  // Public Endpoint Requests
  async getSettings() {
    try {
      const response = await fetch('/api/settings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { email: 'info@sgshrworkforce.com', linkedinUrl: '#', phone: '99405 43980' };
    }
  },

  async getJobs() {
    try {
      const response = await fetch('/api/jobs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  async getJobById(id) {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching job details for ${id}:`, error);
      return null;
    }
  },

  async getBlogs() {
    try {
      const response = await fetch('/api/blogs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return [];
    }
  },

  async getBlogById(id) {
    try {
      const response = await fetch(`/api/blogs/${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching blog detail for ${id}:`, error);
      return null;
    }
  },

  async submitContactForm(formData) {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return { msg: 'Server connectivity error. Please try again later.' };
    }
  },

  async registerCandidate(formData) {
    try {
      const response = await fetch('/api/candidates/register', {
        method: 'POST',
        body: formData // Note: Content-Type is auto-set by browser for FormData (multipart/form-data)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed');
      }
      return data;
    } catch (error) {
      console.error('Candidate registration failed:', error);
      throw error;
    }
  },

  // Auth Operations
  async adminLogin(username, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }
      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }
};
