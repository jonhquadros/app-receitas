import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types/recipe';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('neco_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Carregar tema do perfil ao iniciar ou mudar auth
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const client = supabase;

    async function syncThemeFromProfile() {
      try {
        const {
          data: { user },
        } = await client.auth.getUser();

        if (user) {
          const { data: prof } = await client
            .from('profiles')
            .select('tema')
            .eq('id', user.id)
            .single();

          if (prof?.tema) {
            const mapped: ThemeMode =
              prof.tema === 'claro' ? 'light' : prof.tema === 'escuro' ? 'dark' : 'system';
            setThemeState(mapped);
            localStorage.setItem('neco_theme', mapped);
          }
        }
      } catch (err) {
        console.warn('Erro ao sincronizar tema do perfil:', err);
      }
    }

    syncThemeFromProfile();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('neco_theme', newTheme);

    // Salvar tema em profiles no Supabase (se autenticado)
    if (isSupabaseConfigured() && supabase) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const dbTema =
            newTheme === 'light' ? 'claro' : newTheme === 'dark' ? 'escuro' : 'automatico';

          await supabase
            .from('profiles')
            .update({ tema: dbTema })
            .eq('id', user.id);
        }
      } catch (err) {
        console.warn('Erro ao salvar tema no perfil do Supabase:', err);
      }
    }
  };

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let dark = false;
      if (theme === 'dark') {
        dark = true;
      } else if (theme === 'light') {
        dark = false;
      } else {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDarkMode(dark);
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
