import React from 'react';
import { cn } from '@/lib/utils';

interface SakuraPetalProps {
  className?: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

export function SakuraPetal({ 
  className = "", 
  size = 20, 
  color = "hsl(350, 100%, 85%)",
  style = {} 
}: SakuraPetalProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn("", className)}
      style={style}
    >
      <path
        d="M12 2C12 2 8 6 8 10C8 14 12 18 12 18C12 18 16 14 16 10C16 6 12 2 12 2Z"
        fill={color}
        opacity={0.9}
      />
      <ellipse
        cx="12"
        cy="10"
        rx="1"
        ry="1.5"
        fill="hsl(43, 96%, 56%)"
        opacity={0.8}
      />
    </svg>
  );
}

interface FallingPetalsProps {
  count?: number;
  className?: string;
}

export function FallingPetals({ count = 12, className = "" }: FallingPetalsProps) {
  const petals = React.useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 8,
      size: 12 + Math.random() * 12,
      opacity: 0.4 + Math.random() * 0.4,
    })),
    [count]
  );

  return (
    <div className={cn("fixed inset-0 pointer-events-none overflow-hidden z-0", className)}>
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-fall"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
          }}
        >
          <SakuraPetal 
            size={petal.size}
            color={`hsla(350, 100%, 85%, ${petal.opacity})`}
            className="animate-sway"
          />
        </div>
      ))}
    </div>
  );
}

interface SakuraBranchProps {
  className?: string;
}

export function SakuraBranch({ className = "" }: SakuraBranchProps) {
  return (
    <svg 
      viewBox="0 0 200 100" 
      className={cn("w-full h-auto", className)}
    >
      {/* Branch */}
      <path
        d="M0 80 Q50 60 100 50 Q150 40 200 20"
        stroke="hsl(24, 30%, 35%)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Small branches */}
      <path
        d="M60 62 Q70 50 85 45"
        stroke="hsl(24, 30%, 40%)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M120 42 Q135 35 150 30"
        stroke="hsl(24, 30%, 40%)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Sakura flowers */}
      <g>
        {/* Flower 1 */}
        <circle cx="50" cy="55" r="8" fill="hsl(350, 100%, 90%)" />
        <circle cx="44" cy="52" r="6" fill="hsl(350, 100%, 88%)" />
        <circle cx="56" cy="52" r="6" fill="hsl(350, 100%, 88%)" />
        <circle cx="46" cy="60" r="6" fill="hsl(350, 100%, 88%)" />
        <circle cx="54" cy="60" r="6" fill="hsl(350, 100%, 88%)" />
        <circle cx="50" cy="55" r="3" fill="hsl(43, 96%, 65%)" />
        
        {/* Flower 2 */}
        <circle cx="90" cy="45" r="7" fill="hsl(350, 100%, 92%)" />
        <circle cx="85" cy="42" r="5" fill="hsl(350, 100%, 90%)" />
        <circle cx="95" cy="42" r="5" fill="hsl(350, 100%, 90%)" />
        <circle cx="86" cy="49" r="5" fill="hsl(350, 100%, 90%)" />
        <circle cx="94" cy="49" r="5" fill="hsl(350, 100%, 90%)" />
        <circle cx="90" cy="45" r="2.5" fill="hsl(43, 96%, 65%)" />
        
        {/* Flower 3 */}
        <circle cx="140" cy="32" r="9" fill="hsl(350, 100%, 88%)" />
        <circle cx="133" cy="28" r="7" fill="hsl(350, 100%, 86%)" />
        <circle cx="147" cy="28" r="7" fill="hsl(350, 100%, 86%)" />
        <circle cx="134" cy="37" r="7" fill="hsl(350, 100%, 86%)" />
        <circle cx="146" cy="37" r="7" fill="hsl(350, 100%, 86%)" />
        <circle cx="140" cy="32" r="3.5" fill="hsl(43, 96%, 65%)" />
        
        {/* Flower 4 - small */}
        <circle cx="180" cy="22" r="6" fill="hsl(350, 100%, 90%)" />
        <circle cx="175" cy="19" r="4" fill="hsl(350, 100%, 88%)" />
        <circle cx="185" cy="19" r="4" fill="hsl(350, 100%, 88%)" />
        <circle cx="176" cy="26" r="4" fill="hsl(350, 100%, 88%)" />
        <circle cx="184" cy="26" r="4" fill="hsl(350, 100%, 88%)" />
        <circle cx="180" cy="22" r="2" fill="hsl(43, 96%, 65%)" />
        
        {/* Buds */}
        <ellipse cx="70" cy="50" rx="3" ry="5" fill="hsl(350, 100%, 85%)" />
        <ellipse cx="110" cy="40" rx="2.5" ry="4" fill="hsl(350, 100%, 87%)" />
        <ellipse cx="160" cy="28" rx="2" ry="3" fill="hsl(350, 100%, 85%)" />
      </g>
    </svg>
  );
}

interface SakuraCornerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export function SakuraCorner({ position = 'top-right', className = "" }: SakuraCornerProps) {
  const positionClasses = {
    'top-left': 'top-0 left-0 -scale-x-100',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0 -scale-x-100 -scale-y-100',
    'bottom-right': 'bottom-0 right-0 -scale-y-100',
  };
  
  return (
    <div className={cn("absolute w-24 h-24 opacity-60 pointer-events-none", positionClasses[position], className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Corner branch */}
        <path
          d="M100 0 Q70 20 50 50 Q30 70 0 100"
          stroke="hsl(24, 30%, 45%)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Flowers */}
        <circle cx="75" cy="25" r="8" fill="hsl(350, 100%, 88%)" opacity="0.9" />
        <circle cx="50" cy="50" r="6" fill="hsl(350, 100%, 90%)" opacity="0.8" />
        <circle cx="25" cy="75" r="5" fill="hsl(350, 100%, 85%)" opacity="0.7" />
        
        {/* Centers */}
        <circle cx="75" cy="25" r="2" fill="hsl(43, 96%, 65%)" />
        <circle cx="50" cy="50" r="1.5" fill="hsl(43, 96%, 65%)" />
        <circle cx="25" cy="75" r="1" fill="hsl(43, 96%, 65%)" />
        
        {/* Petals floating */}
        <ellipse cx="85" cy="40" rx="3" ry="5" fill="hsl(350, 100%, 85%)" opacity="0.6" transform="rotate(30 85 40)" />
        <ellipse cx="40" cy="85" rx="2" ry="4" fill="hsl(350, 100%, 87%)" opacity="0.5" transform="rotate(-20 40 85)" />
      </svg>
    </div>
  );
}

export function SakuraLoader() {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-bounce"
          style={{ 
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.8s'
          }}
        >
          <SakuraPetal size={16} />
        </div>
      ))}
    </div>
  );
}
