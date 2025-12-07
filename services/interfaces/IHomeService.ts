import { HomeResponse, TopBoatType, PopularBoat } from './home.models';
export interface TopBoatType {
  id: string;
  name: string;
  icon?: string;
  count: number;
}

export interface PopularBoat {
  id: number;
  name: string;
  type: string;
  location: string;
  city: string;
  destinationId?: number | null;
  country: string;
  price: number;
  capacity: number;
  cabins: number;
  length: number;
  year: number;
  image?: string | null;
  rating: number;
  reviewCount: number;
  equipment?: string | null;
  description?: string | null;
  ownerId: string;
  ownerName?: string | null;
  ownerAvatar?: string | null;
  isActive: boolean;
  isVerified: boolean;
}

export interface HomeResponse {
  topBoatTypes: TopBoatType[];
  popularBoats: PopularBoat[];
  popularDestinations: { id: number; name: string; image?: string; boats?: number }[];
}

export interface IHomeService {
  /**
   * Retourne les données nécessaires pour la page d'accueil
   */
  getHome(): Promise<HomeResponse>;

  /**
   * Optionnel helpers
   */
  getTopBoatTypes?(): Promise<TopBoatType[]>;
  getPopularBoats?(): Promise<PopularBoat[]>;
}
