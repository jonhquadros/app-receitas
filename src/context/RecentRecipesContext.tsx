import React, { createContext, useContext, useState, useEffect } from 'react';

interface RecentRecipesContextType {
  recentRecipeIds: string[];
  addRecentRecipe: (recipeId: string) => void;
  clearRecent: () => void;
}

const RecentRecipesContext = createContext<RecentRecipesContextType | undefined>(undefined);

export const RecentRecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentRecipeIds, setRecentRecipeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('neco_recent_recipes');
      return saved ? JSON.parse(saved) : ['004']; // Default contains 004 as an initial sample
    } catch {
      return ['004'];
    }
  });

  useEffect(() => {
    localStorage.setItem('neco_recent_recipes', JSON.stringify(recentRecipeIds));
  }, [recentRecipeIds]);

  const addRecentRecipe = (recipeId: string) => {
    setRecentRecipeIds((prev) => {
      // Filter out existing occurrence, put new one at index 0, take at most 5
      const updated = [recipeId, ...prev.filter((id) => id !== recipeId)].slice(0, 5);
      return updated;
    });
  };

  const clearRecent = () => {
    setRecentRecipeIds([]);
  };

  return (
    <RecentRecipesContext.Provider value={{ recentRecipeIds, addRecentRecipe, clearRecent }}>
      {children}
    </RecentRecipesContext.Provider>
  );
};

export const useRecentRecipes = () => {
  const context = useContext(RecentRecipesContext);
  if (!context) {
    throw new Error('useRecentRecipes must be used within a RecentRecipesProvider');
  }
  return context;
};
