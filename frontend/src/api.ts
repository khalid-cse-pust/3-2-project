const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
}

export const api = {
  get: async (endpoint: string, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      const err: any = new Error(errorData.message || 'Something went wrong');
      err.status = response.status;
      err.data = errorData;
      throw err;
    }
    return response.json();
  },

  post: async (endpoint: string, data: any, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      const err: any = new Error(errorData.message || 'Something went wrong');
      err.status = response.status;
      err.data = errorData;
      throw err;
    }
    return response.json();
  },

  put: async (endpoint: string, data: any, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      const err: any = new Error(errorData.message || 'Something went wrong');
      err.status = response.status;
      err.data = errorData;
      throw err;
    }
    return response.json();
  },

  delete: async (endpoint: string, token?: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      const err: any = new Error(errorData.message || 'Something went wrong');
      err.status = response.status;
      err.data = errorData;
      throw err;
    }
    return response.json();
  },
};

