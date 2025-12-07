/**
 * Interface pour le service de gestion des avis
 */

export interface Review {
  id: number;
  boatId: number;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  userId?: number;
}

export interface CreateReviewInput {
  boatId: number;
  rating: number;
  comment: string;
  userName?: string;
  userAvatar?: string;
}

export interface IReviewService {
  /**
   * Récupérer tous les avis
   */
  getAllReviews(): Promise<Review[]>;

  /**
   * Récupérer les avis d'un bateau
   */
  getReviewsByBoatId(boatId: number): Promise<Review[]>;

  /**
   * Récupérer un avis par son ID
   */
  getReviewById(id: number): Promise<Review | null>;

  /**
   * Créer un nouvel avis
   */
  createReview(review: CreateReviewInput): Promise<Review>;

  /**
   * Supprimer un avis
   */
  deleteReview(id: number): Promise<boolean>;

  /**
   * Récupérer la moyenne des notes d'un bateau
   */
  getAverageRating(boatId: number): Promise<number>;

  /**
   * Récupérer les avis récents (tous bateaux)
   */
  getRecentReviews(limit?: number): Promise<Review[]>;
}
