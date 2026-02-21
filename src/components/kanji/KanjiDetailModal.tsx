import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { useJapaneseAudio } from '@/hooks/useJapaneseAudio';
import { PronunciationCheckButton } from '@/components/shared/PronunciationCheckButton';

interface KanjiDetailModalProps {
  kanji: {
    id: string;
    character: string;
    meanings_id: string;
    meanings_en: string | null;
    kun_readings: string[];
    on_readings: string[];
    stroke_count: number;
    example_words: {
      word: string;
      reading: string;
      meaning: string;
    }[];
    mnemonic_id: string | null;
    radicals: string[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkKnown?: () => void;
  onMarkUnknown?: () => void;
}

export function KanjiDetailModal({ 
  kanji, 
  isOpen, 
  onClose,
  onMarkKnown,
  onMarkUnknown 
}: KanjiDetailModalProps) {
  const { speak, isPlaying } = useJapaneseAudio();

  if (!kanji) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Detail Kanji</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Kanji Display */}
          <div className="text-center">
            <div className="text-8xl font-jp mb-4 text-primary">
              {kanji.character}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => speak(kanji.character)}
              disabled={isPlaying}
              className="gap-2"
            >
              <Volume2 className="h-4 w-4" />
              Putar Audio
            </Button>
          </div>

          {/* Meanings */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{kanji.meanings_id}</h3>
            {kanji.meanings_en && (
              <p className="text-sm text-muted-foreground">{kanji.meanings_en}</p>
            )}
          </div>

          {/* Readings */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-muted-foreground">訓読み (Kun)</div>
                  {kanji.kun_readings.length > 0 && (
                    <PronunciationCheckButton targetText={kanji.kun_readings[0]} size="sm" />
                  )}
                </div>
                <div className="font-jp text-sm">
                  {kanji.kun_readings.length > 0
                    ? kanji.kun_readings.join('、')
                    : '-'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-muted-foreground">音読み (On)</div>
                  {kanji.on_readings.length > 0 && (
                    <PronunciationCheckButton targetText={kanji.on_readings[0]} size="sm" />
                  )}
                </div>
                <div className="font-jp text-sm">
                  {kanji.on_readings.length > 0
                    ? kanji.on_readings.join('、')
                    : '-'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline">{kanji.stroke_count} guratan</Badge>
            {kanji.radicals.length > 0 && (
              <Badge variant="secondary" className="font-jp">
                部首: {kanji.radicals.join(', ')}
              </Badge>
            )}
          </div>

          {/* Mnemonic */}
          {kanji.mnemonic_id && (
            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <div className="text-sm font-medium mb-1">Tips Mengingat</div>
                    <div className="text-sm text-muted-foreground">
                      {kanji.mnemonic_id}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Example Words */}
          {kanji.example_words.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Contoh Kata</h4>
              <div className="space-y-2">
                {kanji.example_words.map((word, index) => (
                  <Card key={index}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-jp text-lg mr-2">{word.word}</span>
                        <span className="text-sm text-muted-foreground font-jp">
                          ({word.reading})
                        </span>
                      </div>
                      <div className="text-sm">{word.meaning}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {(onMarkKnown || onMarkUnknown) && (
            <div className="flex gap-3 pt-4">
              {onMarkUnknown && (
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={onMarkUnknown}
                >
                  <XCircle className="h-4 w-4" />
                  Belum Hafal
                </Button>
              )}
              {onMarkKnown && (
                <Button 
                  className="flex-1 gap-2"
                  onClick={onMarkKnown}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Sudah Hafal
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
