export interface AuthResponse {
    jwt: string;
    status: boolean;
    message: string;
    isTwoFactorAuthEnabled: boolean;
    session?: string;
  }
  
  export interface UserData {
    fullname: string;
    email: string;
    password: string;
    role?: string;
    twoFactorAuth?: {
      is_enabled: boolean;
      send_to: string;
    };
  }