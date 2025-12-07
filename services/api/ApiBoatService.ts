/**
 * Implémentation API du service Boat
 * Communique avec l'API .NET 8 pour les opérations sur les bateaux
 */

import { IBoatService, Boat, BoatFilters, CreateBoatDto, UpdateBoatDto } from '../interfaces/IBoatService';
import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';

export class ApiBoatService implements IBoatService {
  private readonly endpoint = '/boats';

  // Static boat types used by UI where backend doesn't provide a dedicated endpoint
  static boatTypes = [
    { value: 'sailboat', label: 'Voilier' },
    { value: 'catamaran', label: 'Catamaran' },
    { value: 'motor', label: 'Bateau à moteur' },
    { value: 'semirigid', label: 'Semi-rigide' },
    { value: 'all', label: 'Tous les bateaux' }
  ];

  async getBoats(filters?: BoatFilters): Promise<Boat[]> {
    logApiOperation('boats', 'getBoats', filters);
    
    // Construire les query params pour les filtres
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.destination) queryParams.append('destination', filters.destination);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.priceMin !== undefined) queryParams.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax !== undefined) queryParams.append('priceMax', filters.priceMax.toString());
      if (filters.capacityMin !== undefined) queryParams.append('capacityMin', filters.capacityMin.toString());
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
    }
    
    const query = queryParams.toString();
    const url = query ? `${this.endpoint}?${query}` : this.endpoint;
    
    const response = await apiClient.get<Boat[]>(url);
    
    if (response.error) {
      console.error('Error fetching boats:', response.error);
      return [];
    }
    
    return response.data || [];
  }

  async getBoatById(id: number): Promise<Boat | null> {
    logApiOperation('boats', 'getBoatById', { id });
    
    const response = await apiClient.get<Boat>(`${this.endpoint}/${id}`);
    
    if (response.error) {
      console.error(`Error fetching boat ${id}:`, response.error);
      return null;
    }
    
    return response.data || null;
  }

  async createBoat(boat: CreateBoatDto): Promise<Boat> {
    logApiOperation('boats', 'createBoat', boat);
    
    const response = await apiClient.post<Boat>(this.endpoint, boat);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to create boat');
    }
    
    return response.data;
  }

  async updateBoat(boat: UpdateBoatDto): Promise<Boat> {
    logApiOperation('boats', 'updateBoat', boat);
    
    const response = await apiClient.put<Boat>(`${this.endpoint}/${boat.id}`, boat);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update boat');
    }
    
    return response.data;
  }

  async deleteBoat(id: number): Promise<boolean> {
    logApiOperation('boats', 'deleteBoat', { id });
    
    const response = await apiClient.delete(`${this.endpoint}/${id}`);
    
    if (response.error) {
      console.error(`Error deleting boat ${id}:`, response.error);
      return false;
    }
    
    return response.status === 200 || response.status === 204;
  }

  /**
   * Set a boat active/inactive via PATCH /boats/{id}/active?isActive={bool}
   */
  async setActive(id: number, isActive: boolean): Promise<boolean> {
    logApiOperation('boats', 'setActive', { id, isActive });
    const resp = await apiClient.patch(`${this.endpoint}/${id}/active?isActive=${encodeURIComponent(String(isActive))}`, {});
    if (resp.error) {
      console.error(`Error setting active ${id}:`, resp.error);
      return false;
    }
    return resp.status >= 200 && resp.status < 300;
  }

  /**
   * Set a boat verification flag via PATCH /boats/{id}/verify?isVerified={bool}
   */
  async setVerified(id: number, isVerified: boolean): Promise<boolean> {
    logApiOperation('boats', 'setVerified', { id, isVerified });
    const resp = await apiClient.patch(`${this.endpoint}/${id}/verify?isVerified=${encodeURIComponent(String(isVerified))}`, {});
    if (resp.error) {
      console.error(`Error setting verified ${id}:`, resp.error);
      return false;
    }
    return resp.status >= 200 && resp.status < 300;
  }

  async getBoatsByOwner(ownerId: number): Promise<Boat[]> {
    logApiOperation('boats', 'getBoatsByOwner', { ownerId });
    
    const response = await apiClient.get<Boat[]>(`${this.endpoint}/owner/${ownerId}`);
    
    if (response.error) {
      console.error(`Error fetching boats for owner ${ownerId}:`, response.error);
      return [];
    }
    
    return response.data || [];
  }
}
