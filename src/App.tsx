import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { FontSizeProvider } from './context/FontSizeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { RecentRecipesProvider, useRecentRecipes } from './context/RecentRecipesContext';
import { Recipe } from './types/recipe';
import { fetchRecipes } from './services/recipeService';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { FavoritesView } from './views/FavoritesView';
import { MoreView } from './views/MoreView';
import { AdminView } from './views/AdminView';
import { RecipeDetail } from './components/RecipeDetail';
import { FirstOpeningDisclaimerModal } from './components/FirstOpeningDisclaimerModal';
import { PaywallView } from './components/PaywallView';
import { PastDueWarningBanner } from './components/PastDueWarningBanner';
import { PaymentStatusModal } from './components/PaymentStatusModal';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { Leaf, ArrowLeft } from 'lucide-react';

function AppContent() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchCategory, setSearchCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAdminView, setShowAdminView] = useState<boolean>(false);
  const [showPaywallManual, setShowPaywallManual] = useState<boolean>(false);

  const { addRecentRecipe } = useRecentRecipes();
  const { isAdmin } = useAuth();
  const { hasAccess } = useSubscription();

  const previewRecipes = recipes.filter((r) => r.isPreview).slice(0, 3);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await fetchRecipes();
        if (isMounted && data && data.length > 0) {
          setRecipes(data);
        }
      } catch (err) {
        console.warn('Erro ao carregar receitas:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectRecipe = (recipe: Recipe) => {
    setShowAdminView(false);
    addRecentRecipe(recipe.id);
    setSelectedRecipe(recipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedRecipe(null);
  };

  const handleSelectRecipeByNumber = (recipeNumber: number) => {
    const numStr = String(recipeNumber).padStart(3, '0');
    const found = recipes.find(
      (r) => r.code.includes(numStr) || r.id === String(recipeNumber)
    );
    if (found) {
      handleSelectRecipe(found);
    }
  };

  const handleSelectCategory = (categoryName: string) => {
    setShowAdminView(false);
    setSelectedRecipe(null);
    setSearchCategory(categoryName);
    setSearchQuery('');
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSearch = (initialQuery?: string) => {
    setShowAdminView(false);
    setSelectedRecipe(null);
    if (initialQuery !== undefined) {
      setSearchQuery(initialQuery);
    }
    setSearchCategory('');
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: TabType) => {
    setShowAdminView(false);
    setShowPaywallManual(false);
    setSelectedRecipe(null); // Return to list mode when tapping tabs
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#121413] text-stone-900 dark:text-stone-100 transition-colors duration-200 antialiased font-sans selection:bg-emerald-200 dark:selection:bg-emerald-900">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#1E2220]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 px-4 py-2.5 shadow-2xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between min-h-[52px]">
          {selectedRecipe ? (
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-stone-800 dark:text-stone-200 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold min-h-[52px] pr-3 active:scale-95 transition-transform cursor-pointer"
              aria-label="Voltar para a lista de receitas"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[17px] truncate max-w-[200px] sm:max-w-xs">
                {selectedRecipe.title}
              </span>
            </button>
          ) : (
            <div
              onClick={() => handleTabChange('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-emerald-700 text-white dark:bg-emerald-600 shadow-xs group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[20px] sm:text-[22px] font-extrabold text-emerald-950 dark:text-emerald-100 tracking-tight">
                Receitas do Seu Neco
              </span>
            </div>
          )}

          {!selectedRecipe && (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setShowAdminView(true)}
                  className="text-[12px] font-bold text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-300/60 dark:border-purple-800/60 hover:scale-105 transition-transform cursor-pointer"
                >
                  Admin
                </button>
              )}
              <div className="text-[13px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-300/40 dark:border-emerald-800/40">
                350 receitas
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Banner de Aviso quando status for past_due (Falha de Pagamento) */}
      <PastDueWarningBanner />

      {/* Main Container */}
      <main className="w-full">
        {selectedRecipe ? (
          hasAccess || selectedRecipe.isPreview ? (
            <RecipeDetail recipe={selectedRecipe} onBack={handleBackToList} />
          ) : (
            <PaywallView
              previewRecipes={previewRecipes}
              onSelectPreviewRecipe={handleSelectRecipe}
              onOpenAccount={() => handleTabChange('more')}
            />
          )
        ) : showAdminView ? (
          <AdminView onBack={() => setShowAdminView(false)} />
        ) : showPaywallManual ? (
          <PaywallView
            previewRecipes={previewRecipes}
            onSelectPreviewRecipe={handleSelectRecipe}
            onOpenAccount={() => {
              setShowPaywallManual(false);
              handleTabChange('more');
            }}
          />
        ) : (
          <>
            {/* REGRA CENTRAL: Sem assinatura ativa, o usuário vê a tela de planos (paywall) */}
            {activeTab === 'home' && (
              hasAccess ? (
                <HomeView
                  recipes={recipes}
                  onSelectRecipe={handleSelectRecipe}
                  onSelectCategory={handleSelectCategory}
                  onOpenSearch={handleOpenSearch}
                />
              ) : (
                <PaywallView
                  previewRecipes={previewRecipes}
                  onSelectPreviewRecipe={handleSelectRecipe}
                  onOpenAccount={() => handleTabChange('more')}
                />
              )
            )}

            {activeTab === 'search' && (
              hasAccess ? (
                <SearchView
                  recipes={recipes}
                  initialCategory={searchCategory}
                  initialQuery={searchQuery}
                  onSelectRecipe={handleSelectRecipe}
                />
              ) : (
                <PaywallView
                  previewRecipes={previewRecipes}
                  onSelectPreviewRecipe={handleSelectRecipe}
                  onOpenAccount={() => handleTabChange('more')}
                />
              )
            )}

            {activeTab === 'favorites' && (
              hasAccess ? (
                <FavoritesView
                  recipes={recipes}
                  onSelectRecipe={handleSelectRecipe}
                  onOpenSearch={handleOpenSearch}
                />
              ) : (
                <PaywallView
                  previewRecipes={previewRecipes}
                  onSelectPreviewRecipe={handleSelectRecipe}
                  onOpenAccount={() => handleTabChange('more')}
                />
              )
            )}

            {activeTab === 'more' && (
              <MoreView
                onOpenAdmin={() => setShowAdminView(true)}
                onSelectRecipeNumber={handleSelectRecipeByNumber}
                onOpenPaywall={() => setShowPaywallManual(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Fixed Bottom Nav Bar */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tela de Primeira Abertura (Aviso de Responsabilidade) */}
      <FirstOpeningDisclaimerModal />

      {/* Modal de Sucesso ou Cancelamento de Pagamento */}
      <PaymentStatusModal
        onGoToRecipes={() => {
          setShowPaywallManual(false);
          handleTabChange('home');
        }}
        onRetryPayment={() => {
          setShowPaywallManual(true);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FontSizeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <FavoritesProvider>
              <RecentRecipesProvider>
                <AppContent />
              </RecentRecipesProvider>
            </FavoritesProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </FontSizeProvider>
    </ThemeProvider>
  );
}
