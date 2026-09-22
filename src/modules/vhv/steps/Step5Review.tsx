import React from 'react';
import type { Patient } from '../../../types';
import { ALCOHOL_OPTIONS, type AlcoholLevel } from './Step4RiskFactors';

interface Step5ReviewProps {
  patient: Patient;
  weight: number;
  height: number;
  bmi: number;
  alcoholLevel: AlcoholLevel;
  hasDehydration: boolean;
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
  patient,
  weight,
  height,
  bmi,
  alcoholLevel,
  hasDehydration,
}) => {
  const items = [
    ['เลข ปชช (HN)', patient.citizenId],
    ['ผู้ป่วย', `${patient.name} · อายุ ${patient.age} ปี`],
    ['eGFR (จากฐานข้อมูล รพ.)', `${patient.egfr} mL/min`],
    ['น้ำหนัก', `${weight} กก.`],
    ['ส่วนสูง · BMI', `${height} ซม. · ${bmi} kg/m²`],
    ['การดื่มแอลกอฮอล์', ALCOHOL_OPTIONS.find((o) => o.id === alcoholLevel)?.label ?? '-'],
    ['ภาวะขาดน้ำสัปดาห์นี้', hasDehydration ? 'มีอาการขาดน้ำ' : 'ไม่มีอาการ'],
    ['ผู้บันทึก', 'อสม. ประจำหมู่ 1'],
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold text-[#17301F]">ตรวจทานแล้วกดบันทึก[cite: 11]</h2>
        <p className="text-[12.5px] text-[#6B786D] mt-0.5">
          ตรวจทานข้อมูลก่อนส่ง เมื่อกดยืนยัน ระบบ AI จะคำนวณ Risk Score ทันที[cite: 11]
        </p>
      </div>

      <dl className="text-[13px] divide-y divide-[#EEF0EA] border border-[#E1E4DB] rounded-md overflow-hidden shadow-sm">
        {items.map(([label, val]) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5 bg-white">
            <dt className="text-[#6B786D]">{label}[cite: 11]</dt>
            <dd className="font-semibold text-[#17301F] text-right">{val}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};