import { Home, BookOpen, Layers, Mic, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { TranslationKeys } from '@/lib/i18n';

const navItems: { icon: typeof Home; labelKey: keyof TranslationKeys; path: string }[] = [
  { icon: Home, labelKey: 'home', path: '/home' },
  { icon: BookOpen, labelKey: 'learn', path: '/learn' },
  { icon: Mic, labelKey: 'speaking', path: '/speaking' },
  { icon: Layers, labelKey: 'practice', path: '/practice' },
  { icon: User, labelKey: 'profile', path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border pb-safe">
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
                  "relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <Icon className={cn("h-5 w-5 relative z-10", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium relative z-10">{t(item.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
