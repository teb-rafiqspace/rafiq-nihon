import { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Repeat1,
  X,
  ListMusic,
  Volume2,
  ChevronUp,
  ChevronDown,
  Trash2,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAudioQueue, QueueItem } from '@/hooks/useAudioQueue';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioQueuePlayerProps {
  className?: string;
}

export function AudioQueuePlayer({ className }: AudioQueuePlayerProps) {
  const {
    queue,
    currentIndex,
    currentItem,
    isPlaying,
    isPaused,
    repeatMode,
    autoAdvance,
    playbackSpeed,
    delayBetweenItems,
    play,
    pause,
    resume,
    stop,
    next,
    previous,
    clearQueue,
    removeFromQueue,
    toggleRepeat,
    setPlaybackSpeed,
    setDelay,
    toggleAutoAdvance,
  } = useAudioQueue();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (queue.length === 0) {
    return null;
  }

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={cn(
          'fixed bottom-20 left-0 right-0 z-40 px-4 pb-2',
          'md:bottom-4 md:left-auto md:right-4 md:max-w-md',
          className
        )}
      >
        <Card className="shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-3">
            {/* Mini Player */}
            <div className="flex items-center gap-3">
              {/* Current Item Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-lg truncate">
                  {currentItem?.text || 'Antrian Audio'}
                </p>
                {currentItem?.reading && (
                  <p className="text-sm text-muted-foreground truncate">
                    {currentItem.reading}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {currentIndex + 1} / {queue.length}
                  </Badge>
                  {repeatMode !== 'none' && (
                    <Badge variant="outline" className="text-xs">
                      {repeatMode === 'one' ? 'Ulangi 1' : 'Ulangi Semua'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={previous}
                  className="h-8 w-8"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  variant="default"
                  size="icon"
                  onClick={() => {
                    if (!isPlaying) {
                      play(currentIndex >= 0 ? currentIndex : 0);
                    } else if (isPaused) {
                      resume();
                    } else {
                      pause();
                    }
                  }}
                  className="h-10 w-10"
                >
                  {isPlaying && !isPaused ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={next}
                  className="h-8 w-8"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Expand/Collapse */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Expanded Queue View */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {/* Controls Row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={repeatMode !== 'none' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={toggleRepeat}
                        className="h-8 w-8"
                      >
                        <RepeatIcon className="h-4 w-4" />
                      </Button>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64" align="start">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Kecepatan: {playbackSpeed}x
                              </Label>
                              <Slider
                                value={[playbackSpeed]}
                                onValueChange={([v]) => setPlaybackSpeed(v)}
                                min={0.5}
                                max={2}
                                step={0.1}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Jeda: {delayBetweenItems / 1000}s
                              </Label>
                              <Slider
                                value={[delayBetweenItems]}
                                onValueChange={([v]) => setDelay(v)}
                                min={0}
                                max={5000}
                                step={500}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Auto lanjut</Label>
                              <Switch
                                checked={autoAdvance}
                                onCheckedChange={toggleAutoAdvance}
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Badge variant="outline" className="text-xs">
                        {playbackSpeed}x
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearQueue}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>

                  {/* Queue List */}
                  <ScrollArea className="h-48 mt-3">
                    <div className="space-y-1">
                      {queue.map((item, index) => (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
                            index === currentIndex
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-muted'
                          )}
                          onClick={() => play(index)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'font-medium truncate',
                              index === currentIndex && 'text-primary'
                            )}>
                              {item.text}
                            </p>
                            {item.meaning && (
                              <p className="text-xs text-muted-foreground truncate">
                                {item.meaning}
                              </p>
                            )}
                          </div>
                          
                          {index === currentIndex && isPlaying && !isPaused && (
                            <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromQueue(index);
                            }}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Button to add items to queue
interface AddToQueueButtonProps {
  items: QueueItem | QueueItem[];
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'icon';
}

export function AddToQueueButton({
  items,
  className,
  variant = 'outline',
  size = 'icon',
}: AddToQueueButtonProps) {
  const { addToQueue } = useAudioQueue();

  const handleAdd = () => {
    addToQueue(items);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAdd}
      className={className}
      aria-label="Tambah ke antrian"
    >
      <ListMusic className="h-4 w-4" />
    </Button>
  );
}
