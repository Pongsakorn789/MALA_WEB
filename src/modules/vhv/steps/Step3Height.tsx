import React from 'react';
import { NumberPad } from '../components/NumberPad';

interface Step3HeightProps {
  heightInput: string;
  bmi: number;
  onHeightChange: (v: string) => void;
}

export const Step3Height: React.FC<Step3HeightProps> = ({ heightInput, bmi, onHeightChange }) => {
  return (
    <div className="space-y-5 font-sans text-sm text-zinc-900">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">ส่วนสูง</h2>
        <p className="leading-relaxed text-zinc-500">
          กรอกครั้งเดียวใช้ได้ตลอด ระบบคำนวณ BMI ทันทีเพื่อใช้ประเมินความเสี่ยง
        </p>
      </header>

      {/* ค่าที่กรอก + BMI */}
      <section
        className="rounded-2xl bg-zinc-50 px-5 py-7 text-center"
        aria-live="polite"
        aria-label="ส่วนสูงที่กรอก"
      >
        <p className="flex items-baseline justify-center gap-2">
          <span
            className={`text-5xl font-semibold tabular-nums tracking-tight ${
              heightInput ? 'text-zinc-900' : 'text-zinc-300'
            }`}
          >
            {heightInput || '0'}
          </span>
          <span className="text-base text-zinc-500">ซม.</span>
        </p>

        <p className="mt-3 text-[13px] text-zinc-500">
          BMI{' '}
          <span className={`font-mono font-semibold ${bmi ? 'text-zinc-900' : 'text-zinc-400'}`}>
            {bmi || '—'}
          </span>{' '}
          kg/m²
        </p>
      </section>

      <NumberPad value={heightInput} onChange={onHeightChange} allowDecimal={false} />
    </div>
  );
};

export default Step3Height;