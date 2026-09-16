import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { User, AuthContextType } from '@/lib/types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há usuário autenticado no localStorage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('dashboard_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('dashboard_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Buscar usuário na tabela s_users
      const { data, error } = await supabase
        .from('s_users')
        .select('id, email, password_hash, created_at')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error('Usuário não encontrado ou inativo');
      }

      // Comparar senha com hash bcrypt
      const isPasswordValid = await bcrypt.compare(password, data.password_hash);
      if (!isPasswordValid) {
        throw new Error('Senha incorreta');
      }

      // Autenticação bem-sucedida
      const userData: User = {
        id: data.id,
        email: data.email,
        created_at: data.created_at,
      };

      setUser(userData);
      localStorage.setItem('dashboard_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('dashboard_user');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
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
