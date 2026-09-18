import React, { useState } from 'react';
import { 
  Dumbbell, 
  Ruler, 
  History, 
  Calendar, 
  TrendingUp, 
  Award, 
  ChevronDown, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  Scale, 
  Flame, 
  Filter, 
  Check, 
  Info,
  Layers,
  Activity
} from 'lucide-react';

interface LoadProgressionItem {
  id: string;
  exercise: string;
  category: 'peito' | 'costas' | 'pernas' | 'ombros';
  categoryLabel: string;
  initialWeight: number; // kg
  currentPr: number; // kg (1RM)
  repsAtPr: number;
  lastPrDate: string;
  workingSet: string;
  workingWeight: number;
  rpe: number;
  status: 'progressao' | 'consolidando' | 'teste_favoravel';
  statusLabel: string;
  history: {
    date: string;
    weight: number;
    reps: number;
    estimated1RM: number;
    rpe: number;
    diffKg: string;
  }[];
}

interface BodyMeasurement {
  id: string;
  region: 'superior' | 'tronco' | 'inferior';
  regionLabel: string;
  name: string;
  currentCm: number;
  previousCm: number;
  deltaCm: number;
  lastUpdated: string;
}

interface WeightLog {
  id: string;
  date: string;
  weight: number;
  bodyFatPercentage: number;
  note?: string;
}

export const EvolutionView: React.FC = () => {
  // Top Navigation Tabs: Strictly ONE concise word per option as requested
  const [activeTab, setActiveTab] = useState<'cargas' | 'medidas' | 'historico'>('cargas');

  // Load progression state
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'peito' | 'costas' | 'pernas'>('todos');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('supino-reto');
  const [showLogPrModal, setShowLogPrModal] = useState(false);
  const [logExerciseId, setLogExerciseId] = useState('supino-reto');
  const [newWeight, setNewWeight] = useState('');
  const [newReps, setNewReps] = useState('1');
  const [newRpe, setNewRpe] = useState('9.5');

  // Body measurements state
  const [measurementFilter, setMeasurementFilter] = useState<'todos' | 'superior' | 'tronco' | 'inferior'>('todos');
  const [showLogWeightModal, setShowLogWeightModal] = useState(false);
  const [inputWeight, setInputWeight] = useState('82.4');
  const [inputBf, setInputBf] = useState('14.8');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Main Load Progression Dataset
  const [progressionList, setProgressionList] = useState<LoadProgressionItem[]>([
    {
      id: 'supino-reto',
      exercise: 'Supino Reto com Barra',
      category: 'peito',
      categoryLabel: 'Peitoral & Tríceps',
      initialWeight: 80,
      currentPr: 100,
      repsAtPr: 3,
      lastPrDate: 'Ontem',
      workingSet: '4x 6-8 @ 90kg',
      workingWeight: 90,
      rpe: 9.0,
      status: 'teste_favoravel',
      statusLabel: 'Teste Favorável (105kg)',
      history: [
        { date: 'Ontem', weight: 100, reps: 3, estimated1RM: 107, rpe: 9.5, diffKg: '+4 kg' },
        { date: '19 Out', weight: 96, reps: 4, estimated1RM: 105, rpe: 9.0, diffKg: '+4 kg' },
        { date: '12 Out', weight: 92, reps: 5, estimated1RM: 103, rpe: 8.5, diffKg: '+2 kg' },
        { date: '05 Out', weight: 90, reps: 6, estimated1RM: 102, rpe: 8.5, diffKg: '+5 kg' },
        { date: '15 Ago', weight: 80, reps: 6, estimated1RM: 91, rpe: 8.0, diffKg: 'Base' }
      ]
    },
    {
      id: 'agachamento-livre',
      exercise: 'Agachamento Livre',
      category: 'pernas',
      categoryLabel: 'Quadríceps & Glúteos',
      initialWeight: 115,
      currentPr: 140,
      repsAtPr: 3,
      lastPrDate: 'Há 5 dias',
      workingSet: '4x 5 @ 125kg',
      workingWeight: 125,
      rpe: 8.5,
      status: 'progressao',
      statusLabel: 'Em Sobrecarga Ativa',
      history: [
        { date: 'Há 5 dias', weight: 140, reps: 3, estimated1RM: 150, rpe: 9.0, diffKg: '+10 kg' },
        { date: '16 Out', weight: 130, reps: 4, estimated1RM: 142, rpe: 8.5, diffKg: '+5 kg' },
        { date: '08 Out', weight: 125, reps: 5, estimated1RM: 140, rpe: 8.0, diffKg: '+5 kg' },
        { date: '15 Ago', weight: 115, reps: 6, estimated1RM: 131, rpe: 8.0, diffKg: 'Base' }
      ]
    },
    {
      id: 'levantamento-terra',
      exercise: 'Levantamento Terra Convencional',
      category: 'costas',
      categoryLabel: 'Cadeia Posterior & Lombar',
      initialWeight: 135,
      currentPr: 160,
      repsAtPr: 2,
      lastPrDate: 'Há 12 dias',
      workingSet: '3x 4 @ 145kg',
      workingWeight: 145,
      rpe: 9.0,
      status: 'consolidando',
      statusLabel: 'Consolidando Carga',
      history: [
        { date: 'Há 12 dias', weight: 160, reps: 2, estimated1RM: 168, rpe: 9.5, diffKg: '+5 kg' },
        { date: '11 Out', weight: 155, reps: 3, estimated1RM: 166, rpe: 9.0, diffKg: '+5 kg' },
        { date: '28 Set', weight: 150, reps: 4, estimated1RM: 165, rpe: 8.5, diffKg: '+5 kg' },
        { date: '15 Ago', weight: 135, reps: 5, estimated1RM: 152, rpe: 8.0, diffKg: 'Base' }
      ]
    },
    {
      id: 'desenvolvimento-militar',
      exercise: 'Desenvolvimento Militar com Barra',
      category: 'ombros',
      categoryLabel: 'Deltóides & Core',
      initialWeight: 45,
      currentPr: 62,
      repsAtPr: 4,
      lastPrDate: 'Há 8 dias',
      workingSet: '4x 6 @ 54kg',
      workingWeight: 54,
      rpe: 8.5,
      status: 'progressao',
      statusLabel: 'Em Sobrecarga Ativa',
      history: [
        { date: 'Há 8 dias', weight: 62, reps: 4, estimated1RM: 68, rpe: 9.0, diffKg: '+4 kg' },
        { date: '14 Out', weight: 58, reps: 5, estimated1RM: 65, rpe: 8.5, diffKg: '+4 kg' },
        { date: '29 Set', weight: 54, reps: 6, estimated1RM: 62, rpe: 8.0, diffKg: '+4 kg' },
        { date: '15 Ago', weight: 45, reps: 6, estimated1RM: 51, rpe: 8.0, diffKg: 'Base' }
      ]
    },
    {
      id: 'barra-fixa-lastro',
      exercise: 'Barra Fixa com Sobrecarga (Pull-up)',
      category: 'costas',
      categoryLabel: 'Dorsais & Bíceps',
      initialWeight: 10,
      currentPr: 22,
      repsAtPr: 4,
      lastPrDate: 'Há 15 dias',
      workingSet: '3x 5 @ +16kg',
      workingWeight: 16,
      rpe: 8.5,
      status: 'progressao',
      statusLabel: 'Em Sobrecarga Ativa',
      history: [
        { date: 'Há 15 dias', weight: 22, reps: 4, estimated1RM: 24, rpe: 9.0, diffKg: '+4 kg' },
        { date: '06 Out', weight: 18, reps: 5, estimated1RM: 20, rpe: 8.5, diffKg: '+3 kg' },
        { date: '20 Set', weight: 15, reps: 6, estimated1RM: 17, rpe: 8.0, diffKg: '+5 kg' },
        { date: '15 Ago', weight: 10, reps: 6, estimated1RM: 11, rpe: 8.0, diffKg: 'Base' }
      ]
    }
  ]);

  // Body measurements dataset
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([
    { id: 'm1', region: 'superior', regionLabel: 'Superiores', name: 'Braço Direito (Contraído)', currentCm: 40.5, previousCm: 39.5, deltaCm: 1.0, lastUpdated: '22 Out' },
    { id: 'm2', region: 'superior', regionLabel: 'Superiores', name: 'Braço Esquerdo (Contraído)', currentCm: 40.2, previousCm: 39.2, deltaCm: 1.0, lastUpdated: '22 Out' },
    { id: 'm3', region: 'superior', regionLabel: 'Superiores', name: 'Tórax / Peitoral', currentCm: 108.0, previousCm: 106.0, deltaCm: 2.0, lastUpdated: '22 Out' },
    { id: 'm4', region: 'superior', regionLabel: 'Superiores', name: 'Ombros (Circunferência)', currentCm: 124.0, previousCm: 122.5, deltaCm: 1.5, lastUpdated: '22 Out' },
    { id: 'm5', region: 'tronco', regionLabel: 'Tronco & Core', name: 'Cintura (Linha Umbilical)', currentCm: 81.0, previousCm: 83.0, deltaCm: -2.0, lastUpdated: '22 Out' },
    { id: 'm6', region: 'tronco', regionLabel: 'Tronco & Core', name: 'Quadril / Glúteos', currentCm: 101.5, previousCm: 100.5, deltaCm: 1.0, lastUpdated: '22 Out' },
    { id: 'm7', region: 'inferior', regionLabel: 'Inferiores', name: 'Coxa Direita', currentCm: 61.5, previousCm: 60.0, deltaCm: 1.5, lastUpdated: '22 Out' },
    { id: 'm8', region: 'inferior', regionLabel: 'Inferiores', name: 'Coxa Esquerda', currentCm: 61.2, previousCm: 59.8, deltaCm: 1.4, lastUpdated: '22 Out' },
    { id: 'm9', region: 'inferior', regionLabel: 'Inferiores', name: 'Panturrilha Direita', currentCm: 38.5, previousCm: 38.0, deltaCm: 0.5, lastUpdated: '22 Out' },
    { id: 'm10', region: 'inferior', regionLabel: 'Inferiores', name: 'Panturrilha Esquerda', currentCm: 38.5, previousCm: 38.0, deltaCm: 0.5, lastUpdated: '22 Out' }
  ]);

  // Weight history timeline
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>([
    { id: 'w1', date: '24 Out (Hoje)', weight: 82.4, bodyFatPercentage: 14.8, note: 'Pós-treino de Peito em jejum' },
    { id: 'w2', date: '17 Out', weight: 82.7, bodyFatPercentage: 15.0, note: 'Manutenção de carboidratos' },
    { id: 'w3', date: '10 Out', weight: 83.1, bodyFatPercentage: 15.2, note: 'Ajuste de macros com a Dra. Camila' },
    { id: 'w4', date: '03 Out', weight: 83.6, bodyFatPercentage: 15.6, note: 'Início da nova periodização' },
    { id: 'w5', date: '26 Set', weight: 84.0, bodyFatPercentage: 16.0, note: 'Avaliação física inicial' }
  ]);

  const activeExercise = progressionList.find((p) => p.id === selectedExerciseId) || progressionList[0];

  // Filtering for Load Progression Table
  const filteredProgression = progressionList.filter((item) => {
    if (selectedCategory === 'todos') return true;
    return item.category === selectedCategory;
  });

  // Filtering for Measurements Table
  const filteredMeasurements = measurements.filter((m) => {
    if (measurementFilter === 'todos') return true;
    return m.region === measurementFilter;
  });

  // Handle logging a new PR / 1RM
  const handleSavePr = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeight);
    const repsNum = parseInt(newReps, 10) || 1;
    const rpeNum = parseFloat(newRpe) || 9.5;

    if (isNaN(weightNum) || weightNum <= 0) {
      showToast('Por favor, insira uma carga válida em kg.');
      return;
    }

    // Epley formula for estimated 1RM: Weight * (1 + Reps / 30)
    const estimated1RM = repsNum === 1 ? weightNum : Math.round(weightNum * (1 + repsNum / 30));

    setProgressionList((prev) =>
      prev.map((item) => {
        if (item.id === logExerciseId) {
          const diffKg = `+${Math.max(0, weightNum - item.currentPr)} kg`;
          const newHistoryItem = {
            date: 'Hoje',
            weight: weightNum,
            reps: repsNum,
            estimated1RM,
            rpe: rpeNum,
            diffKg: diffKg === '+0 kg' ? 'Recorde Igualado' : diffKg
          };

          return {
            ...item,
            currentPr: Math.max(item.currentPr, weightNum),
            repsAtPr: repsNum,
            lastPrDate: 'Hoje',
            rpe: rpeNum,
            history: [newHistoryItem, ...item.history]
          };
        }
        return item;
      })
    );

    setShowLogPrModal(false);
    setNewWeight('');
    showToast(`Novo teste de ${weightNum}kg registrado com sucesso na tabela de progressão!`);
  };

  // Handle logging a new weight & body fat entry
  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const wNum = parseFloat(inputWeight);
    const bfNum = parseFloat(inputBf);

    if (isNaN(wNum) || wNum <= 0) {
      showToast('Insira um peso válido.');
      return;
    }

    const newLog: WeightLog = {
      id: `w-${Date.now()}`,
      date: 'Hoje',
      weight: wNum,
      bodyFatPercentage: !isNaN(bfNum) ? bfNum : 14.8,
      note: 'Pesagem matinal atualizada'
    };

    setWeightHistory([newLog, ...weightHistory]);
    setShowLogWeightModal(false);
    showToast(`Peso de ${wNum} kg e ${bfNum}% BF atualizados no histórico!`);
  };

  return (
    <div className="flex flex-col w-full pb-24 md:pb-12 gap-5">
      
      {/* Segmented Control Tabs: Strictly ONE concise word per option as requested */}
      <div className="w-full bg-[#181c21] p-1.5 rounded-2xl flex items-center border border-[#262a30] shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('cargas')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'cargas'
              ? 'bg-[#0066ff] text-white shadow-md'
              : 'text-[#8c90a1] hover:text-white'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Cargas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('medidas')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'medidas'
              ? 'bg-[#0066ff] text-white shadow-md'
              : 'text-[#8c90a1] hover:text-white'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>Medidas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historico')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'historico'
              ? 'bg-[#0066ff] text-white shadow-md'
              : 'text-[#8c90a1] hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico</span>
        </button>
      </div>

      {/* TAB 1: CARGAS (TABELA DE PROGRESSÃO DE CARGAS & DETALHES) */}
      {activeTab === 'cargas' && (
        <>
          {/* Summary KPIs: Global Strength & Volume */}
          <div className="bg-gradient-to-br from-[#1c2025] to-[#14181f] rounded-2xl p-4 md:p-5 border border-[#262a30] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0066ff]" />
                <span className="text-sm font-bold text-white">Balanço de Sobrecarga Progressiva</span>
              </div>
              <span className="text-[11px] bg-[#00a572]/20 text-[#4edea3] font-bold px-2.5 py-0.5 rounded-full border border-[#4edea3]/30">
                +18.4% de Carga Média
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-[#181c21] p-3 rounded-xl border border-[#262a30]/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#8c90a1] uppercase tracking-wider">
                  Volume Total
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-extrabold text-[#b3c5ff]">42.8t</span>
                  <span className="text-[10px] text-[#4edea3] font-bold">+3.2t</span>
                </div>
              </div>

              <div className="bg-[#181c21] p-3 rounded-xl border border-[#262a30]/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#8c90a1] uppercase tracking-wider">
                  Recordes (PRs)
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-extrabold text-white">12</span>
                  <span className="text-[10px] text-[#ffb59d] font-bold">ativos</span>
                </div>
              </div>

              <div className="bg-[#181c21] p-3 rounded-xl border border-[#262a30]/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[#8c90a1] uppercase tracking-wider">
                  RPE Médio
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-extrabold text-[#4edea3]">8.7</span>
                  <span className="text-[10px] text-[#8c90a1]">/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN SECTION: ORGANIZED LOAD PROGRESSION TABLE */}
          <div className="bg-[#1c2025] rounded-2xl p-4 md:p-5 border border-[#262a30] shadow-sm flex flex-col gap-4">
            
            {/* Header & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0066ff]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Tabela de Progressão de Carga
                  </h2>
                </div>
                <p className="text-xs text-[#8c90a1] mt-0.5">
                  Evolução comparativa de cargas máximas (1RM) e séries de trabalho.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLogExerciseId(selectedExerciseId);
                  setShowLogPrModal(true);
                }}
                className="h-9 px-3.5 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Teste (1RM)</span>
              </button>
            </div>

            {/* Muscle Group Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('todos')}
                className={`h-7 px-3 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'todos'
                    ? 'bg-[#0066ff] text-white'
                    : 'bg-[#181c21] text-[#8c90a1] hover:text-white border border-[#262a30]'
                }`}
              >
                Todos os Movimentos
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('peito')}
                className={`h-7 px-3 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'peito'
                    ? 'bg-[#0066ff] text-white'
                    : 'bg-[#181c21] text-[#8c90a1] hover:text-white border border-[#262a30]'
                }`}
              >
                Peitoral & Tríceps
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('pernas')}
                className={`h-7 px-3 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'pernas'
                    ? 'bg-[#0066ff] text-white'
                    : 'bg-[#181c21] text-[#8c90a1] hover:text-white border border-[#262a30]'
                }`}
              >
                Pernas & Quadríceps
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('costas')}
                className={`h-7 px-3 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'costas'
                    ? 'bg-[#0066ff] text-white'
                    : 'bg-[#181c21] text-[#8c90a1] hover:text-white border border-[#262a30]'
                }`}
              >
                Costas & Posteriores
              </button>
            </div>

            {/* Structured Table */}
            <div className="w-full bg-[#181c21] rounded-xl overflow-hidden border border-[#262a30]/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#262a30] bg-[#14181f] text-[11px] font-bold text-[#8c90a1]">
                      <th className="py-2.5 px-3.5">EXERCÍCIO</th>
                      <th className="py-2.5 px-3 text-center">CARGA BASE</th>
                      <th className="py-2.5 px-3 text-center">1RM ATUAL (PR)</th>
                      <th className="py-2.5 px-3 text-center">PROGRESSÃO</th>
                      <th className="py-2.5 px-3 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262a30]/50 text-xs">
                    {filteredProgression.map((item) => {
                      const deltaKg = item.currentPr - item.initialWeight;
                      const deltaPct = Math.round((deltaKg / item.initialWeight) * 100);
                      const isSelected = item.id === selectedExerciseId;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedExerciseId(item.id)}
                          className={`hover:bg-[#20252d] transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#0066ff]/10 border-l-2 border-l-[#0066ff]' : ''
                          }`}
                        >
                          <td className="py-3 px-3.5">
                            <div className="flex flex-col">
                              <span className={`font-bold ${isSelected ? 'text-[#0066ff]' : 'text-white'}`}>
                                {item.exercise}
                              </span>
                              <span className="text-[10px] text-[#8c90a1]">
                                {item.categoryLabel} • {item.workingSet}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center text-[#8c90a1] font-medium">
                            {item.initialWeight} kg
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-extrabold text-white text-sm">
                                {item.currentPr} kg
                              </span>
                              <span className="text-[10px] text-[#8c90a1]">
                                {item.repsAtPr} reps • {item.lastPrDate}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#4edea3] bg-[#00a572]/15 px-2 py-0.5 rounded-md">
                              <ArrowUpRight className="w-3 h-3" />
                              +{deltaKg} kg (+{deltaPct}%)
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block ${
                              item.status === 'teste_favoravel'
                                ? 'bg-[#ffb59d]/15 text-[#ffb59d] border border-[#ffb59d]/30'
                                : item.status === 'progressao'
                                ? 'bg-[#0066ff]/20 text-[#b3c5ff] border border-[#0066ff]/30'
                                : 'bg-[#262a30] text-[#c2c6d8]'
                            }`}>
                              {item.statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Inspection of Selected Exercise */}
            <div className="bg-[#101419] p-4 rounded-xl border border-[#262a30] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#0066ff] tracking-wider">
                    Histórico & Curva do Movimento
                  </span>
                  <h3 className="text-sm font-extrabold text-white">{activeExercise.exercise}</h3>
                </div>

                <div className="flex items-center gap-1.5 bg-[#181c21] border border-[#262a30] px-2.5 py-1 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5 text-[#4edea3]" />
                  <span className="text-xs font-bold text-[#4edea3]">
                    +{activeExercise.currentPr - activeExercise.initialWeight} kg desde o início
                  </span>
                </div>
              </div>

              {/* Log Table of Selected Exercise */}
              <div className="w-full bg-[#181c21] rounded-xl overflow-hidden border border-[#262a30]/60">
                <div className="grid grid-cols-5 px-3 py-2 bg-[#14181f] text-[#8c90a1] text-[10px] font-bold">
                  <span>DATA</span>
                  <span className="text-center">CARGA</span>
                  <span className="text-center">REPS</span>
                  <span className="text-center">1RM ESTIMADA</span>
                  <span className="text-right">RPE</span>
                </div>

                {activeExercise.history.map((h, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-5 px-3 py-2.5 items-center text-xs border-b border-[#262a30]/30 last:border-none ${
                      i === 0 ? 'bg-[#0066ff]/10 font-bold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>}
                      <span className="text-white">{h.date}</span>
                    </div>
                    <span className="text-center font-bold text-white">{h.weight} kg</span>
                    <span className="text-center text-[#c2c6d8]">{h.reps} reps</span>
                    <span className="text-center text-[#b3c5ff] font-semibold">{h.estimated1RM} kg</span>
                    <span className="text-right font-extrabold text-[#4edea3]">{h.rpe.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Coach Insight Card */}
          <div className="bg-[#181c21] rounded-2xl p-4 border border-[#262a30] flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-[#0066ff]/20 text-[#0066ff] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-white">Diretriz Técnica do Treinador</span>
              <p className="text-xs text-[#8c90a1] leading-relaxed">
                A progressão de carga no {activeExercise.exercise} manteve o RPE estável abaixo de 9.0 nas séries de trabalho. O volume semanal está calibrado para continuidade da hipertrofia miofibrilar.
              </p>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: MEDIDAS (MEDIDAS CORPORAIS & PESOS ORGANIZADOS) */}
      {activeTab === 'medidas' && (
        <div className="flex flex-col gap-4">
          
          {/* Main Weight & Body Composition Card */}
          <div className="bg-gradient-to-br from-[#1c2025] via-[#181c21] to-[#12161c] rounded-2xl p-5 border border-[#262a30] shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#0066ff] uppercase tracking-wider">
                  Composição Corporal & Biometria
                </span>
                <h2 className="text-base font-extrabold text-white mt-0.5">
                  Balanço Atual de Peso & Gordura
                </h2>
                <span className="text-xs text-[#8c90a1]">
                  Última aferição: 24 de Outubro • Protocolo 7 Dobras & Balança Digital
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowLogWeightModal(true)}
                className="h-8 px-3 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Atualizar Peso</span>
              </button>
            </div>

            {/* Key Body Metrix Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-[#101419] p-3 rounded-xl border border-[#262a30] flex flex-col justify-between">
                <span className="text-[10px] text-[#8c90a1] uppercase font-bold">Peso Corporal</span>
                <div className="mt-1">
                  <span className="text-2xl font-extrabold text-white">{weightHistory[0].weight}</span>
                  <span className="text-xs text-[#8c90a1] ml-1">kg</span>
                </div>
                <span className="text-[10px] text-[#4edea3] font-bold mt-1">-1.6 kg (últimos 30d)</span>
              </div>

              <div className="bg-[#101419] p-3 rounded-xl border border-[#262a30] flex flex-col justify-between">
                <span className="text-[10px] text-[#8c90a1] uppercase font-bold">Gordura (BF%)</span>
                <div className="mt-1">
                  <span className="text-2xl font-extrabold text-[#4edea3]">
                    {weightHistory[0].bodyFatPercentage}%
                  </span>
                </div>
                <span className="text-[10px] text-[#4edea3] font-bold mt-1">-1.2% gordura</span>
              </div>

              <div className="bg-[#101419] p-3 rounded-xl border border-[#262a30] flex flex-col justify-between">
                <span className="text-[10px] text-[#8c90a1] uppercase font-bold">Massa Magra</span>
                <div className="mt-1">
                  <span className="text-2xl font-extrabold text-[#b3c5ff]">70.2</span>
                  <span className="text-xs text-[#8c90a1] ml-1">kg</span>
                </div>
                <span className="text-[10px] text-[#4edea3] font-bold mt-1">+1.4 kg massa</span>
              </div>

              <div className="bg-[#101419] p-3 rounded-xl border border-[#262a30] flex flex-col justify-between">
                <span className="text-[10px] text-[#8c90a1] uppercase font-bold">Meta do Ciclo</span>
                <div className="mt-1">
                  <span className="text-2xl font-extrabold text-white">85.0</span>
                  <span className="text-xs text-[#8c90a1] ml-1">kg</span>
                </div>
                <span className="text-[10px] text-[#b3c5ff] font-bold mt-1">Superávit Limpo</span>
              </div>
            </div>
          </div>

          {/* Weight Progression Timeline */}
          <div className="bg-[#1c2025] rounded-2xl p-4 md:p-5 border border-[#262a30] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#0066ff]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Histórico de Pesagens Semanal
                </h3>
              </div>
              <span className="text-xs text-[#8c90a1]">5 registros</span>
            </div>

            <div className="w-full bg-[#181c21] rounded-xl overflow-hidden border border-[#262a30]/70">
              <div className="grid grid-cols-4 px-3.5 py-2 bg-[#14181f] text-[#8c90a1] text-[11px] font-bold">
                <span>DATA</span>
                <span className="text-center">PESO (KG)</span>
                <span className="text-center">BF (%)</span>
                <span className="text-right">OBSERVAÇÃO</span>
              </div>

              {weightHistory.map((w, index) => (
                <div
                  key={w.id}
                  className={`grid grid-cols-4 px-3.5 py-2.5 items-center text-xs border-b border-[#262a30]/40 last:border-none ${
                    index === 0 ? 'bg-[#0066ff]/10 font-semibold' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {index === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>}
                    <span className="text-white">{w.date}</span>
                  </div>
                  <span className="text-center font-bold text-white">{w.weight.toFixed(1)} kg</span>
                  <span className="text-center text-[#4edea3] font-bold">{w.bodyFatPercentage}%</span>
                  <span className="text-right text-[11px] text-[#8c90a1] truncate">{w.note || 'Ok'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Body Measurements Section */}
          <div className="bg-[#1c2025] rounded-2xl p-4 md:p-5 border border-[#262a30] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#0066ff]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Circunferências Corporais (cm)
                  </h3>
                </div>
                <span className="text-xs text-[#8c90a1]">
                  Medições organizadas por regiões anatômicas e variação
                </span>
              </div>

              {/* Filter by Anatomical Region */}
              <div className="flex items-center gap-1.5 bg-[#181c21] p-1 rounded-xl border border-[#262a30]">
                <button
                  type="button"
                  onClick={() => setMeasurementFilter('todos')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    measurementFilter === 'todos' ? 'bg-[#0066ff] text-white' : 'text-[#8c90a1]'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setMeasurementFilter('superior')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    measurementFilter === 'superior' ? 'bg-[#0066ff] text-white' : 'text-[#8c90a1]'
                  }`}
                >
                  Superiores
                </button>
                <button
                  type="button"
                  onClick={() => setMeasurementFilter('tronco')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    measurementFilter === 'tronco' ? 'bg-[#0066ff] text-white' : 'text-[#8c90a1]'
                  }`}
                >
                  Tronco
                </button>
                <button
                  type="button"
                  onClick={() => setMeasurementFilter('inferior')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    measurementFilter === 'inferior' ? 'bg-[#0066ff] text-white' : 'text-[#8c90a1]'
                  }`}
                >
                  Inferiores
                </button>
              </div>
            </div>

            {/* Table of Measurements */}
            <div className="w-full bg-[#181c21] rounded-xl overflow-hidden border border-[#262a30]/80">
              <div className="grid grid-cols-4 px-3.5 py-2.5 bg-[#14181f] text-[#8c90a1] text-[11px] font-bold">
                <span>REGIÃO / MEMBRO</span>
                <span className="text-center">ATUAL</span>
                <span className="text-center">ANTERIOR</span>
                <span className="text-right">VARIAÇÃO</span>
              </div>

              <div className="divide-y divide-[#262a30]/40 text-xs">
                {filteredMeasurements.map((m) => {
                  const isPositiveGain = m.deltaCm > 0;
                  const isWaist = m.name.toLowerCase().includes('cintura');
                  // For waist, negative is good (fat loss). For arms/chest/legs, positive is muscle gain.
                  const isFavorable = isWaist ? m.deltaCm < 0 : m.deltaCm > 0;

                  return (
                    <div
                      key={m.id}
                      className="grid grid-cols-4 px-3.5 py-3 items-center hover:bg-[#20252d] transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{m.name}</span>
                        <span className="text-[10px] text-[#8c90a1]">{m.regionLabel} • {m.lastUpdated}</span>
                      </div>

                      <span className="text-center font-extrabold text-white text-sm">
                        {m.currentCm.toFixed(1)} cm
                      </span>

                      <span className="text-center text-[#8c90a1]">
                        {m.previousCm.toFixed(1)} cm
                      </span>

                      <div className="text-right">
                        <span className={`inline-flex items-center gap-0.5 text-[11px] font-extrabold px-2 py-0.5 rounded ${
                          isFavorable
                            ? 'bg-[#00a572]/15 text-[#4edea3]'
                            : m.deltaCm === 0
                            ? 'bg-[#262a30] text-[#c2c6d8]'
                            : 'bg-[#ffb59d]/15 text-[#ffb59d]'
                        }`}>
                          {m.deltaCm > 0 ? `+${m.deltaCm.toFixed(1)} cm` : `${m.deltaCm.toFixed(1)} cm`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HISTÓRICO (HISTÓRICO COMPLETO DE SESSÕES) */}
      {activeTab === 'historico' && (
        <div className="flex flex-col gap-3">
          <div className="bg-[#1c2025] rounded-2xl p-4 border border-[#262a30] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Treino B • Costas & Bíceps</span>
              <span className="text-[10px] text-[#4edea3] font-bold bg-[#00a572]/20 px-2 py-0.5 rounded">1 PR Batido</span>
            </div>
            <span className="text-xs text-[#8c90a1]">Ontem • 18:42 • 54 min</span>
            <div className="grid grid-cols-3 gap-2 bg-[#181c21] p-2.5 rounded-xl text-center text-xs mt-1">
              <div>
                <span className="text-[10px] text-[#8c90a1] block">TEMPO</span>
                <span className="font-bold text-white">54 min</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8c90a1] block">VOLUME</span>
                <span className="font-bold text-[#b3c5ff]">7.850 kg</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8c90a1] block">ITENS</span>
                <span className="font-bold text-white">6 exercícios</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1c2025] rounded-2xl p-4 border border-[#262a30] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Treino A • Empurrar & Peito</span>
              <span className="text-[10px] text-[#8c90a1]">Concluído</span>
            </div>
            <span className="text-xs text-[#8c90a1]">22 Outubro • 07:15 • 58 min</span>
            <div className="grid grid-cols-3 gap-2 bg-[#181c21] p-2.5 rounded-xl text-center text-xs mt-1">
              <div>
                <span className="text-[10px] text-[#8c90a1] block">TEMPO</span>
                <span className="font-bold text-white">58 min</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8c90a1] block">VOLUME</span>
                <span className="font-bold text-[#b3c5ff]">8.200 kg</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8c90a1] block">ITENS</span>
                <span className="font-bold text-white">6 exercícios</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1c2025] rounded-2xl p-4 border border-[#262a30] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Treino C • Pernas Completo</span>
              <span className="text-[10px] text-[#4edea3] font-bold bg-[#00a572]/20 px-2 py-0.5 rounded">PR no Agachamento</span>
            </div>
            <span className="text-xs text-[#8c90a1]">19 Outubro • 19:10 • 65 min</span>
            <div className="grid grid-cols-3 gap-2 bg-[#181c21] p-2.5 rounded-xl text-center text-xs mt-1">
              <div>
                <span className="text-[10px] text-[#8c90a1] block">TEMPO</span>
                <span className="font-bold text-white">65 min</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8c90a1] block">VOLUME</span>
                <span className="font-bold text-[#b3c5ff]">11.450 kg</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8c90a1] block">ITENS</span>
                <span className="font-bold text-white">7 exercícios</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR TESTE DE CARGA (1RM) */}
      {showLogPrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#181c21] border border-[#262a30] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-[#0066ff]">
              <Award className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Registrar Teste de Sobrecarga</h3>
            </div>
            <p className="text-xs text-[#8c90a1]">
              Atualize sua 1RM estimada e adicione uma nova entrada na tabela de progressão de carga.
            </p>

            <form onSubmit={handleSavePr} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#c2c6d8] font-semibold">Exercício</label>
                <select
                  value={logExerciseId}
                  onChange={(e) => setLogExerciseId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#101419] border border-[#262a30] text-white text-xs font-semibold focus:border-[#0066ff] outline-none cursor-pointer"
                >
                  {progressionList.map((item) => (
                    <option key={item.id} value={item.id} className="bg-[#181c21]">
                      {item.exercise} (Atual: {item.currentPr}kg)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#c2c6d8] font-semibold">Carga Utilizada (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Ex: 102.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#101419] border border-[#262a30] text-white text-sm font-bold focus:border-[#0066ff] outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#c2c6d8] font-semibold">Repetições Válidas</label>
                  <input
                    type="number"
                    placeholder="Ex: 3"
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#101419] border border-[#262a30] text-white text-sm font-bold focus:border-[#0066ff] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#c2c6d8] font-semibold">Esforço Subjetivo (RPE)</label>
                  <span className="text-xs font-bold text-[#4edea3]">RPE {newRpe}</span>
                </div>
                <input
                  type="range"
                  min="7.0"
                  max="10.0"
                  step="0.5"
                  value={newRpe}
                  onChange={(e) => setNewRpe(e.target.value)}
                  className="w-full accent-[#0066ff] cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogPrModal(false)}
                  className="flex-1 h-11 rounded-xl bg-[#262a30] hover:bg-[#31353b] text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                >
                  Salvar na Tabela
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ATUALIZAR PESO & COMPOSIÇÃO */}
      {showLogWeightModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#181c21] border border-[#262a30] rounded-2xl p-5 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-[#0066ff]">
              <Scale className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Registrar Pesagem Corporal</h3>
            </div>
            <p className="text-xs text-[#8c90a1]">
              Insira o peso matinal em jejum para registrar no gráfico de evolução e recalcular a massa magra.
            </p>

            <form onSubmit={handleSaveWeight} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#c2c6d8] font-semibold">Peso Atual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#101419] border border-[#262a30] text-white text-sm font-bold focus:border-[#0066ff] outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#c2c6d8] font-semibold">Gordura Corporal Estimada (% BF)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputBf}
                  onChange={(e) => setInputBf(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#101419] border border-[#262a30] text-white text-sm font-bold focus:border-[#0066ff] outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogWeightModal(false)}
                  className="flex-1 h-11 rounded-xl bg-[#262a30] hover:bg-[#31353b] text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
                >
                  Confirmar Pesagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0066ff] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
