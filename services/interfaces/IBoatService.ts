/**
 * Interface pour le service Boat
 * Définit le contrat que doivent respecter les implémentations mock et API
 */

export interface Boat {
  id: number;
  name: string;
  type: string;
  location: string;
  city: string;
  // API may return either destination name or id
  destination?: string;
  destinationId?: number;

  country: string;
  price: number;
  capacity: number;
  cabins: number;
  length: number;
  year: number;

  // primary image url (deprecated if you use `images` array)
  image?: string;

  // multiple images
  images?: {
    id: number;
    imageUrl: string;
    caption?: string;
    displayOrder?: number;
  }[];

  rating?: number;
  // numeric count of reviews
  reviewCount?: number;
  // legacy single-number reviews field (keep for compatibility)
  reviews?: number;

  // prefer array; some APIs return a JSON string that must be parsed
  equipment?: string[] | string;

  description?: string;

  // owner can be nested object (API) or ownerId/ownerName fields (legacy)
  ownerId?: number | string;
  ownerName?: string;
  ownerAvatar?: string;
  owner?: {
    id: string;
    name?: string;
    avatarUrl?: string;
  };

  // lifecycle flags
  isActive?: boolean;
  isVerified?: boolean;
  isDeleted?: boolean;

  // audit
  createdAt?: string;
  updatedAt?: string;

  // availabilities (owner-managed)
  availabilities?: {
    id: number;
    startDate: string;
    endDate: string;
    isAvailable: boolean;
    reason?: string;
  }[];

  // full review objects
  reviewsList?: {
    id: number;
    userId: string;
    userName: string;
    rating: number;
    comment?: string;
    createdAt?: string;
  }[];

  // documents / other metadata
  documents?: any[];
}

export interface BoatFilters {
  location?: string;
  destination?: string;
  type?: string;
  priceMin?: number;
  priceMax?: number;
  capacityMin?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateBoatDto {
  name: string;
  type: string;
  location: string;
  city: string;
  destination?: string;
  country: string;
  price: number;
  capacity: number;
  cabins: number;
  length: number;
  year: number;
  image: string;
  equipment: string[];
  description: string;
  ownerId: number;
}

export interface UpdateBoatDto extends Partial<CreateBoatDto> {
  id: number;
}

export interface IBoatService {
  /**
   * Récupère tous les bateaux avec filtres optionnels
   */
  getBoats(filters?: BoatFilters): Promise<Boat[]>;
  
  /**
   * Récupère un bateau par son ID
   */
  getBoatById(id: number): Promise<Boat | null>;
  
  /**
   * Crée un nouveau bateau
   */
  createBoat(boat: CreateBoatDto): Promise<Boat>;
  
  /**
   * Met à jour un bateau existant
   */
  updateBoat(boat: UpdateBoatDto): Promise<Boat>;
  
  /**
   * Supprime un bateau
   */
  deleteBoat(id: number): Promise<boolean>;
  
  /**
   * Récupère les bateaux d'un propriétaire
   */
  getBoatsByOwner(ownerId: number): Promise<Boat[]>;
}
