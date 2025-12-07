import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';
import {
  IOwnerDashboardService,
  OwnerStats,
  OwnerBoatSummary,
  OwnerBookingSummary,
  OwnerRevenueSummary,
  OwnerAvailabilitySummary,
} from '../interfaces/IOwnerDashboardService';
import { RenterProfile } from '../interfaces/IRenterDashboardService';

export class ApiOwnerDashboardService implements IOwnerDashboardService {
  private readonly base = '/owner/dashboard';

  async getStats(): Promise<OwnerStats> {
    logApiOperation('owner', 'getStats');
    const resp = await apiClient.get<OwnerStats>(`${this.base}/stats`);
    if (resp.error) throw new Error(resp.error);
    return resp.data as OwnerStats;
  }

  async getBoats(): Promise<OwnerBoatSummary[]> {
    logApiOperation('owner', 'getBoats');
    const resp = await apiClient.get<OwnerBoatSummary[]>(`${this.base}/boats`);
    if (resp.error) throw new Error(resp.error);
    return resp.data || [];
  }

  async getBookings(): Promise<OwnerBookingSummary[]> {
    logApiOperation('owner', 'getBookings');
    const resp = await apiClient.get<OwnerBookingSummary[]>(`${this.base}/bookings`);
    if (resp.error) throw new Error(resp.error);
    return resp.data || [];
  }

  async getRevenue(): Promise<OwnerRevenueSummary> {
    logApiOperation('owner', 'getRevenue');
    const resp = await apiClient.get<OwnerRevenueSummary>(`${this.base}/revenue`);
    if (resp.error) throw new Error(resp.error);
    return resp.data as OwnerRevenueSummary;
  }

  async getAvailability(boatId: number): Promise<OwnerAvailabilitySummary> {
    logApiOperation('owner', 'getAvailability', { boatId });
    const resp = await apiClient.get<OwnerAvailabilitySummary>(`${this.base}/availability/${boatId}`);
    if (resp.error) throw new Error(resp.error);
    return resp.data as OwnerAvailabilitySummary;
  }

    async getProfile(): Promise<RenterProfile> {
      logApiOperation('owner', 'getProfile');
      const resp = await apiClient.get<RenterProfile>(`${this.base}/profile`);
      if (resp.error) throw new Error(resp.error);
      return resp.data as RenterProfile;
    }
  
    async updateProfile(profile: Partial<RenterProfile>): Promise<RenterProfile> {
      logApiOperation('owner', 'updateProfile', profile);
      const resp = await apiClient.put<RenterProfile>(`${this.base}/profile`, profile);
      if (resp.error) throw new Error(resp.error);
      return resp.data as RenterProfile;
    }

  async updateAvailability(boatId: number, data: any): Promise<boolean> {
    logApiOperation('owner', 'updateAvailability', { boatId, data });
    const resp = await apiClient.post(`${this.base}/availability/${boatId}`, data);
    if (resp.error) throw new Error(resp.error);
    return resp.status >= 200 && resp.status < 300;
  }
}
