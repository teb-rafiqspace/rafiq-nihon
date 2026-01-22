import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Room {
  id: string;
  nameJp: string;
  nameId: string;
  reading: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const rooms: Room[] = [
  { id: 'toilet', nameJp: 'トイレ', nameId: 'Toilet', reading: 'toire', x: 5, y: 10, width: 18, height: 15, color: 'hsl(var(--secondary))' },
  { id: 'changing', nameJp: '更衣室', nameId: 'Ruang Ganti', reading: 'kouishitsu', x: 28, y: 10, width: 18, height: 15, color: 'hsl(var(--accent))' },
  { id: 'factory', nameJp: '工場', nameId: 'Pabrik', reading: 'koujou', x: 55, y: 5, width: 40, height: 35, color: 'hsl(var(--warning))' },
  { id: 'canteen', nameJp: '食堂', nameId: 'Kantin', reading: 'shokudou', x: 5, y: 35, width: 25, height: 20, color: 'hsl(var(--primary))' },
  { id: 'office', nameJp: '事務所', nameId: 'Kantor', reading: 'jimusho', x: 60, y: 50, width: 30, height: 20, color: 'hsl(var(--secondary))' },
  { id: 'restroom', nameJp: '休憩室', nameId: 'Ruang Istirahat', reading: 'kyuukeishitsu', x: 5, y: 60, width: 25, height: 18, color: 'hsl(var(--accent))' },
  { id: 'entrance', nameJp: '入口', nameId: 'Pintu Masuk', reading: 'iriguchi', x: 40, y: 85, width: 20, height: 10, color: 'hsl(var(--primary))' },
];

interface FactoryMapProps {
  onComplete?: () => void;
}

export function FactoryMap({ onComplete }: FactoryMapProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('entrance');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPath, setShowPath] = useState(false);
  const [pathTarget, setPathTarget] = useState<string | null>(null);
  const [visitedRooms, setVisitedRooms] = useState<string[]>(['entrance']);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoice = () => {
      const voices = speechSynthesis.getVoices();
      const jpVoice = voices.find(v => v.lang.startsWith('ja')) || null;
      setSelectedVoice(jpVoice);
    };
    loadVoice();
    speechSynthesis.onvoiceschanged = loadVoice;
  }, []);

  const speakJapanese = useCallback((text: string) => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  }, [isPlaying, selectedVoice]);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    speakJapanese(room.nameJp);
    
    if (!visitedRooms.includes(room.id)) {
      setVisitedRooms(prev => [...prev, room.id]);
    }
  };

  const handleNavigate = (roomId: string) => {
    setPathTarget(roomId);
    setShowPath(true);
    
    setTimeout(() => {
      setCurrentLocation(roomId);
      setShowPath(false);
      setPathTarget(null);
    }, 1500);
  };

  const getPositionSentence = (room: Room): string => {
    const current = rooms.find(r => r.id === currentLocation);
    if (!current || current.id === room.id) return '';
    
    const dx = room.x - current.x;
    const dy = room.y - current.y;
    
    let position = '';
    if (Math.abs(dx) > Math.abs(dy)) {
      position = dx > 0 ? '右' : '左';
    } else {
      position = dy > 0 ? '下' : '上';
    }
    
    return `${room.nameJp}は${current.nameJp}の${position}にあります。`;
  };

  const currentRoom = rooms.find(r => r.id === currentLocation);

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="font-bold text-lg font-jp">工場マップ</h3>
        <p className="text-sm text-muted-foreground">Tap ruangan untuk mendengar namanya</p>
      </div>

      {/* Map Container */}
      <div className="relative bg-muted/50 rounded-2xl p-4 border border-border overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full aspect-square">
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsl(var(--border))" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Path visualization */}
          {showPath && pathTarget && (
            <motion.line
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
              x1={rooms.find(r => r.id === currentLocation)!.x + rooms.find(r => r.id === currentLocation)!.width / 2}
              y1={rooms.find(r => r.id === currentLocation)!.y + rooms.find(r => r.id === currentLocation)!.height / 2}
              x2={rooms.find(r => r.id === pathTarget)!.x + rooms.find(r => r.id === pathTarget)!.width / 2}
              y2={rooms.find(r => r.id === pathTarget)!.y + rooms.find(r => r.id === pathTarget)!.height / 2}
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          )}

          {/* Rooms */}
          {rooms.map((room) => (
            <g key={room.id} onClick={() => handleRoomClick(room)} className="cursor-pointer">
              <motion.rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                rx="2"
                fill={room.color}
                fillOpacity={selectedRoom?.id === room.id ? 0.9 : 0.7}
                stroke={selectedRoom?.id === room.id ? 'hsl(var(--foreground))' : 'transparent'}
                strokeWidth="0.5"
                whileHover={{ fillOpacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
              />
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 - 2}
                textAnchor="middle"
                className="text-[3px] fill-white font-bold font-jp pointer-events-none"
              >
                {room.nameJp}
              </text>
              <text
                x={room.x + room.width / 2}
                y={room.y + room.height / 2 + 3}
                textAnchor="middle"
                className="text-[2px] fill-white/80 pointer-events-none"
              >
                {room.nameId}
              </text>

              {/* Current location indicator */}
              {currentLocation === room.id && (
                <motion.circle
                  cx={room.x + room.width / 2}
                  cy={room.y + room.height - 3}
                  r="2"
                  fill="hsl(var(--primary))"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </g>
          ))}

          {/* You are here marker */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
          >
            <circle
              cx={currentRoom!.x + currentRoom!.width / 2}
              cy={currentRoom!.y + currentRoom!.height - 3}
              r="3"
              fill="hsl(var(--primary))"
              fillOpacity="0.3"
            />
          </motion.g>
        </svg>

        {/* Current location badge */}
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span className="font-jp">{currentRoom?.nameJp}</span>
        </div>
      </div>

      {/* Selected Room Info */}
      <AnimatePresence mode="wait">
        {selectedRoom && (
          <motion.div
            key={selectedRoom.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card rounded-xl p-4 border border-border shadow-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xl font-jp">{selectedRoom.nameJp}</h4>
                <p className="text-sm text-muted-foreground">{selectedRoom.reading} - {selectedRoom.nameId}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => speakJapanese(selectedRoom.nameJp)}
                className="shrink-0"
              >
                <Volume2 className={cn("w-5 h-5", isPlaying && "text-primary animate-pulse")} />
              </Button>
            </div>

            {selectedRoom.id !== currentLocation && (
              <div className="space-y-2">
                <p className="text-sm font-jp bg-muted/50 p-2 rounded-lg">
                  {getPositionSentence(selectedRoom)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate(selectedRoom.id)}
                  className="w-full"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Pindah ke {selectedRoom.nameId}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="text-center text-sm text-muted-foreground">
        Tempat dikunjungi: {visitedRooms.length}/{rooms.length}
      </div>
    </div>
  );
}
