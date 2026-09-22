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
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold text-[#17301F]">กรอกน้ำหนักวันนี้[cite: 11]</h2>
        <p className="text-[12.5px] text-[#6B786D] mt-0.5">ชั่งน้ำหนักผู้ป่วยวันนี้ แล้วกรอกค่าที่อ่านได้[cite: 11]</p>
      </div>

      <div className="rounded-md border border-[#DCE3DA] p-4 text-center space-y-1 bg-white">
        <span className="text-[11px] text-[#8A968C]">น้ำหนัก (กิโลกรัม)[cite: 11]</span>
        <p className="text-3xl font-semibold tabular-nums text-[#0E5C33]">{weightInput || '0'}</p>
        {currentPatient.weight != null && (
          <span className="text-[11.5px] text-[#8A968C] block">
            ครั้งก่อน {currentPatient.weight} กก. (12 มิ.ย. 2569)[cite: 11]
          </span>
        )}
      </div>

      <NumberPad value={weightInput} onChange={onWeightChange} allowDecimal={true} />
    </div>
  );
};