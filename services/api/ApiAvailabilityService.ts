/**
 * Implémentation API du service Availability
 */

import { IAvailabilityService, UnavailablePeriod, AvailabilityCheck, CreateAvailabilityDto, AddUnavailablePeriodDto } from '../interfaces/IAvailabilityService';
import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';

export class ApiAvailabilityService implements IAvailabilityService {
  private readonly endpoint = '/availability';

  async checkAvailability(
    boatId: number,
    startDate: string,
    endDate: string,
    excludeBookingId?: string
  ): Promise<AvailabilityCheck> {
    logApiOperation('availability', 'checkAvailability', { boatId, startDate, endDate });

    const params = new URLSearchParams({
      boatId: boatId.toString(),
      startDate,
      endDate
    });

    if (excludeBookingId) {
      params.append('excludeBookingId', excludeBookingId);
    }

    const response = await apiClient.get<AvailabilityCheck>(
      `${this.endpoint}/check?${params.toString()}`
    );

    if (response.error || !response.data) {
      return {
        isAvailable: false,
        message: response.error || 'Erreur lors de la vérification de disponibilité'
      };
    }

    return response.data;
  }

  async getUnavailableDates(
    boatId: number,
    startDate?: string,
    endDate?: string
  ): Promise<UnavailablePeriod[]> {
    logApiOperation('availability', 'getUnavailableDates', { boatId, startDate, endDate });

    const params = new URLSearchParams({
      boatId: boatId.toString()
    });

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get<UnavailablePeriod[]>(
      `${this.endpoint}/unavailable?${params.toString()}`
    );

    if (response.error) {
      console.error('Error fetching unavailable dates:', response.error);
      return [];
    }

    return response.data || [];
  }

  async getUnavailablePeriods(boatId: number): Promise<UnavailablePeriod[]> {
    // Alias pour getUnavailableDates pour compatibilité avec AvailabilityCalendar
    return this.getUnavailableDates(boatId);
  }

  async addUnavailablePeriod(boatId: number, period: AddUnavailablePeriodDto): Promise<UnavailablePeriod> {
    logApiOperation('availability', 'addUnavailablePeriod', { boatId, period });

    const response = await apiClient.post<UnavailablePeriod>(
      `${this.endpoint}/boats/${boatId}/unavailable`,
      period
    );

    if (response.error || !response.data) {
      throw new Error(response.error || 'Erreur lors de l\'ajout de la période indisponible');
    }

    return response.data;
  }

  async removeUnavailablePeriod(boatId: number, startDate: string): Promise<boolean> {
    logApiOperation('availability', 'removeUnavailablePeriod', { boatId, startDate });

    const response = await apiClient.delete(
      `${this.endpoint}/boats/${boatId}/unavailable/${startDate}`
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.status === 200 || response.status === 204;
  }

  async blockPeriod(availability: CreateAvailabilityDto): Promise<boolean> {
    logApiOperation('availability', 'blockPeriod', availability);

    const response = await apiClient.post<{ success: boolean }>(
      `${this.endpoint}/block`,
      availability
    );

    if (response.error) {
      console.error('Error blocking period:', response.error);
      return false;
    }

    return response.data?.success || false;
  }

  async unblockPeriod(availabilityId: number): Promise<boolean> {
    logApiOperation('availability', 'unblockPeriod', { availabilityId });

    const response = await apiClient.delete(
      `${this.endpoint}/${availabilityId}`
    );

    if (response.error) {
      console.error('Error unblocking period:', response.error);
      return false;
    }

    return response.status === 200 || response.status === 204;
  }
}
