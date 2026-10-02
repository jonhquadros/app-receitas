import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isMountedRef = React.useRef(true);

  useEffect(() => () => { isMountedRef.current = false; }, []);

  // Escutar mudanças de autenticação para recarregar favoritos do usuário ativo
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;

    let isMounted = true;

    async function loadUserFavorites(userId: string | null) {
      if (!isMounted) return;
      setCurrentUserId(userId);

      if (!userId) {
        // Usuário anônimo / deslogado: carrega do storage anônimo
        const saved = localStorage.getItem('neco_anon_favorites');
        setFavorites(saved ? JSON.parse(saved) : []);
        return;
      }

      if (!supabase) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('recipe_id')
          .eq('user_id', userId);

        if (!error && data && isMounted) {
          const userFavs = data.map((r) => r.recipe_id);
          setFavorites(userFavs);
          localStorage.setItem(`neco_favs_${userId}`, JSON.stringify(userFavs));
        }
      } catch (err) {
        console.warn('Erro ao carregar favoritos do usuário:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (!supabase) return;

    // Inicialização
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserFavorites(session?.user?.id ?? null);
    });

    // Mudança de sessão (login / logout / troca de usuário)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserFavorites(session?.user?.id ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Salvar no storage local com escopo de usuário
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(`neco_favs_${currentUserId}`, JSON.stringify(favorites));
    } else {
      localStorage.setItem('neco_anon_favorites', JSON.stringify(favorites));
    }
  }, [favorites, currentUserId]);

  const toggleFavorite = async (recipeId: string) => {
    const isCurrentlyFav = isFavorite(recipeId);
    const newFavorites = isCurrentlyFav
      ? favorites.filter(
          (id) =>
            id !== recipeId &&
            !(recipeId === '004' && id === '00000000-0000-0000-0000-000000000004') &&
            !(recipeId === '00000000-0000-0000-0000-000000000004' && id === '004')
        )
      : [...favorites, recipeId];

    // Optimistic UI update imediato
    setFavorites(newFavorites);

    // Sincronizar com o Supabase com RLS. Se o contexto ainda não recebeu
    // o userId após o login, consulta a sessão atual antes de desistir.
    if (isSupabaseConfigured() && supabase) {
      try {
        let userId = currentUserId;
        if (!userId) {
          const { data: { session } } = await supabase.auth.getSession();
          userId = session?.user?.id ?? null;
          if (userId && isMountedRef.current) {
            setCurrentUserId(userId);
          }
        }

        if (!userId) return;

        const targetRecipeId =
          recipeId === '004' ? '00000000-0000-0000-0000-000000000004' : recipeId;

        const result = isCurrentlyFav
          ? await supabase
              .from('favorites')
              .delete()
              .eq('user_id', userId)
              .eq('recipe_id', targetRecipeId)
          : await supabase
              .from('favorites')
              .insert({ user_id: userId, recipe_id: targetRecipeId });

        if (result.error) {
          console.error('Erro ao sincronizar favorito com Supabase:', result.error.message);
          setFavorites((prev) => (isCurrentlyFav ? [...prev, recipeId] : prev.filter((id) => id !== recipeId)));
        }
      } catch (err) {
        console.error('Erro ao sincronizar favorito com Supabase:', err);
        setFavorites((prev) => (isCurrentlyFav ? [...prev, recipeId] : prev.filter((id) => id !== recipeId)));
      }
    }
  };

  const isFavorite = (recipeId: string) => {
    return favorites.some(
      (id) =>
        id === recipeId ||
        (recipeId === '004' && id === '00000000-0000-0000-0000-000000000004') ||
        (recipeId === '00000000-0000-0000-0000-000000000004' && id === '004')
    );
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
