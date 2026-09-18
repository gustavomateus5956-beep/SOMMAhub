import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Check,
  Plus,
  Minus,
  Timer,
  Dumbbell,
  Award,
  Flame,
  Share2,
  Instagram,
  BookOpen,
  Trash2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Clock,
  History,
  MessageSquarePlus,
  ChevronDown
} from 'lucide-react';
import { Routine, Exercise, WorkoutSessionRecord, CompletedExerciseLog, CompletedSetLog, SetTypeKey } from '../types';
import { ExportCardModal, WorkoutExportData } from './ExportCardModal';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { storageService } from '../services/storageService';
import { useUser } from '../context/UserContext';
import { useWorkout } from '../context/WorkoutContext';
import { getSetTypeConfig, SetTypeIcon } from '../data/setTypes';
import { SetTypeSelectorModal } from './SetTypeSelectorModal';
import { ExerciseGuidanceSection } from './ExerciseGuidanceSection';
import { ExerciseFeedbackModal } from './ExerciseFeedbackModal';

interface ActiveWorkoutModalProps {
  routine: Routine | null;
  onClose: () => void;
  onMinimize?: () => void;
  onFinishWorkout: (summary: {
    name: string;
    durationMinutes: number;
    totalVolume: number;
    setsCompleted: number;
  }) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  routine,
  onClose,
  onMinimize,
  onFinishWorkout
}) => {
  const { user, updateUser } = useUser();
  const {
    activeSession,
    workoutStatus,
    minimizeWorkout,
    updateExercises: syncExercisesToContext,
    setRestSeconds: setContextRestSeconds,
    setIsRestPaused: setContextIsRestPaused,
    setIsTimerPaused: setContextIsTimerPaused,
    setLastActivePosition,
    discardWorkout: contextDiscardWorkout
  } = useWorkout();

  const [seconds, setSeconds] = useState(activeSession?.seconds || 0);
  const [isTimerPaused, setIsTimerPaused] = useState(activeSession?.isTimerPaused || false);
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    if (activeSession && activeSession.exercises && activeSession.exercises.length > 0) {
      return activeSession.exercises;
    }
    return [];
  });
  const [workoutName, setWorkoutName] = useState(
    activeSession?.workoutName || routine?.name || 'Treino Personalizado'
  );
  const [isFinished, setIsFinished] = useState(false);
  const [showIncompleteConfirm, setShowIncompleteConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [editingSetType, setEditingSetType] = useState<{ exIndex: number; setIndex: number } | null>(null);
  const [feedbackExercise, setFeedbackExercise] = useState<Exercise | null>(null);

  // Rest timer states
  const [restSeconds, setRestSeconds] = useState<number | null>(activeSession?.restSeconds ?? null);
  const [isRestPaused, setIsRestPaused] = useState(activeSession?.isRestPaused || false);
  const defaultRestTime = 60; // 60 seconds standard

  // Sync with global timer in WorkoutContext (keeps running when minimized!)
  useEffect(() => {
    if (activeSession) {
      setSeconds(activeSession.seconds);
      setRestSeconds(activeSession.restSeconds);
    }
  }, [activeSession?.seconds, activeSession?.restSeconds]);

  // Initialize exercises with previous performance references
  useEffect(() => {
    if (routine && routine.exercises.length > 0) {
      const cloned = JSON.parse(JSON.stringify(routine.exercises)) as Exercise[];
      // Enrich with previous exercise data if available for current user
      if (user?.id) {
        cloned.forEach((ex) => {
          const past = storageService.getLastExercisePerformance(user.id, ex.name);
          if (past && past.sets.length > 0) {
            ex.sets.forEach((set, idx) => {
              if (past.sets[idx]) {
                set.prevWeight = past.sets[idx].weight;
                set.prevReps = past.sets[idx].reps;
              }
            });
          }
        });
      }
      setExercises(cloned);
      setWorkoutName(routine.name);
    } else {
      // Empty workout initial state
      setExercises([
        {
          id: 'custom-ex-1',
          name: 'Supino Reto com Barra',
          muscleGroup: 'Peitoral',
          sets: [
            { id: 'cs1', setNumber: 1, prevWeight: 80, prevReps: 10, weight: 80, reps: 10, completed: false },
            { id: 'cs2', setNumber: 2, prevWeight: 84, prevReps: 8, weight: 84, reps: 8, completed: false },
            { id: 'cs3', setNumber: 3, prevWeight: 90, prevReps: 6, weight: 90, reps: 6, completed: false }
          ]
        }
      ]);
      setWorkoutName('Treino Livre');
    }
  }, [routine, user?.id]);

  // Main workout elapsed timer
  useEffect(() => {
    if (isTimerPaused || isFinished) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, isFinished]);

  // Rest countdown timer
  useEffect(() => {
    if (restSeconds === null || restSeconds <= 0 || isRestPaused) return;
    const interval = setInterval(() => {
      setRestSeconds((prev) => {
        if (prev === null || prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restSeconds, isRestPaused]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateExercisesAndSync = (newExercises: Exercise[]) => {
    setExercises(newExercises);
    syncExercisesToContext(newExercises);
  };

  const handleAddExerciseFromLibrary = (exercise: Exercise) => {
    // Check previous performance
    let enriched = { ...exercise };
    if (user?.id) {
      const past = storageService.getLastExercisePerformance(user.id, exercise.name);
      if (past && past.sets.length > 0) {
        enriched.sets = enriched.sets.map((s, idx) => ({
          ...s,
          prevWeight: past.sets[idx]?.weight || s.prevWeight,
          prevReps: past.sets[idx]?.reps || s.prevReps
        }));
      }
    }
    const updated = [...exercises, enriched];
    updateExercisesAndSync(updated);
    setShowExerciseLibrary(false);
  };

  const handleRemoveExercise = (exIndex: number) => {
    const updated = exercises.filter((_, idx) => idx !== exIndex);
    updateExercisesAndSync(updated);
  };

  const toggleSetComplete = (exIndex: number, setIndex: number) => {
    const updated = [...exercises];
    const currentStatus = updated[exIndex].sets[setIndex].completed;
    const nextStatus = !currentStatus;
    updated[exIndex].sets[setIndex].completed = nextStatus;
    updateExercisesAndSync(updated);
    setLastActivePosition(exIndex, setIndex);

    // If marked as complete, start rest countdown
    if (nextStatus) {
      setRestSeconds(defaultRestTime);
      setIsRestPaused(false);
      setContextRestSeconds(defaultRestTime);
      setContextIsRestPaused(false);
    }
  };

  const updateSetField = (
    exIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: number
  ) => {
    const updated = [...exercises];
    const safeValue = Math.max(0, value);
    updated[exIndex].sets[setIndex][field] = safeValue;
    updateExercisesAndSync(updated);
    setLastActivePosition(exIndex, setIndex);
  };

  const adjustSetWeight = (exIndex: number, setIndex: number, delta: number) => {
    const updated = [...exercises];
    const current = updated[exIndex].sets[setIndex].weight || 0;
    const next = Math.max(0, Math.round((current + delta) * 10) / 10);
    updated[exIndex].sets[setIndex].weight = next;
    updateExercisesAndSync(updated);
    setLastActivePosition(exIndex, setIndex);
  };

  const adjustSetReps = (exIndex: number, setIndex: number, delta: number) => {
    const updated = [...exercises];
    const current = updated[exIndex].sets[setIndex].reps || 0;
    const next = Math.max(1, current + delta);
    updated[exIndex].sets[setIndex].reps = next;
    updateExercisesAndSync(updated);
    setLastActivePosition(exIndex, setIndex);
  };

  const addSetToExercise = (exIndex: number) => {
    const updated = [...exercises];
    const prevSet = updated[exIndex].sets[updated[exIndex].sets.length - 1];
    const nextSetNumber = updated[exIndex].sets.length + 1;
    updated[exIndex].sets.push({
      id: `set-${Date.now()}-${nextSetNumber}`,
      setNumber: nextSetNumber,
      prevWeight: prevSet?.weight || 60,
      prevReps: prevSet?.reps || 10,
      weight: prevSet?.weight || 60,
      reps: prevSet?.reps || 10,
      completed: false
    });
    updateExercisesAndSync(updated);
  };

  const removeLastSet = (exIndex: number) => {
    const updated = [...exercises];
    if (updated[exIndex].sets.length > 1) {
      updated[exIndex].sets.pop();
      updateExercisesAndSync(updated);
    }
  };

  // Metrics calculation
  let totalVolume = 0;
  let totalCompletedSets = 0;
  let totalSetsCount = 0;
  let detectedPrs = 0;

  exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      totalSetsCount++;
      if (set.completed) {
        totalVolume += (set.weight || 0) * (set.reps || 0);
        totalCompletedSets++;
        if (set.prevWeight && set.weight > set.prevWeight && set.reps >= (set.prevReps || 0)) {
          detectedPrs++;
        }
      }
    });
  });

  const progressPercentage =
    totalSetsCount > 0 ? Math.round((totalCompletedSets / totalSetsCount) * 100) : 0;

  const handleFinishAttempt = () => {
    const uncompleted = totalSetsCount - totalCompletedSets;
    if (uncompleted > 0) {
      setShowIncompleteConfirm(true);
    } else {
      setIsFinished(true);
    }
  };

  const confirmFinishWorkout = () => {
    setShowIncompleteConfirm(false);
    setIsFinished(true);
  };

  const handleUpdateSetType = (type: SetTypeKey) => {
    if (!editingSetType) return;
    const { exIndex, setIndex } = editingSetType;
    const updated = [...exercises];
    const targetEx = { ...updated[exIndex] };
    const sets = [...targetEx.sets];
    sets[setIndex] = {
      ...sets[setIndex],
      type
    };
    targetEx.sets = sets;
    updated[exIndex] = targetEx;
    updateExercisesAndSync(updated);
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      minimizeWorkout();
    }
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(false);
    contextDiscardWorkout();
    onClose();
  };

  // Final persistence to user storage & Context
  const handleSaveAndExit = () => {
    const durationMinutes = Math.max(1, Math.round(seconds / 60));
    const now = new Date();

    const completedExercises: CompletedExerciseLog[] = exercises.map((ex) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscleGroup: ex.muscleGroup,
      professionalNote: ex.professionalNote,
      sets: ex.sets.map((s) => ({
        setNumber: s.setNumber,
        type: s.type || 'working',
        targetWeight: s.targetWeight,
        targetReps: s.targetReps,
        weight: s.weight,
        reps: s.reps,
        completed: s.completed,
        prevWeight: s.prevWeight,
        prevReps: s.prevReps,
        isPr: Boolean(s.prevWeight && s.weight > s.prevWeight && s.reps >= (s.prevReps || 0)),
        instruction: s.instruction
      }))
    }));

    const sessionRecord: WorkoutSessionRecord = {
      id: `workout-session-${Date.now()}`,
      userId: user?.id || 'user_lucas_default',
      routineId: routine?.id,
      routineName: workoutName,
      muscleGroups: exercises.map((e) => e.muscleGroup).slice(0, 2).join(' & '),
      startedAt: new Date(Date.now() - seconds * 1000).toISOString(),
      finishedAt: now.toISOString(),
      dateDisplay: 'Hoje',
      durationMinutes,
      durationFormatted: `${durationMinutes} min`,
      totalVolume,
      totalCompletedSets,
      totalExercises: exercises.length,
      prsCount: detectedPrs,
      exercises: completedExercises,
      notes: routine?.category ? `Categoria: ${routine.category}` : undefined
    };

    if (user?.id) {
      storageService.saveWorkoutSession(user.id, sessionRecord);
      updateUser({
        totalWorkouts: (user.totalWorkouts || 0) + 1,
        totalPrs: (user.totalPrs || 0) + detectedPrs
      });
    }

    contextDiscardWorkout();

    onFinishWorkout({
      name: workoutName,
      durationMinutes,
      totalVolume,
      setsCompleted: totalCompletedSets
    });
    onClose();
  };

  // Prepare payload for social export modal
  const exportWorkoutPayload: WorkoutExportData = {
    title: workoutName,
    duration: formatTimer(seconds),
    volume: `${totalVolume.toLocaleString()} kg`,
    exercisesCount: exercises.length,
    completedSets: totalCompletedSets,
    prsCount: detectedPrs,
    exercisesPreview: exercises.slice(0, 4).map((ex) => ({
      name: ex.name,
      detail: `${ex.sets.filter((s) => s.completed).length}/${ex.sets.length} séries • ${ex.muscleGroup}`
    }))
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end md:justify-center items-center">
      <div className="w-full max-w-[500px] h-[95vh] md:h-[90vh] bg-[#101419] border border-[#262a30] rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Top Sticky Bar: Live Timer, Progress, and Header */}
        <div className="px-4 py-3 bg-[#181c21] border-b border-[#262a30] flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            {/* Dedicated Minimize Button (Hevy-inspired UX) */}
            <button
              type="button"
              onClick={handleMinimize}
              aria-label="Minimizar treino para segundo plano"
              className="w-8 h-8 rounded-full bg-[#101419] hover:bg-[#262a30] border border-[#262a30] flex items-center justify-center text-[#c2c6d8] hover:text-white transition-colors cursor-pointer"
              title="Minimizar treino (continuar navegando no app)"
            >
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !isTimerPaused;
                setIsTimerPaused(next);
                setContextIsTimerPaused(next);
              }}
              className="flex items-center gap-1.5 bg-[#101419] hover:bg-[#262a30] px-3 py-1.5 rounded-full border border-[#262a30] transition-colors cursor-pointer"
              title={isTimerPaused ? 'Retomar cronômetro' : 'Pausar cronômetro'}
            >
              {isTimerPaused ? (
                <Play className="w-3.5 h-3.5 text-[#ffb59d] fill-[#ffb59d]" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              )}
              <span className="font-mono font-bold text-sm tracking-wider text-white tabular-nums">
                {formatTimer(seconds)}
              </span>
            </button>
            <span className="text-xs text-[#8c90a1] font-semibold hidden sm:inline">
              {isTimerPaused ? '(Pausado)' : 'Treino Ao Vivo'}
            </span>
          </div>

          {/* Quick Progress Badge */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-bold text-white tabular-nums">
                {totalCompletedSets}/{totalSetsCount} séries
              </span>
              <span className="text-[9px] text-[#4edea3] font-bold">
                {progressPercentage}% concluído
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowDiscardConfirm(true)}
              aria-label="Sair ou descartar treino"
              className="w-8 h-8 rounded-full bg-[#262a30] hover:bg-[#31353b] flex items-center justify-center text-[#c2c6d8] transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Progress Bar Ribbon */}
        <div className="w-full bg-[#181c21] h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0066ff] via-[#4edea3] to-[#4edea3] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Rest Timer Floating Bar (Sticky below header when active) */}
        {restSeconds !== null && (
          <div className="bg-[#0066ff]/15 border-b border-[#0066ff]/40 px-4 py-2.5 flex items-center justify-between z-10 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[#0066ff] animate-spin" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b3c5ff]">
                  Descanso entre Séries
                </span>
                <span className="font-mono text-base font-extrabold text-white tabular-nums leading-none">
                  {formatTimer(restSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRestSeconds((prev) => (prev ? prev + 30 : 30))}
                className="px-2 py-1 bg-[#262a30] hover:bg-[#31353b] rounded-lg text-[11px] font-bold text-[#b3c5ff] cursor-pointer"
              >
                +30s
              </button>
              <button
                type="button"
                onClick={() => setRestSeconds((prev) => (prev && prev > 15 ? prev - 15 : null))}
                className="px-2 py-1 bg-[#262a30] hover:bg-[#31353b] rounded-lg text-[11px] font-bold text-[#8c90a1] cursor-pointer"
              >
                -15s
              </button>
              <button
                type="button"
                onClick={() => setIsRestPaused(!isRestPaused)}
                className="p-1 bg-[#262a30] hover:bg-[#31353b] rounded-lg text-white cursor-pointer"
              >
                {isRestPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setRestSeconds(null)}
                className="px-2.5 py-1 bg-[#0066ff] hover:bg-[#0054d6] text-white rounded-lg text-[11px] font-bold cursor-pointer"
              >
                Pular
              </button>
            </div>
          </div>
        )}

        {/* Workout Sub-Header: Title & Summary Counters */}
        <div className="px-4 py-2.5 bg-[#12171f] border-b border-[#262a30]/60 flex items-center justify-between shrink-0">
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="text-base font-bold text-white bg-transparent border-none outline-none max-w-[240px] truncate focus:bg-[#181c21] focus:px-2 rounded transition-all"
            title="Clique para editar o título do treino"
          />

          <div className="flex items-center gap-3 text-xs text-[#8c90a1]">
            <span className="font-semibold text-white">{exercises.length} ex</span>
            <span>•</span>
            <span className="font-bold text-[#4edea3] tabular-nums">
              {totalVolume.toLocaleString()} kg
            </span>
            {detectedPrs > 0 && (
              <span className="flex items-center gap-1 text-[#ffb59d] font-bold">
                <Award className="w-3.5 h-3.5" />
                {detectedPrs} PR
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Exercises & Sets Area (Hevy-style Cards) */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar">
          {exercises.map((exercise, exIndex) => (
            <div
              key={exercise.id || `ex-${exIndex}`}
              className="bg-[#1c2025] rounded-2xl p-3.5 border border-[#262a30] shadow-sm flex flex-col gap-3"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#0066ff]/20 text-[#0066ff] text-xs font-black flex items-center justify-center">
                      {exIndex + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                      {exercise.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8c90a1] pl-7">
                    <span>{exercise.muscleGroup}</span>
                    {exercise.equipment && (
                      <>
                        <span>•</span>
                        <span className="text-[#b3c5ff]">{exercise.equipment}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFeedbackExercise(exercise)}
                    className="px-2 py-1.5 rounded-lg bg-[#0066ff]/15 hover:bg-[#0066ff]/25 text-[#b3c5ff] hover:text-white text-xs font-bold flex items-center gap-1 transition-colors border border-[#0066ff]/30 cursor-pointer"
                    title="Tirar dúvida com o professor ou postar no feed"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5 text-[#0066ff]" />
                    <span className="hidden sm:inline">Dúvida / Feed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRestSeconds(defaultRestTime);
                      setIsRestPaused(false);
                    }}
                    title="Iniciar cronômetro de descanso para este exercício"
                    className="p-1.5 rounded-lg bg-[#262a30] hover:bg-[#31353b] text-[#b3c5ff] transition-colors cursor-pointer"
                  >
                    <Timer className="w-4 h-4" />
                  </button>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exIndex)}
                      aria-label="Remover exercício"
                      className="p-1.5 rounded-lg bg-[#262a30] hover:bg-[#31353b] text-[#8c90a1] hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Professional Guidance & Step-by-Step Instructions (Kept cleanly on top) */}
              <ExerciseGuidanceSection
                exercise={exercise}
                onOpenFeedback={() => setFeedbackExercise(exercise)}
              />

              {/* Sets Table Header */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-[#8c90a1] uppercase px-1 pb-0.5">
                  <span className="col-span-2 text-center">SÉRIE</span>
                  <span className="col-span-3 text-center">ALVO / ANT.</span>
                  <span className="col-span-3 text-center">CARGA (KG)</span>
                  <span className="col-span-2 text-center">REPS</span>
                  <span className="col-span-2 text-center">CHECK</span>
                </div>

                {/* Set Rows: Only icon + number without bottom description text */}
                {exercise.sets.map((set, setIndex) => {
                  const setTypeConfig = getSetTypeConfig(set.type);
                  const isSpecialType = set.type && set.type !== 'working';

                  return (
                    <div
                      key={set.id || `set-${setIndex}`}
                      className={`grid grid-cols-12 gap-1 items-center p-1.5 rounded-xl transition-colors ${
                        set.completed
                          ? 'bg-[#00a572]/15 border border-[#00a572]/40'
                          : 'bg-[#14181f] border border-[#262a30]/60'
                      }`}
                    >
                      {/* Set Type Icon & Number */}
                      <div className="col-span-2 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setEditingSetType({ exIndex, setIndex })}
                          className={`min-w-[42px] h-8 px-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                            isSpecialType
                              ? `${setTypeConfig.badgeBg} ${setTypeConfig.badgeBorder} ${setTypeConfig.badgeText}`
                              : 'bg-[#101419] border-[#262a30] text-[#c2c6d8] hover:border-[#0066ff]'
                          }`}
                          title={`Tipo: ${setTypeConfig.name}. Toque para alterar.`}
                        >
                          <SetTypeIcon type={set.type} className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs font-bold tabular-nums">{set.setNumber}</span>
                        </button>
                      </div>

                      {/* Target / Previous Metric */}
                      <div className="col-span-3 flex flex-col items-center justify-center text-center">
                        {set.targetWeight || set.targetReps ? (
                          <span className="text-xs font-semibold text-[#c2c6d8] tabular-nums truncate px-0.5">
                            {set.targetWeight ? `${set.targetWeight}k` : ''}{set.targetReps ? ` × ${set.targetReps}` : ''}
                          </span>
                        ) : set.prevWeight ? (
                          <span className="text-xs text-[#8c90a1] tabular-nums truncate px-0.5">
                            {set.prevWeight}k × {set.prevReps}
                          </span>
                        ) : (
                          <span className="text-xs text-[#64748b]">-</span>
                        )}
                        {set.completed && set.prevWeight && set.weight > set.prevWeight && (
                          <span className="text-[9px] font-black text-[#ffb59d]">NOVO PR</span>
                        )}
                      </div>

                      {/* Weight (Kg) Input with Quick Stepper */}
                      <div className="col-span-3 flex items-center bg-[#101419] rounded-lg border border-[#262a30] px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => adjustSetWeight(exIndex, setIndex, -2.5)}
                          className="w-5 h-7 text-[#8c90a1] hover:text-white flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          value={set.weight}
                          onChange={(e) =>
                            updateSetField(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)
                          }
                          className="w-full text-center bg-transparent text-xs font-bold text-white tabular-nums outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => adjustSetWeight(exIndex, setIndex, 2.5)}
                          className="w-5 h-7 text-[#8c90a1] hover:text-white flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Reps Input with Quick Stepper */}
                      <div className="col-span-2 flex items-center bg-[#101419] rounded-lg border border-[#262a30] px-0.5 py-0.5">
                        <input
                          type="number"
                          min="1"
                          value={set.reps}
                          onChange={(e) =>
                            updateSetField(exIndex, setIndex, 'reps', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-full text-center bg-transparent text-xs font-bold text-white tabular-nums outline-none"
                        />
                      </div>

                      {/* Check / Complete Button */}
                      <div className="col-span-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => toggleSetComplete(exIndex, setIndex)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            set.completed
                              ? 'bg-[#10b981] text-white shadow-md shadow-[#10b981]/25 scale-105'
                              : 'bg-[#262a30] hover:bg-[#31353b] text-[#8c90a1]'
                          }`}
                          title={set.completed ? 'Marcar como não feita' : 'Concluir série'}
                        >
                          <Check className={`w-5 h-5 ${set.completed ? 'stroke-[3]' : 'stroke-[2]'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Set Actions: Add Set or Remove Set */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => addSetToExercise(exIndex)}
                  className="flex-1 py-2 rounded-xl border border-dashed border-[#262a30] hover:border-[#0066ff] text-xs font-bold text-[#b3c5ff] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-[#14181f]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Série</span>
                </button>

                {exercise.sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLastSet(exIndex)}
                    className="px-3 py-2 rounded-xl border border-dashed border-[#262a30] hover:border-red-500/50 text-[11px] font-semibold text-[#8c90a1] hover:text-red-400 transition-colors cursor-pointer"
                    title="Remover última série"
                  >
                    Remover Série
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add Exercise from SOMMA Library */}
          <button
            type="button"
            onClick={() => setShowExerciseLibrary(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#14181f] hover:bg-[#1c2025] border border-dashed border-[#262a30] hover:border-[#0066ff] text-[#0066ff] hover:text-[#b3c5ff] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Adicionar Exercício da Biblioteca SOMMA</span>
          </button>
        </div>

        {/* Bottom CTA Bar */}
        <div className="p-4 bg-[#181c21] border-t border-[#262a30] flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowDiscardConfirm(true)}
            className="h-12 px-4 rounded-xl bg-[#262a30] hover:bg-[#31353b] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Pausar / Sair
          </button>
          <button
            type="button"
            onClick={handleFinishAttempt}
            className="flex-1 h-12 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] active:scale-[0.98] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0066ff]/20 transition-all cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Finalizar Treino</span>
          </button>
        </div>

        {/* Confirmation Modal for Incomplete Sets */}
        {showIncompleteConfirm && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#1c2025] border border-[#262a30] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Séries ainda pendentes</h4>
                  <p className="text-xs text-[#8c90a1] mt-0.5">
                    Você tem {totalSetsCount - totalCompletedSets} série(s) não marcadas.
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#c2c6d8] leading-relaxed">
                Deseja salvar o treino com o volume concluído até agora ou continuar executando as séries?
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowIncompleteConfirm(false)}
                  className="flex-1 h-10 rounded-xl bg-[#262a30] hover:bg-[#31353b] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Continuar Treinando
                </button>
                <button
                  type="button"
                  onClick={confirmFinishWorkout}
                  className="flex-1 h-10 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Finalizar Assim Mesmo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Discard / Pause */}
        {showDiscardConfirm && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#1c2025] border border-[#262a30] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">
              <h4 className="text-base font-bold text-white">Pausar ou Sair do Treino</h4>
              <p className="text-xs text-[#8c90a1] leading-relaxed">
                Você pode minimizar a sessão para conferir a dieta e retornar, ou descartar esta sessão.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    handleMinimize();
                  }}
                  className="w-full h-11 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  <span>Minimizar (Continuar em Segundo Plano)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="w-full h-11 rounded-xl bg-[#262a30] hover:bg-red-500/20 hover:text-red-400 text-[#8c90a1] text-xs font-bold transition-colors cursor-pointer"
                >
                  Descartar Treino
                </button>
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="w-full py-2 text-xs text-[#8c90a1] hover:text-white transition-colors cursor-pointer text-center"
                >
                  Voltar para o treino
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Celebratory Finish Summary Screen (Hevy-inspired UX) */}
        {isFinished && (
          <div className="absolute inset-0 bg-black/92 backdrop-blur-md z-50 flex flex-col items-center justify-between p-6 text-center animate-in zoom-in-95 duration-200 overflow-y-auto no-scrollbar">
            <div className="w-full flex flex-col items-center pt-4">
              <div className="w-16 h-16 rounded-full bg-[#10b981]/20 border border-[#10b981] flex items-center justify-center text-[#10b981] mb-3 shadow-lg shadow-[#10b981]/20 animate-bounce">
                <Award className="w-8 h-8" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-[#4edea3]">
                Consistência Registrada
              </span>
              <h3 className="text-2xl font-black text-white mt-1">{workoutName}</h3>
              <p className="text-xs text-[#8c90a1] mt-1 max-w-xs leading-relaxed">
                Treino finalizado com sucesso e salvo no seu perfil SOMMA Hub.
              </p>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-md my-5">
                <div className="bg-[#181c21] p-3 rounded-2xl border border-[#262a30] flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#8c90a1] uppercase">Duração</span>
                  <span className="text-base font-black text-white mt-0.5">
                    {formatTimer(seconds)}
                  </span>
                </div>

                <div className="bg-[#181c21] p-3 rounded-2xl border border-[#262a30] flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#8c90a1] uppercase">Volume Total</span>
                  <span className="text-base font-black text-[#4edea3] mt-0.5 tabular-nums">
                    {totalVolume.toLocaleString()} kg
                  </span>
                </div>

                <div className="bg-[#181c21] p-3 rounded-2xl border border-[#262a30] flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#8c90a1] uppercase">Séries Concluídas</span>
                  <span className="text-base font-black text-[#b3c5ff] mt-0.5">
                    {totalCompletedSets}
                  </span>
                </div>

                <div className="bg-[#181c21] p-3 rounded-2xl border border-[#262a30] flex flex-col items-center">
                  <span className="text-[10px] font-bold text-[#8c90a1] uppercase">Recordes (PR)</span>
                  <span className="text-base font-black text-[#ffb59d] mt-0.5 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    {detectedPrs}
                  </span>
                </div>
              </div>

              {/* Exercise Summary Preview */}
              <div className="w-full max-w-md bg-[#181c21] rounded-2xl p-4 border border-[#262a30] text-left mb-4">
                <span className="text-xs font-bold text-white block mb-2">Exercícios Executados</span>
                <div className="space-y-2">
                  {exercises.map((ex, idx) => (
                    <div
                      key={`fin-${idx}`}
                      className="flex items-center justify-between text-xs py-1 border-b border-[#262a30]/50 last:border-0"
                    >
                      <span className="font-semibold text-[#c2c6d8] truncate pr-2">{ex.name}</span>
                      <span className="text-[11px] text-[#4edea3] font-bold shrink-0">
                        {ex.sets.filter((s) => s.completed).length}/{ex.sets.length} séries
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full max-w-md pb-4">
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>Compartilhar & Salvar Imagem</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndExit}
                className="w-full h-12 rounded-2xl bg-[#0066ff] hover:bg-[#0054d6] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Salvar Treino no SOMMA</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Social Export Modal */}
      {showExportModal && (
        <ExportCardModal
          workoutData={exportWorkoutPayload}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* In-Workout Exercise Library Modal */}
      {showExerciseLibrary && (
        <ExerciseLibraryModal
          title="Adicionar Exercício ao Treino"
          onClose={() => setShowExerciseLibrary(false)}
          onAddExercise={handleAddExerciseFromLibrary}
        />
      )}

      {/* Set Type Selector Modal (Clean & Explanatory) */}
      {editingSetType && (
        <SetTypeSelectorModal
          setNumber={exercises[editingSetType.exIndex]?.sets[editingSetType.setIndex]?.setNumber || 1}
          currentType={exercises[editingSetType.exIndex]?.sets[editingSetType.setIndex]?.type || 'working'}
          exerciseName={exercises[editingSetType.exIndex]?.name || 'Exercício'}
          onClose={() => setEditingSetType(null)}
          onSelectType={handleUpdateSetType}
        />
      )}

      {/* Exercise Feedback & Question Modal (Teacher & Feed) */}
      {feedbackExercise && (
        <ExerciseFeedbackModal
          exercise={feedbackExercise}
          routineName={workoutName}
          currentWeight={feedbackExercise.sets.find((s) => s.completed && s.weight > 0)?.weight || feedbackExercise.sets[0]?.weight}
          currentReps={feedbackExercise.sets.find((s) => s.completed && s.reps > 0)?.reps || feedbackExercise.sets[0]?.reps}
          onClose={() => setFeedbackExercise(null)}
          onSendMessageToCoach={(msg) => {
            // Save to messages/notifications if needed
            try {
              const existingNotifs = JSON.parse(localStorage.getItem('somma_coach_queries') || '[]');
              existingNotifs.unshift({
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                ...msg
              });
              localStorage.setItem('somma_coach_queries', JSON.stringify(existingNotifs));
            } catch (e) {
              console.error(e);
            }
          }}
          onPostToFeed={(post) => {
            try {
              const existingPosts = JSON.parse(localStorage.getItem('somma_community_posts') || '[]');
              existingPosts.unshift({
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                likes: 1,
                comments: 0,
                ...post
              });
              localStorage.setItem('somma_community_posts', JSON.stringify(existingPosts));
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}
    </div>
  );
};
