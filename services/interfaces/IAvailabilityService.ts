/**
 * Interface pour le service de gestion des disponibilités
 */

export interface UnavailablePeriod {
  type: 'booking' | 'blocked';
  referenceId?: string;
  startDate: string;
  endDate: string;
  reason?: string;
  details?: string;
}

export interface AvailabilityCheck {
  isAvailable: boolean;
  message: string;
}

export interface CreateAvailabilityDto {
  boatId: number;
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  reason?: string;
}

export interface AddUnavailablePeriodDto {
  startDate: string;
  endDate: string;
  type: 'blocked';
  reason?: string;
}

export interface IAvailabilityService {
  /**
   * Vérifie si un bateau est disponible sur une période
   */
  checkAvailability(
    boatId: number,
    startDate: string,
    endDate: string,
    excludeBookingId?: string
  ): Promise<AvailabilityCheck>;

  /**
   * Récupère toutes les périodes indisponibles d'un bateau
   */
  getUnavailableDates(
    boatId: number,
    startDate?: string,
    endDate?: string
  ): Promise<UnavailablePeriod[]>;

  /**
   * Récupère toutes les périodes indisponibles (alias pour compatibilité)
   */
  getUnavailablePeriods(boatId: number): Promise<UnavailablePeriod[]>;

  /**
   * Ajoute une période indisponible
   */
  addUnavailablePeriod(boatId: number, period: AddUnavailablePeriodDto): Promise<UnavailablePeriod>;

  /**
   * Supprime une période indisponible
   */
  removeUnavailablePeriod(boatId: number, startDate: string): Promise<boolean>;

  /**
   * Bloque une période pour un bateau (maintenance, etc.)
   */
  blockPeriod(availability: CreateAvailabilityDto): Promise<boolean>;

  /**
   * Débloque une période
   */
  unblockPeriod(availabilityId: number): Promise<boolean>;
}
