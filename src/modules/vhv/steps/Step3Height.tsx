import React from 'react';
import { NumberPad } from '../components/NumberPad';

interface Step3HeightProps {
  heightInput: string;
  bmi: number;
  onHeightChange: (v: string) => void;
}

export const Step3Height: React.FC<Step3HeightProps> = ({ heightInput, bmi, onHeightChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold text-[#17301F]">กรอกส่วนสูง[cite: 11]</h2>
        <p className="text-[12.5px] text-[#6B786D] mt-0.5">
          กรอกครั้งเดียวใช้ได้ตลอด ระบบคำนวณ BMI ทันทีเพื่อนำไปประเมินความเสี่ยง[cite: 11]
        </p>
      </div>

      <div className="rounded-md border border-[#DCE3DA] p-4 text-center space-y-1 bg-white">
        <span className="text-[11px] text-[#8A968C]">ส่วนสูง (เซนติเมตร)[cite: 11]</span>
        <p className="text-3xl font-semibold tabular-nums text-[#0E5C33]">{heightInput || '0'}</p>
        <div className="pt-1">
          <span className="inline-block bg-[#F3F7EC] text-[#2C4A0C] border border-[#CDE0BF] px-3 py-1 rounded-full text-xs font-bold">
            BMI ที่คำนวณได้ {bmi || '—'} kg/m²[cite: 11]
          </span>
        </div>
      </div>

      <NumberPad value={heightInput} onChange={onHeightChange} allowDecimal={false} />
    </div>
  );
};