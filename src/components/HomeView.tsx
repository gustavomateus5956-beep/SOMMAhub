import React, { useState, useEffect } from 'react';
import { Play, Flame, Timer, Dumbbell, TrendingUp, Check, Minus, Clock, Users, ChevronRight, Award, MessageSquare, Search, Stethoscope, Utensils, HeartPulse, Apple, ShieldCheck, CheckCircle2, Eye, RotateCcw } from 'lucide-react';
import { TabType, Routine, WorkoutSessionRecord } from '../types';
import { INITIAL_ROUTINES } from '../data/mockData';
import { SommaTrainBadge } from './SommaTrainBadge';
import { useUser } from '../context/UserContext';
import { useWorkout } from '../context/WorkoutContext';
import { storageService } from '../services/storageService';
import { WorkoutSessionDetailModal } from './WorkoutSessionDetailModal';

interface HomeViewProps {
  onNavigate: (tab: TabType) => void;
  onStartRoutine: (routine: Routine) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onStartRoutine }) => {
  const { user } = useUser();
  const { workoutStatus, activeSession, maximizeWorkout } = useWorkout();
  const [feedLiked, setFeedLiked] = useState(false);
  const [cheerCount, setCheerCount] = useState(18);
  const [todaySession, setTodaySession] = useState<WorkoutSessionRecord | null>(null);
  const [selectedSessionModal, setSelectedSessionModal] = useState<WorkoutSessionRecord | null>(null);

  const plannedRoutine = INITIAL_ROUTINES.find((r) => r.id === 'rotina-a') || INITIAL_ROUTINES[0];
  const userFirstName = user?.name ? user.name.trim().split(' ')[0] : 'Atleta';
  const streakDays = user?.streakDays ?? 14;

  useEffect(() => {
    if (user?.id) {
      const sessions = storageService.getWorkoutSessions(user.id);
      const found = sessions.find((s) => s.dateDisplay === 'Hoje' || s.dateDisplay.toLowerCase().includes('hoje'));
      setTodaySession(found || null);
    } else {
      setTodaySession(null);
    }
  }, [user?.id]);

  const handleToggleFeedLike = () => {
    if (!feedLiked) {
      setCheerCount((c) => c + 1);
      setFeedLiked(true);
    } else {
      setCheerCount((c) => c - 1);
      setFeedLiked(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-24 md:pb-12">
      {/* Salutation & Streak Header */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex flex-col">
          <span className="text-xs text-[#8c90a1] font-medium tracking-wide uppercase">
            Sábado, 24 de Maio
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Bom dia, {userFirstName}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#262a30] border border-[#31353b]">
          <Flame className="w-4 h-4 text-[#ffb59d] fill-[#ffb59d]" />
          <span className="text-xs font-bold text-white">{streakDays} dias</span>
        </div>
      </div>

      {/* Resumo do Plano Atual Card */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1c2025] border border-[#262a30] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0066ff]/15 border border-[#0066ff]/30 flex items-center justify-center text-[#0066ff] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{user?.plan || 'SOMMA Black Anual'}</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3]">
                Ativo
              </span>
            </div>
            <span className="text-[11px] text-[#8c90a1]">
              Equipe multidisciplinar e prescrição personalizada
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('perfil')}
          className="text-xs text-[#0066ff] hover:text-[#b3c5ff] font-bold px-2.5 py-1.5 rounded-lg hover:bg-[#0066ff]/10 transition-colors cursor-pointer shrink-0"
        >
          Meu plano
        </button>
      </div>

      {/* Planned Workout Hero Card */}
      <section className="relative overflow-hidden rounded-2xl bg-[#1c2025] p-5 flex flex-col gap-4 border border-[#262a30] shadow-lg">
        {todaySession ? (
          /* When today's workout has already been completed */
          <>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00a572]/20 text-[#4edea3] text-[11px] font-extrabold uppercase tracking-wider">
                    Treino Concluído
                  </span>
                  <span className="text-[#424656] text-xs">•</span>
                  <span className="text-xs text-[#8c90a1]">{todaySession.dateDisplay}</span>
                </div>
                <h2 className="text-lg md:text-xl font-extrabold text-white mt-1">
                  {todaySession.routineName}
                </h2>
                <span className="text-xs text-[#8c90a1]">
                  {todaySession.muscleGroups || 'Peitoral & Tríceps'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#00a572]/20 border border-[#00a572]/30 flex items-center justify-center text-[#4edea3]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#262a30]/60 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#8c90a1] font-semibold uppercase">Duração</span>
                <span className="text-sm font-bold text-white">{todaySession.durationFormatted}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#8c90a1] font-semibold uppercase">Volume</span>
                <span className="text-sm font-bold text-[#4edea3] tabular-nums">
                  {todaySession.totalVolume.toLocaleString()} kg
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#8c90a1] font-semibold uppercase">Séries</span>
                <span className="text-sm font-bold text-[#b3c5ff]">
                  {todaySession.totalCompletedSets} feitas
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedSessionModal(todaySession)}
                className="flex-1 h-[48px] rounded-xl bg-[#262a30] hover:bg-[#31353b] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Ver Resumo do Treino</span>
              </button>

              <button
                type="button"
                onClick={() => onStartRoutine(plannedRoutine)}
                className="h-[48px] px-4 rounded-xl bg-[#0066ff]/20 hover:bg-[#0066ff]/30 text-[#b3c5ff] border border-[#0066ff]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Iniciar outro treino hoje"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Treinar Novamente</span>
              </button>
            </div>
          </>
        ) : (
          /* When workout is pending */
          <>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0066ff]/20 text-[#b3c5ff] text-[11px] font-bold uppercase tracking-wider">
                    Treino de Hoje
                  </span>
                  <span className="text-[#424656] text-xs">•</span>
                  <span className="text-xs text-[#c2c6d8] font-semibold">
                    {plannedRoutine.category || 'Foco Hipertrofia'}
                  </span>
                  {plannedRoutine.isProfessionalCertified && plannedRoutine.certifiedBy && (
                    <SommaTrainBadge certificate={plannedRoutine.certifiedBy} size="sm" />
                  )}
                </div>
                <h2 className="text-lg md:text-xl font-extrabold text-white mt-1">
                  {plannedRoutine.name}
                </h2>
                <span className="text-xs text-[#8c90a1]">
                  {plannedRoutine.muscleGroups || 'Peitoral & Tríceps'}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#262a30] text-[#c2c6d8] text-xs font-semibold">
                Hoje
              </span>
            </div>

            {/* Specs Ribbon */}
            <div className="flex items-center flex-wrap gap-x-6 gap-y-2 py-2 border-y border-[#262a30]/60 text-xs text-[#c2c6d8]">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#8c90a1]" />
                <span>
                  <strong className="text-white font-semibold">~{plannedRoutine.estimatedMinutes} min</strong> est.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#8c90a1]" />
                <span>
                  <strong className="text-white font-semibold">{plannedRoutine.exercisesCount}</strong> exercícios
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4edea3]" />
                <span>
                  <strong className="text-[#4edea3] font-semibold">Sobrecarga:</strong> +2.5 kg
                </span>
              </div>
            </div>

            {/* Primary Workout CTA */}
            {workoutStatus === 'minimized' ? (
              <button
                type="button"
                onClick={maximizeWorkout}
                className="w-full h-[52px] rounded-xl bg-gradient-to-r from-[#0066ff] to-[#0054d6] hover:brightness-110 active:scale-[0.98] text-white text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0066ff]/20 transition-all cursor-pointer animate-pulse"
              >
                <RotateCcw className="w-5 h-5" />
                <span>RETOMAR TREINO EM ANDAMENTO</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStartRoutine(plannedRoutine)}
                className="w-full h-[52px] rounded-xl bg-[#0066ff] hover:bg-[#0054d6] active:scale-[0.98] text-white text-base font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>COMEÇAR TREINO</span>
              </button>
            )}
          </>
        )}
      </section>

      {/* Weekly Progress & Consistency Widget */}
      <section className="flex flex-col gap-3 rounded-2xl bg-[#1c2025] p-5 border border-[#262a30] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Progresso Recente</span>
            <span className="text-[#424656] text-xs">•</span>
            <span className="text-xs text-[#8c90a1]">Semana 21</span>
          </div>
          <span className="text-xs text-[#4edea3] font-semibold">4 de 5 treinos</span>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {/* SEG */}
          <div className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-[#262a30]">
            <span className="text-[10px] font-bold text-[#8c90a1]">SEG</span>
            <div className="w-6 h-6 rounded-full bg-[#00a572] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          {/* TER */}
          <div className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-[#262a30]">
            <span className="text-[10px] font-bold text-[#8c90a1]">TER</span>
            <div className="w-6 h-6 rounded-full bg-[#00a572] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          {/* QUA (Rest) */}
          <div className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-[#262a30]">
            <span className="text-[10px] font-bold text-[#8c90a1]">QUA</span>
            <div className="w-6 h-6 rounded-full bg-[#101419] flex items-center justify-center text-[#8c90a1]">
              <Minus className="w-3.5 h-3.5" />
            </div>
          </div>
          {/* QUI */}
          <div className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-[#262a30]">
            <span className="text-[10px] font-bold text-[#8c90a1]">QUI</span>
            <div className="w-6 h-6 rounded-full bg-[#00a572] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          {/* SEX */}
          <div className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-[#262a30]">
            <span className="text-[10px] font-bold text-[#8c90a1]">SEX</span>
            <div className="w-6 h-6 rounded-full bg-[#00a572] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          {/* SAB (Today) */}
          <div className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-[#31353b] ring-1 ring-[#0066ff]/40">
            <span className="text-[10px] font-bold text-[#b3c5ff]">SÁB</span>
            <div className="w-6 h-6 rounded-full bg-[#0066ff]/25 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0066ff] animate-pulse"></span>
            </div>
          </div>
          {/* DOM */}
          <div className="flex flex-col items-center gap-1.5 py-2 rounded-xl bg-[#262a30] opacity-40">
            <span className="text-[10px] font-bold text-[#8c90a1]">DOM</span>
            <div className="w-6 h-6 rounded-full bg-[#101419] flex items-center justify-center text-[#8c90a1]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Highlight Milestone Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181c21] border border-[#262a30]/50 mt-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#cc4204]/20 text-[#ffb59d] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ffb59d]">
                Recorde Pessoal (PR)
              </span>
              <span className="text-xs font-semibold text-white truncate">
                Supino Reto: 100 kg <span className="text-[#4edea3] font-bold">(+4 kg)</span>
              </span>
            </div>
          </div>

          <div className="text-right shrink-0 pl-2">
            <span className="text-[11px] text-[#8c90a1] block">Volume total</span>
            <span className="text-xs font-extrabold text-white">12.8 ton</span>
          </div>
        </div>
      </section>

      {/* Dieta & Macronutrientes Quick Widget */}
      <section
        onClick={() => onNavigate('dieta')}
        className="rounded-2xl bg-[#1c2025] hover:bg-[#20252c] p-4 border border-[#262a30] hover:border-[#00a572]/40 shadow-sm transition-all cursor-pointer flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00a572]/20 text-[#4edea3] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Plano Alimentar & Dieta</span>
              <span className="text-[9px] font-bold bg-[#00a572]/20 text-[#4edea3] px-2 py-0.5 rounded-full border border-[#00a572]/30">
                Certificado
              </span>
            </div>
            <span className="text-[11px] text-[#8c90a1] mt-0.5">
              1.890 / 2.750 kcal • P: 185g • C: 310g • G: 65g
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-[#b3c5ff] group-hover:text-white shrink-0">
          <span className="hidden sm:inline">Ver Dieta</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </section>

      {/* Community Activity Snippet */}
      <section className="flex flex-col gap-3 rounded-2xl bg-[#1c2025] p-5 border border-[#262a30] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8c90a1]" />
            <h3 className="text-sm font-bold text-white">Feed de Atividades</h3>
          </div>
          <button
            onClick={() => onNavigate('comunidade')}
            className="text-xs font-bold text-[#b3c5ff] hover:text-white uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
          >
            Ver Feed
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Snippet Post */}
        <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#181c21] border border-[#262a30]/50">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZC4vFbQFMF-osDJAnT0au0ozLarPRkP3AlG9eYXGvvmuf91MFJIyEsy-t2F4JZ9UncfqJRZXsGASZhTtPltFTkheYnScjsBv3RpYWKqRji4Hpo49eLWFwifcFNwm5YoKbcyzXPoqEAULo-mbPZZGof1DnKB1qF1W9ofcPo1ONPbulyvflbaDf2S9gzYDeVSLZeQTV_Gbztb3-egyuw6BqWjStsagLPWp244LxACyvcCf_hh7Dj36Tqg"
            alt="Foto do atleta Matheus Silva"
            className="w-10 h-10 rounded-full object-cover shrink-0 bg-[#262a30]"
          />

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-white truncate">Matheus Silva</span>
              <span className="text-[10px] text-[#8c90a1] shrink-0">há 22m</span>
            </div>
            <p className="text-xs text-[#c2c6d8] line-clamp-2 mt-0.5">
              Novo RP no Leg Press 45°: 360 kg × 8 reps! Foco total na progressão contínua.
            </p>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#262a30]/50">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleToggleFeedLike}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    feedLiked ? 'text-[#ffb59d]' : 'text-[#b3c5ff] hover:text-white'
                  }`}
                >
                  <Flame className={`w-4 h-4 ${feedLiked ? 'fill-[#ffb59d]' : ''}`} />
                  <span>Dar Força ({cheerCount})</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-[#8c90a1]">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>4</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('comunidade')}
                className="text-xs text-[#8c90a1] hover:text-white cursor-pointer"
              >
                Comentar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Encontre seu profissional Card */}
      <section className="flex flex-col gap-3 rounded-2xl bg-[#1c2025] p-5 border border-[#262a30] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#0066ff]" />
            <h3 className="text-sm font-bold text-white">Encontre seu profissional</h3>
          </div>
          <button
            onClick={() => onNavigate('profissionais')}
            className="text-xs font-bold text-[#b3c5ff] hover:text-white uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
          >
            Ver Todos
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#8c90a1]">
          Encontre profissionais para acompanhar seu treino, alimentação e evolução.
        </p>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="px-3 py-1.5 rounded-full bg-[#181c21] border border-[#262a30] text-[#c2c6d8] text-xs font-medium flex items-center gap-1.5 shrink-0">
            <Dumbbell className="w-3.5 h-3.5 text-[#0066ff]" />
            Personal
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[#181c21] border border-[#262a30] text-[#c2c6d8] text-xs font-medium flex items-center gap-1.5 shrink-0">
            <Utensils className="w-3.5 h-3.5 text-[#4edea3]" />
            Nutricionista
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[#181c21] border border-[#262a30] text-[#c2c6d8] text-xs font-medium flex items-center gap-1.5 shrink-0">
            <HeartPulse className="w-3.5 h-3.5 text-[#ffb59d]" />
            Fisioterapeuta
          </span>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('profissionais')}
          className="w-full h-11 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all mt-1 cursor-pointer shadow-md shadow-[#0066ff]/20"
        >
          <Search className="w-4 h-4 text-white" />
          <span>Encontrar profissionais</span>
        </button>
      </section>

      {/* Historical Session Detail Modal */}
      {selectedSessionModal && (
        <WorkoutSessionDetailModal
          session={selectedSessionModal}
          onClose={() => setSelectedSessionModal(null)}
          onRepeatWorkout={(session) => {
            onStartRoutine(plannedRoutine);
            setSelectedSessionModal(null);
          }}
        />
      )}
    </div>
  );
};
