/**
 * Interface pour le service de gestion des destinations
 */

export interface Destination {
  id: number;
  name: string;
  country: string;
  boats: number;
  image: string;
  description: string;
  region?: string;
  averagePrice?: number;
  // API may return these as JSON strings or arrays
  popularMonths?: string[] | string;
  highlights?: string[] | string;
  boatCount?: number;
}

export interface IDestinationService {
  /**
   * Récupérer toutes les destinations
   */
  getAllDestinations(): Promise<Destination[]>;

  /**
   * Récupérer une destination par son ID
   */
  getDestinationById(id: number): Promise<Destination | null>;

  /**
   * Rechercher des destinations par critères
   */
  searchDestinations(query: string): Promise<Destination[]>;

  /**
   * Récupérer les destinations par région
   */
  getDestinationsByRegion(region: string): Promise<Destination[]>;

  /**
   * Récupérer les destinations populaires
   */
  getPopularDestinations(limit?: number): Promise<Destination[]>;
}
