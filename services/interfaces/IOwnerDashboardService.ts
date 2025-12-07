export interface OwnerStats {
  boats: number;
  bookings: number;
  revenue: number;
  pendingBookings: number;
  occupancyRate: number;
}

export interface OwnerBoatSummary {
  id: number;
  name: string;
  image: string;
  location: string;
  price: number;
  reviews: number;
  isActive: boolean;
}

export interface OwnerBookingSummary {
  id: string;
  boatId: number;
  boatName: string;
  boatImage: string;
  renterName: string;
  renterEmail: string;
  renterPhone?: string;
  startDate: string;
  endDate: string;
  dailyPrice: number;
  totalPrice: number;
  subtotal: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
}

export interface OwnerRevenueSummary {
  totalRevenue: number;
  monthRevenue: number;
  upcomingPayments: number;
}

export interface OwnerAvailabilitySummary {
  boatId: number;
  periods: {
    start: string;
    end: string;
    type: 'blocked' | 'booking';
    reason?: string;
    referenceId?: string;
  }[];
}

export interface IOwnerDashboardService {
  getStats(): Promise<OwnerStats>;
  getBoats(): Promise<OwnerBoatSummary[]>;
  getBookings(): Promise<OwnerBookingSummary[]>;
  getRevenue(): Promise<OwnerRevenueSummary>;
  getAvailability(boatId: number): Promise<OwnerAvailabilitySummary>;
  updateAvailability(boatId: number, data: any): Promise<boolean>;
}
