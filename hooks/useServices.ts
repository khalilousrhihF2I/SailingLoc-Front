/**
 * Hooks React pour utiliser les services dans les composants
 * 
 * Ces hooks facilitent l'accès aux services et la gestion des états de chargement
 */

import { useState, useEffect } from 'react';
import { boatService, userService, bookingService, authService } from '../services/ServiceFactory';
import { Boat, BoatFilters } from '../services/interfaces/IBoatService';
import { User } from '../services/interfaces/IUserService';
import { Booking, BookingFilters } from '../services/interfaces/IBookingService';

/**
 * Hook pour charger des bateaux avec filtres
 */
export function useBoats(filters?: BoatFilters) {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBoats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await boatService.getBoats(filters);
        setBoats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load boats');
      } finally {
        setLoading(false);
      }
    };

    loadBoats();
  }, [filters]);

  return { boats, loading, error, refetch: () => boatService.getBoats(filters) };
}

/**
 * Hook pour charger un bateau par ID
 */
export function useBoat(id: number) {
  const [boat, setBoat] = useState<Boat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBoat = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await boatService.getBoatById(id);
        setBoat(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load boat');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBoat();
    }
  }, [id]);

  return { boat, loading, error };
}

/**
 * Hook pour charger les réservations avec filtres
 */
export function useBookings(filters?: BookingFilters) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.getBookings(filters);
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [filters]);

  return { bookings, loading, error, refetch: () => bookingService.getBookings(filters) };
}

/**
 * Hook pour charger un utilisateur par ID
 */
export function useUser(id: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUserById(id);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadUser();
    }
  }, [id]);

  return { user, loading, error };
}

/**
 * Hook pour gérer l'authentification
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If a token exists in localStorage, try to rehydrate the current user first.
        const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('sailingloc_auth_token') : null;
        if (token) {
          const user = await authService.getCurrentUser();
          if (user) {
            setIsAuthenticated(true);
            setCurrentUser(user);
            setLoading(false);
            return;
          }
        }

        // Fallback: call isAuthenticated which may validate/refresh the token
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.success) {
      setIsAuthenticated(true);
      setCurrentUser(response.user);
    }
    return response;
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    if (response.success) {
      setIsAuthenticated(true);
      setCurrentUser(response.user);
    }
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return {
    isAuthenticated,
    currentUser,
    loading,
    login,
    register,
    logout,
  };
}

/**
 * Hook pour gérer les disponibilités d'un bateau
 */
export function useAvailability(boatId: number) {
  const [unavailablePeriods, setUnavailablePeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        setError(null);
        const { availabilityService } = await import('../services/ServiceFactory');
        const periods = await availabilityService.getUnavailableDates(boatId);
        setUnavailablePeriods(periods);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load availability');
      } finally {
        setLoading(false);
      }
    };

    if (boatId) {
      loadAvailability();
    }
  }, [boatId]);

  const checkAvailability = async (startDate: string, endDate: string) => {
    const { availabilityService } = await import('../services/ServiceFactory');
    return availabilityService.checkAvailability(boatId, startDate, endDate);
  };

  return { unavailablePeriods, loading, error, checkAvailability };
}

/**
 * Export des services pour utilisation directe dans les composants
 */
export {
  boatService,
  userService,
  bookingService,
  authService,
};
