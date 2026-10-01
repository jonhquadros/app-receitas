import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DbProfile } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: DbProfile | null;
  role: 'admin' | 'usuario' | 'anonimo';
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (email: string, pass: string, nome?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Carregar ou sincronizar perfil do usuário logado
  const loadProfile = async (currentUser: User) => {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (data) {
        setProfile(data as DbProfile);
      } else {
        // Se ainda não existir perfil na tabela (ou se foi inserido manualmente sem profile),
        // cria o registro inicial respeitando o trigger
        const defaultName =
          currentUser.user_metadata?.nome || currentUser.email?.split('@')[0] || 'Usuário';

        const { data: created, error: insertErr } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            nome: defaultName,
            tema: 'automatico',
            role: 'usuario',
          })
          .select()
          .single();

        if (created) {
          setProfile(created as DbProfile);
        } else if (insertErr) {
          console.warn('Aviso ao inicializar perfil:', insertErr.message);
          // Fallback seguro em memória para o usuário não ficar bloqueado
          setProfile({
            id: currentUser.id,
            nome: defaultName,
            tema: 'automatico',
            role: 'usuario',
          });
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil do usuário:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured() || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await loadProfile(initialSession.user);
          }
        }
      } catch (err) {
        console.warn('Erro ao obter sessão inicial:', err);
      } finally {
        if (mounted) setLoading(false);
      }

      // Escutar mudanças de autenticação (login, logout, refresh de token)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadProfile(currentSession.user);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, pass: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Serviço de autenticação não configurado.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'E-mail ou senha incorretos. Por favor, tente novamente.' };
        }
        return { error: error.message };
      }

      if (data.user) {
        await loadProfile(data.user);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro inesperado ao realizar login.' };
    }
  };

  const signUp = async (
    email: string,
    pass: string,
    nome?: string
  ): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Serviço de autenticação não configurado.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: {
            nome: nome?.trim() || email.split('@')[0],
          },
        },
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          return {
            error:
              'Limite temporário de cadastros atingido no Supabase. Aguarde alguns instantes ou faça login.',
          };
        }
        return { error: error.message };
      }

      if (data.user) {
        await loadProfile(data.user);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro ao criar conta.' };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Serviço de autenticação não configurado.' };
    }

    try {
      const redirectTo = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro ao enviar e-mail de recuperação.' };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user);
    }
  };

  const role: 'admin' | 'usuario' | 'anonimo' = !user
    ? 'anonimo'
    : profile?.role === 'admin'
    ? 'admin'
    : 'usuario';

  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
