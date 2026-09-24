import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchSessionUser, submitLogout } from '@/lib/auth';
import { User, AuthContextType } from '@/lib/types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há sessão ativa no Django
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setUser(await fetchSessionUser());
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    submitLogout();
  };

  const value: AuthContextType = {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
