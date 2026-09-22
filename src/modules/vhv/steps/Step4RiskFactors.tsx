import React from 'react';
import { Droplets, Check } from 'lucide-react';

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
    <div className="space-y-5">
      <div>
        <h2 className="text-[15px] font-semibold text-[#17301F]">เลือกระดับการดื่มแอลกอฮอล์[cite: 11]</h2>
        <p className="text-[12.5px] text-[#6B786D] mt-0.5">
          สอบถามการดื่มในช่วง 1 เดือนที่ผ่านมา แล้วเลือกระดับที่ตรงที่สุด[cite: 11]
        </p>
      </div>

      <div className="space-y-2">
        {ALCOHOL_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectAlcohol(opt.id)}
            className={`w-full text-left px-4 py-3 rounded-md border transition ${
              alcoholLevel === opt.id ? 'border-[#0E5C33] bg-[#F3F7EC]' : 'border-[#DCE3DA] hover:bg-[#F6F4EF]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-semibold text-[#17301F]">{opt.label}[cite: 11]</span>
              {alcoholLevel === opt.id && <Check className="w-4 h-4 text-[#0E5C33]" />}
            </div>
            <p className="text-[11.5px] text-[#8A968C] mt-0.5">{opt.hint}[cite: 11]</p>
          </button>
        ))}
      </div>

      {/* ภาวะขาดน้ำ / Sick Day Rule Trigger */}
      <div className="pt-4 border-t border-[#EEF0EA] space-y-2">
        <p className="text-[12.5px] font-medium text-[#5C6B5F] flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-blue-500" />
          สัปดาห์นี้มีอาการท้องเสีย / ขาดน้ำหรือไม่?[cite: 1]
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onToggleDehydration(false)}
            className={`h-11 rounded-md text-[12.5px] font-semibold border transition ${
              !hasDehydration
                ? 'bg-[#0E5C33] text-white border-[#0E5C33]'
                : 'bg-white text-[#5C6B5F] border-[#DCE3DA] hover:bg-[#F6F4EF]'
            }`}
          >
            ไม่มีอาการ
          </button>
          <button
            type="button"
            onClick={() => onToggleDehydration(true)}
            className={`h-11 rounded-md text-[12.5px] font-semibold border transition ${
              hasDehydration
                ? 'bg-[#95650B] text-white border-[#95650B]'
                : 'bg-white text-[#5C6B5F] border-[#DCE3DA] hover:bg-[#F6F4EF]'
            }`}
          >
            มีอาการขาดน้ำ
          </button>
        </div>
      </div>
    </div>
  );
};