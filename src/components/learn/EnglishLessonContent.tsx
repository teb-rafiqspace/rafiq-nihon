import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

interface LessonSection {
  title: string;
  body: string;
  type?: 'info' | 'tip' | 'warning' | 'example';
}

interface KeyPoint {
  text: string;
  detail?: string;
}

interface EnglishLessonContentProps {
  lessonTitle: string;
  lessonTitleId: string;
  sections: LessonSection[];
  keyPoints?: KeyPoint[];
  currentSection: number;
  totalSections: number;
}

export function EnglishLessonContent({
  lessonTitle,
  lessonTitleId,
  sections,
  keyPoints,
  currentSection,
  totalSections,
}: EnglishLessonContentProps) {
  const section = sections[currentSection];
  if (!section) return null;

  const iconMap = {
    info: <BookOpen className="h-5 w-5 text-blue-500" />,
    tip: <Lightbulb className="h-5 w-5 text-amber-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    example: <CheckCircle className="h-5 w-5 text-green-500" />,
  };

  const bgMap = {
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    tip: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    warning: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
    example: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
  };

  const sectionType = section.type || 'info';

  return (
    <div className="space-y-4">
      {/* Section Counter */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {currentSection + 1} / {totalSections}
        </Badge>
      </div>

      {/* Section Card */}
      <Card className={`border ${bgMap[sectionType]}`}>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            {iconMap[sectionType]}
            <h3 className="font-semibold text-base">{section.title}</h3>
          </div>
          <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
            {section.body}
          </div>
        </CardContent>
      </Card>

      {/* Key Points (shown on last section) */}
      {keyPoints && keyPoints.length > 0 && currentSection === totalSections - 1 && (
        <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30">
          <CardContent className="p-5 space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-indigo-500" />
              Key Takeaways
            </h4>
            <ul className="space-y-2">
              {keyPoints.map((kp, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <span className="text-indigo-500 font-bold mt-0.5">{idx + 1}.</span>
                  <div>
                    <span className="font-medium">{kp.text}</span>
                    {kp.detail && (
                      <span className="text-muted-foreground ml-1">— {kp.detail}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
