import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import ChapterDetail from "./pages/ChapterDetail";
import LessonView from "./pages/LessonView";
import JLPTLessonView from "./pages/JLPTLessonView";
import TimeScheduleLesson from "./pages/TimeScheduleLesson";
import LocationLesson from "./pages/LocationLesson";
import KanaLearn from "./pages/KanaLearn";
import KanjiLearn from "./pages/KanjiLearn";
import ReadingPractice from "./pages/ReadingPractice";
import ListeningPractice from "./pages/ListeningPractice";
import CulturalTips from "./pages/CulturalTips";
import Practice from "./pages/Practice";
import Speaking from "./pages/Speaking";
import FlashcardView from "./pages/FlashcardView";
import MockTestView from "./pages/MockTestView";
import ExamView from "./pages/ExamView";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Bookmarks from "./pages/Bookmarks";
import Install from "./pages/Install";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/home" element={<Home />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/chapter/:chapterId" element={<ChapterDetail />} />
              <Route path="/lesson/:lessonId" element={<LessonView />} />
              <Route path="/jlpt-lesson/:lessonId" element={<JLPTLessonView />} />
              <Route path="/time-lesson" element={<TimeScheduleLesson />} />
              <Route path="/location-lesson" element={<LocationLesson />} />
              <Route path="/kana" element={<KanaLearn />} />
              <Route path="/kanji" element={<KanjiLearn />} />
              <Route path="/reading" element={<ReadingPractice />} />
              <Route path="/listening" element={<ListeningPractice />} />
              <Route path="/cultural-tips" element={<CulturalTips />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/speaking" element={<Speaking />} />
              <Route path="/flashcard" element={<FlashcardView />} />
              <Route path="/mock-test" element={<MockTestView />} />
              <Route path="/exam" element={<ExamView />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/install" element={<Install />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
