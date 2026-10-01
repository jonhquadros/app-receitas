import React from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode } from '../types/recipe';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options: { id: ThemeMode; label: string; icon: typeof Sun; description: string }[] = [
    {
      id: 'light',
      label: 'Claro',
      icon: Sun,
      description: 'Fundo claro com alto contraste',
    },
    {
      id: 'dark',
      label: 'Escuro',
      icon: Moon,
      description: 'Agradável para leitura à noite',
    },
    {
      id: 'system',
      label: 'Automático',
      icon: Monitor,
      description: 'Siga a configuração do seu celular',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-[19px] font-semibold text-stone-900 dark:text-stone-100 mb-2">
        Aparência da tela
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center justify-between p-4 min-h-[64px] rounded-2xl text-left border-2 transition-all ${
                isSelected
                  ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E2220] text-stone-700 dark:text-stone-300 hover:border-emerald-300 dark:hover:border-emerald-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    isSelected
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-stone-950'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[18px] font-bold leading-tight">{opt.label}</div>
                  <div className="text-[14px] text-stone-600 dark:text-stone-400 mt-0.5">
                    {opt.description}
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="p-1.5 rounded-full bg-emerald-600 text-white dark:bg-emerald-500 dark:text-stone-950">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
