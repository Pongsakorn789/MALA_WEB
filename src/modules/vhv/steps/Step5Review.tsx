import React from 'react';
import type { Patient } from '../../../types';
import type { AlcoholLevel } from './Step4RiskFactors';
import { calculateMalaRiskScore } from '../../../utils/riskEngine';
import { assessMetforminDose, parseMetforminDoseMg } from '../../../utils/metforminGuideline';

interface Step5ReviewProps {
  patient: Patient;
  weight: number;
  height: number;
  bmi: number;
  alcoholLevel: AlcoholLevel;
  hasDehydration: boolean;
  bingeDrinking: boolean;
  highWeeklyAlcohol: boolean;
  poorIntake: boolean;
  painMedication: boolean;
  supplementOrHerbal: boolean;
}

interface RiskRow {
  label: string;
  yes: boolean;
  yesText?: string;
  noText?: string;
  sub?: boolean; // คำถามย่อย แสดงเยื้องเข้ามา
}

const Pill: React.FC<{ warn: boolean; children: React.ReactNode }> = ({ warn, children }) => (
  <span
    className={`inline-flex min-w-[3.75rem] shrink-0 items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
      warn ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-500'
    }`}
  >
    {children}
  </span>
);

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="10" cy="10" r="8" />
    <path d="m6.5 10.2 2.3 2.3 4.7-4.9" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="10" cy="10" r="8" />
    <path d="M10 6v4.5M10 13.5h.01" />
  </svg>
);

export const Step5Review: React.FC<Step5ReviewProps> = ({
  patient,
  weight,
  height,
  bmi,
  alcoholLevel,
  hasDehydration,
  bingeDrinking,
  highWeeklyAlcohol,
  poorIntake,
  painMedication,
  supplementOrHerbal,
}) => {
  const drinking = alcoholLevel === 'drinking';

  const riskRows: RiskRow[] = [
    { label: 'การดื่มแอลกอฮอล์', yes: drinking, yesText: 'ดื่ม', noText: 'ไม่ดื่ม' },
    // คำถามย่อยแสดงเฉพาะเมื่อผู้ป่วยดื่ม เพื่อลดความรก
    ...(drinking
      ? [
          { label: 'ดื่มหนักใน 2 ชั่วโมง', yes: bingeDrinking, sub: true },
          { label: 'ดื่มเกินเกณฑ์ต่อสัปดาห์', yes: highWeeklyAlcohol, sub: true },
        ]
      : []),
    { label: 'อาเจียนหรือท้องเสีย', yes: hasDehydration },
    { label: 'ทานอาหารไม่ได้ / ได้น้อย 1–2 วัน', yes: poorIntake },
    { label: 'ใช้ยาแก้ปวด แก้อักเสบ หรือยาชุด', yes: painMedication },
    { label: 'ใช้ยาต้ม ยาหม้อ สมุนไพร หรืออาหารเสริม', yes: supplementOrHerbal },
  ];

  const flaggedCount = riskRows.filter((r) => r.yes).length;
  const hasRisk = flaggedCount > 0;
  const heavyAlcohol = drinking && (bingeDrinking || highWeeklyAlcohol);
  const malaScore = calculateMalaRiskScore(patient.egfr, bmi, heavyAlcohol);
  const doseAssessment = assessMetforminDose(patient.egfr, parseMetforminDoseMg(patient.metforminDose));

  const stats = [
    { label: 'น้ำหนัก', value: weight, unit: 'กก.' },
    { label: 'ส่วนสูง', value: height, unit: 'ซม.' },
    { label: 'BMI', value: bmi, unit: 'kg/m²' },
  ];

  return (
    <div className="space-y-6 font-sans text-sm text-zinc-900">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">ตรวจทานก่อนบันทึก</h2>
        <p className="leading-relaxed text-zinc-500">ตรวจคำตอบให้ถูกต้อง แล้วกดบันทึกเพื่อประเมินความเสี่ยง</p>
      </header>

      {/* สรุปผลภาพรวม */}
      <div
        role="status"
        className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 ${
          hasRisk ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-900'
        }`}
      >
        <span className={hasRisk ? 'text-amber-600' : 'text-emerald-600'}>
          {hasRisk ? <AlertIcon /> : <CheckIcon />}
        </span>
        <div className="leading-snug">
          <p className="font-semibold">{hasRisk ? `มีคำตอบใช่ ${flaggedCount} ข้อ` : 'ทุกข้อที่ตอบเป็นไม่ใช่'}</p>
          <p className={`text-xs ${hasRisk ? 'text-amber-800/80' : 'text-emerald-800/80'}`}>
            {hasRisk ? 'จำนวนคำตอบใช่นี้ไม่ใช่คะแนน Part 2' : 'ดูคะแนน Part 2 แยกตามเกณฑ์ด้านล่าง'}
          </p>
        </div>
      </div>

      {/* ผู้ป่วย */}
      <section aria-label="ข้อมูลผู้ป่วย" className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-base font-semibold text-white">
          {patient.name?.trim().charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{patient.name}</p>
          <p className="text-zinc-500">อายุ {patient.age} ปี</p>
          <p className="mt-0.5 font-mono text-xs text-zinc-400">{patient.citizenId}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-zinc-400">eGFR</p>
          <p className="font-mono text-base font-semibold leading-tight">{patient.egfr}</p>
          <p className="text-xs text-zinc-400">mL/min</p>
        </div>
      </section>

      {/* ข้อมูลที่วัดวันนี้ */}
      <section aria-label="ข้อมูลที่วัดวันนี้" className="space-y-2">
        <h3 className="px-1 text-xs font-medium text-zinc-500">วัดวันนี้</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-zinc-50 px-3 py-3.5 text-center">
              <p className="text-xs text-zinc-500">{s.label}</p>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums">{s.value}</p>
              <p className="text-xs text-zinc-400">{s.unit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="ผลตามเกณฑ์คัดกรอง">
        <div className={`rounded-2xl border p-4 ${doseAssessment.status === 'within-range' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          <p className="text-xs font-semibold text-zinc-500">Part 1 · ขนาดยา</p>
          <p className="mt-1 font-semibold">{doseAssessment.title}</p>
          <p className="mt-1 text-xs text-zinc-600">{doseAssessment.detail}</p>
        </div>
        <div className={`rounded-2xl border p-4 ${malaScore >= 2 ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <p className="text-xs font-semibold text-zinc-500">Part 2 · คะแนนความเสี่ยง MALA</p>
          <p className="mt-1 font-semibold">{malaScore} คะแนน {malaScore >= 2 ? '· เข้าเกณฑ์เสี่ยง' : '· ต่ำกว่าเกณฑ์เสี่ยง'}</p>
          <p className="mt-1 text-xs text-zinc-500">eGFR &lt;60 = 1 · BMI &lt;23 = 2 · ดื่มหนัก = 2 · ตั้งแต่ 2 คะแนนถือว่าเสี่ยง</p>
        </div>
      </section>

      {/* ปัจจัยเสี่ยง */}
      <section aria-label="ปัจจัยเสี่ยง" className="space-y-2">
        <h3 className="px-1 text-xs font-medium text-zinc-500">ปัจจัยเสี่ยง</h3>
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {riskRows.map((r) => (
            <li
              key={r.label}
              className={`flex items-center justify-between gap-4 py-3 pr-4 ${
                r.sub ? 'pl-9' : 'pl-4'
              } ${r.yes ? 'bg-amber-50/60' : ''}`}
            >
              <span className={`leading-snug ${r.yes ? 'font-medium text-zinc-900' : 'text-zinc-500'} ${r.sub ? 'text-[13px]' : ''}`}>
                {r.label}
              </span>
              <Pill warn={r.yes}>{r.yes ? r.yesText ?? 'ใช่' : r.noText ?? 'ไม่ใช่'}</Pill>
            </li>
          ))}
        </ul>
      </section>

      <p className="px-1 text-center text-xs text-zinc-400">บันทึกโดย อสม. ประจำหมู่ 1</p>
    </div>
  );
};

export default Step5Review;
