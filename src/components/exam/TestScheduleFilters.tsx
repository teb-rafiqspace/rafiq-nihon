import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTestTypes } from '@/hooks/useExamSchedules';

interface TestScheduleFiltersProps {
  testType: string;
  city: string;
  level: string;
  onTestTypeChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onLevelChange: (value: string) => void;
}

const cities = [
  { value: 'all', label: 'Semua Kota' },
  { value: 'Jakarta', label: 'Jakarta' },
  { value: 'Surabaya', label: 'Surabaya' },
  { value: 'Bandung', label: 'Bandung' },
  { value: 'Yogyakarta', label: 'Yogyakarta' },
  { value: 'Semarang', label: 'Semarang' },
  { value: 'Medan', label: 'Medan' },
  { value: 'Makassar', label: 'Makassar' },
  { value: 'Denpasar', label: 'Denpasar' },
  { value: 'Palembang', label: 'Palembang' },
];

const levels = [
  { value: 'all', label: 'Semua Level' },
  { value: 'N5/5級', label: 'N5/5級 (Pemula)' },
  { value: 'N4/4級', label: 'N4/4級 (Dasar)' },
  { value: 'N3/3級', label: 'N3/3級 (Menengah)' },
  { value: 'N2/2級', label: 'N2/2級 (Lanjutan)' },
  { value: 'N1/1級', label: 'N1/1級 (Mahir)' },
];

export function TestScheduleFilters({
  testType,
  city,
  level,
  onTestTypeChange,
  onCityChange,
  onLevelChange,
}: TestScheduleFiltersProps) {
  const { data: testTypes } = useTestTypes();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      <Select value={testType} onValueChange={onTestTypeChange}>
        <SelectTrigger className="min-w-[130px] h-9 text-sm">
          <SelectValue placeholder="Jenis Ujian" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Ujian</SelectItem>
          {testTypes?.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name_id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={city} onValueChange={onCityChange}>
        <SelectTrigger className="min-w-[120px] h-9 text-sm">
          <SelectValue placeholder="Kota" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={level} onValueChange={onLevelChange}>
        <SelectTrigger className="min-w-[140px] h-9 text-sm">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          {levels.map((l) => (
            <SelectItem key={l.value} value={l.value}>
              {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
