import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { FlashCard } from './FlashCard';
import { Check, X } from 'lucide-react';

interface SwipeableCardProps {
  wordJp: string;
  reading?: string;
  meaningId: string;
  exampleJp?: string;
  exampleId?: string;
  isFlipped: boolean;
  onFlip: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function SwipeableCard({
  wordJp,
  reading,
  meaningId,
  exampleJp,
  exampleId,
  isFlipped,
  onFlip,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  const greenOpacity = useTransform(x, [0, 100], [0, 1]);
  const redOpacity = useTransform(x, [-100, 0], [1, 0]);
  
  const [isExiting, setIsExiting] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      setIsExiting(true);
      setTimeout(() => {
        onSwipeRight();
        setIsExiting(false);
      }, 200);
    } else if (info.offset.x < -threshold) {
      setIsExiting(true);
      setTimeout(() => {
        onSwipeLeft();
        setIsExiting(false);
      }, 200);
    }
  };

  return (
    <div className="relative">
      {/* Green overlay for "Know" */}
      <motion.div
        className="absolute inset-0 bg-success/20 rounded-3xl flex items-center justify-center pointer-events-none z-10"
        style={{ opacity: greenOpacity }}
      >
        <div className="bg-success rounded-full p-4">
          <Check className="h-12 w-12 text-success-foreground" />
        </div>
      </motion.div>
      
      {/* Red overlay for "Don't Know" */}
      <motion.div
        className="absolute inset-0 bg-destructive/20 rounded-3xl flex items-center justify-center pointer-events-none z-10"
        style={{ opacity: redOpacity }}
      >
        <div className="bg-destructive rounded-full p-4">
          <X className="h-12 w-12 text-destructive-foreground" />
        </div>
      </motion.div>
      
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, opacity }}
        animate={isExiting ? { 
          x: x.get() > 0 ? 300 : -300, 
          opacity: 0,
          transition: { duration: 0.2 }
        } : {}}
        className="touch-none"
      >
        <FlashCard
          wordJp={wordJp}
          reading={reading}
          meaningId={meaningId}
          exampleJp={exampleJp}
          exampleId={exampleId}
          isFlipped={isFlipped}
          onFlip={onFlip}
        />
      </motion.div>
    </div>
  );
}
