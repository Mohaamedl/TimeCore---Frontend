import { CalendarEvent, useCalendarStore } from '@/store/CalendarStore';
import { AuthResponse, UserData } from '@/types/auth';
import axios from 'axios';

const API_URL = 'http://localhost:8080/auth';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      throw new Error('No authentication token found');
    }
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const register = async (userData: UserData): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      ...userData,
      role: 'USER',
      twoFactorAuth: {
        isEnabled: false,
        sendTo: "EMAIL"
      }
    });
    
    if (response.data.jwt) {
      localStorage.setItem('token', response.data.jwt);
    }
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw new Error('Network error');
  }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/signin`, { email, password });
    
    if (response.data.jwt) {
      localStorage.setItem('token', response.data.jwt);
      return response.data;
    }
    
    if (response.data.twoFactorAuthEnabled) {
      return {
        requiresTwoFactor: true,
        session: response.data.session,
        jwt: null,
        status: 'pending',
        message: 'Two-factor authentication required'
      };
    }

    throw new Error('Invalid response format');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const verifyTwoFactor = async (otp: string, session: string) => {
  try {
    const response = await axios.post(`${API_URL}/two-factor/otp/${otp}?id=${session}`);
    if (response.data.jwt) {
      localStorage.setItem('token', response.data.jwt);
      return response.data;
    }
    throw new Error('Invalid 2FA response');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Two-factor authentication failed');
  }
};

export const logout = (): void => {
 
  localStorage.setItem('calendar-storage', " ");
   localStorage.removeItem('token');
  useCalendarStore.getState().clearEvents();
  window.location.href = '/';
};
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    throw new Error('Authentication required');
  }

  await axios.put(
    `${API_URL}/password`, 
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` }}
  );
};

export const importEventsFromPDF = async (file: File): Promise<CalendarEvent[]> => {
  if (!file) {
    throw new Error('No file selected');
  }

  if (!file.type.includes('pdf')) {
    throw new Error('Please select a PDF file');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_URL}/import`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });

    if (!response.data) {
      throw new Error('No events found in PDF');
    }

    return response.data.map((event: any) => ({
      id: event.id?.toString() || Date.now().toString(),
      title: event.title || 'Untitled Event',
      description: event.description || '',
      start: new Date(event.startDate || event.start),
      end: new Date(event.endDate || event.end),
      isDraft: false
    }));

  } catch (error: any) {
    console.error('PDF Import Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      throw new Error('Authentication expired');
    }

    if (error.response?.data) {
      throw new Error(error.response.data);
    }

    throw new Error('Failed to import PDF file');
  }
};

export { api };
export type { UserData };

