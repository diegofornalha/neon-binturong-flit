"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  name?: string;
  role: string;
  organizationId: number;
}

interface Organization {
  id: number;
  name: string;
  slug: string;
  plan: string;
  limits: {
    maxClients: number;
    maxAdAccounts: number;
    maxUsers: number;
  };
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Carrega sessão do usuário
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setOrganization(data.organization);
      }
    } catch (error) {
      console.error('[Auth] Erro ao carregar sessão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Login failed');
    }

    setUser(data.user);
    setOrganization(data.organization);
    
    router.push('/dashboard');
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setOrganization(null);
    router.push('/login');
  };

  const switchOrganization = async (orgId: number) => {
    const response = await fetch('/api/auth/switch-organization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId: orgId })
    });

    const data = await response.json();
    
    if (data.success) {
      setOrganization(data.organization);
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      isLoading,
      login,
      logout,
      switchOrganization
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}