import axios from 'axios';

const API_URL = 'http://localhost:9192/auth';
const BACKEND_URL = 'http://localhost:9192';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const handleApiError = (error) => {
  return error.response ? error.response.data : { message: 'An unexpected error occurred. Please try again.' };
};


apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(`${API_URL}/refresh`, {}, {
          withCredentials: true 
        });
        
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Cập nhật token cho tất cả các request tiếp theo
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        // Thực hiện lại request ban đầu với token mới
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (name, password) => {
  try {
    console.log('Login attempt:', { name, password }); 
    const response = await apiClient.post('/login', { name, password });
    
    if (response.data && response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Login error:', error.response || error); 
    throw error.response?.data || { message: 'Login failed. Please try again.' };
  }
};

export const register = async (userData) => {
  try {
    const response = await apiClient.post('/register', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const refreshToken = async () => {
  try {
    const response = await apiClient.post('/refresh');
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const handleGoogleLogin = () => {
  window.location.href = `${BACKEND_URL}/auth/google`;
};

export const logout = async () => {
  try {
    const response = await apiClient.post('/logout', {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    sessionStorage.clear();
    
    return response.data;
  } catch (error) {

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    throw handleApiError(error);
  }
};

export const checkAuthStatus = async () => {
  try {
    const response = await axios.post(`${API_URL}/refresh`, {}, {
      withCredentials: true
    });
    
    if (response.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export default apiClient;
