export interface AuthResponse {
  jwt?: string | null;
  status: string;
  message: string;
  requiresTwoFactor?: boolean;
  session?: string;
  twoFactorAuthEnabled?: boolean;
}

export interface UserData {
  fullname: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
  twoFactorAuth?: {
    isEnabled: boolean;
    sendTo: 'MOBILE' | 'EMAIL' | null;
  };
}
