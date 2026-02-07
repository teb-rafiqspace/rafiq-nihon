import { motion } from 'framer-motion';
import { 
  Eye, 
  Type, 
  Zap, 
  VolumeX,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAccessibility, AccessibilitySettings } from '@/hooks/useAccessibility';
import { useI18n } from '@/lib/i18n';

const fontSizeOptions: { value: AccessibilitySettings['fontSize']; label: string; size: string }[] = [
  { value: 'small', label: 'Kecil', size: '14px' },
  { value: 'medium', label: 'Normal', size: '16px' },
  { value: 'large', label: 'Besar', size: '18px' },
  { value: 'xlarge', label: 'Sangat Besar', size: '20px' },
];

export function AccessibilityPanel() {
  const { t } = useI18n();
  const { 
    settings, 
    toggleHighContrast, 
    toggleReducedMotion, 
    toggleScreenReaderOptimized,
    setFontSize 
  } = useAccessibility();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
        {t('accessibility')}
      </h2>
      <Card className="divide-y divide-border">
        {/* High Contrast Mode */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center"
              aria-hidden="true"
            >
              <Eye className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="font-medium">{t('highContrast')}</p>
              <p className="text-sm text-muted-foreground">
                {t('highContrastDesc')}
              </p>
            </div>
          </div>
          <Switch 
            checked={settings.highContrast}
            onCheckedChange={toggleHighContrast}
            aria-label={t('highContrast')}
          />
        </div>

        {/* Font Size */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
              aria-hidden="true"
            >
              <Type className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{t('fontSize')}</p>
              <p className="text-sm text-muted-foreground">
                {t('fontSizeDesc')}
              </p>
            </div>
          </div>
          <div 
            className="grid grid-cols-4 gap-2"
            role="radiogroup"
            aria-label={t('fontSize')}
          >
            {fontSizeOptions.map(({ value, label, size }) => (
              <button
                key={value}
                onClick={() => setFontSize(value)}
                role="radio"
                aria-checked={settings.fontSize === value}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  settings.fontSize === value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <span 
                  className={`font-medium ${settings.fontSize === value ? 'text-primary' : 'text-muted-foreground'}`}
                  style={{ fontSize: size }}
                  aria-hidden="true"
                >
                  あ
                </span>
                <span className={`text-xs ${settings.fontSize === value ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {settings.fontSize === value && (
                  <Check className="h-3 w-3 text-primary" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Reduced Motion */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center"
              aria-hidden="true"
            >
              <Zap className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-medium">{t('reducedMotion')}</p>
              <p className="text-sm text-muted-foreground">
                {t('reducedMotionDesc')}
              </p>
            </div>
          </div>
          <Switch 
            checked={settings.reducedMotion}
            onCheckedChange={toggleReducedMotion}
            aria-label={t('reducedMotion')}
          />
        </div>

        {/* Screen Reader Optimization */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center"
              aria-hidden="true"
            >
              <VolumeX className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="font-medium">{t('screenReader')}</p>
              <p className="text-sm text-muted-foreground">
                {t('screenReaderDesc')}
              </p>
            </div>
          </div>
          <Switch 
            checked={settings.screenReaderOptimized}
            onCheckedChange={toggleScreenReaderOptimized}
            aria-label={t('screenReader')}
          />
        </div>
      </Card>
    </motion.section>
  );
}
