import React, { useState } from 'react';
import type { Patient } from '../../../types';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Send,
  Stethoscope,
  Users,
  Wine,
} from 'lucide-react';

interface Step6ResultProps {
  patient: Patient;
  risk: string;
  cpg?: string;
  riskScore: number;
  onReset: () => void;
  onEscalateToDoctor?: () => void;
}

const THRESHOLD = 60;

export const Step6Result: React.FC<Step6ResultProps> = ({
  patient,
  risk,
  riskScore,
  onReset,
  onEscalateToDoctor,
}) => {
  const [lineSent, setLineSent] = useState(false);
  const [doctorSent, setDoctorSent] = useState(patient.status === 'Escalated');
  const isHighRisk = risk === 'Red' || riskScore >= THRESHOLD;

  const handleSendLine = () => setLineSent(true);

  const handleSendToDoctor = () => {
    setDoctorSent(true);
    onEscalateToDoctor?.();
  };

  const accent = isHighRisk
    ? { text: 'text-red-600', bar: 'bg-red-500', soft: 'bg-red-50 text-red-700' }
    : { text: 'text-emerald-700', bar: 'bg-emerald-600', soft: 'bg-emerald-50 text-emerald-700' };

  const barWidth = Math.max(0, Math.min(100, riskScore));

  return (
    <div className="space-y-5 font-sans text-sm text-zinc-900">
      {/* 1. คะแนนความเสี่ยง */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-500">คะแนนความเสี่ยง MALA</p>
            <p className={`mt-1 font-mono text-5xl font-semibold tracking-tight ${accent.text}`}>
              {riskScore}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-[13px] font-medium ${accent.soft}`}>
            {isHighRisk ? 'ความเสี่ยงสูง' : 'เฝ้าระวัง'}
          </span>
        </div>

        {/* แถบคะแนน + เส้นเกณฑ์ */}
        <div className="relative mt-5">
          <div
            className="h-2 overflow-hidden rounded-full bg-zinc-100"
            role="progressbar"
            aria-valuenow={riskScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="คะแนนความเสี่ยง MALA"
          >
            <div className={`h-full rounded-full ${accent.bar}`} style={{ width: `${barWidth}%` }} />
          </div>
          <div
            className="absolute -top-1 h-4 w-px bg-zinc-400"
            style={{ left: `${THRESHOLD}%` }}
            aria-hidden
          />
          <p
            className="absolute mt-1 -translate-x-1/2 text-[11px] text-zinc-400"
            style={{ left: `${THRESHOLD}%` }}
          >
            เกณฑ์ {THRESHOLD}
          </p>
        </div>

        <p className="mt-9 text-[13px] leading-relaxed text-zinc-600">
          {isHighRisk ? 'เกินเกณฑ์ที่กำหนด · ' : ''}eGFR {patient.egfr} mL/min · อายุ {patient.age} ปี
          {patient.hasAlcohol && ' · ดื่มแอลกอฮอล์'}
        </p>
      </section>

      {/* 2. คำแนะนำสำหรับผู้ป่วย */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h3 className="font-semibold">คำแนะนำสำหรับผู้ป่วย</h3>
          <span className="text-xs text-zinc-400">สร้างโดย AI · ใช้แจ้งคนไข้หน้างาน</span>
        </div>

        <ul className="space-y-4">
          <li className="flex gap-3 rounded-xl bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">กฎวันป่วย (Sick Day Rule)</p>
              <p className="mt-0.5 leading-relaxed text-amber-800/80">
                หยุดยาชั่วคราวเมื่อร่างกายขาดน้ำ ท้องเสีย อาเจียน หรือมีไข้สูง แล้วติดต่อ รพ.สต. ทันที
              </p>
            </div>
          </li>

          <li className="flex gap-3 px-1">
            <Wine className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <div>
              <p className="font-medium">งดแอลกอฮอล์ทุกชนิด</p>
              <p className="mt-0.5 leading-relaxed text-zinc-500">
                การดื่มร่วมกับ Metformin ในภาวะไตเสื่อม เพิ่มความเสี่ยงเลือดเป็นกรดจากแลคติกอย่างชัดเจน
              </p>
            </div>
          </li>

          <li className="flex gap-3 px-1">
            <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p className="font-medium">อาการเตือนที่ต้องไปโรงพยาบาลทันที</p>
              <p className="mt-0.5 leading-relaxed text-zinc-500">
                หายใจหอบลึก ปวดเมื่อยกล้ามเนื้อมาก อ่อนเพลียผิดปกติ คลื่นไส้
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* 3. การจัดการเคสเสี่ยงสูง */}
      {isHighRisk && (
        <section className="space-y-3">
          <h3 className="px-1 font-semibold">ขั้นตอนต่อไป</h3>

          {/* ส่งปรึกษาแพทย์ */}
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium">ส่งปรึกษาแพทย์ รพ.ศูนย์</p>
                <p className="mt-0.5 leading-relaxed text-zinc-500">
                  eGFR {patient.egfr} mL/min เสี่ยง MALA ส่งเข้าคิวตรวจเพื่อให้แพทย์พิจารณาปรับหรือหยุดยา Metformin
                </p>
              </div>
            </div>

            {doctorSent ? (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-medium text-emerald-800"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>ส่งเข้าคิวแพทย์แล้ว · รอแพทย์สั่งยา</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendToDoctor}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-700 py-3 font-medium text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600/40 focus-visible:ring-offset-2"
              >
                <Send className="h-4 w-4" />
                ส่งเคสเข้าคิวแพทย์
              </button>
            )}
          </div>

          {/* แจ้งเตือน LINE */}
          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#06C755] text-[10px] font-bold text-white">
                LINE
              </div>
              <div className="min-w-0">
                <p className="font-medium">แจ้งเตือนกลุ่ม MALA เครือข่าย รพ.ศูนย์</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                  <Users className="h-3 w-3" />
                  สมาชิก 12 คน · แพทย์ เภสัชกร พยาบาล จนท. รพ.สต.
                </p>
              </div>
            </div>

            {/* ตัวอย่างข้อความที่จะส่ง */}
            <div className="rounded-xl bg-zinc-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-red-600">แจ้งเตือนความเสี่ยงสูง (MALA)</span>
                <span className="font-mono text-xs font-semibold text-red-700">Score {riskScore}</span>
              </div>
              <dl className="mt-2.5 space-y-1 text-[13px] text-zinc-700">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-zinc-400">ผู้ป่วย</dt>
                  <dd>
                    {patient.name} (HN: {patient.citizenId})
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-zinc-400">จุดคัดกรอง</dt>
                  <dd>รพ.สต. ท่าสาย</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-zinc-400">eGFR</dt>
                  <dd>
                    <span className="font-semibold text-red-600">{patient.egfr}</span> mL/min
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-zinc-400">ยาเดิม</dt>
                  <dd>{patient.metforminDose}</dd>
                </div>
              </dl>
            </div>

            {lineSent ? (
              <>
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-medium text-emerald-800"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>ส่งเข้ากลุ่ม LINE แล้ว</span>
                </div>

                {/* จำลองการตอบรับจากทีม */}
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[11px] font-semibold text-white">
                    ภญ
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-zinc-100 px-3.5 py-2.5 text-[13px]">
                    <p className="font-medium text-sky-800">ภญ.อรุณี · ศูนย์ข้อมูลยา รพ.เชียงรายฯ</p>
                    <p className="mt-0.5 leading-relaxed text-zinc-700">
                      รับเรื่องค่ะ กำลังตรวจประวัติการใช้ยาอื่นและส่งต่อแพทย์พิจารณาปรับยาในระบบให้ค่ะ
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSendLine}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#06C755] py-3 font-medium text-white transition hover:bg-[#05a847] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06C755]/40 focus-visible:ring-offset-2"
              >
                <Send className="h-4 w-4" />
                ส่งแจ้งเตือนเข้ากลุ่ม LINE
              </button>
            )}
          </div>
        </section>
      )}

      {/* 4. จบเคส */}
      <button
        type="button"
        onClick={onReset}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E5C33] py-3.5 font-medium text-white transition hover:bg-[#0A431F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C33]/40 focus-visible:ring-offset-2"
      >
        <span>เสร็จสิ้น · สแกนผู้ป่วยรายถัดไป</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Step6Result;