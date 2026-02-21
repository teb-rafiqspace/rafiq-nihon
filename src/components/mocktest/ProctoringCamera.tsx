import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProctoringCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  faceStatus: 'ok' | 'no_face' | 'multiple_faces' | 'checking';
  isCameraActive: boolean;
}

const statusConfig: Record<
  ProctoringCameraProps['faceStatus'],
  { borderColor: string; label: string; dotColor: string }
> = {
  ok: {
    borderColor: 'border-green-500',
    label: 'Wajah terdeteksi',
    dotColor: 'bg-green-500',
  },
  no_face: {
    borderColor: 'border-red-500',
    label: 'Wajah tidak terdeteksi',
    dotColor: 'bg-red-500',
  },
  multiple_faces: {
    borderColor: 'border-red-500',
    label: 'Lebih dari satu wajah',
    dotColor: 'bg-red-500',
  },
  checking: {
    borderColor: 'border-yellow-500',
    label: 'Memeriksa...',
    dotColor: 'bg-yellow-500',
  },
};

export function ProctoringCamera({
  videoRef,
  faceStatus,
  isCameraActive,
}: ProctoringCameraProps) {
  const config = statusConfig[faceStatus];

  return (
    <AnimatePresence>
      {isCameraActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div
            className={cn(
              'rounded-xl shadow-lg overflow-hidden border-2 bg-black',
              config.borderColor
            )}
          >
            {/* Video preview */}
            <div className="relative w-[120px] h-[90px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Camera icon overlay when inactive */}
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <CameraOff className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              {/* Small camera icon indicator */}
              <div className="absolute top-1.5 left-1.5">
                <Camera className="h-3.5 w-3.5 text-white drop-shadow-md" />
              </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-card">
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  config.dotColor,
                  faceStatus === 'checking' && 'animate-pulse'
                )}
              />
              <span className="text-[10px] font-medium text-foreground truncate leading-tight">
                {config.label}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
