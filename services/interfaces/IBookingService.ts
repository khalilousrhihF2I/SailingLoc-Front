/**
 * Interface pour le service Booking
 */

export interface Booking {
  id: string;
  boatId: number;
  boatName: string;
  boatImage: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  serviceFee: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhoneNumber: string;
  renterId: number;
  renterName: string;
  renterEmail: string;
  renterPhoneNumber: string;
  createdAt?: string;
}

export interface CreateBookingDto {
  boatId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  serviceFee: number;
  renterId: number;
  renterName: string;
  renterEmail: string;
}

export interface UpdateBookingDto {
  id: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface BookingFilters {
  renterId?: number;
  ownerId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface IBookingService {
  /**
   * Récupère toutes les réservations avec filtres optionnels
   */
  getBookings(filters?: BookingFilters): Promise<Booking[]>;
  
  /**
   * Récupère une réservation par son ID
   */
  getBookingById(id: string): Promise<Booking | null>;
  
  /**
   * Crée une nouvelle réservation
   */
  createBooking(booking: CreateBookingDto): Promise<Booking>;
  
  /**
   * Met à jour une réservation
   */
  updateBooking(booking: UpdateBookingDto): Promise<Booking>;
  
  /**
   * Annule une réservation
   */
  cancelBooking(id: string): Promise<Booking>;
  
  /**
   * Récupère les réservations d'un locataire
   */
  getBookingsByRenter(renterId: number): Promise<Booking[]>;
  
  /**
   * Récupère les réservations pour les bateaux d'un propriétaire
   */
  getBookingsByOwner(ownerId: number): Promise<Booking[]>;

  /**
   * Télécharge la facture d'une réservation (blob + metadata)
   */
  downloadInvoice(id: string): Promise<{ blob?: Blob; contentType?: string | null; filename?: string | null; error?: string; status: number }>;
}
