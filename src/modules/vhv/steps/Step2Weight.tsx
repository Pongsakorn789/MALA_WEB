import React from 'react';
import type { Patient } from '../../../types';
import { NumberPad } from '../components/NumberPad';

interface Step2WeightProps {
  currentPatient: Patient;
  weightInput: string;
  onWeightChange: (v: string) => void;
}

export const Step2Weight: React.FC<Step2WeightProps> = ({
  currentPatient,
  weightInput,
  onWeightChange,
}) => {
  const hasPrevious = currentPatient.weight != null;
  const current = parseFloat(weightInput);
 const diff =
  hasPrevious && !Number.isNaN(current)
    ? Math.round((current - currentPatient.weight!) * 10) / 10
    : null;
  return (
    <div className="space-y-5 font-sans text-sm text-zinc-900">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">น้ำหนักวันนี้</h2>
        <p className="leading-relaxed text-zinc-500">ชั่งน้ำหนักผู้ป่วย แล้วกรอกค่าที่อ่านได้</p>
      </header>

      {/* ค่าที่กรอก */}
      <section
        className="rounded-2xl bg-zinc-50 px-5 py-7 text-center"
        aria-live="polite"
        aria-label="น้ำหนักที่กรอก"
      >
        <p className="flex items-baseline justify-center gap-2">
          <span
            className={`text-5xl font-semibold tabular-nums tracking-tight ${
              weightInput ? 'text-zinc-900' : 'text-zinc-300'
            }`}
          >
            {weightInput || '0'}
          </span>
          <span className="text-base text-zinc-500">กก.</span>
        </p>

        {hasPrevious && (
          <p className="mt-3 text-[13px] text-zinc-500">
            ครั้งก่อน {currentPatient.weight} กก. (12 มิ.ย. 2569)
            {diff !== null && diff !== 0 && (
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                  Math.abs(diff) >= 2 ? 'bg-amber-50 text-amber-700' : 'bg-zinc-200/70 text-zinc-600'
                }`}
              >
                {diff > 0 ? '+' : ''}
                {diff} กก.
              </span>
            )}
          </p>
        )}
      </section>

      <NumberPad value={weightInput} onChange={onWeightChange} allowDecimal={true} />
    </div>
  );
};

export default Step2Weight;