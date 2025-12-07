export interface CreateAdminDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  adress?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  role: string;
}

export interface UpdateAdminDto {
  firstName?: string;
  lastName?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface AssignRolesDto {
  roles: string[];
}

export interface AdminUserDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  createdAt?: string;
  emailConfirmed?: boolean;
}

export interface PaginatedResult<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, any> | null;
}

export interface IAdminUsersService {
  getUsers(page?: number, pageSize?: number, q?: string): Promise<PaginatedResult<AdminUserDto>>;
  getUserById(id: string): Promise<AdminUserDto | null>;
  createUser(dto: CreateAdminDto): Promise<AdminUserDto>;
  updateUser(id: string, dto: UpdateAdminDto): Promise<void>;
  deleteUser(id: string): Promise<void>;
  assignRoles(id: string, dto: AssignRolesDto): Promise<string[]>;
  getAuditLogs(page?: number, pageSize?: number): Promise<PaginatedResult<AuditLogEntry>>;
}

export default IAdminUsersService;
