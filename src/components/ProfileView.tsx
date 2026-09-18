import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Camera, 
  Edit3, 
  User, 
  Mail, 
  Calendar, 
  Ruler, 
  Weight, 
  Target, 
  CheckCircle2, 
  ChevronRight, 
  Award, 
  Dumbbell, 
  Utensils, 
  HeartPulse, 
  Volume2, 
  Smartphone, 
  Cloud, 
  Download, 
  LogOut, 
  X, 
  Check, 
  AlertCircle, 
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { USER_PROFILE, MOCK_PROFESSIONALS } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { Professional } from '../types';

interface ProfileViewProps {
  onOpenPlans: () => void;
  onNavigateToProfessionals: () => void;
  onSelectProfessional?: (professional: Professional) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenPlans,
  onNavigateToProfessionals,
  onSelectProfessional
}) => {
  const { user, logout, updateUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App settings state
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);

  // Edit profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Form state for editing personal data
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAge, setEditAge] = useState<string>('');
  const [editHeight, setEditHeight] = useState<string>('');
  const [editWeight, setEditWeight] = useState<string>('');
  const [editGoal, setEditGoal] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3200);
  };

  // Derive display values from user or mock
  const displayName = user?.name || USER_PROFILE.name;
  const displayUsername = user?.username || (user?.name ? user.name.toLowerCase().replace(/[^a-z0-9_.]/g, '') : 'lucasandrade');
  const displayEmail = user?.email || 'lucas@somma.com';
  const displayAvatar = user?.avatar || USER_PROFILE.avatar;
  const displayRole = user?.role || USER_PROFILE.role;
  const displayJoined = user?.joinedDate || USER_PROFILE.joinedDate;
  const displayAge = user?.age ?? 26;
  const displayWeight = user?.weight ?? USER_PROFILE.weight;
  const displayHeight = user?.height ?? USER_PROFILE.height;
  const displayGoal = user?.goal || 'Hipertrofia e Força';
  const displayPlan = user?.plan || 'SOMMA Black Anual';
  const displayWorkouts = user?.totalWorkouts ?? USER_PROFILE.totalWorkouts;
  const displayPrs = user?.totalPrs ?? USER_PROFILE.totalPrs;
  const displayStreak = user?.streakDays ?? 14;

  // Resolve linked professionals
  // If user has specific linked IDs, find them; otherwise fallback to professionals marked as isLinkedToUserPlan
  const linkedProfessionals = React.useMemo(() => {
    if (user && user.linkedProfessionalIds !== undefined) {
      if (user.linkedProfessionalIds.length === 0) {
        return [];
      }
      return MOCK_PROFESSIONALS.filter((p) => user.linkedProfessionalIds?.includes(p.id));
    }
    return MOCK_PROFESSIONALS.filter((p) => p.isLinkedToUserPlan);
  }, [user]);

  // Open Edit Modal and prefill with current data
  const handleOpenEditModal = () => {
    setEditName(displayName);
    setEditUsername(displayUsername);
    setEditEmail(displayEmail);
    setEditAge(displayAge ? String(displayAge) : '');
    setEditHeight(displayHeight ? String(displayHeight) : '');
    setEditWeight(displayWeight ? String(displayWeight) : '');
    setEditGoal(displayGoal);
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Validate and save edited personal data
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = editName.trim();
    if (!cleanName) {
      setFormError('O nome completo não pode ficar vazio.');
      return;
    }

    // Username validation: normalize to lowercase, remove spaces and non-allowed characters
    const cleanUsername = editUsername
      .toLowerCase()
      .trim()
      .replace(/^@+/, '')
      .replace(/[^a-z0-9_.]/g, '');

    if (!cleanUsername) {
      setFormError('O nome de usuário não pode ficar vazio.');
      return;
    }

    if (cleanUsername.length < 3) {
      setFormError('O nome de usuário deve ter no mínimo 3 caracteres.');
      return;
    }

    const parsedAge = editAge ? parseInt(editAge, 10) : undefined;
    const parsedHeight = editHeight ? parseFloat(editHeight.replace(',', '.')) : undefined;
    const parsedWeight = editWeight ? parseFloat(editWeight.replace(',', '.')) : undefined;

    updateUser({
      name: cleanName,
      username: cleanUsername,
      email: editEmail.trim() || displayEmail,
      age: parsedAge && !isNaN(parsedAge) ? parsedAge : displayAge,
      height: parsedHeight && !isNaN(parsedHeight) ? parsedHeight : displayHeight,
      weight: parsedWeight && !isNaN(parsedWeight) ? parsedWeight : displayWeight,
      goal: editGoal.trim() || displayGoal,
    });

    setIsEditModalOpen(false);
    showToast('Dados pessoais e usuário atualizados com sucesso!');
  };

  // Handle local avatar photo selection with canvas compression to JPEG Base64
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          updateUser({ avatar: compressedDataUrl });
          showToast('Foto de perfil alterada e salva com sucesso!');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input to allow choosing same file again if wanted
    e.target.value = '';
  };

  return (
    <div className="flex flex-col w-full pb-24 md:pb-12 gap-5 max-w-[480px] md:max-w-none mx-auto">
      
      {/* Visual Feedback Toast */}
      {feedbackToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#0066ff] text-white text-xs font-bold shadow-xl border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Hidden File Input for Avatar Selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label="Upload da foto de perfil"
        className="hidden"
        onChange={handlePhotoSelect}
      />

      {/* 1. Profile Identity & Central Card */}
      <section className="bg-[#1c2025] rounded-3xl p-5 md:p-6 border border-[#262a30] shadow-sm flex flex-col items-center text-center gap-4">
        
        {/* Avatar with Camera Overlay */}
        <div className="relative group">
          <img
            src={displayAvatar}
            alt={`Foto de perfil de ${displayName}`}
            className="w-24 h-24 rounded-full object-cover ring-2 ring-[#0066ff] bg-[#262a30] shadow-xl transition-all group-hover:opacity-90"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Alterar foto de perfil"
            aria-label="Alterar foto de perfil"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0066ff] hover:bg-[#0052cc] text-white flex items-center justify-center ring-3 ring-[#101419] shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Change Photo Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-[#0066ff] hover:text-[#b3c5ff] font-bold flex items-center gap-1.5 transition-colors cursor-pointer -mt-1 px-3 py-1 rounded-full hover:bg-[#0066ff]/10"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Alterar foto</span>
        </button>

        {/* User Titles & Handle */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold text-white tracking-tight">{displayName}</h1>
            <ShieldCheck className="w-4 h-4 text-[#0066ff]" />
          </div>
          <span className="text-xs font-semibold text-[#0066ff] tracking-wide mt-0.5">
            @{displayUsername}
          </span>
          <span className="text-xs text-[#8c90a1] mt-1">{displayRole}</span>
          <span className="text-[11px] text-[#424656]">{displayEmail}</span>
        </div>

        {/* Action Button: Edit Personal Data */}
        <button
          type="button"
          onClick={handleOpenEditModal}
          className="w-full max-w-xs h-10 rounded-xl bg-[#262a30] hover:bg-[#31353b] text-white text-xs font-bold border border-[#31353b] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#0066ff]" />
          <span>Editar dados pessoais</span>
        </button>

        {/* Biometrics & Goal Matrix */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#262a30]/70">
          <div className="bg-[#181c21] p-3 rounded-2xl border border-[#262a30]/60 flex flex-col items-center">
            <span className="text-[10px] text-[#8c90a1] uppercase font-bold tracking-wider">Idade</span>
            <span className="text-sm font-extrabold text-white mt-0.5">{displayAge} anos</span>
          </div>

          <div className="bg-[#181c21] p-3 rounded-2xl border border-[#262a30]/60 flex flex-col items-center">
            <span className="text-[10px] text-[#8c90a1] uppercase font-bold tracking-wider">Peso</span>
            <span className="text-sm font-extrabold text-white mt-0.5">{displayWeight} kg</span>
          </div>

          <div className="bg-[#181c21] p-3 rounded-2xl border border-[#262a30]/60 flex flex-col items-center">
            <span className="text-[10px] text-[#8c90a1] uppercase font-bold tracking-wider">Altura</span>
            <span className="text-sm font-extrabold text-white mt-0.5">{displayHeight} m</span>
          </div>

          <div className="bg-[#181c21] p-3 rounded-2xl border border-[#262a30]/60 flex flex-col items-center">
            <span className="text-[10px] text-[#8c90a1] uppercase font-bold tracking-wider">Treinos</span>
            <span className="text-sm font-extrabold text-[#4edea3] mt-0.5">{displayWorkouts}</span>
          </div>
        </div>

        {/* Goal highlight */}
        <div className="w-full p-3 rounded-2xl bg-[#181c21]/80 border border-[#262a30]/70 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <Target className="w-4 h-4 text-[#0066ff] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#8c90a1] uppercase font-bold">Foco Atual</span>
              <span className="text-xs font-bold text-white">{displayGoal}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="text-[11px] text-[#0066ff] hover:text-[#b3c5ff] font-semibold cursor-pointer"
          >
            Ajustar
          </button>
        </div>
      </section>

      {/* 2. Meu plano Section */}
      <section className="bg-[#1c2025] rounded-3xl p-5 border border-[#262a30] flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#0066ff]" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Meu plano
            </h2>
          </div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30">
            Ativo
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#181c21] to-[#12161b] border border-[#0066ff]/35 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white">{displayPlan}</span>
                <Sparkles className="w-4 h-4 text-[#0066ff]" />
              </div>
              <span className="text-xs text-[#8c90a1] mt-0.5">
                Renovação automática • Acesso total ao ecossistema SOMMA
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#262a30]/60">
            <div className="flex items-center gap-2 text-xs text-[#c2c6d8]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
              <span>
                <strong>Profissionais vinculados:</strong> {linkedProfessionals.length > 0 ? `${linkedProfessionals.length} especialista(s) inclusos no plano` : 'Equipe multidisciplinar habilitada'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#c2c6d8]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
              <span>Periodização automática, progressão de carga e histórico ilimitado</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#c2c6d8]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
              <span>Feedback direto em vídeo e chat integrado</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onOpenPlans}
              className="flex-1 h-10 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#0066ff]/25"
            >
              <span>Ver plano & Benefícios</span>
            </button>
            <button
              type="button"
              onClick={onOpenPlans}
              className="h-10 px-3 rounded-xl bg-[#262a30] hover:bg-[#31353b] text-white text-xs font-bold border border-[#31353b] transition-colors cursor-pointer"
            >
              <span>Alterar plano</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Minha equipe / Profissionais vinculados Section */}
      <section className="bg-[#1c2025] rounded-3xl p-5 border border-[#262a30] flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-[#0066ff]" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Minha equipe
            </h2>
          </div>
          {linkedProfessionals.length > 0 && (
            <span className="text-[10px] text-[#8c90a1] font-semibold bg-[#262a30] px-2 py-0.5 rounded-full">
              {linkedProfessionals.length} ativo(s)
            </span>
          )}
        </div>

        {linkedProfessionals.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {linkedProfessionals.map((prof) => (
              <div
                key={prof.id}
                className="p-3.5 rounded-2xl bg-[#181c21] border border-[#262a30]/80 flex items-center justify-between gap-3 hover:border-[#0066ff]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={prof.avatar}
                    alt={`Foto de ${prof.name}`}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-[#0066ff] bg-[#262a30] shrink-0"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{prof.name}</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#0066ff]/20 text-[#b3c5ff]">
                        {prof.categoryLabel || prof.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8c90a1] line-clamp-1">{prof.title}</span>
                    {prof.nextCheckInDate && (
                      <span className="text-[10px] text-[#4edea3] mt-0.5">
                        Próximo alinhamento: {prof.nextCheckInDate}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectProfessional) {
                      onSelectProfessional(prof);
                    } else {
                      onNavigateToProfessionals();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#262a30] hover:bg-[#31353b] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Ver perfil
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={onNavigateToProfessionals}
              className="text-xs text-[#0066ff] hover:text-[#b3c5ff] font-bold flex items-center justify-center gap-1.5 py-2 transition-colors cursor-pointer"
            >
              <span>Gerenciar especialistas & ver diretório</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Empty state when user has no linked professional */
          <div className="p-5 rounded-2xl bg-[#181c21] border border-[#262a30]/80 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#262a30] flex items-center justify-center text-[#8c90a1]">
              <User className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">
                Você ainda não possui um profissional vinculado.
              </span>
              <span className="text-xs text-[#8c90a1] mt-1 max-w-xs">
                Contrate um treinador ou nutricionista para prescrever seus treinos, ajustar calorias e acompanhar sua evolução.
              </span>
            </div>
            <button
              type="button"
              onClick={onNavigateToProfessionals}
              className="h-10 px-5 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#0066ff]/20 active:scale-98 mt-1"
            >
              <Search className="w-4 h-4" />
              <span>Encontrar profissionais</span>
            </button>
          </div>
        )}
      </section>

      {/* 4. Configurações do Aplicativo */}
      <section className="bg-[#1c2025] rounded-3xl p-5 border border-[#262a30] flex flex-col gap-3 shadow-sm">
        <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
          Configurações do Aplicativo
        </h2>

        {/* Unit Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-[#262a30]/50">
          <div className="flex flex-col">
            <span className="text-xs text-[#c2c6d8] font-semibold">Unidade de Carga</span>
            <span className="text-[11px] text-[#8c90a1]">Padrão para registro de peso nos exercícios</span>
          </div>
          <div className="flex bg-[#181c21] p-0.5 rounded-lg border border-[#262a30]">
            <button
              type="button"
              onClick={() => setUnit('kg')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                unit === 'kg' ? 'bg-[#0066ff] text-white' : 'text-[#8c90a1]'
              }`}
            >
              KG
            </button>
            <button
              type="button"
              onClick={() => setUnit('lbs')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                unit === 'lbs' ? 'bg-[#0066ff] text-white' : 'text-[#8c90a1]'
              }`}
            >
              LBS
            </button>
          </div>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between py-2 border-b border-[#262a30]/50">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-[#8c90a1]" />
            <span className="text-xs text-[#c2c6d8] font-semibold">Som ao término do descanso</span>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#0066ff] cursor-pointer"
          />
        </div>

        {/* Vibration toggle */}
        <div className="flex items-center justify-between py-2 border-b border-[#262a30]/50">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-[#8c90a1]" />
            <span className="text-xs text-[#c2c6d8] font-semibold">Vibração ao registrar série</span>
          </div>
          <input
            type="checkbox"
            checked={vibrateEnabled}
            onChange={(e) => setVibrateEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#0066ff] cursor-pointer"
          />
        </div>

        {/* Cloud sync indicator */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-4 h-4 text-[#0066ff]" />
            <span className="text-xs text-[#c2c6d8] font-semibold">Persistência local segura</span>
          </div>
          <span className="text-xs font-bold text-[#4edea3]">Sincronizado</span>
        </div>
      </section>

      {/* 5. Export and Logout Actions */}
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => showToast('Histórico CSV de treinos e cargas gerado com sucesso!')}
          className="w-full h-11 rounded-2xl bg-[#1c2025] hover:bg-[#262a30] text-white text-xs font-bold border border-[#262a30] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4 text-[#0066ff]" />
          <span>Exportar Histórico de Cargas (CSV)</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="w-full h-11 rounded-2xl text-xs font-bold text-[#ffb59d] hover:text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da conta no dispositivo</span>
        </button>
      </div>

      {/* ================= EDIT PROFILE MODAL ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#1c2025] border border-[#262a30] rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#181c21] border-b border-[#262a30] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0066ff]" />
                <h3 className="text-sm font-bold text-white">Editar Dados Pessoais</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#262a30] hover:bg-[#31353b] flex items-center justify-center text-[#c2c6d8] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveProfile} className="p-5 flex-1 overflow-y-auto space-y-4 no-scrollbar">
              
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nome Completo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#c2c6d8]">
                  Nome Completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#181c21] border border-[#262a30] text-white text-xs focus:outline-none focus:border-[#0066ff] transition-colors"
                />
              </div>

              {/* Nome de Usuário (@username) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#c2c6d8]">
                    Nome de Usuário (@username) <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] text-[#8c90a1]">letras, números, ponto e underline</span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-[#0066ff]">@</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => {
                      // Normalize live: lowercase and strip invalid characters
                      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
                      setEditUsername(clean);
                    }}
                    placeholder="seunome"
                    className="w-full h-11 pl-8 pr-3.5 rounded-xl bg-[#181c21] border border-[#262a30] text-white text-xs focus:outline-none focus:border-[#0066ff] transition-colors"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#c2c6d8]">E-mail</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#181c21] border border-[#262a30] text-white text-xs focus:outline-none focus:border-[#0066ff] transition-colors"
                />
              </div>

              {/* Idade, Altura, Peso in 3 columns */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#c2c6d8]">Idade (anos)</label>
                  <input
                    type="number"
                    min="10"
                    max="110"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    placeholder="26"
                    className="w-full h-11 px-3 rounded-xl bg-[#181c21] border border-[#262a30] text-white text-xs focus:outline-none focus:border-[#0066ff] transition-colors text-center"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#c2c6d8]">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="250"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    placeholder="82.4"
                    className="w-full h-11 px-3 rounded-xl bg-[#181c21] border border-[#262a30] text-white text-xs focus:outline-none focus:border-[#0066ff] transition-colors text-center"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#c2c6d8]">Altura (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="2.5"
                    value={editHeight}
                    onChange={(e) => setEditHeight(e.target.value)}
                    placeholder="1.78"
                    className="w-full h-11 px-3 rounded-xl bg-[#181c21] border border-[#262a30] text-white text-xs focus:outline-none focus:border-[#0066ff] transition-colors text-center"
                  />
                </div>
              </div>

              {/* Objetivo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#c2c6d8]">Objetivo Principal</label>
                <input
                  type="text"
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  placeholder="Ex: Hipertrofia e Força"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#181c21] border border-[#262a30] text-white text-xs focus:outline-none focus:border-[#0066ff] transition-colors"
                />
                {/* Quick Goal Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[
                    'Hipertrofia e Força',
                    'Definição Muscular',
                    'Condicionamento Geral',
                    'Perda de Gordura',
                    'Longevidade & Saúde'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditGoal(preset)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        editGoal === preset
                          ? 'bg-[#0066ff] text-white border-[#0066ff]'
                          : 'bg-[#181c21] text-[#8c90a1] border-[#262a30] hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-[#262a30]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 h-11 rounded-xl bg-[#181c21] hover:bg-[#262a30] text-[#c2c6d8] text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#0066ff]/25"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
