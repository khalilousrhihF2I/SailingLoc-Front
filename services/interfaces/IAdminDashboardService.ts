export interface AdminStats {
  totalUsers: number;
  totalBoats: number;
  totalBookings: number;
  totalRevenue: number;
  pendingVerifications: number;
  pendingDocuments: number;
  disputes: number;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  type: 'renter' | 'owner' | 'admin';
  verified: boolean;
  avatar: string | null;
}

export interface AdminBoatSummary {
  id: number;
  name: string;
  ownerName: string;
  ownerId: string;
  image: string;
  location: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface AdminBookingSummary {
  id: string;
  boatName: string;
  renterName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
}

export interface AdminActivity {
  type: string;
  message: string;
  date: string;
}

export interface AdminPaymentsStats {
  paid: number;
  pending: number;
  platformFee: number;
}

export interface IAdminDashboardService {
  getStats(): Promise<AdminStats>;
  getUsers(): Promise<AdminUserSummary[]>;
  getBoats(): Promise<AdminBoatSummary[]>;
  getBookings(): Promise<AdminBookingSummary[]>;
  getActivity(): Promise<AdminActivity[]>;
  getPaymentStats(): Promise<AdminPaymentsStats>;
}
