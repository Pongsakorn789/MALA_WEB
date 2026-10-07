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

interface Row {
  label: string;
  value: string;
  mono?: boolean;
  warn?: boolean; // เน้นสีเหลืองสำหรับปัจจัยเสี่ยงที่พบ
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
  patient,
  weight,
  height,
  bmi,
  alcoholLevel,
  hasDehydration,
}) => {
  const groups: { title: string; rows: Row[] }[] = [
    {
      title: 'ผู้ป่วย',
      rows: [
        { label: 'ชื่อ', value: `${patient.name} · อายุ ${patient.age} ปี` },
        { label: 'เลข ปชช (HN)', value: patient.citizenId, mono: true },
        { label: 'eGFR (ฐานข้อมูล รพ.)', value: `${patient.egfr} mL/min`, mono: true },
      ],
    },
    {
      title: 'ข้อมูลที่วัดวันนี้',
      rows: [
        { label: 'น้ำหนัก', value: `${weight} กก.`, mono: true },
        { label: 'ส่วนสูง', value: `${height} ซม.`, mono: true },
        { label: 'BMI', value: `${bmi} kg/m²`, mono: true },
      ],
    },
    {
      title: 'ปัจจัยเสี่ยง',
      rows: [
        {
          label: 'การดื่มแอลกอฮอล์',
          value: ALCOHOL_OPTIONS.find((o) => o.id === alcoholLevel)?.label ?? '-',
          warn: alcoholLevel === 'regular' || alcoholLevel === 'heavy',
        },
        {
          label: 'ท้องเสีย / ขาดน้ำสัปดาห์นี้',
          value: hasDehydration ? 'มีอาการขาดน้ำ' : 'ไม่มีอาการ',
          warn: hasDehydration,
        },
      ],
    },
  ];

  return (
    <div className="space-y-5 font-sans text-sm text-zinc-900">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">ตรวจทานก่อนบันทึก</h2>
        <p className="leading-relaxed text-zinc-500">
          เมื่อกดยืนยัน ระบบ AI จะคำนวณคะแนนความเสี่ยงทันที
        </p>
      </header>

      <div className="space-y-4">
        {groups.map((g) => (
          <section key={g.title}>
            <h3 className="mb-1.5 px-1 text-xs font-medium text-zinc-500">{g.title}</h3>
            <dl className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              {g.rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-zinc-500">{r.label}</dt>
                  <dd className="flex items-center gap-2 text-right font-medium">
                    {r.warn && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden />}
                    <span className={`${r.mono ? 'font-mono' : ''} ${r.warn ? 'text-amber-700' : ''}`}>
                      {r.value}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="px-1 text-xs text-zinc-400">บันทึกโดย อสม. ประจำหมู่ 1</p>
    </div>
  );
};

export default Step5Review;