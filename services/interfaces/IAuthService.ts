/**
 * Interface pour le service Auth
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'Renter' | 'Owner';
  phoneNumber: string;
  birthDate?: string; // ISO date
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  avatarBase64?: string | null;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  type: 'renter' | 'owner' | 'admin';
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | Date;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
  tokens?: TokenResponse;
  errors?: Array<{ code?: string; description?: string }>;
}

export interface IAuthService {
  /**
   * Authentifie un utilisateur
   */
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  
  /**
   * Enregistre un nouvel utilisateur
   */
  register(data: RegisterData): Promise<AuthResponse>;
  
  /**
   * Déconnecte l'utilisateur
   */
  logout(): Promise<void>;
  
  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): Promise<boolean>;
  
  /**
   * Récupère l'utilisateur actuellement connecté
   */
  getCurrentUser(): Promise<AuthResponse['user'] | null>;

  // Password reset flow
  requestPasswordResetCode(email: string): Promise<{ success: boolean; message?: string }>;
  verifyPasswordResetCode(email: string, code: string): Promise<{ success: boolean; resetToken?: string; message?: string }>;
  resetPassword(email: string, resetToken: string, newPassword: string): Promise<{ success: boolean; message?: string; errors?: Array<{ code?: string; description?: string }> }>;
}
