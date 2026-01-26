import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SpeakingStatsCard } from '@/components/speaking/SpeakingStatsCard';
import { PracticeModeCard } from '@/components/speaking/PracticeModeCard';
import { DailyGoalCard } from '@/components/speaking/DailyGoalCard';
import { LessonList } from '@/components/speaking/LessonList';
import { ShadowingPractice } from '@/components/speaking/ShadowingPractice';
import { ConversationPractice } from '@/components/speaking/ConversationPractice';
import { RolePlayPractice } from '@/components/speaking/RolePlayPractice';
import { SpeakingResults } from '@/components/speaking/SpeakingResults';
import { 
  useSpeakingLessons, 
  useSpeakingItems, 
  useConversationScripts,
  useConversationLines,
  useRoleplayScenarios,
  useSpeakingStats,
  SpeakingLesson,
  ConversationScript,
  RoleplayScenario
} from '@/hooks/useSpeaking';

type ViewState = 
  | { type: 'hub' }
  | { type: 'lesson-list'; mode: string; title: string; icon: string; color: string }
  | { type: 'shadowing'; lesson: SpeakingLesson }
  | { type: 'conversation'; script: ConversationScript }
  | { type: 'roleplay'; scenario: RoleplayScenario }
  | { type: 'results'; data: ResultData };

interface ResultData {
  score: number;
  completed: number;
  total: number;
  mode: string;
}

export default function Speaking() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>({ type: 'hub' });
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [selectedScriptId, setSelectedScriptId] = useState<string>('');
  
  const { data: stats } = useSpeakingStats();
  const { data: shadowingLessons = [] } = useSpeakingLessons('shadowing');
  const { data: pronunciationLessons = [] } = useSpeakingLessons('pronunciation');
  const { data: conversationLessons = [] } = useSpeakingLessons('conversation');
  const { data: roleplayLessons = [] } = useSpeakingLessons('roleplay');
  const { data: readAloudLessons = [] } = useSpeakingLessons('read_aloud');
  const { data: pitchLessons = [] } = useSpeakingLessons('pitch_accent');
  
  const { data: speakingItems = [] } = useSpeakingItems(selectedLessonId);
  const { data: conversationScripts = [] } = useConversationScripts();
  const { data: conversationLines = [] } = useConversationLines(selectedScriptId);
  const { data: roleplayScenarios = [] } = useRoleplayScenarios();

  const practiceModes = [
    { 
      id: 'shadowing',
      icon: '🎧', 
      title: 'Shadowing', 
      titleJp: 'シャドーイング',
      description: 'Listen & Repeat',
      lessonCount: shadowingLessons.length,
      color: 'from-indigo-500 to-blue-600'
    },
    { 
      id: 'pronunciation',
      icon: '🎤', 
      title: 'Pronunciation', 
      titleJp: '発音',
      description: 'Perfect Sounds',
      lessonCount: pronunciationLessons.length,
      color: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'conversation',
      icon: '💬', 
      title: 'Conversation', 
      titleJp: '会話',
      description: 'Talk with AI',
      lessonCount: conversationScripts.length,
      color: 'from-emerald-500 to-teal-600'
    },
    { 
      id: 'roleplay',
      icon: '🎭', 
      title: 'Role-Play', 
      titleJp: 'ロールプレイ',
      description: 'Real Scenarios',
      lessonCount: roleplayScenarios.length,
      color: 'from-orange-500 to-red-600'
    },
    { 
      id: 'read_aloud',
      icon: '📖', 
      title: 'Read Aloud', 
      titleJp: '音読',
      description: 'Practice Reading',
      lessonCount: readAloudLessons.length,
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      id: 'pitch_accent',
      icon: '🎯', 
      title: 'Pitch Accent', 
      titleJp: 'アクセント',
      description: 'Master Tones',
      lessonCount: pitchLessons.length,
      color: 'from-rose-500 to-pink-600'
    }
  ];

  const handleModeSelect = (mode: typeof practiceModes[0]) => {
    if (mode.id === 'conversation') {
      // Show conversation scripts
      setViewState({
        type: 'lesson-list',
        mode: mode.id,
        title: mode.title,
        icon: mode.icon,
        color: mode.color
      });
    } else if (mode.id === 'roleplay') {
      // Show roleplay scenarios
      setViewState({
        type: 'lesson-list',
        mode: mode.id,
        title: mode.title,
        icon: mode.icon,
        color: mode.color
      });
    } else {
      setViewState({
        type: 'lesson-list',
        mode: mode.id,
        title: mode.title,
        icon: mode.icon,
        color: mode.color
      });
    }
  };

  const handleLessonSelect = (lesson: SpeakingLesson) => {
    setSelectedLessonId(lesson.id);
    setViewState({ type: 'shadowing', lesson });
  };

  const handleScriptSelect = (script: ConversationScript) => {
    setSelectedScriptId(script.id);
  };

  const handleComplete = (data: { score: number; completed: number }, total: number, mode: string) => {
    setViewState({
      type: 'results',
      data: { score: data.score, completed: data.completed, total, mode }
    });
  };

  const handleBackToHub = () => {
    setViewState({ type: 'hub' });
    setSelectedLessonId('');
    setSelectedScriptId('');
  };

  // Render based on view state
  if (viewState.type === 'shadowing' && speakingItems.length > 0) {
    return (
      <ShadowingPractice
        lessonTitle={viewState.lesson.title_id}
        lessonTitleJp={viewState.lesson.title_ja}
        items={speakingItems}
        onComplete={(data) => handleComplete(data, speakingItems.length, 'shadowing')}
        onBack={handleBackToHub}
      />
    );
  }

  if (viewState.type === 'conversation' && conversationLines.length > 0) {
    return (
      <ConversationPractice
        scriptTitle={viewState.script.title_id}
        scriptTitleJp={viewState.script.title_ja}
        scenario={viewState.script.scenario_description || ''}
        location={viewState.script.location || ''}
        lines={conversationLines}
        onComplete={(data) => handleComplete({ score: data.score, completed: data.turnsCompleted }, conversationLines.length, 'conversation')}
        onBack={handleBackToHub}
      />
    );
  }

  if (viewState.type === 'roleplay') {
    return (
      <RolePlayPractice
        scenario={viewState.scenario}
        onComplete={(data) => handleComplete({ score: data.score, completed: data.objectivesCompleted }, viewState.scenario.objectives?.length || 3, 'roleplay')}
        onBack={handleBackToHub}
      />
    );
  }

  if (viewState.type === 'results') {
    return (
      <SpeakingResults
        score={viewState.data.score}
        xpEarned={Math.round(viewState.data.score / 4)}
        pronunciation={Math.round(viewState.data.score * 0.9)}
        fluency={Math.round(viewState.data.score * 0.85)}
        accuracy={Math.round(viewState.data.score * 0.95)}
        phrasesCompleted={viewState.data.completed}
        totalPhrases={viewState.data.total}
        phrasesMastered={Math.floor(viewState.data.completed * 0.6)}
        timeSpent="6:32"
        improvements={[
          'Work on long vowel sounds (oo, ee)',
          'Practice pitch accent for questions',
          'Slow down slightly for clarity'
        ]}
        onPracticeAgain={() => setViewState({ type: 'hub' })}
        onContinue={handleBackToHub}
      />
    );
  }

  if (viewState.type === 'lesson-list') {
    if (viewState.mode === 'conversation') {
      return (
        <div className="min-h-screen bg-background">
          <div className={`bg-gradient-to-r ${viewState.color} text-white`}>
            <div className="container max-w-lg mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleBackToHub}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ←
                </button>
                <h1 className="text-xl font-bold">{viewState.icon} {viewState.title}</h1>
              </div>
            </div>
          </div>
          <div className="container max-w-lg mx-auto px-4 py-6 space-y-3">
            {conversationScripts.map((script, index) => (
              <motion.button
                key={script.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedScriptId(script.id);
                  setViewState({ type: 'conversation', script });
                }}
                className="w-full bg-card rounded-xl p-4 shadow-card hover:shadow-elevated transition-all text-left"
              >
                <h3 className="font-semibold">{script.title_id}</h3>
                <p className="text-sm text-muted-foreground font-jp">{script.title_ja}</p>
                <p className="text-xs text-muted-foreground mt-1">{script.scenario_description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      );
    }

    if (viewState.mode === 'roleplay') {
      return (
        <div className="min-h-screen bg-background">
          <div className={`bg-gradient-to-r ${viewState.color} text-white`}>
            <div className="container max-w-lg mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleBackToHub}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ←
                </button>
                <h1 className="text-xl font-bold">{viewState.icon} {viewState.title}</h1>
              </div>
            </div>
          </div>
          <div className="container max-w-lg mx-auto px-4 py-6 space-y-3">
            {roleplayScenarios.map((scenario, index) => (
              <motion.button
                key={scenario.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setViewState({ type: 'roleplay', scenario })}
                className="w-full bg-card rounded-xl p-4 shadow-card hover:shadow-elevated transition-all text-left"
              >
                <h3 className="font-semibold">{scenario.title_id}</h3>
                <p className="text-sm text-muted-foreground font-jp">{scenario.title_ja}</p>
                <p className="text-xs text-muted-foreground mt-1">{scenario.scenario_description_id}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{scenario.difficulty}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{scenario.estimated_minutes} min</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <LessonList
        lessonType={viewState.mode}
        title={viewState.title}
        icon={viewState.icon}
        color={viewState.color}
        onSelectLesson={handleLessonSelect}
        onBack={handleBackToHub}
      />
    );
  }

  // Hub View
  return (
    <AppLayout>
      <div className="pt-safe">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="container max-w-lg mx-auto px-4 pt-6 pb-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                <Mic className="h-6 w-6" />
                Speaking Practice
              </h1>
              <p className="text-white/80 text-sm font-jp">話す練習</p>
            </motion.div>
          </div>
        </div>

        <div className="container max-w-lg mx-auto px-4 -mt-4 space-y-6 pb-6">
          {/* Stats */}
          <SpeakingStatsCard
            accuracy={stats?.accuracy || 0}
            fluency={stats?.fluency || 0}
            practiceHours={stats?.practiceMinutes ? Math.round(stats.practiceMinutes / 60 * 10) / 10 : 0}
          />

          {/* Practice Modes */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              🎧 PRACTICE MODES
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {practiceModes.map((mode, index) => (
                <PracticeModeCard
                  key={mode.id}
                  icon={mode.icon}
                  title={mode.title}
                  titleJp={mode.titleJp}
                  description={mode.description}
                  lessonCount={mode.lessonCount}
                  color={mode.color}
                  onClick={() => handleModeSelect(mode)}
                  delay={index * 0.05}
                />
              ))}
            </div>
          </div>

          {/* Daily Goal */}
          <DailyGoalCard
            currentMinutes={3}
            goalMinutes={5}
          />
        </div>
      </div>
    </AppLayout>
  );
}
