import { motion } from 'framer-motion';
import { Eye, EyeOff, Volume2, VolumeX, Briefcase, Sun, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface LearningSettingsPanelProps {
  showFurigana: boolean;
  showRomaji: boolean;
  autoPlayAudio: boolean;
  exampleContext: 'daily' | 'work';
  onToggleFurigana: () => void;
  onToggleRomaji: () => void;
  onToggleAutoPlay: () => void;
  onSetExampleContext: (context: 'daily' | 'work') => void;
}

export function LearningSettingsPanel({
  showFurigana,
  showRomaji,
  autoPlayAudio,
  exampleContext,
  onToggleFurigana,
  onToggleRomaji,
  onToggleAutoPlay,
  onSetExampleContext,
}: LearningSettingsPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings2 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-left mb-6">
          <SheetTitle>Pengaturan Belajar</SheetTitle>
          <SheetDescription>
            Sesuaikan tampilan dan audio sesuai preferensimu
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Furigana Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showFurigana ? (
                <Eye className="h-5 w-5 text-primary" />
              ) : (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="furigana" className="font-medium">Furigana</Label>
                <p className="text-sm text-muted-foreground">
                  Tampilkan cara baca di atas kanji
                </p>
              </div>
            </div>
            <Switch
              id="furigana"
              checked={showFurigana}
              onCheckedChange={onToggleFurigana}
            />
          </div>
          
          {/* Romaji Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showRomaji ? (
                <Eye className="h-5 w-5 text-primary" />
              ) : (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="romaji" className="font-medium">Romaji</Label>
                <p className="text-sm text-muted-foreground">
                  Tampilkan transliterasi huruf latin
                </p>
              </div>
            </div>
            <Switch
              id="romaji"
              checked={showRomaji}
              onCheckedChange={onToggleRomaji}
            />
          </div>
          
          {/* Auto-play Audio Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {autoPlayAudio ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="autoplay" className="font-medium">Auto-play Audio</Label>
                <p className="text-sm text-muted-foreground">
                  Putar audio otomatis saat ganti kata
                </p>
              </div>
            </div>
            <Switch
              id="autoplay"
              checked={autoPlayAudio}
              onCheckedChange={onToggleAutoPlay}
            />
          </div>
          
          {/* Example Context Selector */}
          <div className="space-y-3">
            <Label className="font-medium">Konteks Contoh Kalimat</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSetExampleContext('daily')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                  exampleContext === 'daily'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Sun className={cn(
                  "h-6 w-6",
                  exampleContext === 'daily' ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium text-sm",
                  exampleContext === 'daily' ? "text-primary" : "text-muted-foreground"
                )}>
                  Kehidupan Sehari-hari
                </span>
              </button>
              
              <button
                onClick={() => onSetExampleContext('work')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                  exampleContext === 'work'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Briefcase className={cn(
                  "h-6 w-6",
                  exampleContext === 'work' ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium text-sm",
                  exampleContext === 'work' ? "text-primary" : "text-muted-foreground"
                )}>
                  Lingkungan Kerja
                </span>
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
