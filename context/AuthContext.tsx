import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/ServiceFactory';
import { getUserRole, UserRole } from '../utils/getUserRole';

type UserType = UserRole | null;

interface AuthContextType {
  isLoggedIn: boolean;
  userType: UserType;
  isLoading: boolean;
  handleLogin: (type: UserType) => void;
  handleRegister: (type: 'renter' | 'owner') => void;
  handleAccountCreatedDuringBooking: () => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        if (!mounted) return;
        if (authenticated) {
          const user = await authService.getCurrentUser();
          if (!mounted) return;
          if (user) {
            setIsLoggedIn(true);
            const inferred = getUserRole(user);
            setUserType(inferred);
          }
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLogin = useCallback((type: UserType) => {
    setIsLoggedIn(true);
    setUserType(type);
  }, []);

  const handleRegister = useCallback((type: 'renter' | 'owner') => {
    setIsLoggedIn(true);
    setUserType(type);
  }, []);

  const handleAccountCreatedDuringBooking = useCallback(() => {
    setIsLoggedIn(true);
    setUserType('renter');
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUserType(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userType,
      isLoading,
      handleLogin,
      handleRegister,
      handleAccountCreatedDuringBooking,
      handleLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
