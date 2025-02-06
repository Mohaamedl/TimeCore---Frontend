import axios from 'axios';
import { api } from './authService';

const API_URL = 'http://localhost:8080/api/users';

export interface UserProfile {
  id: number;
  fullname: string;
  email: string;
  mobile: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  isVerified: boolean;
  twoFactorAuth: {
    isEnabled: boolean;
    sendTo: 'MOBILE' | 'EMAIL' | null;
  };
  picture: string | null;
  role: 'USER' | 'ADMIN';
}

export const getUserProfile = async (): Promise<UserProfile> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem('token');
    console.log(data);
    const response = await axios.put(`${API_URL}/profile`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(response);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to update profile';
    throw new Error(message);
  }
};

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await api.put('/api/users/profile/password', { 
      currentPassword, 
      newPassword 
    });
  } catch (error: any) {
    if (error.message === 'No authentication token found') {
      window.location.href = '/';
      throw new Error('Please login to continue');
    }
    throw error;
  }
};