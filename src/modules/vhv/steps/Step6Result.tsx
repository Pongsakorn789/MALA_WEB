import React, { useState } from 'react';
import type { Patient } from '../../../types';
import { AlertTriangle, CheckCircle2, Send, ShieldAlert } from 'lucide-react';

interface Step6ResultProps {
  patient: Patient;
  risk: string;
  cpg: string;
  riskScore: number;
  onReset: () => void;
}

export const Step6Result: React.FC<Step6ResultProps> = ({
  patient,
  risk,
  cpg,
  riskScore,
  onReset,
}) => {
  const [lineSent, setLineSent] = useState(false);
  const isHighRisk = risk === 'Red' || riskScore >= 60;

  return (
    <div className="space-y-4">
      {/* 1. กล่องคะแนนความเสี่ยง Risk Score */}
      <div
        className={`rounded-lg p-5 text-center border-2 ${
          isHighRisk
            ? 'bg-[#FBEEEE] border-[#9B3131] text-[#732424]'
            : 'bg-[#F3F7EC] border-[#3B6D11] text-[#2C4A0C]'
        }`}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider block">
          MALA RISK SCORE[cite: 11]
        </span>
        <span className="text-4xl font-extrabold tracking-tight block my-1">{riskScore}</span>
        <span className="text-sm font-bold block">
          {isHighRisk ? 'ความเสี่ยงสูง (เกินเกณฑ์ที่กำหนด 60)' : 'ความเสี่ยงปกติ / เฝ้าระวัง'}[cite: 11]
        </span>
        <p className="text-[12px] opacity-80 mt-1">
          ปัจจัยหลัก: eGFR {patient.egfr} mL/min · อายุ {patient.age} ปี[cite: 11]
        </p>
      </div>

      {/* 2. คำแนะนำเฉพาะราย (AI Generated Advice) & Sick Day Rule */}
      <div className="rounded-lg border border-[#DCE3DA] bg-white p-4 space-y-3 text-xs">
        <div className="font-bold text-[#0E5C33] flex items-center gap-1.5 border-b pb-2">
          <ShieldAlert className="w-4 h-4 text-[#0E5C33]" />
          <span>คำแนะนำเฉพาะราย (AI GENERATED)[cite: 11]</span>
        </div>

        <div className="space-y-2 text-[#17301F]">
          <div className="p-2.5 bg-[#FFF8E6] border border-[#F0D597] rounded-md">
            <p className="font-bold text-[#8A5B00]">⚠️ Sick Day Rule (กฎวันป่วย)[cite: 11]</p>
            <p className="text-[11.5px] text-[#6E4A00] mt-0.5">
              หยุดยาชั่วคราวเมื่อร่างกายขาดน้ำ ท้องเสีย อาเจียน มีไข้สูง แล้วติดต่อ รพ.สต. ทันที[cite: 11]
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-800">🚫 งดแอลกอฮอล์ทุกชนิด[cite: 11]</p>
            <p className="text-[11px] text-slate-500">
              การดื่มร่วมกับ Metformin ในภาวะไตเสื่อม เพิ่มความเสี่ยงเลือดเป็นกรดชัดเจน[cite: 11]
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-800">🚨 อาการเตือนวิกฤต[cite: 11]</p>
            <p className="text-[11px] text-slate-500">
              หายใจหอบลึก ปวดกล้ามเนื้อมาก อ่อนเพลียผิดปกติ คลื่นไส้ ให้มาโรงพยาบาลทันที[cite: 11]
            </p>
          </div>
        </div>
      </div>

      {/* 3. จำลองการแจ้งเตือนกลุ่ม LINE สหวิชาชีพ */}
      {isHighRisk && (
        <div className="rounded-lg border border-[#DCE3DA] bg-white p-3.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">กลุ่ม LINE: เครือข่าย MALA อำเภอเมือง[cite: 11]</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
              {lineSent ? 'ส่งแจ้งเตือนแล้ว' : 'พร้อมส่งอัตโนมัติ'}[cite: 11]
            </span>
          </div>

          <button
            type="button"
            onClick={() => setLineSent(true)}
            disabled={lineSent}
            className={`w-full py-2.5 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition ${
              lineSent
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#00B900] hover:bg-[#009900] text-white shadow'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{lineSent ? 'ส่งการ์ดแจ้งเตือนทีมแพทย์/เภสัชกรแล้ว' : 'ส่งการ์ดแจ้งเตือนเข้ากลุ่ม LINE'}[cite: 11]</span>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="w-full py-3.5 bg-[#0E5C33] hover:bg-[#0A431F] text-white font-semibold rounded-md transition text-sm shadow"
      >
        เสร็จสิ้น / คัดกรองผู้ป่วยรายถัดไป[cite: 11]
      </button>
    </div>
  );
};