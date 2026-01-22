import { Home, BookOpen, Layers, Award, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Beranda', path: '/home' },
  { icon: BookOpen, label: 'Belajar', path: '/learn' },
  { icon: Layers, label: 'Latihan', path: '/practice' },
  { icon: Award, label: 'Ujian', path: '/exam' },
  { icon: User, label: 'Profil', path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/98 backdrop-blur-xl border-t border-sakura-100 pb-safe shadow-lg">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200",
                  isActive ? "text-primary" : "text-sumi-400 hover:text-sakura-500"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-sakura-100 rounded-2xl"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <Icon className={cn("h-5 w-5 relative z-10 transition-transform", isActive && "stroke-[2.5] scale-110")} />
                <span className="text-[10px] font-medium relative z-10">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
