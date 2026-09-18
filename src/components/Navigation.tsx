import React from 'react';
import { Home, Dumbbell, Utensils, TrendingUp, Users, Award, User } from 'lucide-react';
import { TabType } from '../types';
import { SommaLogo } from './SommaLogo';

interface NavigationProps {
  currentTab: TabType;
  onNavigate: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onNavigate }) => {
  // Desktop sidebar nav
  const desktopNavItems = [
    { id: 'inicio' as TabType, label: 'Início', icon: Home },
    { id: 'treino' as TabType, label: 'Treinos', icon: Dumbbell },
    { id: 'dieta' as TabType, label: 'Dieta & Macros', icon: Utensils },
    { id: 'evolucao' as TabType, label: 'Evolução', icon: TrendingUp },
    { id: 'comunidade' as TabType, label: 'Feed', icon: Users },
    { id: 'perfil' as TabType, label: 'Perfil', icon: User },
  ];

  // Mobile bottom bar nav: 6 ergonomic items (Profissionais accessed via Início)
  const mobileNavItems = [
    { id: 'inicio' as TabType, label: 'Início', icon: Home },
    { id: 'treino' as TabType, label: 'Treino', icon: Dumbbell },
    { id: 'dieta' as TabType, label: 'Dieta', icon: Utensils },
    { id: 'evolucao' as TabType, label: 'Evolução', icon: TrendingUp },
    { id: 'comunidade' as TabType, label: 'Feed', icon: Users },
    { id: 'perfil' as TabType, label: 'Perfil', icon: User },
  ];

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#101419]/95 backdrop-blur-xl border-r border-[#262a30]/40 z-50 fixed top-0 bottom-0 left-0">
        <div className="h-16 px-5 flex items-center border-b border-[#262a30]/40">
          <button
            onClick={() => onNavigate('inicio')}
            className="flex items-center focus:outline-none hover:opacity-90 transition-opacity"
            aria-label="Ir para a tela inicial do SOMMA Hub"
          >
            <SommaLogo variant="full" className="h-8 w-auto" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1.5">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#0066ff] text-white font-bold shadow-lg shadow-[#0066ff]/25 scale-[1.02]'
                    : 'text-[#c2c6d8] hover:text-white hover:bg-[#1c2025]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#8c90a1]'}`} />
                <span className="text-sm font-semibold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#262a30]/40">
          <div className="bg-[#181c21] p-3 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-[#8c90a1]">Status do Atleta</span>
              <span className="text-sm font-bold text-white">14 Dias Streak 🔥</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse"></span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (fixed on mobile, hidden on md+) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-40 pb-safe bg-[#101419]/95 backdrop-blur-xl border-t border-[#262a30]/60 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        <div className="h-16 max-w-[440px] mx-auto px-1.5 flex items-center justify-around relative">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-label={item.label}
                className="flex-1 flex flex-col items-center justify-center h-16 relative focus:outline-none cursor-pointer group"
              >
                {isActive ? (
                  /* Elevated, highlighted action button style for the selected tab */
                  <div className="flex flex-col items-center justify-center -mt-4 transition-all duration-300 animate-in zoom-in-95">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 bg-[#0066ff] text-white ring-4 ring-[#101419] shadow-[#0066ff]/45 scale-105 active:scale-95">
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] mt-0.5 tracking-tight font-extrabold text-white transition-colors truncate max-w-[56px] text-center">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  /* Standard clean tab item */
                  <div className="flex flex-col items-center justify-center gap-1 transition-all duration-200 group-hover:scale-105">
                    <Icon className="w-5 h-5 text-[#8c90a1] group-hover:text-white transition-colors" />
                    <span className="text-[10px] tracking-tight truncate max-w-[56px] font-medium text-[#8c90a1] group-hover:text-[#c2c6d8] transition-colors text-center">
                      {item.label}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
