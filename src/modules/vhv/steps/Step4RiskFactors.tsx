import React from 'react';
import { Droplets } from 'lucide-react';

export type AlcoholLevel = 'none' | 'occasional' | 'regular' | 'heavy';

export const ALCOHOL_OPTIONS: { id: AlcoholLevel; label: string; hint: string }[] = [
  { id: 'none', label: 'ไม่ดื่มเลย', hint: 'งดดื่มตลอด หรือเลิกแล้วมากกว่า 1 ปี' },
  { id: 'occasional', label: 'ดื่มเป็นครั้งคราว', hint: 'ไม่เกิน 1 ครั้ง/สัปดาห์ ปริมาณไม่มาก' },
  { id: 'regular', label: 'ดื่มประจำ', hint: 'ตั้งแต่ 3 ครั้ง/สัปดาห์ขึ้นไป' },
  { id: 'heavy', label: 'ดื่มหนัก', hint: 'ตั้งแต่ 5 แก้ว/ครั้ง หรือดื่มเกือบทุกวัน' },
];

interface Step4RiskFactorsProps {
  alcoholLevel: AlcoholLevel;
  hasDehydration: boolean;
  onSelectAlcohol: (level: AlcoholLevel) => void;
  onToggleDehydration: (status: boolean) => void;
}

export const Step4RiskFactors: React.FC<Step4RiskFactorsProps> = ({
  alcoholLevel,
  hasDehydration,
  onSelectAlcohol,
  onToggleDehydration,
}) => {
  return (
    <div className="space-y-8 font-sans text-sm text-zinc-900">
      {/* ===== แอลกอฮอล์ ===== */}
      <section className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">การดื่มแอลกอฮอล์</h2>
          <p className="leading-relaxed text-zinc-500">
            สอบถามการดื่มในช่วง 1 เดือนที่ผ่านมา แล้วเลือกระดับที่ตรงที่สุด
          </p>
        </header>

        <div role="radiogroup" aria-label="ระดับการดื่มแอลกอฮอล์" className="space-y-2">
          {ALCOHOL_OPTIONS.map((opt) => {
            const selected = alcoholLevel === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelectAlcohol(opt.id)}
                className={`flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C33]/30 ${
                  selected
                    ? 'border-[#0E5C33] bg-emerald-50/50'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                {/* วงกลมเลือก */}
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    selected ? 'border-[#0E5C33]' : 'border-zinc-300'
                  }`}
                  aria-hidden
                >
                  {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#0E5C33]" />}
                </span>

                <span className="min-w-0">
                  <span className="block font-medium">{opt.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">{opt.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== ภาวะขาดน้ำ / Sick Day Rule ===== */}
      <section className="space-y-3 border-t border-zinc-100 pt-6">
        <h3 className="flex items-center gap-2 font-medium">
          <Droplets className="h-4 w-4 text-sky-500" />
          สัปดาห์นี้มีอาการท้องเสียหรือขาดน้ำหรือไม่?
        </h3>

        <div
          role="radiogroup"
          aria-label="อาการท้องเสียหรือขาดน้ำ"
          className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1"
        >
          <button
            type="button"
            role="radio"
            aria-checked={!hasDehydration}
            onClick={() => onToggleDehydration(false)}
            className={`h-11 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C33]/30 ${
              !hasDehydration ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            ไม่มีอาการ
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={hasDehydration}
            onClick={() => onToggleDehydration(true)}
            className={`h-11 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
              hasDehydration ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            มีอาการขาดน้ำ
          </button>
        </div>
      </section>
    </div>
  );
};

export default Step4RiskFactors;