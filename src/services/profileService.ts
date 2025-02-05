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
    // Format mobile number if present
    const formattedData = {
      ...data,
      mobile: data.mobile ? data.mobile.replace(/\D/g, '') : null // Remove non-digits
    };
    
    const response = await axios.put(`${API_URL}/profile`, formattedData, {
      headers: { Authorization: `Bearer ${token}` }
    });
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