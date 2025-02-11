import axios from 'axios';
import { api } from './authService';

const API_URL = 'http://localhost:8080/api/users';

export interface TwoFactorAuth {
  id?: any;
  enabled: boolean;  
  send_to: 'MOBILE' | 'EMAIL' | null;  
}

export interface UserProfile {
  id: number;
  fullname: string;
  email: string;
  mobile: string ;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  isVerified: boolean;
  twoFactorAuth: TwoFactorAuth;
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
    const currentProfile = await getUserProfile();

    const updatedProfile = {
      ...currentProfile,
      fullname: data.fullname ?? currentProfile.fullname,
      mobile: data.mobile !== undefined 
        ? (data.mobile ? data.mobile.replace(/\D/g, '') : null)
        : currentProfile.mobile,
      twoFactorAuth: {
        ...currentProfile.twoFactorAuth,
        enabled: data.twoFactorAuth?.enabled ?? currentProfile.twoFactorAuth.enabled, 
        send_to: data.twoFactorAuth?.enabled === false ? null : data.twoFactorAuth?.send_to ?? currentProfile.twoFactorAuth.send_to  
      }
    };

    const response = await axios.put(
      `${API_URL}/profile`,
      updatedProfile,
      { headers: { Authorization: `Bearer ${token}` }}
    );

    return response.data;
  } catch (error: any) {
    console.error('Profile update error:', error);
    throw new Error(error.response?.data?.message || 'Failed to update profile');
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

export type VerificationType = 'EMAIL' | 'MOBILE';

export const sendVerificationOtp = async (verificationType: VerificationType): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await axios.post(
      `${API_URL}/verification/${verificationType}/send-otp`,
      {},
      { headers: { Authorization: `Bearer ${token}` }}
    );
  } catch (error: any) {
    throw new Error(error.response?.data || 'Falha ao enviar o código de verificação');
  }
};

export const verifyAndEnableTwoFactor = async (otp: string): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(
      `${API_URL}/enable-two-factor/verify-otp/${otp}`,
      {},
      { headers: { Authorization: `Bearer ${token}` }}
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data || 'Falha ao verificar OTP');
  }
};


export const updateTwoFactorStatus = async (enabled: boolean, sendTo?: 'EMAIL' | 'MOBILE' | null): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem('token');
    const currentProfile = await getUserProfile();
    
    const updatedProfile = {
      ...currentProfile,
      twoFactorAuth: {
        ...currentProfile.twoFactorAuth,
        enabled: enabled,  
        send_to: enabled ? (sendTo || currentProfile.twoFactorAuth.send_to) : null  
      }
    };

    const response = await axios.put(
      `${API_URL}/profile`,
      updatedProfile,
      { headers: { Authorization: `Bearer ${token}` }}
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Falha ao atualizar o status 2FA');
  }
};