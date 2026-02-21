import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Camera,
  Mic,
  ScanFace,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProctoringSetupProps {
  onReady: () => void;
  onBack: () => void;
}

type StepStatus = 'pending' | 'checking' | 'passed' | 'failed';

export function ProctoringSetup({ onReady, onBack }: ProctoringSetupProps) {
  const [cameraStatus, setCameraStatus] = useState<StepStatus>('pending');
  const [micStatus, setMicStatus] = useState<StepStatus>('pending');
  const [faceStatus, setFaceStatus] = useState<StepStatus>('pending');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const allPassed =
    cameraStatus === 'passed' &&
    micStatus === 'passed' &&
    faceStatus === 'passed';

  // Request camera permission
  const requestCamera = useCallback(async () => {
    setCameraStatus('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 320, height: 240 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStatus('passed');
    } catch {
      setCameraStatus('failed');
    }
  }, []);

  // Request microphone permission
  const requestMic = useCallback(async () => {
    setMicStatus('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop audio tracks immediately -- we only need to verify permission
      stream.getAudioTracks().forEach((t) => t.stop());
      setMicStatus('passed');
    } catch {
      setMicStatus('failed');
    }
  }, []);

  // Simple face detection check (uses video dimensions as proxy)
  const checkFaceDetection = useCallback(async () => {
    if (cameraStatus !== 'passed') return;
    setFaceStatus('checking');

    // Give the camera a moment to stabilise
    await new Promise((r) => setTimeout(r, 1500));

    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setFaceStatus('failed');
      return;
    }

    // Draw frame to offscreen canvas and check if there is meaningful content
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setFaceStatus('failed');
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simple brightness variance check -- a real face produces varied luminance
      let sum = 0;
      let sumSq = 0;
      const pixelCount = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        sum += lum;
        sumSq += lum * lum;
      }
      const mean = sum / pixelCount;
      const variance = sumSq / pixelCount - mean * mean;

      // If variance is above a threshold the camera sees something (likely a face)
      if (variance > 200) {
        setFaceStatus('passed');
      } else {
        setFaceStatus('failed');
      }
    } catch {
      setFaceStatus('failed');
    }
  }, [cameraStatus]);

  // Auto-start checks sequentially
  useEffect(() => {
    if (cameraStatus === 'pending') {
      requestCamera();
    }
  }, [cameraStatus, requestCamera]);

  useEffect(() => {
    if (cameraStatus === 'passed' && micStatus === 'pending') {
      requestMic();
    }
  }, [cameraStatus, micStatus, requestMic]);

  useEffect(() => {
    if (micStatus === 'passed' && faceStatus === 'pending') {
      checkFaceDetection();
    }
  }, [micStatus, faceStatus, checkFaceDetection]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const retryStep = (step: 'camera' | 'mic' | 'face') => {
    if (step === 'camera') {
      setCameraStatus('pending');
      setFaceStatus('pending');
    } else if (step === 'mic') {
      setMicStatus('pending');
    } else {
      setFaceStatus('pending');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card className="border border-border shadow-elevated">
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold">Pengaturan Proktoring</h1>
              <p className="text-sm text-muted-foreground">
                Tes ini menggunakan sistem proktoring untuk memastikan kejujuran.
                Silakan aktifkan izin berikut.
              </p>
            </div>

            {/* Camera preview */}
            {cameraStatus === 'passed' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex justify-center"
              >
                <div className="relative rounded-xl overflow-hidden border-2 border-green-500 shadow-md">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-[240px] h-[180px] object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    Kamera aktif
                  </div>
                </div>
              </motion.div>
            )}

            {/* Setup steps */}
            <div className="space-y-3">
              {/* Step 1: Camera */}
              <SetupStep
                index={1}
                icon={<Camera className="h-5 w-5" />}
                label="Izin Kamera"
                description="Kamera dibutuhkan untuk mendeteksi wajah selama tes"
                status={cameraStatus}
                onRetry={() => retryStep('camera')}
              />

              {/* Step 2: Microphone */}
              <SetupStep
                index={2}
                icon={<Mic className="h-5 w-5" />}
                label="Izin Mikrofon"
                description="Mikrofon dibutuhkan untuk mendeteksi suara percakapan"
                status={micStatus}
                onRetry={() => retryStep('mic')}
              />

              {/* Step 3: Face detection */}
              <SetupStep
                index={3}
                icon={<ScanFace className="h-5 w-5" />}
                label="Deteksi Wajah"
                description="Wajah terdeteksi oleh kamera"
                status={faceStatus}
                onRetry={() => retryStep('face')}
              />
            </div>

            {/* Proctoring rules */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                    Aturan Proktoring
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                    <li>Jangan berpindah tab atau jendela selama tes berlangsung</li>
                    <li>Wajah Anda harus terlihat oleh kamera setiap saat</li>
                    <li>Jangan berbicara atau berdiskusi selama tes</li>
                    <li>Jangan menggunakan alat bantu atau developer tools</li>
                    <li>Tes akan otomatis berakhir setelah 3 pelanggaran</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full"
                onClick={onReady}
                disabled={!allPassed}
              >
                <ShieldCheck className="h-5 w-5 mr-2" />
                Mulai Tes Terproktoring
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Internal step component                                            */
/* ------------------------------------------------------------------ */

function SetupStep({
  index,
  icon,
  label,
  description,
  status,
  onRetry,
}: {
  index: number;
  icon: React.ReactNode;
  label: string;
  description: string;
  status: StepStatus;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-colors',
        status === 'passed' && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        status === 'failed' && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        status === 'checking' && 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        status === 'pending' && 'bg-muted/30 border-border'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          status === 'passed' && 'bg-green-100 dark:bg-green-800/40 text-green-600 dark:text-green-400',
          status === 'failed' && 'bg-red-100 dark:bg-red-800/40 text-red-600 dark:text-red-400',
          status === 'checking' && 'bg-yellow-100 dark:bg-yellow-800/40 text-yellow-600 dark:text-yellow-400',
          status === 'pending' && 'bg-muted text-muted-foreground'
        )}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>

      {/* Status indicator */}
      <div className="shrink-0">
        {status === 'passed' && (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
        {status === 'failed' && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            <XCircle className="h-5 w-5" />
            <span>Coba lagi</span>
          </button>
        )}
        {status === 'checking' && (
          <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
        )}
        {status === 'pending' && (
          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
        )}
      </div>
    </motion.div>
  );
}
