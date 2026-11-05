import React, { useState, useEffect } from 'react';
import type { Patient } from '../../../types';
import { assessMetforminDose, parseMetforminDoseMg } from '../../../utils/metforminGuideline';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Send,
  Stethoscope,
  Users,
  Wine,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface Step6ResultProps {
  patient: Patient;
  risk: string;
  cpg?: string;
  riskScore: number;
  onReset: () => void;
  onEscalateToDoctor?: () => void;
}

export const Step6Result: React.FC<Step6ResultProps> = ({
  patient,
  risk,
  cpg,
  riskScore,
  onReset,
  onEscalateToDoctor,
}) => {
  const [lineSent, setLineSent] = useState(false);
  const [doctorSent, setDoctorSent] = useState(patient.status === 'Escalated');
  const isAtRisk = riskScore >= 2;
  const metforminDoseMg = parseMetforminDoseMg(patient.metforminDose);
  const doseAssessment = assessMetforminDose(patient.egfr, metforminDoseMg);
  const needsClinicalReview = isAtRisk || doseAssessment.status !== 'within-range';
  const part3Triggers = [
    { label: 'อาเจียนหรือท้องเสีย', yes: !!patient.hasDehydration },
    { label: 'กินอาหารได้น้อย 1–2 วัน', yes: !!patient.poorIntake },
  ];
  const part4Triggers = [
    { label: 'ใช้ยาแก้ปวด/แก้อักเสบ/ยาชุด', yes: !!patient.painMedication },
    { label: 'ใช้ยาต้ม/สมุนไพร/อาหารเสริม', yes: !!patient.supplementOrHerbal },
  ];
  const scoreFactors = [
    { label: 'eGFR < 60', points: patient.egfr < 60 ? 1 : 0 },
    { label: 'BMI < 23', points: patient.bmi !== undefined && patient.bmi > 0 && patient.bmi < 23 ? 2 : 0 },
    { label: 'ดื่มหนักตามเกณฑ์ข้อ 9', points: patient.bingeDrinking || patient.highWeeklyAlcohol ? 2 : 0 },
  ];

  const [apiRecommendation, setApiRecommendation] = useState<string | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState<boolean>(true);

  // In development use the local API; production uses VITE_MALA_API_URL.
  const fetchRecommendations = async () => {
    setIsLoadingRecommendation(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_MALA_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');
      if (!apiBaseUrl) {
        setApiRecommendation(null);
        return;
      }

      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/evaluate-mala-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: patient.age,
          egfr: patient.egfr,
          metforminDose: metforminDoseMg ?? 0,
          hasBingeDrinking: !!patient.bingeDrinking,
          hasChronicAlcohol: !!patient.highWeeklyAlcohol,
          hasVomitingDiarrhea: !!patient.hasDehydration,
          hasFasting: !!patient.poorIntake,
          hasPainkillers: !!patient.painMedication,
          hasHerbsSupplements: !!patient.supplementOrHerbal,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApiRecommendation(data.recommendations);
      } else {
        setApiRecommendation(null);
      }
    } catch (error) {
      console.warn('ไม่สามารถเชื่อมต่อ MALA API ได้ ใช้คำแนะนำมาตรฐานระบบแทน:', error);
      setApiRecommendation(null);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [patient]);

  const handleSendLine = () => setLineSent(true);

  const handleSendToDoctor = () => {
    setDoctorSent(true);
    onEscalateToDoctor?.();
  };

  const accent = isAtRisk
    ? { text: 'text-amber-700', soft: 'bg-amber-50 text-amber-800', border: 'border-amber-200' }
    : { text: 'text-emerald-700', soft: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200' };
  const doseTone = doseAssessment.status === 'contraindicated'
    ? 'border-red-200 bg-red-50 text-red-800'
    : doseAssessment.status === 'review'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-emerald-200 bg-emerald-50 text-emerald-900';

  return (
    <div className="space-y-5 font-sans text-sm text-zinc-900">
      <section className={`rounded-2xl border p-5 shadow-xs ${doseTone}`}>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Part 1 · ความเหมาะสมของขนาดยา</p>
        <h2 className="mt-2 text-lg font-semibold">{doseAssessment.title}</h2>
        <p className="mt-1 leading-relaxed">{doseAssessment.detail}</p>
        <p className="mt-2 text-xs opacity-70">ขนาดยาที่บันทึก: {metforminDoseMg === null ? 'อ่านค่าไม่ได้' : `${metforminDoseMg.toLocaleString()} มก./วัน`} · eGFR {patient.egfr} mL/min/1.73 m²</p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Part 2 · ความเสี่ยงต่อ MALA</p>
            <h2 className={`mt-2 text-lg font-semibold ${accent.text}`}>{risk === 'Yellow' ? 'เข้าเกณฑ์เสี่ยงต่อ MALA' : 'ยังไม่เข้าเกณฑ์เสี่ยงจากคะแนน'}</h2>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${accent.soft}`}>{riskScore} คะแนน</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">เกณฑ์ตามตาราง: คะแนนตั้งแต่ 2 ขึ้นไปถือว่าเสี่ยง</p>
        <ul className="mt-3 space-y-1.5 text-xs text-zinc-600">
          {scoreFactors.map((factor) => <li key={factor.label} className="flex justify-between"><span>{factor.label}</span><span>{factor.points} คะแนน</span></li>)}
        </ul>
        {isAtRisk && <p className="mt-3 text-xs leading-relaxed text-amber-800">{cpg}</p>}
        <p className="mt-2 text-xs text-zinc-400">รวมสูงสุด 5 คะแนน · BMI {patient.bmi ?? '—'} · อายุ {patient.age} ปี</p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Part 3 · อาการกระตุ้นและ Sick Day Rules</p>
        <ul className="mt-3 divide-y divide-zinc-100">
          {part3Triggers.map((trigger) => <li key={trigger.label} className="flex items-center justify-between gap-3 py-2.5">
            <span className={trigger.yes ? 'font-medium text-zinc-900' : 'text-zinc-500'}>{trigger.label}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${trigger.yes ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-500'}`}>{trigger.yes ? 'พบ' : 'ไม่พบ'}</span>
          </li>)}
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Part 4 · ปัจจัยกระตุ้น AKI/ทบทวนยา</p>
        <ul className="mt-3 divide-y divide-zinc-100">
          {part4Triggers.map((trigger) => <li key={trigger.label} className="flex items-center justify-between gap-3 py-2.5">
            <span className={trigger.yes ? 'font-medium text-zinc-900' : 'text-zinc-500'}>{trigger.label}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${trigger.yes ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-500'}`}>{trigger.yes ? 'พบ' : 'ไม่พบ'}</span>
          </li>)}
        </ul>
      </section>

      {/* คำแนะนำตามปัจจัยคัดกรองจาก API */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold text-zinc-900">คำแนะนำสำหรับผู้ป่วย</h3>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            {isLoadingRecommendation ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                กำลังประมวลผล...
              </>
            ) : (
              apiRecommendation ? 'คำแนะนำตามปัจจัยคัดกรอง' : 'คำแนะนำมาตรฐาน'
            )}
          </span>
        </div>

        {/* แสดงผลคำแนะนำจาก API หรือใช้คำแนะนำมาตรฐานเมื่อ API ยังไม่พร้อม */}
        {isLoadingRecommendation ? (
          <div className="py-8 text-center text-zinc-400 space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-medium">กำลังสรุปคำแนะนำตามข้อมูลคัดกรอง...</p>
          </div>
        ) : apiRecommendation ? (
          /* แสดงคำแนะนำจากกฎที่ตรวจสอบได้ใน backend */
          <div className="rounded-xl bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800 whitespace-pre-line border border-zinc-200">
            {apiRecommendation}
          </div>
        ) : (
          /* คำแนะนำมาตรฐานเมื่อไม่ได้ตั้งค่า API หรือเชื่อมต่อไม่ได้ */
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
        )}
      </section>

      {/* การจัดการตามคะแนน Part 2 หรือเกณฑ์ยา Part 1 */}
      {needsClinicalReview && (
        <section className="space-y-3">
          <h3 className="px-1 font-semibold">ขั้นตอนต่อไป</h3>

          {/* ส่งปรึกษาแพทย์ */}
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
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
          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
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
                <span className="text-[13px] font-semibold text-amber-700">ผลคัดกรอง MALA</span>
                <span className="text-xs font-semibold text-amber-800">คะแนน {riskScore} / 5</span>
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
