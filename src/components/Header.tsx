import React from 'react';
import { Bell } from 'lucide-react';
import { TabType } from '../types';
import { USER_PROFILE } from '../data/mockData';
import { SommaLogo } from './SommaLogo';
import { useUser } from '../context/UserContext';

interface HeaderProps {
  currentTab: TabType;
  onNavigate: (tab: TabType) => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

const TAB_TITLES: Record<TabType, string> = {
  inicio: 'Início',
  treino: 'Treino',
  dieta: 'Dieta & Macros',
  evolucao: 'Evolução',
  comunidade: 'Feed',
  profissionais: 'Plano & Time',
  perfil: 'Perfil'
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenNotifications,
  unreadCount = 2
}) => {
  const { user } = useUser();
  const avatarUrl = user?.avatar || USER_PROFILE.avatar;
  const userName = user?.name || USER_PROFILE.name;

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-40 pt-safe bg-[#101419]/90 backdrop-blur-xl border-b border-[#262a30]/40">
      <div className="h-14 px-4 max-w-[430px] md:max-w-none mx-auto flex items-center justify-between">
        {/* Brand logo and section breadcrumb */}
        <div className="flex items-center gap-2">
          {/* Logo visual: Somma iconic dual blue spheres + section breadcrumb */}
          <button 
            onClick={() => onNavigate('inicio')}
            className="flex items-center focus:outline-none group text-left hover:opacity-85 transition-opacity"
            aria-label="Ir para a tela inicial do SOMMA Hub"
          >
            <SommaLogo variant="icon" className="h-6 w-auto" />
          </button>

          <span className="text-[#424656] text-sm font-normal">/</span>
          <span className="text-sm font-semibold text-[#e0e2ea] truncate max-w-[150px] md:max-w-xs">
            {TAB_TITLES[currentTab]}
          </span>
        </div>

        {/* Action icons: Notifications & User profile avatar */}
        <div className="flex items-center gap-1">
          <button
            aria-label="Notificações"
            onClick={onOpenNotifications}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#c2c6d8] hover:text-white hover:bg-[#1c2025] transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0066ff] ring-2 ring-[#101419]"></span>
            )}
          </button>

          <button
            aria-label="Perfil do Atleta"
            onClick={() => onNavigate('perfil')}
            className="w-10 h-10 flex items-center justify-center rounded-full ring-1 ring-transparent hover:ring-[#0066ff] transition-all"
          >
            <img
              src={avatarUrl}
              alt={`Foto de perfil de ${userName}`}
              className="w-8 h-8 rounded-full object-cover bg-[#1c2025]"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
