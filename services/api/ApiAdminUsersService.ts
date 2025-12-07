import type { IAdminUsersService, AdminUserDto, CreateAdminDto, UpdateAdminDto, AssignRolesDto, PaginatedResult, AuditLogEntry } from '../interfaces/IAdminUsersService';
import { apiClient } from '../../lib/apiClient';

export class ApiAdminUsersService implements IAdminUsersService {
  private readonly endpoint = '/admin';

  async getUsers(page = 1, pageSize = 20, q?: string) {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('pageSize', String(pageSize));
    if (q) params.append('q', q);
    const query = params.toString();
    const url = `${this.endpoint}/users${query ? `?${query}` : ''}`;
    const res = await apiClient.get(url);
    return res.data as PaginatedResult<AdminUserDto>;
  }

  async getUserById(id: string) {
    const res = await apiClient.get(`${this.endpoint}/users/${id}`);
    return res.data as AdminUserDto;
  }

  async createUser(dto: CreateAdminDto) {
    const res = await apiClient.post(`${this.endpoint}/users`, dto);
    return res.data as AdminUserDto;
  }

  async updateUser(id: string, dto: UpdateAdminDto) {
    await apiClient.put(`${this.endpoint}/users/${id}`, dto);
  }

  async deleteUser(id: string) {
    await apiClient.delete(`${this.endpoint}/users/${id}`);
  }

  async assignRoles(id: string, dto: AssignRolesDto) {
    const res = await apiClient.post(`${this.endpoint}/users/${id}/roles`, dto);
    return res.data as string[];
  }

  async getAuditLogs(page = 1, pageSize = 50) {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('pageSize', String(pageSize));
    const url = `${this.endpoint}/audit-logs${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await apiClient.get(url);
    return res.data as PaginatedResult<AuditLogEntry>;
  }
}
