export interface RenterStats {
  pending: number;
  confirmed: number;
  completed: number;
}

export interface RenterBookingSummary {
  id: string;
  boatId: number;
  boatName: string;
  boatImage: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  dailyPrice: number;
  subtotal: number;
  serviceFee: number;
  renterName: string;
  renterEmail: string;
  renterPhone?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentMethod?: string;
}

export interface RenterProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  memberSince: string; // ISO date
  avatar?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface RenterDocument {
  id: string;
  type: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface PaymentMethodSummary {
  id: string;
  type: string;
  label: string;
  expiration?: string;
  isDefault: boolean;
}

export interface IRenterDashboardService {
  getStats(): Promise<RenterStats>;
  getBookings(): Promise<RenterBookingSummary[]>;
  getProfile(): Promise<RenterProfile>;
  updateProfile(profile: Partial<RenterProfile>): Promise<RenterProfile>;
  getDocuments(): Promise<RenterDocument[]>;
  getPaymentMethods(): Promise<PaymentMethodSummary[]>;
}
