import { motion } from 'framer-motion';

interface WaveformVisualizerProps {
  data: number[];
  isActive: boolean;
}

export function WaveformVisualizer({ data, isActive }: WaveformVisualizerProps) {
  // Generate bars based on data or idle animation
  const bars = data.length > 0 ? data : Array(16).fill(0);

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((value, index) => {
        const height = isActive 
          ? Math.max(4, Math.abs(value) * 40 + 4) 
          : 4 + Math.sin(Date.now() / 200 + index * 0.5) * 2;
        
        return (
          <motion.div
            key={index}
            className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-purple-500"
            animate={{
              height: `${height}px`,
              opacity: isActive ? 0.8 + Math.abs(value) * 0.2 : 0.4
            }}
            transition={{
              duration: 0.1,
              ease: 'easeOut'
            }}
          />
        );
      })}
    </div>
  );
}
