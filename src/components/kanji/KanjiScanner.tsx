import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, FlashlightOff, Loader2, ScanLine, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCamera } from '@/hooks/useCamera';
import { useKanjiOCR } from '@/hooks/useKanjiOCR';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useJapaneseAudio } from '@/hooks/useJapaneseAudio';

interface KanjiScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onKanjiSelected?: (character: string) => void;
}

export function KanjiScanner({ isOpen, onClose, onKanjiSelected }: KanjiScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isActive, error: cameraError, start, stop, captureBlob } = useCamera();
  const { isProcessing, results, error: ocrError, processImage, reset } = useKanjiOCR();
  const haptic = useHapticFeedback();
  const { speak } = useJapaneseAudio();
  
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      start(videoRef.current);
    }
    return () => {
      stop();
      reset();
      setShowResults(false);
    };
  }, [isOpen, start, stop, reset]);

  const handleCapture = async () => {
    haptic.medium();
    const blob = await captureBlob();
    if (blob) {
      const foundKanji = await processImage(blob);
      if (foundKanji.length > 0) {
        haptic.success();
        setShowResults(true);
      } else {
        haptic.warning();
      }
    }
  };

  const handleSelectKanji = (character: string) => {
    haptic.light();
    speak(character);
    onKanjiSelected?.(character);
    onClose();
  };

  const handleClose = () => {
    stop();
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Camera View */}
        <div className="relative h-full w-full">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
          
          {/* Scan overlay */}
          {isActive && !showResults && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-primary rounded-lg relative">
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-primary"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full">
                  <span className="text-xs text-white">Arahkan ke kanji</span>
                </div>
              </div>
            </div>
          )}

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleClose}
            >
              <X className="h-6 w-6" />
            </Button>
            <h2 className="text-white font-medium">Scan Kanji</h2>
            <div className="w-10" />
          </div>

          {/* Error display */}
          {(cameraError || ocrError) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <Card className="mx-4 max-w-sm">
                <CardContent className="p-6 text-center">
                  <FlashlightOff className="h-12 w-12 mx-auto mb-4 text-destructive" />
                  <h3 className="font-medium mb-2">Error</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {cameraError || ocrError}
                  </p>
                  <Button onClick={handleClose}>Tutup</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-white">Memproses gambar...</p>
              </div>
            </div>
          )}

          {/* Results overlay */}
          {showResults && results.length > 0 && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 max-h-[60vh] overflow-y-auto"
            >
              <h3 className="font-bold text-lg mb-4">Kanji Ditemukan</h3>
              <div className="grid grid-cols-2 gap-3">
                {results.map((result, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleSelectKanji(result.character)}
                    className="bg-card border rounded-xl p-4 text-left hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-4xl font-jp">{result.character}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(result.character);
                        }}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {result.meanings_id && (
                      <p className="text-sm text-muted-foreground truncate">
                        {result.meanings_id}
                      </p>
                    )}
                    {result.on_readings && result.on_readings.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.on_readings.slice(0, 2).map((r, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowResults(false);
                    reset();
                  }}
                >
                  Scan Lagi
                </Button>
                <Button className="flex-1" onClick={handleClose}>
                  Selesai
                </Button>
              </div>
            </motion.div>
          )}

          {/* No results */}
          {showResults && results.length === 0 && !isProcessing && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6"
            >
              <div className="text-center py-8">
                <ScanLine className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Tidak ditemukan kanji</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Pastikan kanji terlihat jelas dalam frame
                </p>
                <Button onClick={() => setShowResults(false)}>
                  Coba Lagi
                </Button>
              </div>
            </motion.div>
          )}

          {/* Capture button */}
          {isActive && !showResults && !isProcessing && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCapture}
                className="w-20 h-20 rounded-full bg-white border-4 border-primary flex items-center justify-center"
              >
                <Camera className="h-8 w-8 text-primary" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
