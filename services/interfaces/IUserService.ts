/**
 * Interface pour le service User
 */

export interface User {
  id: number;
  name: string;
  email: string;
  type: 'renter' | 'owner' | 'admin';
  avatar: string;
  phone: string;
  verified: boolean;
  documents: string[];
  memberSince: string;
  boatsCount?: number;
  totalRevenue?: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  type: 'renter' | 'owner';
  phone: string;
}

export interface UpdateUserDto {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface IUserService {
  /**
   * Récupère tous les utilisateurs
   */
  getUsers(): Promise<User[]>;
  
  /**
   * Récupère un utilisateur par son ID
   */
  getUserById(id: number): Promise<User | null>;
  
  /**
   * Récupère un utilisateur par son email
   */
  getUserByEmail(email: string): Promise<User | null>;
  
  /**
   * Crée un nouvel utilisateur
   */
  createUser(user: CreateUserDto): Promise<User>;
  
  /**
   * Met à jour un utilisateur
   */
  updateUser(user: UpdateUserDto): Promise<User>;
  
  /**
   * Supprime un utilisateur
   */
  deleteUser(id: number): Promise<boolean>;
  
  /**
   * Vérifie un utilisateur
   */
  verifyUser(id: number): Promise<User>;
}
