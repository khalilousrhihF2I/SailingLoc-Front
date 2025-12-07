import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';
import {
  IRenterDashboardService,
  RenterStats,
  RenterBookingSummary,
  RenterProfile,
  RenterDocument,
  PaymentMethodSummary,
} from '../interfaces/IRenterDashboardService';

export class ApiRenterDashboardService implements IRenterDashboardService {
  private readonly base = '/renter/dashboard';

  async getStats(): Promise<RenterStats> {
    logApiOperation('renter', 'getStats');
    const resp = await apiClient.get<RenterStats>(`${this.base}/stats`);
    if (resp.error) throw new Error(resp.error);
    return resp.data as RenterStats;
  }

  async getBookings(): Promise<RenterBookingSummary[]> {
    logApiOperation('renter', 'getBookings');
    const resp = await apiClient.get<RenterBookingSummary[]>(`${this.base}/bookings`);
    if (resp.error) throw new Error(resp.error);
    return resp.data || [];
  }

  async getProfile(): Promise<RenterProfile> {
    logApiOperation('renter', 'getProfile');
    const resp = await apiClient.get<RenterProfile>(`${this.base}/profile`);
    if (resp.error) throw new Error(resp.error);
    return resp.data as RenterProfile;
  }

  async updateProfile(profile: Partial<RenterProfile>): Promise<RenterProfile> {
    logApiOperation('renter', 'updateProfile', profile);
    const resp = await apiClient.put<RenterProfile>(`${this.base}/profile`, profile);
    if (resp.error) throw new Error(resp.error);
    return resp.data as RenterProfile;
  }

  async getDocuments(): Promise<RenterDocument[]> {
    logApiOperation('renter', 'getDocuments');
    const resp = await apiClient.get<RenterDocument[]>(`${this.base}/documents`);
    if (resp.error) throw new Error(resp.error);
    return resp.data || [];
  }

  async getPaymentMethods(): Promise<PaymentMethodSummary[]> {
    logApiOperation('renter', 'getPaymentMethods');
    const resp = await apiClient.get<PaymentMethodSummary[]>(`${this.base}/payments`);
    if (resp.error) throw new Error(resp.error);
    return resp.data || [];
  }
}
