/**
 * Service API pour la gestion des destinations
 * Communique avec l'API .NET 8 backend
 */

import { IDestinationService, Destination } from '../interfaces/IDestinationService';
import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';

export class ApiDestinationService implements IDestinationService {
  private readonly endpoint = '/destinations';

  /**
   * Récupérer toutes les destinations
   */
  async getAllDestinations(): Promise<Destination[]> {
    logApiOperation('destinations', 'getAllDestinations');
    
    try {
      const response = await apiClient.get<Destination[]>(this.endpoint);
      return response.data ?? [];
    } catch (error) {
      console.error('[API] Error fetching destinations:', error);
      throw error;
    }
  }

  /**
   * Récupérer une destination par son ID
   */
  async getDestinationById(id: number): Promise<Destination | null> {
    logApiOperation('destinations', 'getDestinationById', { id });
    
    try {
      const response = await apiClient.get<Destination>(`${this.endpoint}/${id}`);
      return response.data ?? null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('[API] Error fetching destination:', error);
      throw error;
    }
  }

  /**
   * Rechercher des destinations par critères
   */
  async searchDestinations(query: string): Promise<Destination[]> {
    logApiOperation('destinations', 'searchDestinations', { query });
    
    try {
      const response = await apiClient.get<Destination[]>(`${this.endpoint}/search?query=${encodeURIComponent(query)}`);
      return response.data ?? [];
    } catch (error) {
      console.error('[API] Error searching destinations:', error);
      throw error;
    }
  }

  /**
   * Récupérer les destinations par région
   */
  async getDestinationsByRegion(region: string): Promise<Destination[]> {
    logApiOperation('destinations', 'getDestinationsByRegion', { region });
    
    try {
      const response = await apiClient.get<Destination[]>(`${this.endpoint}/region/${encodeURIComponent(region)}`);
      return response.data ?? [];
    } catch (error) {
      console.error('[API] Error fetching destinations by region:', error);
      throw error;
    }
  }

  /**
   * Récupérer les destinations populaires
   */
  async getPopularDestinations(limit: number = 4): Promise<Destination[]> {
    logApiOperation('destinations', 'getPopularDestinations', { limit });
    
    try {
      const response = await apiClient.get<Destination[]>(`${this.endpoint}/popular?limit=${limit}`);
      return response.data ?? [];
    } catch (error) {
      console.error('[API] Error fetching popular destinations:', error);
      throw error;
    }
  }
}
