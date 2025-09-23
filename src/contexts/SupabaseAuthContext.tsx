import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, full_name: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar perfil do usuário
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  // Criar perfil automaticamente após signup
  const createProfile = async (user: User, full_name: string) => {
    try {
      const profileData: Omit<Profile, 'created_at' | 'updated_at'> = {
        id: user.id,
        email: user.email!,
        full_name,
        role: 'user',
        points: 0,
        level: 1
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      return null;
    }
  };

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Função de cadastro
  const signUp = async (email: string, password: string, full_name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name
          }
        }
      });

      // Se o usuário foi criado, criar perfil
      if (data.user && !error) {
        await createProfile(data.user, full_name);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Função de logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // Gerenciar mudanças de autenticação
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Verificar sessão atual primeiro
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (sessionError) {
          console.error('Erro ao buscar sessão:', sessionError);
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Configurar estados baseados na sessão
        setSession(session);
        setUser(session?.user ?? null);

        // Buscar perfil se usuário estiver logado
        if (session?.user) {
          try {
            const userProfile = await fetchProfile(session.user.id);
            if (isMounted) {
              setProfile(userProfile as Profile);
            }
          } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            if (isMounted) {
              setProfile(null);
            }
          }
        } else {
          setProfile(null);
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro na inicialização da auth:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);

        // Buscar perfil quando usuário faz login
        if (session?.user) {
          try {
            const userProfile = await fetchProfile(session.user.id);
            if (isMounted) {
              setProfile(userProfile as Profile);
            }
          } catch (error) {
            console.error('Erro ao buscar perfil no listener:', error);
            if (isMounted) {
              setProfile(null);
            }
          }
        } else {
          setProfile(null);
        }

        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Inicializar
    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
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