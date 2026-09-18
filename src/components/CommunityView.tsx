import React, { useState, useRef } from 'react';
import { 
  Flame, 
  MessageSquare, 
  Copy, 
  Check, 
  Share2, 
  Plus, 
  Users, 
  Send, 
  Camera, 
  Image as ImageIcon, 
  Clock, 
  X, 
  UploadCloud, 
  Trophy, 
  Dumbbell, 
  Zap, 
  Activity,
  Compass,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { MOCK_POSTS, MOCK_LOCAL_ATHLETES, MOCK_ACTIVE_PARTNER_AVATARS, MOCK_DAILY_ROUTINES, DISCOVERABLE_ATHLETES } from '../data/mockData';
import { FeedPost, RoutineFlash, DiscoverAthlete } from '../types';
import { RoutineViewerModal } from './RoutineViewerModal';
import { DiscoverAthletesSection } from './DiscoverAthletesSection';

export const CommunityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'seguindo' | 'explorar'>('seguindo');
  const [posts, setPosts] = useState<FeedPost[]>(MOCK_POSTS);
  const [routines, setRoutines] = useState<RoutineFlash[]>(MOCK_DAILY_ROUTINES);
  const [athletes, setAthletes] = useState(MOCK_LOCAL_ATHLETES);
  const [discoverAthletes, setDiscoverAthletes] = useState<DiscoverAthlete[]>(DISCOVERABLE_ATHLETES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postType, setPostType] = useState<'feed' | 'routine'>('routine');
  const [viewingRoutineIndex, setViewingRoutineIndex] = useState<number | null>(null);

  // New Post/Routine Form State
  const [newCaption, setNewCaption] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('Treino A - Peito & Tríceps');
  const [newMuscleGroup, setNewMuscleGroup] = useState('Peitoral e Ombros');
  const [newHighlightBadge, setNewHighlightBadge] = useState('Novo PR no Supino');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleCheer = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isCheered = p.userCheered;
          return {
            ...p,
            userCheered: !isCheered,
            cheerCount: isCheered ? p.cheerCount - 1 : p.cheerCount + 1
          };
        }
        return p;
      })
    );
  };

  const handleCopyRoutine = (postId: string) => {
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleFollowAthlete = (index: number) => {
    setAthletes((prev) =>
      prev.map((a, i) => (i === index ? { ...a, following: !a.following } : a))
    );
  };

  const handleToggleFollowDiscoverAthlete = (id: string) => {
    setDiscoverAthletes((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              following: !a.following,
              followersCount: a.following ? a.followersCount - 1 : a.followersCount + 1
            }
          : a
      )
    );
  };

  const handleSendComment = (postId: string) => {
    if (!commentInput.trim()) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComments = [
            ...(p.comments || []),
            {
              id: `c-${Date.now()}`,
              author: 'Lucas Andrade',
              role: 'Você',
              text: commentInput.trim()
            }
          ];
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: newComments
          };
        }
        return p;
      })
    );
    setCommentInput('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (postType === 'routine') {
      // Create new 24h Routine
      const newRoutine: RoutineFlash = {
        id: `routine-${Date.now()}`,
        authorName: 'Sua Rotina',
        authorAvatar: 'https://lh3.googleusercontent.com/aida/AEtjO1URm0XDVMSrJNRDc_1GLuvyv0l5c4j4WEL9rP3UPflZRz5H1m9TZPGBMK00H335edXtA8GKJ3D11CB0zoo-_xT8BX4Of8ILIXCOvazguboO4Lw5pTVsG7iJggnbin_E1GWeZ841ZBSPfxaiVabJ12AEsVjplJzt2l3sdqKXs6S9GfMO-qHvR_UCqAjtllBiVgbQolwJ6Cwt3wA0KGJybX7eKNw07aG_W4HSTR08k3vGpETwMxoMon6YKB-UxRSpFwJWPCD7sWLk24k',
        isUser: true,
        hasUnseen: false,
        imageUrl: newPostImage || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        caption: newCaption.trim() || 'Rotina de treino cumprida com consistência!',
        timeAgo: 'Agora mesmo',
        expiresInHours: 24, // 24-hour expiration cycle
        targetMuscle: newMuscleGroup,
        todayVolume: '7.850 kg movidos',
        statBadge: newHighlightBadge || 'Treino Pago',
        workoutHighlight: 'Rotina do Dia'
      };
      setRoutines([newRoutine, ...routines.filter(r => !r.isUser)]);
    } else {
      // Create new Feed Post
      const newPost: FeedPost = {
        id: `user-post-${Date.now()}`,
        authorName: 'Lucas Andrade',
        authorBadge: 'Você',
        authorVerified: true,
        authorAvatar: 'https://lh3.googleusercontent.com/aida/AEtjO1URm0XDVMSrJNRDc_1GLuvyv0l5c4j4WEL9rP3UPflZRz5H1m9TZPGBMK00H335edXtA8GKJ3D11CB0zoo-_xT8BX4Of8ILIXCOvazguboO4Lw5pTVsG7iJggnbin_E1GWeZ841ZBSPfxaiVabJ12AEsVjplJzt2l3sdqKXs6S9GfMO-qHvR_UCqAjtllBiVgbQolwJ6Cwt3wA0KGJybX7eKNw07aG_W4HSTR08k3vGpETwMxoMon6YKB-UxRSpFwJWPCD7sWLk24k',
        timeAgo: 'Agora mesmo',
        location: 'SOMMA Training Lab',
        tag1: 'ROTINA CONCLUÍDA',
        tag2: newMuscleGroup.toUpperCase(),
        title: newPostTitle || 'Treino do Dia Finalizado',
        caption: newCaption.trim(),
        imageUrl: newPostImage || undefined,
        duration: '52 min',
        volume: '7.850 kg',
        exercisesCount: 5,
        prsCount: 1,
        exercisesPreview: [
          { name: 'Supino Reto Barra', detail: '4 × 8 @ 96 kg', isPr: true },
          { name: 'Supino Inclinado Halteres', detail: '3 × 10 @ 34 kg' }
        ],
        cheerCount: 1,
        userCheered: true,
        commentsCount: 0
      };
      setPosts([newPost, ...posts]);
    }

    // Reset Form
    setNewCaption('');
    setNewPostImage(null);
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col w-full pb-24 md:pb-12 gap-5">
      
      {/* 1. REMODELED "ROTINAS (24H)" STRIP */}
      <section aria-label="Rotinas dos Atletas (24 horas)" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#0066ff] fill-[#0066ff]" /> Rotinas
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0066ff]/20 text-[#b3c5ff] border border-[#0066ff]/40 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> Duração de 24h
            </span>
          </div>
          <span className="text-[11px] text-[#8c90a1] font-medium hidden sm:inline">
            Acompanhe o que os atletas treinaram hoje
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2.5 pt-1 no-scrollbar select-none">
          {/* Add Routine Button for User */}
          <button
            type="button"
            onClick={() => {
              setPostType('routine');
              setShowCreateModal(true);
            }}
            className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none cursor-pointer"
          >
            <div className="relative w-[70px] h-[86px] rounded-2xl p-[2px] bg-gradient-to-b from-[#262a30] to-[#181c21] group-hover:border-[#0066ff] border border-dashed border-[#3a404d] transition-all flex flex-col items-center justify-center gap-1">
              <div className="w-9 h-9 rounded-full bg-[#0066ff] text-white flex items-center justify-center shadow-md">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-[#dae1ff] text-center leading-tight">
                Postar<br/>Rotina
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#8c90a1] text-center">Sua Rotina</span>
          </button>

          {/* Athletes 24h Routines with athletic cards & countdown timers */}
          {routines.map((routine, index) => (
            <button
              key={routine.id}
              type="button"
              onClick={() => setViewingRoutineIndex(index)}
              className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none cursor-pointer text-left"
            >
              <div
                className={`relative w-[70px] h-[86px] rounded-2xl p-[2px] transition-all transform group-hover:scale-105 overflow-hidden shadow-md ${
                  routine.hasUnseen
                    ? 'ring-2 ring-[#0066ff] ring-offset-2 ring-offset-[#101419]'
                    : 'border border-[#262a30]'
                }`}
              >
                {/* Background image preview */}
                <img
                  src={routine.imageUrl}
                  alt={routine.caption}
                  className="w-full h-full object-cover rounded-xl filter brightness-[0.75] group-hover:brightness-90 transition-all"
                />
                
                {/* 24h expiration badge in top right */}
                <div className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[8px] font-black text-[#4edea3] flex items-center gap-0.5">
                  <Clock className="w-2 h-2" />
                  <span>{routine.expiresInHours}h</span>
                </div>

                {/* Athlete small avatar in bottom left */}
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                  <img
                    src={routine.authorAvatar}
                    alt={routine.authorName}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white/40"
                  />
                  {routine.statBadge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffb59d]" />
                  )}
                </div>
              </div>

              {/* Caption & Name */}
              <div className="flex flex-col items-center max-w-[70px]">
                <span className="text-[11px] font-bold text-white truncate w-full text-center">
                  {routine.authorName.split(' ')[0]}
                </span>
                <span className="text-[9px] font-medium text-[#8c90a1] truncate w-full text-center">
                  {routine.workoutHighlight?.split('•')[0] || routine.targetMuscle || 'Treino'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Sub-tabs: Seguindo vs Explorar */}
      <div className="w-full bg-[#181c21] p-1 rounded-2xl flex items-center border border-[#262a30] shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('seguindo')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'seguindo'
              ? 'bg-[#0066ff] text-white shadow-md'
              : 'text-[#8c90a1] hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Feed Seguindo</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('explorar')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'explorar'
              ? 'bg-[#0066ff] text-white shadow-md'
              : 'text-[#8c90a1] hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Barra Explorar & Novos Atletas</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-black">
            NOVO
          </span>
        </button>
      </div>

      {/* 3. EXPLORAR VIEW (When Explorar Tab is selected) */}
      {activeTab === 'explorar' && (
        <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200">
          {/* Main Explore Bar & User Discovery Grid */}
          <DiscoverAthletesSection
            athletes={discoverAthletes}
            onToggleFollow={handleToggleFollowDiscoverAthlete}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Heading for Explore Feed */}
          <div className="flex items-center justify-between pt-2 border-t border-[#262a30]/80">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#cc4204]" />
              <h4 className="text-sm font-bold text-white">Publicações em Alta na Comunidade</h4>
            </div>
            <span className="text-xs text-[#8c90a1]">Tendências do SOMMA Hub</span>
          </div>
        </div>
      )}

      {/* 4. SEGUINDO QUICK SHORTCUT (When Seguindo Tab is selected) */}
      {activeTab === 'seguindo' && (
        <>
          {/* Invite / Discover teaser banner */}
          <div
            onClick={() => setActiveTab('explorar')}
            className="bg-gradient-to-r from-[#1c2025] via-[#20252d] to-[#14181f] p-4 rounded-2xl border border-[#262a30] hover:border-[#0066ff]/50 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#0066ff]/20 text-[#0066ff] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">Descobrir Novos Atletas</span>
                  <span className="text-[9px] font-extrabold bg-[#0066ff]/20 text-[#b3c5ff] px-1.5 py-0.5 rounded">
                    Explorar
                  </span>
                </div>
                <span className="text-[11px] text-[#8c90a1] truncate">
                  Use a barra explorar para buscar atletas por modalidade, academia e recordes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#b3c5ff] group-hover:text-white shrink-0">
              <span className="hidden sm:inline">Explorar Atletas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Quick Actions Bar: Postar Foto / Postar Rotina 24h */}
          <div className="bg-gradient-to-r from-[#1c2025] to-[#181c21] rounded-2xl p-3.5 border border-[#262a30] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0066ff]/20 text-[#0066ff] flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Compartilhe sua evolução</span>
                <span className="text-[11px] text-[#8c90a1]">Fotos de treino, rotinas de 24h e colagens para o Instagram</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPostType('feed');
                  setShowCreateModal(true);
                }}
                className="flex-1 sm:flex-initial h-9 px-3.5 bg-[#0066ff] hover:bg-[#0054d6] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Foto</span>
              </button>
            </div>
          </div>

          {/* Active buddies strip */}
          <div className="bg-[#1c2025] rounded-2xl p-3.5 border border-[#262a30] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2 overflow-hidden">
                {MOCK_ACTIVE_PARTNER_AVATARS.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Foto de atleta ativo parceiro"
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-[#1c2025] object-cover bg-[#262a30]"
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-white">14 parceiros ativos hoje</span>
            </div>

            <button
              type="button"
              onClick={() => alert('Link de convite do SOMMA Hub copiado!')}
              className="text-xs font-bold text-[#b3c5ff] hover:text-white px-3 py-1.5 rounded-lg bg-[#262a30] border border-[#31353b] transition-colors cursor-pointer"
            >
              Convidar
            </button>
          </div>
        </>
      )}

      {/* 5. FEED STREAM */}
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-[#1c2025] rounded-2xl p-4 md:p-5 border border-[#262a30] flex flex-col gap-3.5 shadow-sm"
          >
            {/* Post Header: Avatar, Name, Badges, Time & Instagram Export Button */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar}
                  alt={`Foto de ${post.authorName}`}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-[#31353b] bg-[#262a30]"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-white leading-none">{post.authorName}</span>
                    {post.authorVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0066ff] fill-[#0066ff]" />
                    )}
                    {post.isInfluencer || post.authorBadge === 'INFLUENCER SOMMA' ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ffd700]/25 via-[#ff9900]/20 to-[#0066ff]/25 text-[#ffd700] border border-[#ffd700]/40 shadow-sm shadow-[#ffd700]/10 tracking-wider">
                        <Sparkles className="w-2.5 h-2.5 text-[#ffd700]" />
                        <span>SELO SOMMA INFLUENCER</span>
                      </span>
                    ) : post.authorBadge ? (
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#0066ff]/20 text-[#b3c5ff]">
                        {post.authorBadge}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8c90a1] mt-1">
                    {post.authorHandle && (
                      <>
                        <span className="text-[#0066ff] font-semibold">{post.authorHandle}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{post.timeAgo} {post.location && `• ${post.location}`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Tags & Title */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {post.tag1 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#ffb59d]/15 text-[#ffb59d] uppercase">
                    {post.tag1}
                  </span>
                )}
                {post.tag2 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#262a30] text-[#c2c6d8] uppercase">
                    {post.tag2}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white">{post.title}</h3>
              {post.caption && (
                <p className="text-xs text-[#c2c6d8] leading-relaxed">{post.caption}</p>
              )}
            </div>

            {/* Post Photo (if present) */}
            {post.imageUrl && (
              <div className="relative rounded-xl overflow-hidden border border-[#262a30] max-h-96 bg-black">
                <img
                  src={post.imageUrl}
                  alt={`Foto da postagem de ${post.authorName}`}
                  className="w-full h-auto object-cover max-h-96"
                />
              </div>
            )}

            {/* Workout Performance Strip */}
            <div className="grid grid-cols-4 gap-2 bg-[#181c21] p-3 rounded-xl border border-[#262a30]/70 text-center">
              <div>
                <span className="text-[10px] font-bold text-[#8c90a1] uppercase block">Duração</span>
                <span className="text-xs font-extrabold text-white">{post.duration}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8c90a1] uppercase block">Volume</span>
                <span className="text-xs font-extrabold text-[#b3c5ff]">{post.volume}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8c90a1] uppercase block">Exercícios</span>
                <span className="text-xs font-extrabold text-white">{post.exercisesCount}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#ffb59d] uppercase block">PRs</span>
                <span className="text-xs font-extrabold text-[#ffb59d]">
                  {post.prsCount > 0 ? `+${post.prsCount}` : '0'}
                </span>
              </div>
            </div>

            {/* Exercises Preview List */}
            {post.exercisesPreview && post.exercisesPreview.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {post.exercisesPreview.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#181c21]/60"
                  >
                    <span className="text-[#c2c6d8] font-medium truncate max-w-[200px]">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-white font-bold">{item.detail}</span>
                      {item.isPr && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#ffb59d]/20 text-[#ffb59d]">
                          PR
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions Bar: Dar Força, Comentários, Copiar Rotina, Instagram */}
            <div className="flex items-center justify-between pt-2 border-t border-[#262a30]/60">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleCheer(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                    post.userCheered
                      ? 'bg-[#ffb59d]/20 text-[#ffb59d] border border-[#ffb59d]/40'
                      : 'bg-[#181c21] text-[#c2c6d8] hover:text-white border border-[#262a30]'
                  }`}
                >
                  <Flame className={`w-4 h-4 ${post.userCheered ? 'fill-[#ffb59d]' : ''}`} />
                  <span>Dar Força ({post.cheerCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181c21] hover:bg-[#262a30] text-[#c2c6d8] hover:text-white border border-[#262a30] text-xs font-medium transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{post.commentsCount}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyRoutine(post.id)}
                  className="flex items-center gap-1.5 text-xs text-[#b3c5ff] hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  {copiedId === post.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4edea3]" />
                      <span className="text-[#4edea3]">Salvo!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copiar Rotina</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Comments Drawer */}
            {activeCommentsPostId === post.id && (
              <div className="mt-2 pt-3 border-t border-[#262a30] flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-150">
                {post.comments && post.comments.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex items-start gap-2.5 p-2 rounded-xl bg-[#181c21] text-xs"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{comment.author}</span>
                            {comment.role && (
                              <span className="text-[9px] px-1 rounded bg-[#262a30] text-[#8c90a1]">
                                {comment.role}
                              </span>
                            )}
                          </div>
                          <p className="text-[#c2c6d8] mt-0.5">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8c90a1] italic">Nenhum comentário ainda. Seja o primeiro!</p>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                    placeholder="Escreva um comentário de incentivo..."
                    className="flex-1 h-9 px-3 rounded-xl bg-[#181c21] border border-[#262a30] text-xs text-white placeholder:text-[#8c90a1] focus:border-[#0066ff] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendComment(post.id)}
                    className="h-9 px-3 bg-[#0066ff] hover:bg-[#0054d6] text-white rounded-xl text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Suggested Athletes Section */}
      <section className="bg-[#1c2025] rounded-2xl p-4 border border-[#262a30] flex flex-col gap-3 shadow-sm mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0066ff]" />
            <span className="text-xs font-bold text-white">Atletas em Destaque na Sua Região</span>
          </div>
          <span className="text-[11px] text-[#8c90a1]">Mesmas metas que você</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {athletes.map((athlete, idx) => (
            <div
              key={athlete.name}
              className="flex items-center justify-between p-3 rounded-xl bg-[#181c21] border border-[#262a30]/60"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={athlete.avatar}
                  alt={`Foto de ${athlete.name}`}
                  className="w-9 h-9 rounded-full object-cover bg-[#262a30] shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{athlete.name}</span>
                  <span className="text-[11px] text-[#8c90a1] truncate">{athlete.specialty}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleFollowAthlete(idx)}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                  athlete.following
                    ? 'bg-[#262a30] text-[#c2c6d8] hover:text-white'
                    : 'bg-[#0066ff] hover:bg-[#0054d6] text-white'
                }`}
              >
                {athlete.following ? 'Seguindo' : 'Seguir'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- CREATE POST OR 24H ROUTINE MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-[#181c21] border border-[#262a30] rounded-3xl p-5 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#262a30]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0066ff]/20 text-[#0066ff] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Criar Nova Publicação</h3>
                  <p className="text-[11px] text-[#8c90a1]">Escolha entre post permanente no feed ou Rotina 24h</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-[#1c2025] hover:bg-[#262a30] text-[#c2c6d8] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Post Format Selector: Rotina (24h) vs Feed */}
            <div className="grid grid-cols-2 gap-2 bg-[#101419] p-1.5 rounded-2xl border border-[#262a30]">
              <button
                type="button"
                onClick={() => setPostType('routine')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  postType === 'routine'
                    ? 'bg-[#0066ff] text-white shadow-sm'
                    : 'text-[#8c90a1] hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[#ffb59d]" />
                <span>Rotina (24h)</span>
              </button>
              <button
                type="button"
                onClick={() => setPostType('feed')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  postType === 'feed'
                    ? 'bg-[#0066ff] text-white shadow-sm'
                    : 'text-[#8c90a1] hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Post no Feed</span>
              </button>
            </div>

            {/* Rotina 24h helper notice */}
            {postType === 'routine' && (
              <div className="bg-[#0066ff]/10 border border-[#0066ff]/30 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-[#b3c5ff]">
                <Clock className="w-4 h-4 text-[#4edea3] shrink-0" />
                <span>Esta rotina ficará ativa por <strong>24 horas</strong> no topo da comunidade para inspirar outros atletas.</span>
              </div>
            )}

            {/* Title / Muscle Target */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#c2c6d8]">Grupo Muscular</label>
                <input
                  type="text"
                  value={newMuscleGroup}
                  onChange={(e) => setNewMuscleGroup(e.target.value)}
                  placeholder="Ex: Peitoral e Ombros"
                  className="h-10 px-3 rounded-xl bg-[#101419] border border-[#262a30] text-white text-xs outline-none focus:border-[#0066ff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#c2c6d8]">Destaque / PR</label>
                <input
                  type="text"
                  value={newHighlightBadge}
                  onChange={(e) => setNewHighlightBadge(e.target.value)}
                  placeholder="Ex: PR 96kg Supino"
                  className="h-10 px-3 rounded-xl bg-[#101419] border border-[#262a30] text-white text-xs outline-none focus:border-[#0066ff]"
                />
              </div>
            </div>

            {/* Caption */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#c2c6d8]">
                {postType === 'routine' ? 'Descrição da Rotina de Hoje' : 'Legenda da Foto'}
              </label>
              <textarea
                placeholder={
                  postType === 'routine'
                    ? 'Ex: Rotina cumprida com foco em cadência lenta e contração máxima...'
                    : 'Compartilhe suas percepções de carga, intensidade ou conquista...'
                }
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className="w-full h-20 p-3 rounded-xl bg-[#101419] border border-[#262a30] text-white text-xs placeholder:text-[#8c90a1] focus:border-[#0066ff] outline-none resize-none"
              />
            </div>

            {/* Photo Upload Box */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#c2c6d8] flex items-center justify-between">
                <span>Foto da Rotina ou Shape</span>
                {newPostImage && (
                  <button
                    onClick={() => setNewPostImage(null)}
                    className="text-[11px] text-[#ffb59d] hover:underline cursor-pointer"
                  >
                    Remover foto
                  </button>
                )}
              </label>

              {newPostImage ? (
                <div className="relative rounded-xl overflow-hidden border border-[#262a30] h-40 bg-black">
                  <img
                    src={newPostImage}
                    alt="Preview da foto selecionada"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/70 text-[10px] font-bold text-[#4edea3] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Foto Pronta
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-24 rounded-2xl border-2 border-dashed border-[#262a30] hover:border-[#0066ff]/60 bg-[#101419] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-5 h-5 text-[#0066ff]" />
                  <span className="text-xs font-bold text-white">Toque para selecionar foto</span>
                  <span className="text-[10px] text-[#8c90a1]">Foto do shape ou aparelho</span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Presets */}
            {!newPostImage && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#8c90a1]">
                <span>Ou use um exemplo:</span>
                <button
                  type="button"
                  onClick={() =>
                    setNewPostImage(
                      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop'
                    )
                  }
                  className="px-2 py-0.5 rounded-md bg-[#262a30] hover:bg-[#31353b] text-[#b3c5ff] cursor-pointer"
                >
                  Academia
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewPostImage(
                      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop'
                    )
                  }
                  className="px-2 py-0.5 rounded-md bg-[#262a30] hover:bg-[#31353b] text-[#b3c5ff] cursor-pointer"
                >
                  Halteres
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-[#262a30]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 h-11 rounded-xl bg-[#262a30] hover:bg-[#31353b] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="flex-1 h-11 rounded-xl bg-[#0066ff] hover:bg-[#0054d6] text-xs font-bold text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{postType === 'routine' ? 'Publicar Rotina 24h' : 'Publicar no Feed'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- 24H ROUTINE VIEWER MODAL --- */}
      {viewingRoutineIndex !== null && (
        <RoutineViewerModal
          routines={routines}
          initialIndex={viewingRoutineIndex}
          onClose={() => setViewingRoutineIndex(null)}
        />
      )}

    </div>
  );
};
