/**
 * Service API pour la gestion des avis
 * Communique avec l'API .NET 8 backend
 */

import { IReviewService, Review, CreateReviewInput } from '../interfaces/IReviewService';
import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';

export class ApiReviewService implements IReviewService {
  private readonly endpoint = '/reviews';

  /**
   * Récupérer tous les avis
   */
  async getAllReviews(): Promise<Review[]> {
    logApiOperation('reviews', 'getAllReviews');
    
    try {
      const response = await apiClient.get<Review[]>(this.endpoint);
      return response.data ?? [];
    } catch (error) {
      console.error('[API] Error fetching reviews:', error);
      throw error;
    }
  }

  /**
   * Récupérer les avis d'un bateau
   */
  async getReviewsByBoatId(boatId: number): Promise<Review[]> {
    logApiOperation('reviews', 'getReviewsByBoatId', { boatId });
    
    try {
      const response = await apiClient.get<Review[]>(`${this.endpoint}/boat/${boatId}`);
      return response.data ?? [];
    } catch (error) {
      console.error('[API] Error fetching boat reviews:', error);
      throw error;
    }
  }

  /**
   * Récupérer un avis par son ID
   */
  async getReviewById(id: number): Promise<Review | null> {
    logApiOperation('reviews', 'getReviewById', { id });
    
    try {
      const response = await apiClient.get<Review>(`${this.endpoint}/${id}`);
      return response.data ?? null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('[API] Error fetching review:', error);
      throw error;
    }
  }

  /**
   * Créer un nouvel avis
   */
  async createReview(input: CreateReviewInput): Promise<Review> {
    logApiOperation('reviews', 'createReview', input);
    
    try {
      const response = await apiClient.post<Review>(this.endpoint, input);
      if (!response.data) throw new Error(response.error || 'Empty response');
      return response.data;
    } catch (error) {
      console.error('[API] Error creating review:', error);
      throw error;
    }
  }

  /**
   * Supprimer un avis
   */
  async deleteReview(id: number): Promise<boolean> {
    logApiOperation('reviews', 'deleteReview', { id });
    
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      console.error('[API] Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Récupérer la moyenne des notes d'un bateau
   */
  async getAverageRating(boatId: number): Promise<number> {
    logApiOperation('reviews', 'getAverageRating', { boatId });
    
    try {
      const response = await apiClient.get<{ average: number }>(`${this.endpoint}/boat/${boatId}/average`);
      return response.data?.average ?? 0;
    } catch (error) {
      console.error('[API] Error fetching average rating:', error);
      throw error;
    }
  }

  /**
   * Récupérer les avis récents (tous bateaux)
   */
  async getRecentReviews(limit: number = 10): Promise<Review[]> {
    logApiOperation('reviews', 'getRecentReviews', { limit });
    
    try {
      const response = await apiClient.get<Review[]>(`${this.endpoint}/recent?limit=${limit}`);
      return response.data ?? [];
    } catch (error) {
      console.error('[API] Error fetching recent reviews:', error);
      throw error;
    }
  }
}
