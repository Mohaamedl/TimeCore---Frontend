import axios from 'axios';
import { AuthResponse, UserData } from '@/types/auth';

const API_URL = 'http://localhost:8080/auth';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/signin`, { email, password });
  return response.data;
};

export const register = async (userData: UserData): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/signup`, userData);
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('token');
};

export type { UserData };
