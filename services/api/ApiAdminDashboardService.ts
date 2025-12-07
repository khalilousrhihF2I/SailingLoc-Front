import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';
import {
  IAdminDashboardService,
  AdminStats,
  AdminUserSummary,
  AdminBoatSummary,
  AdminBookingSummary,
  AdminActivity,
  AdminPaymentsStats,
} from '../interfaces/IAdminDashboardService';

export class ApiAdminDashboardService implements IAdminDashboardService {
  private readonly base = '/admin/dashboard';

  async getStats(): Promise<AdminStats> {
    logApiOperation('admin', 'getStats');
    const resp = await apiClient.get<AdminStats>(`${this.base}/stats`);
    if (resp.error) throw new Error(resp.error);
    return resp.data as AdminStats;
  }

  async getUsers(): Promise<AdminUserSummary[]> {
    logApiOperation('admin', 'getUsers');
    const resp = await apiClient.get<AdminUserSummary[]>(`${this.base}/users`);
    if (resp.error) throw new Error(resp.error);
    return resp.data || [];
  }

  async getBoats(): Promise<AdminBoatSummary[]> {
    logApiOperation('admin', 'getBoats');
    const resp = await apiClient.get<AdminBoatSummary[]>(`${this.base}/boats`);
    if (resp.error) throw new Error(resp.error);
    return resp.data || [];
  }

  async getBookings(): Promise<AdminBookingSummary[]> {
    logApiOperation('admin', 'getBookings');
    const resp = await apiClient.get<AdminBookingSummary[]>(`${this.base}/bookings`);
    if (resp.error) throw new Error(resp.error);
    return resp.data || [];
  }

  async getActivity(): Promise<AdminActivity[]> {
    logApiOperation('admin', 'getActivity');
    const resp = await apiClient.get<AdminActivity[]>(`${this.base}/activity`);
    if (resp.error) throw new Error(resp.error);
    return resp.data || [];
  }

  async getPaymentStats(): Promise<AdminPaymentsStats> {
    logApiOperation('admin', 'getPaymentStats');
    const resp = await apiClient.get<AdminPaymentsStats>(`${this.base}/payments`);
    if (resp.error) throw new Error(resp.error);
    return resp.data as AdminPaymentsStats;
  }
}
