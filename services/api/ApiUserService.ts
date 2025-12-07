/**
 * Implémentation API du service User
 * Communique avec l'API .NET 8 pour les opérations sur les utilisateurs
 */

import { IUserService, User, CreateUserDto, UpdateUserDto } from '../interfaces/IUserService';
import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';

export class ApiUserService implements IUserService {
  private readonly endpoint = '/user';

  async getUsers(): Promise<User[]> {
    logApiOperation('users', 'getUsers');
    
    const response = await apiClient.get<User[]>(this.endpoint);
    
    if (response.error) {
      console.error('Error fetching users:', response.error);
      return [];
    }
    
    return response.data || [];
  }

  async getUserById(id: number): Promise<User | null> {
    logApiOperation('users', 'getUserById', { id });
    
    const response = await apiClient.get<User>(`${this.endpoint}/${id}`);
    
    if (response.error) {
      console.error(`Error fetching user ${id}:`, response.error);
      return null;
    }
    
    return response.data || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    logApiOperation('users', 'getUserByEmail', { email });
    
    const response = await apiClient.get<User>(`${this.endpoint}/email/${encodeURIComponent(email)}`);
    
    if (response.error) {
      console.error(`Error fetching user by email ${email}:`, response.error);
      return null;
    }
    
    return response.data || null;
  }

  async createUser(user: CreateUserDto): Promise<User> {
    logApiOperation('users', 'createUser', { ...user, password: '***' });
    
    const response = await apiClient.post<User>(this.endpoint, user);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to create user');
    }
    
    return response.data;
  }

  async updateUser(user: UpdateUserDto): Promise<User> {
    logApiOperation('users', 'updateUser', user);
    
    const response = await apiClient.put<User>(`${this.endpoint}/${user.id}`, user);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update user');
    }
    
    return response.data;
  }

  async deleteUser(id: number): Promise<boolean> {
    logApiOperation('users', 'deleteUser', { id });
    
    const response = await apiClient.delete(`${this.endpoint}/${id}`);
    
    if (response.error) {
      console.error(`Error deleting user ${id}:`, response.error);
      return false;
    }
    
    return response.status === 200 || response.status === 204;
  }

  async verifyUser(id: number): Promise<User> {
    logApiOperation('users', 'verifyUser', { id });
    
    const response = await apiClient.patch<User>(`${this.endpoint}/${id}/verify`, {});
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to verify user');
    }
    
    return response.data;
  }
}
