/**
 * Implémentation API du service Booking
 * Communique avec l'API .NET 8 pour les opérations sur les réservations
 */

import { IBookingService, Booking, CreateBookingDto, UpdateBookingDto, BookingFilters } from '../interfaces/IBookingService';
import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';

export class ApiBookingService implements IBookingService {
  private readonly endpoint = '/bookings';

  async getBookings(filters?: BookingFilters): Promise<Booking[]> {
    logApiOperation('bookings', 'getBookings', filters);
    
    // Construire les query params pour les filtres
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.renterId !== undefined) queryParams.append('renterId', filters.renterId.toString());
      if (filters.ownerId !== undefined) queryParams.append('ownerId', filters.ownerId.toString());
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
    }
    
    const query = queryParams.toString();
    const url = query ? `${this.endpoint}?${query}` : this.endpoint;
    
    const response = await apiClient.get<Booking[]>(url);
    
    if (response.error) {
      console.error('Error fetching bookings:', response.error);
      return [];
    }
    
    return response.data || [];
  }

  async getBookingById(id: string): Promise<Booking | null> {
    logApiOperation('bookings', 'getBookingById', { id });
    
    const response = await apiClient.get<Booking>(`${this.endpoint}/${id}`);
    
    if (response.error) {
      console.error(`Error fetching booking ${id}:`, response.error);
      return null;
    }
    
    return response.data || null;
  }

  async createBooking(booking: CreateBookingDto): Promise<Booking> {
    logApiOperation('bookings', 'createBooking', booking);
    
    const response = await apiClient.post<Booking>(this.endpoint, booking);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to create booking');
    }
    
    return response.data;
  }

  async updateBooking(booking: UpdateBookingDto): Promise<Booking> {
    logApiOperation('bookings', 'updateBooking', booking);
    
    const response = await apiClient.put<Booking>(`${this.endpoint}/${booking.id}`, booking);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update booking');
    }
    
    return response.data;
  }

  async cancelBooking(id: string): Promise<Booking> {
    logApiOperation('bookings', 'cancelBooking', { id });
    
    const response = await apiClient.patch<Booking>(`${this.endpoint}/${id}/cancel`, {});
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to cancel booking');
    }
    
    return response.data;
  }

  async getBookingsByRenter(renterId: number): Promise<Booking[]> {
    logApiOperation('bookings', 'getBookingsByRenter', { renterId });
    
    const response = await apiClient.get<Booking[]>(`${this.endpoint}/renter/${renterId}`);
    
    if (response.error) {
      console.error(`Error fetching bookings for renter ${renterId}:`, response.error);
      return [];
    }
    
    return response.data || [];
  }

  async getBookingsByOwner(ownerId: number): Promise<Booking[]> {
    logApiOperation('bookings', 'getBookingsByOwner', { ownerId });
    
    const response = await apiClient.get<Booking[]>(`${this.endpoint}/owner/${ownerId}`);
    
    if (response.error) {
      console.error(`Error fetching bookings for owner ${ownerId}:`, response.error);
      return [];
    }
    
    return response.data || [];
  }

  async downloadInvoice(id: string): Promise<{ blob?: Blob; contentType?: string | null; filename?: string | null; error?: string; status: number }> {
    logApiOperation('bookings', 'downloadInvoice', { id });
    // apiClient.download expects endpoint relative to baseUrl and handles auth
    try {
      const res = await apiClient.download(`${this.endpoint}/${id}/invoice`);
      return res;
    } catch (e: any) {
      return { error: e?.message || 'Unknown error', status: 500 };
    }
  }
}
